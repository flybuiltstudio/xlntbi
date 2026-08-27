/**
 * Coupon policy (client-safe constants).
 *
 * Test coupons (e.g. the 100% XLNTTESZT100 code) must never be usable in the
 * live Stripe environment — except inside an explicit, time-limited window.
 * In live only the codes listed in ALLOWED_LIVE_PROMOTION_CODES may stay
 * active, and only until their `expiresAt`; every other promotion code is
 * deactivated automatically by the live coupon guard.
 */

export type LivePromotionCodeGrant = {
  code: string;
  /** ISO timestamp — the code stops being allowed at this instant. */
  expiresAt: string;
};

/**
 * Explicitly allowed live promotion codes with their expiry.
 * XLNTTESZT100 (100% off) is allowed in live until 2026-08-31 23:59:59
 * Budapest time (UTC+2) = 2026-08-31T21:59:59Z. After that the live coupon
 * guard deactivates it again; it stays usable in sandbox only.
 */
export const ALLOWED_LIVE_PROMOTION_CODES: LivePromotionCodeGrant[] = [
  { code: "XLNTTESZT100", expiresAt: "2026-08-31T21:59:59Z" },
];

/** Internal test codes that must always be off in live outside any window. */
export const TEST_PROMOTION_CODES = ["XLNTTESZT100"];

function normalize(code: string): string {
  return code.trim().toUpperCase();
}

/** Grant for a code, or null if none/expired. */
export function liveGrantFor(
  code: string,
  now: Date = new Date(),
): LivePromotionCodeGrant | null {
  const normalized = normalize(code);
  return (
    ALLOWED_LIVE_PROMOTION_CODES.find(
      (g) => normalize(g.code) === normalized && Date.parse(g.expiresAt) > now.getTime(),
    ) ?? null
  );
}

export function isAllowedLiveCode(code: string, now: Date = new Date()): boolean {
  return liveGrantFor(code, now) !== null;
}

/** Whether the checkout should offer a promotion-code field at all. */
export function promotionCodesEnabled(
  environment: "sandbox" | "live",
  now: Date = new Date(),
): boolean {
  if (environment === "sandbox") return true;
  return ALLOWED_LIVE_PROMOTION_CODES.some((g) => Date.parse(g.expiresAt) > now.getTime());
}
