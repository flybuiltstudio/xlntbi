/**
 * Live coupon guard.
 *
 * Deactivates every live Stripe promotion code that is not explicitly allowed
 * in ALLOWED_LIVE_PROMOTION_CODES (or whose grant already expired), and makes
 * sure still-valid allowed codes exist, are active, and carry their
 * `expires_at` so Stripe itself rejects them after the window closes.
 * Runs automatically (throttled) whenever a live checkout session is created,
 * and on demand from the admin UI.
 */

import {
  ALLOWED_LIVE_PROMOTION_CODES,
  type LivePromotionCodeGrant,
  isAllowedLiveCode,
} from "./coupons";
import { createStripeClient, getStripeErrorMessage } from "./stripe.server";

const SETTING_KEY = "live_coupon_guard";
const THROTTLE_MS = 6 * 60 * 60 * 1000; // 6 hours

export type CouponGuardResult = {
  ok: boolean;
  checked: number;
  deactivated: string[];
  kept: string[];
  activated: string[];
  error?: string;
};

function activeGrants(now: Date): LivePromotionCodeGrant[] {
  return ALLOWED_LIVE_PROMOTION_CODES.filter((g) => Date.parse(g.expiresAt) > now.getTime());
}

/**
 * Makes sure every still-valid allowed code exists in the live account, is
 * active, and expires at the grant's `expiresAt` (Stripe rejects it after
 * that even if the guard never runs again).
 */
async function ensureAllowedCodes(
  stripe: ReturnType<typeof createStripeClient>,
  grants: LivePromotionCodeGrant[],
): Promise<string[]> {
  const activated: string[] = [];
  for (const grant of grants) {
    const code = grant.code.trim().toUpperCase();
    const expiresAt = Math.floor(Date.parse(grant.expiresAt) / 1000);
    const existing = await stripe.promotionCodes.list({ code, limit: 10 });
    const promo = existing.data.find((p) => p.code.trim().toUpperCase() === code);
    if (promo) {
      // Note: Stripe does not allow updating expires_at on an existing
      // promotion code (create-only field). If the code already exists we
      // only reactivate it; the guard sweep deactivates it once the grant
      // window closes.
      if (!promo.active) {
        try {
          await stripe.promotionCodes.update(promo.id, { active: true });
          activated.push(code);
          continue;
        } catch (e) {
          // The backing coupon may have become invalid (deleted/expired) —
          // fall through and create a fresh promotion code from a valid one.
          console.warn(`Live coupon guard: reactivation of ${code} failed:`, getStripeErrorMessage(e));
        }
      } else {
        continue;
      }
    }
    // Not present in live (or its coupon is invalid): create it from a 100% coupon.
    const coupons = await stripe.coupons.list({ limit: 100 });
    const percentOff = coupons.data.find((c) => c.percent_off === 100 && c.valid !== false);
    if (!percentOff) {
      console.error(`Live coupon guard: no 100% coupon found to back ${code}`);
      continue;
    }
    await stripe.promotionCodes.create({
      promotion: { type: "coupon", coupon: percentOff.id },
      code,
      active: true,
      expires_at: expiresAt,
    });
    activated.push(code);
  }
  return activated;
}

/** Deactivates all non-allowlisted (or expired) promotion codes in the live account. */
export async function sweepLivePromotionCodes(): Promise<CouponGuardResult> {
  const deactivated: string[] = [];
  const kept: string[] = [];
  let activated: string[] = [];
  let checked = 0;

  try {
    const now = new Date();
    const stripe = createStripeClient("live");

    // First, reactivate / create allowed codes that are still inside their window.
    activated = await ensureAllowedCodes(stripe, activeGrants(now));

    // Then sweep: anything active that is not currently allowed goes off.
    const codes = await stripe.promotionCodes.list({ active: true, limit: 100 });
    for (const promo of codes.data) {
      checked += 1;
      if (isAllowedLiveCode(promo.code, now)) {
        kept.push(promo.code);
        continue;
      }
      await stripe.promotionCodes.update(promo.id, { active: false });
      deactivated.push(promo.code);
    }

    const { setSetting } = await import("./app-settings.server");
    await setSetting(SETTING_KEY, {
      last_run_at: now.toISOString(),
      deactivated,
      kept,
      activated,
      allowlist: ALLOWED_LIVE_PROMOTION_CODES.map((g) => `${g.code} (eddig: ${g.expiresAt})`),
    });

    if (deactivated.length) {
      console.log("Live promotion codes deactivated:", deactivated.join(", "));
    }
    if (activated.length) {
      console.log("Live promotion codes activated:", activated.join(", "));
    }
    return { ok: true, checked, deactivated, kept, activated };
  } catch (error) {
    const message = getStripeErrorMessage(error);
    console.error("Live coupon guard failed:", message);
    return { ok: false, checked, deactivated, kept, activated, error: message };
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
  activated: string[];
  allowlist: string[];
}> {
  const { getSetting } = await import("./app-settings.server");
  const state = await getSetting(SETTING_KEY);
  return {
    lastRunAt: typeof state["last_run_at"] === "string" ? state["last_run_at"] : null,
    deactivated: Array.isArray(state["deactivated"]) ? state["deactivated"] : [],
    kept: Array.isArray(state["kept"]) ? state["kept"] : [],
    activated: Array.isArray(state["activated"]) ? state["activated"] : [],
    allowlist: ALLOWED_LIVE_PROMOTION_CODES.map((g) => `${g.code} (eddig: ${g.expiresAt})`),
  };
}
