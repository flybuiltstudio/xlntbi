import { createFileRoute } from "@tanstack/react-router";

import { createStripeClient, getStripeErrorMessage } from "@/lib/stripe.server";

// TEMPORARY one-off setup endpoint: creates the 100% test promotion code.
export const Route = createFileRoute("/api/public/dev-coupon-setup")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const stripe = createStripeClient("sandbox");
          const existing = await stripe.promotionCodes.list({ code: "XLNTTESZT100", limit: 1 });
          if (existing.data[0]) {
            return Response.json({ ok: true, code: existing.data[0].code, created: false });
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
          return Response.json({ ok: true, code: promo.code, created: true });
        } catch (error) {
          return Response.json({ ok: false, error: getStripeErrorMessage(error) }, { status: 500 });
        }
      },
    },
  },
});
