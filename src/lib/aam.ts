import { COMPANY } from "./company";

/**
 * Central AAM (alanyi adómentes) rule.
 *
 * The seller is VAT-exempt, so every price on the site is a final amount:
 * no VAT is added anywhere — not on product pages, not at checkout, not in
 * e-mails. If the VAT status ever changes, flip COMPANY.vatStatus and the
 * whole site follows.
 */
export const AAM_MODE = COMPANY.vatStatus.toLowerCase().includes("alanyi adómentes");

/** Full note shown next to prices on product pages. */
export const AAM_PRICE_NOTE =
  "A feltüntetett ár a fizetendő végösszeg. Alanyi adómentes (AAM) értékesítés – ÁFA nem kerül felszámításra.";

/** Short variant for compact UI (checkout, cards). */
export const AAM_PRICE_NOTE_SHORT = "Alanyi adómentes (AAM) – ÁFA nem kerül felszámításra.";

/**
 * Price/payment-related VAT phrases that must not appear next to payable
 * amounts in AAM mode. Deliberately strict: patterns only match when the VAT
 * mention expresses a price computation ("+ ÁFA", "nettó ár", "27% ÁFA",
 * "ÁFA-val együtt" …). Product FEATURE descriptions that legitimately talk
 * about VAT (e.g. "ÁFA kulcs legördülő", "áfabevallás", "+ áfa sorok") do
 * NOT match and are left untouched.
 */
const PRICE_VAT_RULES: Array<[RegExp, string]> = [
  // "19 900 Ft + ÁFA" / "+ÁFA," — only when ÁFA closes the clause
  [/\s*\+\s*ÁFA(?=\s*[.,;:!?)\]]|\s*$)/gi, ""],
  // "27% ÁFA", "(27%-os ÁFA)" next to a price
  [/\s*\(?\d{1,2}\s?%\s?(?:-?os\s|-?es\s)?ÁFA\)?/gi, ""],
  // "ÁFA-val együtt", "ÁFA nélkül(i)"
  [/\s*ÁFA-val együtt/gi, ""],
  [/\s*ÁFA nélküli?/gi, ""],
  // "ÁFA felszámításával", "felszámított ÁFA"
  [/\s*\(?ÁFA felszámításával\)?/gi, ""],
  [/\s*\(?felszámított ÁFA\)?/gi, ""],
  // "az ár ÁFÁ-t (nem) tartalmaz(za)" statements about the price itself
  [/\s*,?\s*(?:az ár\s+)?ÁFÁ?-t nem tartalmaz\w*/gi, ""],
  // "nettó ár / nettó díj / nettó fizetendő" → drop the "nettó" qualifier
  [/\bnettó\s+(?=(?:ár|díj|összeg|fizetendő))/gi, ""],
  // "bruttó ár / bruttó díj" → final-amount phrasing
  [/\bbruttó\s+(?:ár|díj)\b/gi, "végösszeg"],
];

/**
 * Rewrites payment-related VAT mentions out of a display string when the
 * seller is in AAM mode. Safe to apply to any customer-facing product text
 * (intro, features, tier notes, taglines, steps); non-price VAT references
 * pass through unchanged. No-op when AAM_MODE is off.
 */
export function aamText(text: string): string {
  if (!AAM_MODE) return text;
  let out = text;
  for (const [pattern, replacement] of PRICE_VAT_RULES) {
    out = out.replace(pattern, replacement);
  }
  return out
    .replace(/\(\s*\)/g, "")
    .replace(/ {2,}/g, " ")
    .replace(/ +([.,;:!?)\]])/g, "$1")
    .replace(/\s+–\s*([.,;:!?])/g, "$1")
    .trim();
}
