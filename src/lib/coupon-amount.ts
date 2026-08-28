/**
 * Central forint <-> minor unit (fillér) conversion for coupons.
 *
 * Stripe stores every amount in minor units, so a 5 000 Ft fixed discount is
 * 500000 in Stripe. Admin input and every display surface (list, CSV export,
 * usage log, invoice line) must go through these helpers so a fillér value is
 * never printed as forint (100x error) and a forint value is never sent to
 * Stripe unscaled.
 */

/** Max two decimals, optional thousand separators / spaces, comma or dot decimal. */
const HUF_INPUT_RE = /^-?\d{1,3}(?:[ \u00A0.]?\d{3})*(?:[.,]\d{1,2})?$|^-?\d+(?:[.,]\d{1,2})?$/;

export type ParseResult =
  | { ok: true; minor: number; huf: number }
  | { ok: false; error: string };

/**
 * Parses an admin-entered forint amount and returns the Stripe minor-unit
 * value. Rejects anything that is not a plain forint amount with at most two
 * decimals (so "5000,555", "5e3", "1 000 Ft" style typos fail loudly).
 */
export function parseHufInput(raw: string, label = "Az összeg"): ParseResult {
  const value = String(raw ?? "").trim();
  if (value === "") return { ok: false, error: `${label} megadása kötelező.` };
  if (!HUF_INPUT_RE.test(value)) {
    return {
      ok: false,
      error: `${label} csak forintban, legfeljebb két tizedesjeggyel adható meg (pl. 5000 vagy 5000,50).`,
    };
  }
  const normalized = value.replace(/[ \u00A0.](?=\d{3}\b)/g, "").replace(",", ".");
  const huf = Number(normalized);
  if (!Number.isFinite(huf)) {
    return { ok: false, error: `${label} nem értelmezhető számként.` };
  }
  if (huf <= 0) return { ok: false, error: `${label} nullánál nagyobb kell legyen.` };
  const minor = Math.round(huf * 100);
  if (!Number.isSafeInteger(minor)) {
    return { ok: false, error: `${label} túl nagy.` };
  }
  return { ok: true, minor, huf: minor / 100 };
}

/** Stripe minor units -> forint number. */
export function minorToHuf(minor: number): number {
  return Math.round(minor) / 100;
}

/** Forint -> Stripe minor units (already validated numeric input). */
export function hufToMinor(huf: number): number {
  return Math.round(huf * 100);
}

/** Formats a Stripe minor-unit amount as Hungarian forint text. */
export function formatMinorAsHuf(minor: number | null | undefined, fallback = "—"): string {
  if (minor == null || !Number.isFinite(minor)) return fallback;
  const huf = minorToHuf(minor);
  const hasFraction = Math.abs(huf % 1) > 0;
  return `${huf.toLocaleString("hu-HU", {
    minimumFractionDigits: hasFraction ? 2 : 0,
    maximumFractionDigits: 2,
  })} Ft`;
}

/** Formats a whole-forint amount (order totals, invoice lines) as text. */
export function formatHuf(huf: number | null | undefined, fallback = "—"): string {
  if (huf == null || !Number.isFinite(huf)) return fallback;
  return `${Math.round(huf).toLocaleString("hu-HU")} Ft`;
}

/** Human readable discount rule from a Stripe coupon-like object. */
export function describeDiscountRule(coupon: {
  percent_off?: number | null;
  amount_off?: number | null;
  currency?: string | null;
} | null | undefined): string | null {
  if (!coupon) return null;
  if (coupon.percent_off) return `${coupon.percent_off}%`;
  if (coupon.amount_off) {
    const currency = String(coupon.currency ?? "huf").toUpperCase();
    if (currency === "HUF") return formatMinorAsHuf(coupon.amount_off);
    return `${minorToHuf(coupon.amount_off).toLocaleString("hu-HU")} ${currency}`;
  }
  return null;
}

/** Invoice line label for a coupon discount, e.g. "Kuponkedvezmény (NYAR10): -5 000 Ft". */
export function couponInvoiceLineName(
  code: string | null,
  discountHuf: number,
): string {
  const base = code ? `Kuponkedvezmény (${code})` : "Kuponkedvezmény";
  return `${base}: -${formatHuf(discountHuf, "0 Ft")}`;
}
