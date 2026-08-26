import { createServerFn } from "@tanstack/react-start";

import { AAM_MODE } from "@/lib/aam";
import { promotionCodesEnabled } from "@/lib/coupons";
import {
  type StripeEnv,
  createStripeClient,
  getStripeErrorMessage,
} from "@/lib/stripe.server";

type CheckoutSessionResult = { clientSecret: string } | { error: string };

export const createOrderCheckoutSession = createServerFn({ method: "POST" })
  .inputValidator(
    (data: {
      priceId: string;
      quantity: number;
      orderNumber: string;
      customerEmail: string;
      returnUrl: string;
      environment: StripeEnv;
    }) => {
      if (!/^[a-zA-Z0-9_-]+$/.test(data.priceId)) throw new Error("Invalid priceId");
      if (!/^[A-Za-z0-9-]+$/.test(data.orderNumber)) throw new Error("Invalid orderNumber");
      if (!Number.isInteger(data.quantity) || data.quantity < 1 || data.quantity > 20) {
        throw new Error("Invalid quantity");
      }
      return data;
    },
  )
  .handler(async ({ data }): Promise<CheckoutSessionResult> => {
    try {
      const stripe = createStripeClient(data.environment);

      // In live, deactivate every promotion code that is not explicitly
      // allowlisted (test coupons must never work with real money).
      if (data.environment === "live") {
        const { sweepLivePromotionCodesThrottled } = await import("@/lib/coupon-guard.server");
        await sweepLivePromotionCodesThrottled();
      }

      const prices = await stripe.prices.list({ lookup_keys: [data.priceId] });
      const stripePrice = prices.data[0];
      if (!stripePrice) return { error: "A termék árazása nem található a fizetési rendszerben." };

      const productId =
        typeof stripePrice.product === "string" ? stripePrice.product : stripePrice.product.id;
      const product = await stripe.products.retrieve(productId);

      const session = await stripe.checkout.sessions.create({
        line_items: [{ price: stripePrice.id, quantity: data.quantity }],
        mode: "payment",
        ui_mode: "embedded_page",
        return_url: data.returnUrl,
        customer_email: data.customerEmail,
        // Sandbox: test coupons allowed. Live: only when an allowlisted
        // promotion code exists (see src/lib/coupons.ts).
        allow_promotion_codes: promotionCodesEnabled(data.environment),
        locale: "hu",
        // Sell in HUF only — no currency-conversion offer at checkout.
        adaptive_pricing: { enabled: false },
        // AAM (alanyi adómentes) seller: never add tax on top of the listed
        // price — the amount shown on the site is the final amount.
        automatic_tax: { enabled: !AAM_MODE },
        payment_intent_data: { description: product.name },
        metadata: {
          orderNumber: data.orderNumber,
          priceId: data.priceId,
        },
      });

      return { clientSecret: session.client_secret ?? "" };
    } catch (error) {
      return { error: getStripeErrorMessage(error) };
    }
  });
