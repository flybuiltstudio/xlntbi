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
