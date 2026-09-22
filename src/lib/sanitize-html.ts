/**
 * Minimal, isomorphic HTML hardening used wherever stored markup has to be
 * injected into a live DOM (calculator pages, admin preview, newsletter
 * editor). It runs identically on the server (SSR) and in the browser, so the
 * rendered markup never differs between the two.
 *
 * It removes the parts that can execute code while leaving layout, styling,
 * ids, classes and data attributes untouched — the calculators drive
 * themselves from a separately loaded script, so they keep working.
 */

const DANGEROUS_ELEMENTS =
  /<\s*(script|iframe|object|embed|link|meta|base|form|noscript)\b[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi;
const DANGEROUS_VOID_ELEMENTS =
  /<\s*(script|iframe|object|embed|link|meta|base|noscript)\b[^>]*\/?>/gi;
const EVENT_HANDLER_ATTR =
  /\son[a-z-]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'>]+)/gi;
const UNSAFE_URL_ATTR =
  /\s(href|src|xlink:href|action|formaction|srcdoc|data)\s*=\s*(?:"\s*(?:javascript|vbscript|data:text\/html)[^"]*"|'\s*(?:javascript|vbscript|data:text\/html)[^']*'|\s*(?:javascript|vbscript):[^\s>]*)/gi;

/** Strips executable markup (scripts, event handlers, script-ish URLs). */
export function sanitizeEmbeddedHtml(html: string): string {
  if (!html) return "";
  let out = html;
  let previous = "";
  // Repeat until stable so nested / broken markup cannot smuggle a tag through.
  while (out !== previous) {
    previous = out;
    out = out
      .replace(DANGEROUS_ELEMENTS, "")
      .replace(DANGEROUS_VOID_ELEMENTS, "")
      .replace(EVENT_HANDLER_ATTR, "")
      .replace(UNSAFE_URL_ATTR, "");
  }
  return out;
}
