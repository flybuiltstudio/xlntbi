import { createServerFn } from "@tanstack/react-start";

import { AAM_MODE } from "@/lib/aam";
import { promotionCodesEnabled } from "@/lib/coupons";
import {
  type StripeEnv,
  createStripeClient,
  getStripeErrorMessage,
} from "@/lib/stripe.server";

type CheckoutSessionResult = { clientSecret: string } | { error: string };

/** Detailed, Hungarian coupon validation for the checkout coupon helper. */
export const validatePromotionCode = createServerFn({ method: "POST" })
  .inputValidator(
    (data: {
      code: string;
      environment: StripeEnv;
      amount?: number;
      priceId?: string;
      email?: string;
      orderNumber?: string;
    }) => {
      if (typeof data.code !== "string" || data.code.length > 60) {
        throw new Error("Invalid code");
      }
      return data;
    },
  )
  .handler(async ({ data }) => {
    const { checkPromotionCode } = await import("@/lib/coupon-validate.server");
    return checkPromotionCode(data);
  });

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
        payment_intent_data: {
          description: product.name,
          // Lets failure/refund webhooks resolve the order without a lookup.
          metadata: { orderNumber: data.orderNumber },
        },
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

/**
 * Public checkout summary for the thank-you page: itemized coupon discount
 * (original amount, discount, final total). Reads Stripe by the random
 * checkout session id, so no order data is exposed by guessing order numbers.
 */
export const getCheckoutSummary = createServerFn({ method: "POST" })
  .inputValidator((data: { sessionId: string; environment: StripeEnv }) => {
    if (!/^cs_[A-Za-z0-9_-]{10,200}$/.test(data.sessionId)) {
      throw new Error("Invalid sessionId");
    }
    if (data.environment !== "sandbox" && data.environment !== "live") {
      throw new Error("Invalid environment");
    }
    return data;
  })
  .handler(
    async ({
      data,
    }): Promise<{
      ok: boolean;
      currency?: string;
      originalAmount?: number;
      discountAmount?: number;
      totalAmount?: number;
      couponCode?: string | null;
      paymentStatus?: string;
    }> => {
      try {
        const stripe = createStripeClient(data.environment);
        const session = await stripe.checkout.sessions.retrieve(data.sessionId, {
          expand: ["total_details.breakdown"],
        });
        const discountAmount = session.total_details?.amount_discount ?? 0;
        const totalAmount = session.amount_total ?? 0;
        let couponCode: string | null = null;
        const promoRef = (session.total_details as any)?.breakdown?.discounts?.[0]?.discount
          ?.promotion_code;
        if (typeof promoRef === "string") {
          try {
            couponCode = (await stripe.promotionCodes.retrieve(promoRef)).code ?? null;
          } catch {
            couponCode = null;
          }
        } else if (promoRef && typeof promoRef === "object") {
          couponCode = (promoRef as any).code ?? null;
        }

        return {
          ok: true,
          currency: String(session.currency ?? "huf").toUpperCase(),
          originalAmount: totalAmount + discountAmount,
          discountAmount,
          totalAmount,
          couponCode,
          paymentStatus: session.payment_status ?? "unknown",
        };
      } catch (error) {
        console.error("Checkout summary failed:", getStripeErrorMessage(error));
        return { ok: false };
      }
    },
  );
