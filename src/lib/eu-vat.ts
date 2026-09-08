/**
 * VAT treatment of a single order (client- and server-safe).
 *
 * The seller is AAM (alanyi adómentes), so domestic sales carry the "AAM" VAT
 * key with no VAT added. A buyer with a valid EU VAT number from another member
 * state is a different case: the supply is a B2B service under Áfa tv. 37. §,
 * so the invoice must carry the "EUFAD37" VAT key and the mandatory
 * "Reverse charge" note. Non-EU buyers stay on AAM (we do not assume export
 * rules automatically).
 */

/** EU member state VAT prefixes (EL = Greece, XI = Northern Ireland). */
const EU_VAT_PREFIXES = new Set([
  "AT","BE","BG","CY","CZ","DE","DK","EE","EL","ES","FI","FR","GR","HR","HU",
  "IE","IT","LT","LU","LV","MT","NL","PL","PT","RO","SE","SI","SK","XI",
]);

export type VatTreatment = "aam" | "eufad37";

/**
 * Billingo VAT key + entitlement pair for a treatment.
 *
 * An Áfa tv. 37. § B2B service to another member state is booked with the
 * "ÁTHK" VAT key (áfa törvény hatályán kívüli, közösségi) and the predefined
 * "EUFAD37" entitlement (Áfa tv. 37. §), together with the Reverse charge note
 * below. Verified against the live invoicing API: entitlement must be one of
 * EUFAD37, EUFADE, EUE, HO, and the partner must be a FOREIGN partner with a
 * valid EU VAT number.
 */
export const VAT_KEYS: Record<VatTreatment, { vat: string; entitlement: string }> = {
  aam: { vat: "AAM", entitlement: "AAM" },
  eufad37: { vat: "ÁTHK", entitlement: "EUFAD37" },
};


/** Mandatory note on a reverse-charge invoice. */
export const REVERSE_CHARGE_NOTE =
  "Reverse charge – a fordított adózás szabályai szerint az adót a vevő fizeti meg (Áfa tv. 37. §).";

/** Normalises a tax number to its compact, uppercase form. */
function compact(taxNumber: string | null | undefined): string {
  return (taxNumber ?? "").replace(/[\s.\-/]/g, "").toUpperCase();
}

/**
 * Returns the two-letter EU VAT prefix of a tax number, or null when the value
 * is not an EU VAT id (empty, purely numeric Hungarian adószám, non-EU code).
 */
export function euVatPrefix(taxNumber: string | null | undefined): string | null {
  const value = compact(taxNumber);
  if (!/^[A-Z]{2}[0-9A-Z]{2,12}$/.test(value)) return null;
  const prefix = value.slice(0, 2);
  return EU_VAT_PREFIXES.has(prefix) ? prefix : null;
}

/** True when the buyer holds a VAT number of another EU member state. */
export function isEuReverseCharge(taxNumber: string | null | undefined): boolean {
  const prefix = euVatPrefix(taxNumber);
  return prefix !== null && prefix !== "HU";
}

/** VAT treatment for an order's tax number. */
export function vatTreatmentFor(taxNumber: string | null | undefined): VatTreatment {
  return isEuReverseCharge(taxNumber) ? "eufad37" : "aam";
}
