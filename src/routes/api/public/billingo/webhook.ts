import { createFileRoute } from "@tanstack/react-router";

/**
 * Billingo webhook endpoint.
 *
 * Billingo can only be configured with a URL, so the caller is verified with a
 * shared secret passed either as `?secret=` or in the `x-webhook-secret`
 * header. The payload itself is never trusted: the document is re-fetched from
 * the Billingo API before anything is written.
 */
function authorized(request: Request): boolean {
  const expected = process.env["BILLINGO_WEBHOOK_SECRET"];
  if (!expected) {
    console.error("BILLINGO_WEBHOOK_SECRET nincs beállítva.");
    return false;
  }
  const url = new URL(request.url);
  const provided =
    request.headers.get("x-webhook-secret") ?? url.searchParams.get("secret") ?? "";
  if (provided.length !== expected.length) return false;
  // Constant-time-ish compare over equal-length strings.
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= provided.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return diff === 0;
}

async function readPayload(request: Request): Promise<any> {
  const text = await request.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    // Billingo may post form-encoded data.
    return Object.fromEntries(new URLSearchParams(text).entries());
  }
}

export const Route = createFileRoute("/api/public/billingo/webhook")({
  server: {
    handlers: {
      // Billingo webhook — kikapcsolva (nincs webhook beállítva a Billingo fiókban).
      // Újraaktiváláshoz cseréld vissza az alábbi POST handlerre:
      //
      // POST: async ({ request }) => {
      //   if (!authorized(request)) {
      //     return new Response("Unauthorized", { status: 401 });
      //   }
      //   try {
      //     const payload = await readPayload(request);
      //     const { handleBillingoWebhook } = await import("@/lib/billingo-webhook.server");
      //     const result = await handleBillingoWebhook(payload);
      //     if (!result.handled) {
      //       console.log("Billingo webhook skipped:", result.reason);
      //     } else {
      //       console.log(
      //         `Billingo webhook: ${result.orderNumber} → számla ${result.invoiceNumber ?? "-"}${
      //           result.markedPaid ? " (fizetettre állítva)" : ""
      //         }`,
      //       );
      //     }
      //     return Response.json({ received: true, ...result });
      //   } catch (e) {
      //     console.error("Billingo webhook error:", e);
      //     return new Response("Webhook error", { status: 400 });
      //   }
      // },
      POST: async () =>
        new Response("Billingo webhook disabled", { status: 410 }),
    },
  },
});
