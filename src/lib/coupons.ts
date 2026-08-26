/**
 * Coupon policy (client-safe constants).
 *
 * Test coupons (e.g. the 100% XLNTTESZT100 code) must never be usable in the
 * live Stripe environment. In live only the codes listed in
 * ALLOWED_LIVE_PROMOTION_CODES may stay active; every other promotion code is
 * deactivated automatically by the live coupon guard.
 */

/** Explicitly allowed live promotion codes. Empty = no coupon usable in live. */
export const ALLOWED_LIVE_PROMOTION_CODES: string[] = [];

/** Internal test codes that must always be off in live. */
export const TEST_PROMOTION_CODES = ["XLNTTESZT100"];

export function isAllowedLiveCode(code: string): boolean {
  const normalized = code.trim().toUpperCase();
  return ALLOWED_LIVE_PROMOTION_CODES.some((c) => c.trim().toUpperCase() === normalized);
}

/** Whether the checkout should offer a promotion-code field at all. */
export function promotionCodesEnabled(environment: "sandbox" | "live"): boolean {
  return environment === "sandbox" || ALLOWED_LIVE_PROMOTION_CODES.length > 0;
}
