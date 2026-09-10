import { describe, expect, it, vi } from "vitest";

import { promotionCouponId, resolvePromotionCoupon } from "./stripe-coupon";

describe("Stripe promotion coupon normalization", () => {
  it("reads the current promotion.coupon id and retrieves its discount", async () => {
    const retrieve = vi.fn(async () => ({ id: "coupon_1", percent_off: 90, amount_off: null }));
    const promo = { promotion: { type: "coupon", coupon: "coupon_1" } };

    expect(promotionCouponId(promo)).toBe("coupon_1");
    await expect(resolvePromotionCoupon(promo, retrieve)).resolves.toMatchObject({ percent_off: 90 });
    expect(retrieve).toHaveBeenCalledWith("coupon_1");
  });

  it("keeps supporting the legacy expanded coupon shape", async () => {
    const retrieve = vi.fn();
    const promo = { coupon: { id: "coupon_old", percent_off: 25 } };

    await expect(resolvePromotionCoupon(promo, retrieve)).resolves.toMatchObject({ percent_off: 25 });
    expect(retrieve).not.toHaveBeenCalled();
  });
});