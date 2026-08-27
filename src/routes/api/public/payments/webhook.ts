import { createFileRoute } from "@tanstack/react-router";

import { type StripeEnv, verifyWebhook } from "@/lib/stripe.server";
import {
  processStripeEvent,
  type OrderState,
  type WebhookDeps,
} from "@/lib/stripe-webhook.logic";

const ORDER_FIELDS = "*";

async function buildDeps(env: StripeEnv): Promise<WebhookDeps> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const db = supabaseAdmin as any;

  return {
    async getOrderByNumber(orderNumber) {
      const { data } = await db
        .from("orders")
        .select(ORDER_FIELDS)
        .eq("order_number", orderNumber)
        .maybeSingle();
      return (data as OrderState | null) ?? null;
    },
    async getOrderByPaymentReference(paymentIntentId) {
      const { data } = await db
        .from("orders")
        .select(ORDER_FIELDS)
        .eq("payment_reference", paymentIntentId)
        .maybeSingle();
      return (data as OrderState | null) ?? null;
    },
    async markOrderPaid(input) {
      const { markOrderPaid } = await import("@/lib/order-paid.server");
      await markOrderPaid(input);
    },
    async cancelInvoice(order, reason) {
      const { cancelInvoiceForOrder } = await import("@/lib/billingo.server");
      await cancelInvoiceForOrder(order as any, { reason, source: "stripe_cancel" });
    },
    async updateOrder(orderId, patch) {
      await db.from("orders").update(patch).eq("id", orderId);
    },
    async isEventProcessed(eventId) {
      const { data } = await db
        .from("stripe_webhook_events")
        .select("event_id")
        .eq("event_id", eventId)
        .maybeSingle();
      return !!data;
    },
    async recordEvent(entry) {
      const { error } = await db.from("stripe_webhook_events").upsert(
        {
          event_id: entry.eventId,
          event_type: entry.eventType,
          environment: env,
          order_number: entry.orderNumber,
          outcome: entry.outcome,
          event_created_at: entry.eventCreatedAt,
          processed_at: new Date().toISOString(),
        },
        { onConflict: "event_id" },
      );
      if (error) console.error("Stripe event log insert failed:", error.message);
    },
  };
}

export const Route = createFileRoute("/api/public/payments/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const rawEnv = new URL(request.url).searchParams.get("env");
        if (rawEnv !== "sandbox" && rawEnv !== "live") {
          console.error("Webhook received with invalid env query parameter:", rawEnv);
          return Response.json({ received: true, ignored: "invalid env" });
        }
        try {
          const event = await verifyWebhook(request, rawEnv);
          const deps = await buildDeps(rawEnv);
          const result = await processStripeEvent(event as any, deps);
          return Response.json({ received: true, outcome: result.outcome });
        } catch (e) {
          console.error("Webhook error:", e);
          return new Response("Webhook error", { status: 400 });
        }
      },
    },
  },
});
