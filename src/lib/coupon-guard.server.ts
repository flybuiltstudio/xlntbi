/**
 * Live coupon guard.
 *
 * Deactivates every live Stripe promotion code that is not explicitly allowed
 * in ALLOWED_LIVE_PROMOTION_CODES. Runs automatically (throttled) whenever a
 * live checkout session is created, and on demand from the admin UI.
 */

import { ALLOWED_LIVE_PROMOTION_CODES, isAllowedLiveCode } from "./coupons";
import { createStripeClient, getStripeErrorMessage } from "./stripe.server";

const SETTING_KEY = "live_coupon_guard";
const THROTTLE_MS = 6 * 60 * 60 * 1000; // 6 hours

export type CouponGuardResult = {
  ok: boolean;
  checked: number;
  deactivated: string[];
  kept: string[];
  error?: string;
};

/** Deactivates all non-allowlisted active promotion codes in the live account. */
export async function sweepLivePromotionCodes(): Promise<CouponGuardResult> {
  const deactivated: string[] = [];
  const kept: string[] = [];
  let checked = 0;

  try {
    const stripe = createStripeClient("live");
    const codes = await stripe.promotionCodes.list({ active: true, limit: 100 });
    for (const promo of codes.data) {
      checked += 1;
      if (isAllowedLiveCode(promo.code)) {
        kept.push(promo.code);
        continue;
      }
      await stripe.promotionCodes.update(promo.id, { active: false });
      deactivated.push(promo.code);
    }

    const { setSetting } = await import("./app-settings.server");
    await setSetting(SETTING_KEY, {
      last_run_at: new Date().toISOString(),
      deactivated,
      kept,
      allowlist: ALLOWED_LIVE_PROMOTION_CODES,
    });

    if (deactivated.length) {
      console.log("Live promotion codes deactivated:", deactivated.join(", "));
    }
    return { ok: true, checked, deactivated, kept };
  } catch (error) {
    const message = getStripeErrorMessage(error);
    console.error("Live coupon guard failed:", message);
    return { ok: false, checked, deactivated, kept, error: message };
  }
}

/** Runs the sweep at most once per THROTTLE_MS. Never throws. */
export async function sweepLivePromotionCodesThrottled(): Promise<void> {
  try {
    const { getSetting } = await import("./app-settings.server");
    const state = await getSetting(SETTING_KEY);
    const last = typeof state["last_run_at"] === "string" ? Date.parse(state["last_run_at"]) : 0;
    if (last && Date.now() - last < THROTTLE_MS) return;
    await sweepLivePromotionCodes();
  } catch (e: any) {
    console.error("Live coupon guard (throttled) failed:", e?.message ?? e);
  }
}

/** Last recorded guard state, for the admin UI. */
export async function couponGuardState(): Promise<{
  lastRunAt: string | null;
  deactivated: string[];
  kept: string[];
  allowlist: string[];
}> {
  const { getSetting } = await import("./app-settings.server");
  const state = await getSetting(SETTING_KEY);
  return {
    lastRunAt: typeof state["last_run_at"] === "string" ? state["last_run_at"] : null,
    deactivated: Array.isArray(state["deactivated"]) ? state["deactivated"] : [],
    kept: Array.isArray(state["kept"]) ? state["kept"] : [],
    allowlist: ALLOWED_LIVE_PROMOTION_CODES,
  };
}
