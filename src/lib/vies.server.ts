/**
 * Live EU VAT number check through the European Commission's VIES service.
 *
 * Fail-open by design: VIES is frequently unavailable for individual member
 * states, so we only reject an order when VIES explicitly says the number is
 * invalid. Any timeout, HTTP error, service outage or unexpected payload
 * results in "unknown" and the order proceeds.
 */

import { euVatPrefix } from "./eu-vat";

const VIES_BASE = "https://ec.europa.eu/taxation_customs/vies/rest-api";
const TIMEOUT_MS = 7000;

export type ViesResult = {
  status: "valid" | "invalid" | "unknown";
  /** Registered company name, when VIES returns one. */
  name?: string | null;
  /** Registered address, when VIES returns one. */
  address?: string | null;
  /** Why the check could not be completed (only for "unknown"). */
  reason?: string;
};

function compact(taxNumber: string): string {
  return taxNumber.replace(/[\s.\-/]/g, "").toUpperCase();
}

/**
 * Checks an EU VAT number in VIES. Returns "unknown" for anything that is not
 * another member state's VAT id (domestic Hungarian numbers included), because
 * there is nothing for VIES to answer.
 */
export async function checkViesVatNumber(
  taxNumber: string | null | undefined,
): Promise<ViesResult> {
  const value = compact(taxNumber ?? "");
  const prefix = euVatPrefix(value);
  if (!prefix || prefix === "HU") {
    return { status: "unknown", reason: "nem EU-s (másik tagállami) adószám" };
  }
  const number = value.slice(2);
  if (!number) return { status: "unknown", reason: "hiányos adószám" };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(
      `${VIES_BASE}/ms/${encodeURIComponent(prefix)}/vat/${encodeURIComponent(number)}`,
      { signal: controller.signal, headers: { Accept: "application/json" } },
    );
    if (!res.ok) {
      return { status: "unknown", reason: `VIES HTTP ${res.status}` };
    }
    const body: any = await res.json().catch(() => null);
    if (!body || typeof body.isValid !== "boolean") {
      return { status: "unknown", reason: "értelmezhetetlen VIES válasz" };
    }
    if (body.isValid === true) {
      const name = typeof body.name === "string" && body.name !== "---" ? body.name : null;
      const address =
        typeof body.address === "string" && body.address !== "---" ? body.address : null;
      return { status: "valid", name, address };
    }
    // isValid false: only a definite "INVALID" answer is a real rejection; any
    // other userError (service down, member state unavailable, timeout) is
    // inconclusive and must not block the order.
    const userError = String(body.userError ?? "").toUpperCase();
    if (userError === "INVALID" || userError === "INVALID_INPUT") {
      return { status: "invalid" };
    }
    return { status: "unknown", reason: userError || "VIES nem tudott választ adni" };
  } catch (e: any) {
    const reason = e?.name === "AbortError" ? "VIES időtúllépés" : (e?.message ?? "VIES hiba");
    return { status: "unknown", reason };
  } finally {
    clearTimeout(timer);
  }
}
