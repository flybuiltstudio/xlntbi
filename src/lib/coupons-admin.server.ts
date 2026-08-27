/**
 * Admin coupon management.
 *
 * Lists, creates, and disables Stripe promotion codes (coupons) from the
 * admin UI. Coupons created here are persisted in `public.admin_coupons` so
 * the admin can attach local metadata (product scope, creator), and so the
 * live coupon guard (coupon-guard.server.ts) treats them as allowlisted for
 * as long as they are not expired or manually disabled.
 */

import { type StripeEnv, createStripeClient, getStripeErrorMessage } from "./stripe.server";
import { products } from "./products";

export type DiscountType = "percent" | "amount";

export type CreateCouponInput = {
  code: string;
  environment: StripeEnv;
  expiresAt: string | null;
  discountType: DiscountType;
  /** 1..100 when discountType === "percent". */
  percentOff: number | null;
  /** Minor units (forints) when discountType === "amount". */
  amountOff: number | null;
  currency: string;
  /** Empty array means "all products". */
  productSlugs: string[];
  allProducts: boolean;
  /** null = unlimited redemptions. */
  maxRedemptions: number | null;
  /** null = no minimum amount. Minor units (forints). */
  minAmount: number | null;
  createdBy: string;
};

export type AdminCouponView = {
  code: string;
  environment: StripeEnv;
  active: boolean;
  expiresAt: string | null;
  discountType: DiscountType;
  percentOff: number | null;
  amountOff: number | null;
  currency: string;
  maxRedemptions: number | null;
  timesRedeemed: number;
  minAmount: number | null;
  allProducts: boolean;
  productSlugs: string[];
  productNames: string[];
  createdAt: string | null;
  createdBy: string | null;
  disabledAt: string | null;
  /** "valid" | "expired" | "disabled" | "used_up" */
  status: string;
};

/** Resolve Stripe product ids for the given product slugs via price lookup keys. */
async function resolveProductIds(
  stripe: ReturnType<typeof createStripeClient>,
  slugs: string[],
): Promise<string[]> {
  const ids = new Set<string>();
  for (const slug of slugs) {
    const product = products.find((p) => p.slug === slug);
    if (!product) continue;
    const priceList = await stripe.prices.list({ lookup_keys: [product.priceId], limit: 5 });
    const price = priceList.data[0];
    if (!price) continue;
    const productId =
      typeof price.product === "string" ? price.product : price.product.id;
    if (productId) ids.add(productId);
  }
  return [...ids];
}

function productNamesFor(slugs: string[]): string[] {
  return slugs
    .map((slug) => products.find((p) => p.slug === slug)?.name ?? slug)
    .filter(Boolean);
}

function discountTypeOf(coupon: {
  percent_off?: number | null;
  amount_off?: number | null;
}): DiscountType {
  return coupon.percent_off ? "percent" : "amount";
}

function couponStatus(
  active: boolean,
  expiresAt: number | null,
  timesRedeemed: number,
  maxRedemptions: number | null,
  disabledAt: string | null,
): string {
  if (disabledAt) return "disabled";
  if (!active) return "disabled";
  if (maxRedemptions && timesRedeemed >= maxRedemptions) return "used_up";
  if (expiresAt && expiresAt * 1000 <= Date.now()) return "expired";
  return "valid";
}

/**
 * Lists every promotion code (coupon) in the given environment, enriched
 * with the local admin_coupons metadata (product scope, creator).
 */
export async function listAdminCoupons(environment: StripeEnv): Promise<AdminCouponView[]> {
  const stripe = createStripeClient(environment);

  // Load local metadata rows for this environment.
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: rows } = await supabaseAdmin
    .from("admin_coupons")
    .select("*")
    .eq("environment", environment);
  const metaByCode = new Map(
    (rows ?? []).map((r: any) => [String(r.code).toUpperCase(), r]),
  );

  const out: AdminCouponView[] = [];
  let hasMore = true;
  let startingAfter: string | undefined;

  // Stripe promotionCodes.list returns at most 100 per page.
  while (hasMore) {
    const params: any = { limit: 100 };
    if (startingAfter) params.starting_after = startingAfter;
    const list = await stripe.promotionCodes.list(params);

    for (const promo of list.data) {
      const coupon = (promo as any).coupon ?? null;
      const meta = metaByCode.get(String(promo.code).toUpperCase());
      const expiresAt =
        typeof promo.expires_at === "number" ? promo.expires_at : null;
      const maxRedemptions =
        typeof promo.max_redemptions === "number" ? promo.max_redemptions : null;
      const minAmount =
        promo.restrictions && typeof promo.restrictions.minimum_amount === "number"
          ? promo.restrictions.minimum_amount
          : null;
      const slugs: string[] = meta?.product_slugs ?? [];
      const allProducts = meta?.all_products ?? true;
      const createdBy = meta?.created_by ?? null;
      const createdAt = meta?.created_at ?? null;
      const disabledAt = meta?.disabled_at ?? null;

      out.push({
        code: promo.code,
        environment,
        active: Boolean(promo.active),
        expiresAt: expiresAt ? new Date(expiresAt * 1000).toISOString() : null,
        discountType: discountTypeOf(coupon ?? {}),
        percentOff: coupon?.percent_off ?? null,
        amountOff: coupon?.amount_off ?? null,
        currency: String(coupon?.currency ?? "huf").toUpperCase(),
        maxRedemptions,
        timesRedeemed: promo.times_redeemed ?? 0,
        minAmount,
        allProducts,
        productSlugs: slugs,
        productNames: allProducts ? [] : productNamesFor(slugs),
        createdAt,
        createdBy,
        disabledAt,
        status: couponStatus(
          Boolean(promo.active),
          expiresAt,
          promo.times_redeemed ?? 0,
          maxRedemptions,
          disabledAt,
        ),
      });
    }

    hasMore = list.has_more;
    startingAfter = list.data[list.data.length - 1]?.id;
  }

  return out;
}

/**
 * Creates a Stripe coupon + promotion code and records it in admin_coupons.
 * Throws on failure (the server function wraps it in a friendly message).
 */
export async function createAdminCoupon(input: CreateCouponInput): Promise<AdminCouponView> {
  const stripe = createStripeClient(input.environment);
  const code = input.code.trim().toUpperCase();

  // Reject duplicates before touching Stripe.
  const existing = await stripe.promotionCodes.list({ code, limit: 5 });
  if (existing.data.some((p) => p.code.toUpperCase() === code)) {
    throw new Error(`A(z) ${code} kuponkód már létezik ebben a környezetben.`);
  }

  const couponParams: any = {
    name: code,
    duration: "forever",
  };
  let productIds: string[] = [];
  if (input.discountType === "percent") {
    if (!input.percentOff || input.percentOff < 1 || input.percentOff > 100) {
      throw new Error("A százalékos kedvezmény 1 és 100 között kell legyen.");
    }
    couponParams.percent_off = input.percentOff;
  } else {
    if (!input.amountOff || input.amountOff <= 0) {
      throw new Error("A kedvezmény összege nagyobb kell legyen nullánál.");
    }
    couponParams.amount_off = input.amountOff;
    couponParams.currency = (input.currency || "huf").toLowerCase();
  }

  if (!input.allProducts) {
    productIds = await resolveProductIds(stripe, input.productSlugs);
    if (productIds.length === 0) {
      throw new Error("Nem sikerült a kiválasztott termékeket a fizetési rendszerhez kötni.");
    }
    couponParams.applies_to = { products: productIds };
  }

  const coupon = await stripe.coupons.create(couponParams);

  const promoParams: any = {
    promotion: { type: "coupon", coupon: coupon.id },
    code,
    active: true,
  };
  if (input.expiresAt) {
    const ts = Math.floor(Date.parse(input.expiresAt) / 1000);
    if (Number.isFinite(ts)) promoParams.expires_at = ts;
  }
  if (input.maxRedemptions && input.maxRedemptions > 0) {
    promoParams.max_redemptions = input.maxRedemptions;
  }
  if (input.minAmount && input.minAmount > 0) {
    promoParams.restrictions = {
      minimum_amount: input.minAmount,
      minimum_amount_currency: (input.currency || "huf").toLowerCase(),
    };
  }

  const promo = await stripe.promotionCodes.create(promoParams);

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { error } = await supabaseAdmin.from("admin_coupons").insert({
    code,
    environment: input.environment,
    expires_at: input.expiresAt,
    discount_type: input.discountType,
    percent_off: input.percentOff,
    amount_off: input.amountOff,
    currency: (input.currency || "huf").toLowerCase(),
    product_slugs: input.allProducts ? [] : input.productSlugs,
    all_products: input.allProducts,
    max_redemptions: input.maxRedemptions,
    min_amount: input.minAmount,
    stripe_coupon_id: coupon.id,
    stripe_promotion_code_id: promo.id,
    created_by: input.createdBy,
  });
  if (error) {
    console.error("admin_coupons insert failed:", error.message);
  }

  return {
    code,
    environment: input.environment,
    active: true,
    expiresAt: input.expiresAt,
    discountType: input.discountType,
    percentOff: input.percentOff,
    amountOff: input.amountOff,
    currency: (input.currency || "huf").toUpperCase(),
    maxRedemptions: input.maxRedemptions,
    timesRedeemed: 0,
    minAmount: input.minAmount,
    allProducts: input.allProducts,
    productSlugs: input.allProducts ? [] : input.productSlugs,
    productNames: input.allProducts ? [] : productNamesFor(input.productSlugs),
    createdAt: new Date().toISOString(),
    createdBy: input.createdBy,
    disabledAt: null,
    status: "valid",
  };
}

/**
 * Disables a promotion code (sets active: false on Stripe, records disabled_at).
 */
export async function disableAdminCoupon(
  code: string,
  environment: StripeEnv,
): Promise<{ ok: boolean; error?: string }> {
  const stripe = createStripeClient(environment);
  const normalized = code.trim().toUpperCase();

  try {
    const list = await stripe.promotionCodes.list({ code: normalized, limit: 5 });
    const promo = list.data.find((p) => p.code.toUpperCase() === normalized);
    if (!promo) return { ok: false, error: "A kupon nem található a Stripe-ban." };

    if (promo.active) {
      await stripe.promotionCodes.update(promo.id, { active: false });
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin
      .from("admin_coupons")
      .update({ disabled_at: new Date().toISOString() })
      .eq("code", normalized)
      .eq("environment", environment);

    return { ok: true };
  } catch (error) {
    return { ok: false, error: getStripeErrorMessage(error) };
  }
}

/**
 * Returns the set of allowlisted live promotion code strings for the coupon
 * guard — every admin_coupons row that is live, not expired, and not disabled.
 * Called by coupon-guard.server.ts.
 */
export async function adminAllowedLiveCodes(): Promise<string[]> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin
    .from("admin_coupons")
    .select("code, expires_at, disabled_at")
    .eq("environment", "live");
  const now = Date.now();
  return (data ?? [])
    .filter((r: any) => !r.disabled_at)
    .filter((r: any) => !r.expires_at || Date.parse(r.expires_at) > now)
    .map((r: any) => String(r.code).toUpperCase());
}
