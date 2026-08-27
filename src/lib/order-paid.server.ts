import { sendEmails } from "./notify.server";
import { formatPrice } from "./products";
import { issueInvoiceForOrder } from "./billingo.server";

const OWNER_EMAIL = "xllentac@gmail.com";

/**
 * Marks an order as paid (idempotent) and sends the paid confirmation emails.
 * Called only from the signature-verified Stripe webhook route.
 */
export async function markOrderPaid(options: {
  orderNumber: string;
  paymentReference: string;
  /** Coupon discount from the Stripe checkout session (HUF). */
  discount?: { amount: number; promotionCodeId?: string | null };
  environment?: "sandbox" | "live";
}): Promise<void> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const { data: order, error } = await supabaseAdmin
    .from("orders")
    .select("*")
    .eq("order_number", options.orderNumber)
    .maybeSingle();

  if (error) {
    console.error("Paid order lookup failed:", error.message);
    return;
  }
  if (!order) {
    console.error("Paid order not found:", options.orderNumber);
    return;
  }
  if (order.payment_status === "paid") return;

  // Resolve the redeemed coupon code so the confirmation page, the emails and
  // the invoice can show the itemized discount.
  let couponCode: string | null = null;
  const discountAmount = Math.max(0, Math.round(options.discount?.amount ?? 0));
  if (discountAmount > 0 && options.discount?.promotionCodeId && options.environment) {
    try {
      const { createStripeClient } = await import("./stripe.server");
      const promo = await createStripeClient(options.environment).promotionCodes.retrieve(
        options.discount.promotionCodeId,
      );
      couponCode = promo.code ?? null;
    } catch (e) {
      console.error("Promotion code lookup failed:", e);
    }
  }

  const { error: updateError } = await supabaseAdmin
    .from("orders")
    .update({
      payment_status: "paid",
      status: "paid",
      payment_provider: "stripe",
      payment_reference: options.paymentReference,
      ...(discountAmount > 0
        ? {
            discount_amount: discountAmount,
            original_amount: order.total_price as number,
            coupon_code: couponCode,
          }
        : {}),
    })
    .eq("order_number", options.orderNumber);

  if (updateError) {
    console.error("Paid order update failed:", updateError.message);
    return;
  }

  const productLabel = order.tier_label
    ? `${order.product_name} – ${order.tier_label} (${order.quantity} db)`
    : `${order.product_name} (${order.quantity} db)`;
  const rows: Array<[string, string]> = [
    ["Rendelésszám", order.order_number],
    ["Termék", productLabel],
    ["Egységár", formatPrice(order.unit_price)],
  ];
  if (discountAmount > 0) {
    rows.push(
      ["Eredeti összeg", formatPrice(order.total_price as number)],
      [
        couponCode ? `Kuponkedvezmény (${couponCode})` : "Kuponkedvezmény",
        `−${formatPrice(discountAmount)}`,
      ],
    );
  }
  rows.push(
    ["Fizetve", formatPrice((order.total_price as number) - discountAmount)],
    ["Számlázási név", order.billing_name],
  );
  if (order.company_name) rows.push(["Cégnév", order.company_name]);
  if (order.tax_number) rows.push(["Adószám", order.tax_number]);
  rows.push(
    [
      "Számlázási cím",
      `${order.country}, ${order.postal_code} ${order.city}, ${order.address_line}`,
    ],
    ["E-mail", order.email],
    ["Telefon", order.phone],
    ["Fizetés", "Bankkártya (Stripe) – teljesítve"],
  );

  const { issueDownload } = await import("./download.server");
  await issueDownload({
    id: order.id as string,
    order_number: order.order_number as string,
    product_slug: order.product_slug as string,
    product_name: order.product_name as string,
    tier_label: (order.tier_label as string | null) ?? null,
    quantity: order.quantity as number,
    billing_name: order.billing_name as string,
    email: order.email as string,
  });

  await sendEmails([
    {
      template: "megrendeles-visszaigazolas",
      to: order.email,
      key: `${order.order_number}-paid`,
      data: {
        name: order.billing_name,
        orderNumber: order.order_number,
        productName: productLabel,
        total: formatPrice((order.total_price as number) - discountAmount),
        paymentStatus: "paid",
        rows,
      },
      replyTo: OWNER_EMAIL,
    },
    {
      template: "belso-rendeles-ertesito",
      to: OWNER_EMAIL,
      key: `${order.order_number}-paid`,
      data: {
        orderNumber: order.order_number,
        productName: productLabel,
        total: formatPrice((order.total_price as number) - discountAmount),
        customerEmail: order.email,
        paymentStatus: "paid",
        rows: rows.filter(([key]) => key !== "Rendelésszám"),
      },
      replyTo: order.email,
    },
  ]);

  // Auto-invoice via Billingo (only for paid orders; idempotent, never blocks fulfilment).
  await issueInvoiceForOrder(
    { ...(order as any), discount_amount: discountAmount, coupon_code: couponCode },
    { sendToBuyer: true, source: "webhook" },
  );
}
