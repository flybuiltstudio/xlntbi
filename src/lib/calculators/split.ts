/**
 * Splits an uploaded standalone calculator HTML document into the markup and
 * the inline <script> code, matching the shape EmbeddedCalculator expects.
 * External scripts (<script src=...>) are left untouched in the markup.
 */
export function splitCalculatorHtml(raw: string): { html: string; script: string } {
  const scripts: string[] = [];
  const html = raw.replace(
    /<script\b([^>]*)>([\s\S]*?)<\/script>/gi,
    (full, attrs: string, code: string) => {
      if (/\bsrc\s*=/i.test(attrs)) return full;
      scripts.push(code ?? "");
      return "";
    },
  );
  return { html: html.trim(), script: scripts.join("\n").trim() };
}
