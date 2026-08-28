/**
 * Coupon usage history for the admin panel.
 *
 * Reads Stripe checkout sessions that had a discount applied, resolves the
 * promotion code that was used, and joins the matching order row so support
 * questions ("mikor, mennyit, melyik rendeléshez") can be answered fast.
 */

import { type StripeEnv, createStripeClient, getStripeErrorMessage } from "./stripe.server";

export type CouponUsageRow = {
  /** Stripe checkout session id. */
  sessionId: string;
  /** ISO timestamp of the checkout session creation. */
  createdAt: string;
  /** Promotion code as typed by the buyer (may be null for legacy discounts). */
  code: string | null;
  /** Human readable discount rule, e.g. "100%" or "5 000 Ft". */
  rule: string | null;
  /** Discount kind for filtering. */
  discountType: "percent" | "fixed" | null;
  /** Discount amount in HUF. */
  discountAmount: number;
  /** Amount actually paid (after discount), in HUF. */
  paidAmount: number;
  /** Amount before the discount, in HUF. */
  originalAmount: number;
  currency: string;
  /** Stripe payment status: paid / unpaid / no_payment_required. */
  paymentStatus: string;
  customerEmail: string | null;
  orderNumber: string | null;
  /** Joined order info when the order number resolves. */
  order: {
    id: string;
    productName: string;
    billingName: string;
    email: string;
    status: string;
    paymentStatus: string;
    totalPrice: number;
    billingoInvoiceNumber: string | null;
  } | null;
};

function describeRule(coupon: any): string | null {
  if (!coupon) return null;
  if (coupon.percent_off) return `${coupon.percent_off}%`;
  if (coupon.amount_off) {
    const currency = String(coupon.currency ?? "huf").toUpperCase();
    return currency === "HUF"
      ? `${Math.round(coupon.amount_off / 100).toLocaleString("hu-HU")} Ft`
      : `${coupon.amount_off / 100} ${currency}`;
  }
  return null;
}

export async function listCouponUsage(
  environment: StripeEnv,
  limit = 100,
): Promise<{ rows: CouponUsageRow[]; error?: string }> {
  try {
    const stripe = createStripeClient(environment);
    const sessions = await stripe.checkout.sessions.list({
      limit: Math.min(Math.max(limit, 1), 100),
      expand: ["data.total_details.breakdown"],
    });

    const codeCache = new Map<string, string | null>();
    const rows: CouponUsageRow[] = [];

    for (const session of sessions.data) {
      const discountAmount = session.total_details?.amount_discount ?? 0;
      if (!discountAmount) continue;

      const discount = (session.total_details as any)?.breakdown?.discounts?.[0]?.discount;
      const promoRef = discount?.promotion_code;
      let code: string | null = null;
      if (typeof promoRef === "string") {
        if (!codeCache.has(promoRef)) {
          try {
            const promo = await stripe.promotionCodes.retrieve(promoRef);
            codeCache.set(promoRef, promo.code ?? null);
          } catch {
            codeCache.set(promoRef, null);
          }
        }
        code = codeCache.get(promoRef) ?? null;
      } else if (promoRef && typeof promoRef === "object") {
        code = (promoRef as any).code ?? null;
      }

      const paidAmount = session.amount_total ?? 0;
      rows.push({
        sessionId: session.id,
        createdAt: new Date(session.created * 1000).toISOString(),
        code,
        rule: describeRule(discount?.coupon),
        discountType: discount?.coupon?.percent_off
          ? "percent"
          : discount?.coupon?.amount_off
            ? "fixed"
            : null,
        discountAmount,
        paidAmount,
        originalAmount: paidAmount + discountAmount,
        currency: String(session.currency ?? "huf").toUpperCase(),
        paymentStatus: session.payment_status ?? "unknown",
        customerEmail: session.customer_email ?? session.customer_details?.email ?? null,
        orderNumber:
          typeof session.metadata?.["orderNumber"] === "string"
            ? session.metadata["orderNumber"]
            : null,
        order: null,
      });
    }

    const orderNumbers = rows.map((r) => r.orderNumber).filter((n): n is string => !!n);
    if (orderNumbers.length > 0) {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data } = await supabaseAdmin
        .from("orders")
        .select(
          "id, order_number, product_name, billing_name, email, status, payment_status, total_price, billingo_invoice_number",
        )
        .in("order_number", orderNumbers);

      const byNumber = new Map((data ?? []).map((o) => [o.order_number, o]));
      for (const row of rows) {
        const order = row.orderNumber ? byNumber.get(row.orderNumber) : undefined;
        if (!order) continue;
        row.order = {
          id: order.id,
          productName: order.product_name,
          billingName: order.billing_name,
          email: order.email,
          status: order.status,
          paymentStatus: order.payment_status,
          totalPrice: order.total_price,
          billingoInvoiceNumber: order.billingo_invoice_number ?? null,
        };
      }
    }

    return { rows };
  } catch (error) {
    console.error("Coupon usage listing failed:", getStripeErrorMessage(error));
    return { rows: [], error: getStripeErrorMessage(error) };
  }
}
