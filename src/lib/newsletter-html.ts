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

/* ------------------------------------------------------------------ *
 * Raw HTML mode: complete newsletters pasted or uploaded by the admin.
 * Layout, tables, inline styles, images and links are preserved; only
 * active content (scripts, event handlers, javascript: urls, frames) is
 * removed.
 * ------------------------------------------------------------------ */

const DOCUMENT_FORBIDDEN_TAGS = ["script", "iframe", "frame", "frameset", "object", "embed", "form"];

/** Removes active content from a complete HTML email, keeping the layout. */
export function sanitizeNewsletterDocument(input: string): string {
  let html = input.replace(/<!--[\s\S]*?-->/g, "");
  for (const tag of DOCUMENT_FORBIDDEN_TAGS) {
    html = html
      .replace(new RegExp(`<${tag}\\b[\\s\\S]*?<\\/${tag}\\s*>`, "gi"), "")
      .replace(new RegExp(`<\\/?${tag}\\b[^>]*>`, "gi"), "");
  }
  // Inline event handlers (onclick=, onload=, ...) and javascript: targets.
  html = html.replace(
    /<([a-z][a-z0-9]*)((?:[^>"']|"[^"]*"|'[^']*')*)>/gi,
    (_all, tag: string, attrs: string) => {
      const cleaned = attrs
        .replace(/\s+on[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
        .replace(/\s+(href|src|background|action)\s*=\s*("\s*javascript:[^"]*"|'\s*javascript:[^']*'|javascript:[^\s>]+)/gi, "");
      return `<${tag}${cleaned}>`;
    },
  );
  return html;
}

/** True when the value looks like a complete HTML document. */
export function isHtmlDocument(input: string): boolean {
  return /<html[\s>]|<!doctype html/i.test(input);
}

const UNSUBSCRIBE_PLACEHOLDERS = [
  /\{\{\s*unsubscribe(?:_url|Url)?\s*\}\}/gi,
  /\{\{\s*leiratkozas(?:_url)?\s*\}\}/gi,
  /%%unsubscribe%%/gi,
  /"#unsubscribe"/gi,
  /'#unsubscribe'/gi,
];

function unsubscribeFooter(url: string): string {
  return (
    `<div style="margin:24px 0 8px;font-family:Arial,Helvetica,sans-serif;` +
    `font-size:12px;line-height:18px;color:#5b6b63;text-align:center">` +
    `Ezt a levelet azért kaptad, mert feliratkoztál az xlntbi.hu hírlevelére. ` +
    `<a href="${url}" style="color:#217346">Leiratkozás egy kattintással</a>` +
    `</div>`
  );
}

/**
 * Puts the real unsubscribe link into a raw HTML newsletter: replaces the
 * known placeholders, and if none of them is present, appends a small footer
 * so every campaign stays unsubscribable.
 */
export function applyUnsubscribeLink(html: string, url: string): string {
  let replaced = html;
  let found = false;
  for (const pattern of UNSUBSCRIBE_PLACEHOLDERS) {
    if (pattern.test(replaced)) {
      found = true;
      replaced = replaced.replace(pattern, (match) =>
        match.startsWith('"') ? `"${url}"`
        : match.startsWith("'") ? `'${url}'`
        : url,
      );
    }
    pattern.lastIndex = 0;
  }
  if (found) return replaced;

  const footer = unsubscribeFooter(url);
  if (/<\/body\s*>/i.test(replaced)) {
    return replaced.replace(/<\/body\s*>/i, `${footer}</body>`);
  }
  return `${replaced}${footer}`;
}

/** Plain-text part for a complete HTML document. */
export function documentPlainText(html: string): string {
  const body = html
    .replace(/<head[\s\S]*?<\/head>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<\/(td|tr|table|h4|h5|h6)>/gi, "\n");
  return newsletterPlainText(body);
}
