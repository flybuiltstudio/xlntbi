/**
 * Keeps `public.admin_coupons` in sync with coupon changes made OUTSIDE the
 * admin UI (directly in the Stripe dashboard).
 *
 * Handled Stripe events:
 *   promotion_code.created / promotion_code.updated  -> upsert row
 *   coupon.updated                                   -> refresh its promo codes
 *   coupon.deleted                                   -> disable its promo codes
 *
 * A promotion code that only exists in Stripe is inserted with source
 * `stripe`, so the admin Kuponok list and the live coupon guard immediately
 * see it. Rows are never deleted — a removed/inactive code is marked disabled
 * so the history stays auditable.
 */

import type { StripeEnv } from "./stripe.server";

const COUPON_EVENT_PREFIXES = ["promotion_code.", "coupon."];

export function isCouponEvent(eventType: string): boolean {
  return COUPON_EVENT_PREFIXES.some((p) => eventType.startsWith(p));
}

function isoFromUnix(value: unknown): string | null {
  return typeof value === "number" && Number.isFinite(value)
    ? new Date(value * 1000).toISOString()
    : null;
}

type PromoRow = {
  code: string;
  environment: StripeEnv;
  expires_at: string | null;
  discount_type: "percent" | "amount";
  percent_off: number | null;
  amount_off: number | null;
  currency: string;
  max_redemptions: number | null;
  min_amount: number | null;
  stripe_coupon_id: string;
  stripe_promotion_code_id: string;
  stripe_active: boolean;
  times_redeemed: number;
  disabled_at: string | null;
  last_synced_at: string;
};

function rowFromPromo(promo: any, environment: StripeEnv): PromoRow | null {
  const code = typeof promo?.code === "string" ? promo.code.trim().toUpperCase() : "";
  if (!code) return null;
  const coupon = promo.coupon ?? {};
  const percentOff = typeof coupon.percent_off === "number" ? coupon.percent_off : null;
  const amountOff = typeof coupon.amount_off === "number" ? coupon.amount_off : null;
  const active = Boolean(promo.active) && coupon.valid !== false;

  return {
    code,
    environment,
    expires_at: isoFromUnix(promo.expires_at),
    discount_type: percentOff ? "percent" : "amount",
    percent_off: percentOff,
    amount_off: amountOff,
    currency: String(coupon.currency ?? "huf").toLowerCase(),
    max_redemptions:
      typeof promo.max_redemptions === "number" ? promo.max_redemptions : null,
    min_amount:
      typeof promo.restrictions?.minimum_amount === "number"
        ? promo.restrictions.minimum_amount
        : null,
    stripe_coupon_id: String(coupon.id ?? ""),
    stripe_promotion_code_id: String(promo.id ?? ""),
    stripe_active: active,
    times_redeemed: typeof promo.times_redeemed === "number" ? promo.times_redeemed : 0,
    // Stripe is the source of truth for the on/off state.
    disabled_at: active ? null : new Date().toISOString(),
    last_synced_at: new Date().toISOString(),
  };
}

async function db() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin as any;
}

async function upsertPromo(promo: any, environment: StripeEnv): Promise<string> {
  const row = rowFromPromo(promo, environment);
  if (!row) return "ignored_no_code";
  const client = await db();

  const { data: existing } = await client
    .from("admin_coupons")
    .select("id, source")
    .eq("environment", environment)
    .eq("code", row.code)
    .maybeSingle();

  if (existing) {
    const { error } = await client.from("admin_coupons").update(row).eq("id", existing.id);
    if (error) throw new Error(error.message);
    return "updated";
  }

  const { error } = await client
    .from("admin_coupons")
    .insert({ ...row, source: "stripe", all_products: true, product_slugs: [] });
  if (error) throw new Error(error.message);
  return "inserted";
}

/** Re-reads every promotion code of a coupon from Stripe and syncs the rows. */
async function syncCouponPromos(couponId: string, environment: StripeEnv): Promise<string> {
  const { createStripeClient } = await import("./stripe.server");
  const stripe = createStripeClient(environment);
  const list = await stripe.promotionCodes.list({ coupon: couponId, limit: 100 });
  for (const promo of list.data) await upsertPromo(promo, environment);
  return `synced_${list.data.length}`;
}

async function disableCouponPromos(couponId: string, environment: StripeEnv): Promise<string> {
  const client = await db();
  const now = new Date().toISOString();
  const { error } = await client
    .from("admin_coupons")
    .update({ disabled_at: now, stripe_active: false, last_synced_at: now })
    .eq("environment", environment)
    .eq("stripe_coupon_id", couponId);
  if (error) throw new Error(error.message);
  return "disabled";
}

/**
 * Processes one coupon-related Stripe event. Returns a short outcome string
 * for the webhook event log.
 */
export async function handleCouponEvent(
  event: { type: string; data: { object: any } },
  environment: StripeEnv,
): Promise<string> {
  const object = event.data?.object ?? {};

  switch (event.type) {
    case "promotion_code.created":
    case "promotion_code.updated":
      return upsertPromo(object, environment);
    case "coupon.created":
    case "coupon.updated":
      return syncCouponPromos(String(object.id ?? ""), environment);
    case "coupon.deleted":
      return disableCouponPromos(String(object.id ?? ""), environment);
    default:
      return "ignored";
  }
}
