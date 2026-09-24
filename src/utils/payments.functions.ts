import { createServerFn } from "@tanstack/react-start";

import { AAM_MODE } from "@/lib/aam";
import { promotionCodesEnabled } from "@/lib/coupons";
import { withXlntPrefix } from "@/lib/product-name";
import {
  type StripeEnv,
  createStripeClient,
  getStripeErrorMessage,
} from "@/lib/stripe.server";

const ALLOWED_RETURN_ORIGINS = [
  "https://xlntbi.hu",
  "https://www.xlntbi.hu",
  "https://xlntbi.lovable.app",
];

/** Return URL is always built server-side on a trusted origin and fixed path. */
function buildReturnUrl(requested: string, orderNumber: string, token: string): string {
  let origin = ALLOWED_RETURN_ORIGINS[0]!;
  try {
    const url = new URL(requested);
    const allowed =
      ALLOWED_RETURN_ORIGINS.includes(url.origin) ||
      /^https:\/\/[a-z0-9-]+\.lovable\.app$/.test(url.origin) ||
      /^http:\/\/localhost(:\d+)?$/.test(url.origin);
    if (allowed) origin = url.origin;
  } catch {
    // fall back to the production origin
  }
  return `${origin}/megrendeles/koszonjuk?rendeles=${encodeURIComponent(orderNumber)}&t=${encodeURIComponent(token)}&session_id={CHECKOUT_SESSION_ID}`;
}

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
    // Failed attempts are only logged when bound to a real, unpaid order with
    // the same email, so anonymous callers cannot pollute the admin log.
    let bound = false;
    if (
      typeof data.orderNumber === "string" &&
      /^[A-Za-z0-9-]{1,40}$/.test(data.orderNumber) &&
      typeof data.email === "string"
    ) {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data: order } = await supabaseAdmin
        .from("orders")
        .select("email, payment_status")
        .eq("order_number", data.orderNumber)
        .maybeSingle();
      bound =
        !!order &&
        order.payment_status !== "paid" &&
        order.email.trim().toLowerCase() === data.email.trim().toLowerCase();
    }
    return checkPromotionCode(data, { log: bound });
  });

export const createOrderCheckoutSession = createServerFn({ method: "POST" })
  .inputValidator(
    (data: {
      priceId: string;
      quantity: number;
      orderNumber: string;
      checkoutToken: string;
      customerEmail: string;
      returnUrl: string;
      environment: StripeEnv;
    }) => {
      if (!/^[a-zA-Z0-9_-]+$/.test(data.priceId)) throw new Error("Invalid priceId");
      if (!/^[A-Za-z0-9-]+$/.test(data.orderNumber)) throw new Error("Invalid orderNumber");
      if (typeof data.checkoutToken !== "string" || !/^[a-f0-9]{48}$/.test(data.checkoutToken)) {
        throw new Error("Invalid checkoutToken");
      }
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

      // Bind the session to the stored order: the price and quantity must
      // match what the order was created with, never the request alone.
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data: order, error: orderError } = await supabaseAdmin
        .from("orders")
        .select("email, quantity, unit_price, total_price, currency, payment_status")
        .eq("order_number", data.orderNumber)
        .eq("checkout_token", data.checkoutToken)
        .maybeSingle();
      if (orderError || !order) return { error: "A megrendelés nem található." };
      if (order.payment_status === "paid") return { error: "Ez a megrendelés már ki van fizetve." };
      if (order.email.trim().toLowerCase() !== data.customerEmail.trim().toLowerCase()) {
        return { error: "A megrendelés adatai nem egyeznek." };
      }
      if (order.quantity !== data.quantity) {
        return { error: "A megrendelés adatai nem egyeznek." };
      }

      const prices = await stripe.prices.list({ lookup_keys: [data.priceId] });
      const stripePrice = prices.data[0];
      if (!stripePrice) return { error: "A termék árazása nem található a fizetési rendszerben." };

      // Stripe HUF amounts are in minor units (fillér).
      const stripeUnit = Math.round((stripePrice.unit_amount ?? -1) / 100);
      if (
        stripePrice.currency.toLowerCase() !== String(order.currency ?? "huf").toLowerCase() ||
        stripeUnit !== Math.round(Number(order.unit_price)) ||
        stripeUnit * order.quantity !== Math.round(Number(order.total_price))
      ) {
        console.error("Checkout price mismatch for order", data.orderNumber);
        return { error: "A megrendelés összege nem egyezik a termék árával." };
      }

      const productId =
        typeof stripePrice.product === "string" ? stripePrice.product : stripePrice.product.id;
      const product = await stripe.products.retrieve(productId);

      const session = await stripe.checkout.sessions.create({
        line_items: [{ price: stripePrice.id, quantity: order.quantity }],
        mode: "payment",
        ui_mode: "embedded_page",
        return_url: buildReturnUrl(data.returnUrl, data.orderNumber, data.checkoutToken),
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
          description: withXlntPrefix(product.name),
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
      console.error("Checkout session failed:", getStripeErrorMessage(error));
      return { error: "A fizetés indítása nem sikerült. Kérjük, próbáld újra később." };
    }
  });

/**
 * Public checkout summary for the thank-you page: itemized coupon discount
 * (original amount, discount, final total). Reads Stripe by the random
 * checkout session id, so no order data is exposed by guessing order numbers.
 */
export const getCheckoutSummary = createServerFn({ method: "POST" })
  .inputValidator((data: { sessionId: string; orderNumber: string; token: string; environment: StripeEnv }) => {
    if (typeof data.token !== "string" || !/^[a-f0-9]{48}$/.test(data.token)) {
      throw new Error("Invalid token");
    }
    if (typeof data.orderNumber !== "string" || !/^[A-Za-z0-9-]{1,40}$/.test(data.orderNumber)) {
      throw new Error("Invalid orderNumber");
    }
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
        // Only call Stripe for a real card order whose private token the
        // caller holds (it is only in the buyer's own return URL).
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: order } = await supabaseAdmin
          .from("orders")
          .select("id")
          .eq("order_number", data.orderNumber)
          .eq("checkout_token", data.token)
          .eq("payment_provider", "stripe")
          .maybeSingle();
        if (!order) return { ok: false };
        const stripe = createStripeClient(data.environment);
        const session = await stripe.checkout.sessions.retrieve(data.sessionId, {
          expand: ["total_details.breakdown"],
        });
        // Only reveal the summary when the session belongs to the given order.
        if (session.metadata?.["orderNumber"] !== data.orderNumber) return { ok: false };
        // Stripe returns HUF in minor units (fillér) — show forints.
        const toMajor = (v: number) => Math.round(v / 100);
        const discountAmount = toMajor(session.total_details?.amount_discount ?? 0);
        const totalAmount = toMajor(session.amount_total ?? 0);
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
