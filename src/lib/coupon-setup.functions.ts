import { createServerFn } from "@tanstack/react-start";

import {
  type StripeEnv,
  createStripeClient,
  getStripeErrorMessage,
} from "@/lib/stripe.server";

// TEMPORARY one-off setup helper: creates the 100% test promotion code.
// Deleted right after it has been run.
export const ensureTestCoupon = createServerFn({ method: "POST" })
  .inputValidator((data: { environment: StripeEnv }) => data)
  .handler(async ({ data }) => {
    try {
      const stripe = createStripeClient(data.environment);

      const existing = await stripe.promotionCodes.list({ code: "XLNTTESZT100", limit: 1 });
      if (existing.data[0]) {
        return { ok: true as const, code: existing.data[0].code, created: false };
      }

      const coupon = await stripe.coupons.create({
        percent_off: 100,
        duration: "once",
        name: "XLNT teszt 100%",
      });
      const promo = await stripe.promotionCodes.create({
        promotion: { type: "coupon", coupon: coupon.id },
        code: "XLNTTESZT100",
      });

      return { ok: true as const, code: promo.code, created: true, couponId: coupon.id };
    } catch (error) {
      return { ok: false as const, error: getStripeErrorMessage(error) };
    }
  });
