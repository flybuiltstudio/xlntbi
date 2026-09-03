/**
 * Minimal allow-list sanitizer for the newsletter body.
 *
 * The admin editor produces HTML from a contentEditable surface, so the value
 * is trusted-ish but never sent to recipients unchecked: only a small set of
 * tags, attributes and inline styles survive. Runs on the server before the
 * campaign is stored and sent (no DOM needed).
 */

const ALLOWED_TAGS = new Set([
  "p",
  "br",
  "b",
  "strong",
  "i",
  "em",
  "u",
  "s",
  "span",
  "div",
  "ul",
  "ol",
  "li",
  "h1",
  "h2",
  "h3",
  "blockquote",
  "a",
  "img",
  "hr",
]);

const ALLOWED_STYLE_PROPS = new Set([
  "color",
  "background-color",
  "font-weight",
  "font-style",
  "text-decoration",
  "text-align",
  "font-size",
]);

function safeUrl(raw: string, allowData: boolean): string | null {
  const value = raw.trim().replace(/\s+/g, "");
  if (/^https?:\/\//i.test(value)) return raw.trim();
  if (/^mailto:/i.test(value)) return raw.trim();
  if (allowData && /^data:image\/(png|jpe?g|gif|webp);base64,[a-z0-9+/=]+$/i.test(value)) {
    return value;
  }
  return null;
}

function cleanStyle(raw: string): string {
  const parts = raw
    .split(";")
    .map((p) => p.trim())
    .filter(Boolean)
    .filter((p) => {
      const [prop, ...rest] = p.split(":");
      const value = rest.join(":").trim();
      if (!prop || !value) return false;
      if (!ALLOWED_STYLE_PROPS.has(prop.trim().toLowerCase())) return false;
      return !/url\s*\(|expression|javascript:/i.test(value);
    });
  return parts.join("; ");
}

function attrValue(attrs: string, name: string): string | null {
  const match = new RegExp(`${name}\\s*=\\s*("([^"]*)"|'([^']*)')`, "i").exec(attrs);
  if (!match) return null;
  return match[2] ?? match[3] ?? "";
}

function escapeAttr(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

/** Strips everything that is not on the allow-list. */
export function sanitizeNewsletterHtml(input: string): string {
  const withoutDangerous = input
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<(script|style|iframe|object|embed|link|meta)[\s\S]*?<\/\1>/gi, "")
    .replace(/<(script|style|iframe|object|embed|link|meta)[^>]*>/gi, "");

  return withoutDangerous.replace(
    /<(\/?)([a-z0-9]+)((?:[^>"']|"[^"]*"|'[^']*')*)>/gi,
    (_all, slash: string, tagRaw: string, attrs: string) => {
      const tag = tagRaw.toLowerCase();
      if (!ALLOWED_TAGS.has(tag)) return "";
      if (slash) return `</${tag}>`;

      const kept: string[] = [];
      const style = attrValue(attrs, "style");
      if (style) {
        const cleaned = cleanStyle(style);
        if (cleaned) kept.push(`style="${escapeAttr(cleaned)}"`);
      }
      if (tag === "a") {
        const href = attrValue(attrs, "href");
        const safe = href ? safeUrl(href, false) : null;
        if (safe) kept.push(`href="${escapeAttr(safe)}"`);
        kept.push('target="_blank"', 'rel="noopener noreferrer"');
      }
      if (tag === "img") {
        const src = attrValue(attrs, "src");
        const safe = src ? safeUrl(src, true) : null;
        if (!safe) return "";
        kept.push(`src="${escapeAttr(safe)}"`);
        const alt = attrValue(attrs, "alt") ?? "";
        kept.push(`alt="${escapeAttr(alt)}"`);
        const width = attrValue(attrs, "width");
        if (width && /^\d{1,4}$/.test(width)) kept.push(`width="${width}"`);
        kept.push('style="max-width:100%;height:auto"');
      }
      if (tag === "img" || tag === "br" || tag === "hr") {
        return `<${tag}${kept.length ? " " + kept.join(" ") : ""} />`;
      }
      return `<${tag}${kept.length ? " " + kept.join(" ") : ""}>`;
    },
  );
}

/** Rough plain-text version for the text/plain part of the email. */
export function newsletterPlainText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li|h1|h2|h3|blockquote)>/gi, "\n")
    .replace(/<li[^>]*>/gi, "- ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
