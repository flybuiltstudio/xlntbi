import { createFileRoute } from "@tanstack/react-router";

import { type StripeEnv, verifyWebhook } from "@/lib/stripe.server";

async function handleWebhook(request: Request, env: StripeEnv) {
  const event = await verifyWebhook(request, env);

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      if (session.payment_status === "unpaid") break;
      await fulfil(session);
      break;
    }
    case "checkout.session.async_payment_succeeded": {
      await fulfil(event.data.object);
      break;
    }
    case "checkout.session.expired": {
      await unwind(event.data.object, "A fizetési munkamenet lejárt (Stripe).");
      break;
    }
    case "checkout.session.async_payment_failed": {
      await unwind(event.data.object, "A késleltetett fizetés meghiúsult (Stripe).");
      break;
    }
    case "payment_intent.payment_failed": {
      await unwindByPaymentIntent(
        event.data.object,
        "A bankkártyás fizetés meghiúsult (Stripe).",
      );
      break;
    }
    case "payment_intent.canceled": {
      await unwindByPaymentIntent(event.data.object, "A fizetést lemondták (Stripe).");
      break;
    }
    case "charge.refunded": {
      const charge = event.data.object;
      const amount = Number(charge?.amount ?? 0);
      const refunded = Number(charge?.amount_refunded ?? 0);
      // Partial refunds keep the order paid and the invoice valid.
      if (!amount || refunded < amount) {
        console.log("Partial refund ignored for charge:", charge?.id);
        break;
      }
      await unwindByPaymentIntent(charge, "A fizetés visszatérítve (Stripe).", "refund");
      break;
    }

    default:
      console.log("Unhandled Stripe event:", event.type);
  }
}

async function fulfil(session: any) {
  const orderNumber = session.metadata?.orderNumber;
  if (!orderNumber) {
    console.error("Checkout session without orderNumber metadata:", session.id);
    return;
  }
  const paymentReference =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : (session.payment_intent?.id ?? session.id);

  const { markOrderPaid } = await import("@/lib/order-paid.server");
  await markOrderPaid({ orderNumber, paymentReference });
}

/**
 * Stripe payment failed / expired / cancelled / refunded: storno the Billingo
 * invoice if one was already issued, and mark the order accordingly.
 *
 * A már kifizetett rendelést csak teljes visszatérítés bonthatja vissza —
 * késői/ismételt hibaesemény (pl. elutasított, majd újrapróbált kártya) nem
 * teheti fizetetlenné és nem sztornózhatja az érvényes számlát.
 */
async function unwindOrder(
  orderNumber: string,
  reason: string,
  kind: "failure" | "refund" = "failure",
) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: order } = await supabaseAdmin
    .from("orders")
    .select("*")
    .eq("order_number", orderNumber)
    .maybeSingle();
  if (!order) {
    console.error("Failed-payment order not found:", orderNumber);
    return;
  }

  if (kind === "failure" && order.payment_status === "paid") {
    console.log("Ignoring failure event for already paid order:", orderNumber);
    return;
  }

  const { cancelInvoiceForOrder } = await import("@/lib/billingo.server");
  await cancelInvoiceForOrder(order as any, { reason, source: "stripe_cancel" });

  await (supabaseAdmin as any)
    .from("orders")
    .update({
      payment_status: kind === "refund" ? "refunded" : "failed",
      status: order.status === "paid" ? "payment_failed" : order.status,
    })
    .eq("id", order.id);
}

async function unwind(session: any, reason: string) {
  const orderNumber = session?.metadata?.orderNumber;
  if (!orderNumber) return;
  await unwindOrder(orderNumber, reason);
}

async function unwindByPaymentIntent(
  object: any,
  reason: string,
  kind: "failure" | "refund" = "failure",
) {
  const orderNumber = object?.metadata?.orderNumber;
  if (orderNumber) {
    await unwindOrder(orderNumber, reason, kind);
    return;
  }
  const paymentIntentId =
    typeof object?.payment_intent === "string" ? object.payment_intent : object?.id;
  if (!paymentIntentId) return;

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: order } = await supabaseAdmin
    .from("orders")
    .select("order_number")
    .eq("payment_reference", paymentIntentId)
    .maybeSingle();
  if (!order) {
    console.error("Failed-payment order not found for payment intent:", paymentIntentId);
    return;
  }
  await unwindOrder(order.order_number as string, reason, kind);
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
          await handleWebhook(request, rawEnv);
          return Response.json({ received: true });
        } catch (e) {
          console.error("Webhook error:", e);
          return new Response("Webhook error", { status: 400 });
        }
      },
    },
  },
});
