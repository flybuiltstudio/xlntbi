/** Normalizes Stripe's legacy and current promotion-code coupon shapes. */
export type CouponDetails = {
  id?: string;
  valid?: boolean;
  percent_off?: number | null;
  amount_off?: number | null;
  currency?: string | null;
};

function couponReference(promo: any): string | CouponDetails | null {
  const legacy = promo?.coupon;
  if (typeof legacy === "string" || (legacy && typeof legacy === "object")) return legacy;

  const current = promo?.promotion?.type === "coupon" ? promo.promotion.coupon : null;
  return typeof current === "string" || (current && typeof current === "object")
    ? current
    : null;
}

export function embeddedCoupon(promo: any): CouponDetails | null {
  const reference = couponReference(promo);
  return reference && typeof reference === "object" ? reference : null;
}

export function promotionCouponId(promo: any): string | null {
  const reference = couponReference(promo);
  if (typeof reference === "string") return reference;
  return reference && typeof reference.id === "string" ? reference.id : null;
}

export async function resolvePromotionCoupon(
  promo: any,
  retrieve: (id: string) => Promise<any>,
): Promise<CouponDetails | null> {
  const embedded = embeddedCoupon(promo);
  if (embedded && (embedded.percent_off != null || embedded.amount_off != null)) return embedded;

  const id = promotionCouponId(promo);
  if (!id) return embedded;
  const retrieved = await retrieve(id);
  return retrieved && typeof retrieved === "object" ? retrieved : embedded;
}