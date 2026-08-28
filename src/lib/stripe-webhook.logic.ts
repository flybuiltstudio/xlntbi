/**
 * Pure, dependency-injected Stripe webhook decision logic.
 *
 * Keeping this free of Supabase/Billingo imports makes it unit-testable and
 * guarantees the safety rules below hold for every event type:
 *  - a PAID order is never unwound by a failure/cancel/expiry event,
 *  - a partial refund never cancels the Billingo invoice,
 *  - duplicate (re-delivered) and out-of-order (late) events are ignored.
 */

export type OrderState = {
  id: string;
  order_number: string;
  payment_status: string;
  status: string;
  total_price: number;
  refunded_amount?: number | null;
  last_stripe_event_at?: string | null;
  billingo_invoice_id?: number | null;
  billingo_invoice_number?: string | null;
};

export type StripeEventLike = {
  id?: string;
  type: string;
  created?: number;
  data: { object: any };
};

export type OrderPatch = {
  payment_status?: string;
  status?: string;
  refunded_amount?: number;
  last_stripe_event_at?: string;
};

export type WebhookDeps = {
  getOrderByNumber: (orderNumber: string) => Promise<OrderState | null>;
  getOrderByPaymentReference: (paymentIntentId: string) => Promise<OrderState | null>;
  markOrderPaid: (input: {
    orderNumber: string;
    paymentReference: string;
    /** Coupon discount applied in the Stripe checkout session (HUF). */
    discount?: { amount: number; promotionCodeId?: string | null };
  }) => Promise<void>;
  cancelInvoice: (order: OrderState, reason: string) => Promise<void>;
  updateOrder: (orderId: string, patch: OrderPatch) => Promise<void>;
  /** True when this Stripe event id was already processed. */
  isEventProcessed: (eventId: string) => Promise<boolean>;
  recordEvent: (entry: {
    eventId: string;
    eventType: string;
    orderNumber: string | null;
    outcome: string;
    eventCreatedAt: string | null;
  }) => Promise<void>;
  log?: (...args: unknown[]) => void;
};

export type WebhookOutcome =
  | "duplicate"
  | "stale_event"
  | "missing_order"
  | "missing_metadata"
  | "unpaid_session"
  | "fulfilled"
  | "ignored_paid_order"
  | "partial_refund"
  | "refunded"
  | "failed"
  | "unhandled";

export type ProcessResult = { outcome: WebhookOutcome; orderNumber?: string | null };

function eventDate(event: StripeEventLike): string | null {
  return typeof event.created === "number"
    ? new Date(event.created * 1000).toISOString()
    : null;
}

/** An event older than the last processed one for this order must not overwrite state. */
function isStale(order: OrderState, eventCreatedAt: string | null): boolean {
  if (!eventCreatedAt || !order.last_stripe_event_at) return false;
  return new Date(eventCreatedAt).getTime() < new Date(order.last_stripe_event_at).getTime();
}

function orderNumberOf(object: any): string | null {
  const n = object?.metadata?.orderNumber;
  return typeof n === "string" && n ? n : null;
}

export async function processStripeEvent(
  event: StripeEventLike,
  deps: WebhookDeps,
): Promise<ProcessResult> {
  const log = deps.log ?? console.log;
  const eventId = event.id ?? null;
  const createdAt = eventDate(event);

  // 1) Idempotency: Stripe retries and re-sends events.
  if (eventId && (await deps.isEventProcessed(eventId))) {
    log("Duplicate Stripe event ignored:", eventId, event.type);
    return { outcome: "duplicate" };
  }

  const result = await route(event, deps, createdAt, log);

  if (eventId) {
    await deps.recordEvent({
      eventId,
      eventType: event.type,
      orderNumber: result.orderNumber ?? null,
      outcome: result.outcome,
      eventCreatedAt: createdAt,
    });
  }
  return result;
}

async function route(
  event: StripeEventLike,
  deps: WebhookDeps,
  createdAt: string | null,
  log: (...args: unknown[]) => void,
): Promise<ProcessResult> {
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      if (session?.payment_status === "unpaid") {
        return { outcome: "unpaid_session", orderNumber: orderNumberOf(session) };
      }
      return fulfil(session, deps, createdAt, log);
    }
    case "checkout.session.async_payment_succeeded":
      return fulfil(event.data.object, deps, createdAt, log);

    case "checkout.session.expired":
      return unwindBySession(
        event.data.object,
        "A fizetési munkamenet lejárt (Stripe).",
        deps,
        createdAt,
        log,
      );
    case "checkout.session.async_payment_failed":
      return unwindBySession(
        event.data.object,
        "A késleltetett fizetés meghiúsult (Stripe).",
        deps,
        createdAt,
        log,
      );

    case "payment_intent.payment_failed":
      return unwindByIntent(
        event.data.object,
        "A bankkártyás fizetés meghiúsult (Stripe).",
        "failure",
        deps,
        createdAt,
        log,
      );
    case "payment_intent.canceled":
      return unwindByIntent(
        event.data.object,
        "A fizetést lemondták (Stripe).",
        "failure",
        deps,
        createdAt,
        log,
      );

    case "charge.refunded":
      return handleRefund(event.data.object, deps, createdAt, log);

    default:
      log("Unhandled Stripe event:", event.type);
      return { outcome: "unhandled" };
  }
}

async function fulfil(
  session: any,
  deps: WebhookDeps,
  createdAt: string | null,
  log: (...args: unknown[]) => void,
): Promise<ProcessResult> {
  const orderNumber = orderNumberOf(session);
  if (!orderNumber) {
    log("Checkout session without orderNumber metadata:", session?.id);
    return { outcome: "missing_metadata" };
  }
  const order = await deps.getOrderByNumber(orderNumber);
  if (order && isStale(order, createdAt)) {
    log("Stale Stripe event ignored for order:", orderNumber);
    return { outcome: "stale_event", orderNumber };
  }

  const paymentReference =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : (session.payment_intent?.id ?? session.id);

  // Stripe reports HUF in minor units (fillér) — convert to forints, which is
  // what the orders table, the emails and the invoice use.
  const discountAmount = Math.round((Number(session?.total_details?.amount_discount ?? 0) || 0) / 100);
  const promotionCodeId =
    typeof session?.discounts?.[0]?.promotion_code === "string"
      ? session.discounts[0].promotion_code
      : (session?.discounts?.[0]?.promotion_code?.id ?? null);

  await deps.markOrderPaid({
    orderNumber,
    paymentReference,
    ...(discountAmount > 0 ? { discount: { amount: discountAmount, promotionCodeId } } : {}),
  });
  if (order && createdAt) {
    await deps.updateOrder(order.id, { last_stripe_event_at: createdAt });
  }
  return { outcome: "fulfilled", orderNumber };
}

async function resolveOrder(
  object: any,
  deps: WebhookDeps,
): Promise<OrderState | null> {
  const orderNumber = orderNumberOf(object);
  if (orderNumber) return deps.getOrderByNumber(orderNumber);
  const paymentIntentId =
    typeof object?.payment_intent === "string" ? object.payment_intent : object?.id;
  if (!paymentIntentId) return null;
  return deps.getOrderByPaymentReference(paymentIntentId);
}

async function unwindBySession(
  session: any,
  reason: string,
  deps: WebhookDeps,
  createdAt: string | null,
  log: (...args: unknown[]) => void,
): Promise<ProcessResult> {
  if (!orderNumberOf(session)) return { outcome: "missing_metadata" };
  return unwindByIntent(session, reason, "failure", deps, createdAt, log);
}

async function unwindByIntent(
  object: any,
  reason: string,
  kind: "failure" | "refund",
  deps: WebhookDeps,
  createdAt: string | null,
  log: (...args: unknown[]) => void,
): Promise<ProcessResult> {
  const order = await resolveOrder(object, deps);
  if (!order) {
    log("Order not found for Stripe event:", object?.id);
    return { outcome: "missing_order" };
  }
  if (isStale(order, createdAt)) {
    log("Stale Stripe event ignored for order:", order.order_number);
    return { outcome: "stale_event", orderNumber: order.order_number };
  }

  // A paid order is never unwound by a failure/cancel/expiry event.
  if (kind === "failure" && order.payment_status === "paid") {
    log("Ignoring failure event for already paid order:", order.order_number);
    return { outcome: "ignored_paid_order", orderNumber: order.order_number };
  }

  await deps.cancelInvoice(order, reason);
  await deps.updateOrder(order.id, {
    payment_status: kind === "refund" ? "refunded" : "failed",
    status: order.status === "paid" ? "payment_failed" : order.status,
    ...(createdAt ? { last_stripe_event_at: createdAt } : {}),
  });
  return {
    outcome: kind === "refund" ? "refunded" : "failed",
    orderNumber: order.order_number,
  };
}

async function handleRefund(
  charge: any,
  deps: WebhookDeps,
  createdAt: string | null,
  log: (...args: unknown[]) => void,
): Promise<ProcessResult> {
  const amount = Number(charge?.amount ?? 0);
  const refunded = Number(charge?.amount_refunded ?? 0);

  // Full refund (or unknown amount treated conservatively as partial).
  if (amount > 0 && refunded >= amount) {
    return unwindByIntent(
      charge,
      "A fizetés teljes összegben visszatérítve (Stripe).",
      "refund",
      deps,
      createdAt,
      log,
    );
  }

  const order = await resolveOrder(charge, deps);
  if (!order) {
    log("Order not found for refunded charge:", charge?.id);
    return { outcome: "missing_order" };
  }
  if (isStale(order, createdAt)) {
    return { outcome: "stale_event", orderNumber: order.order_number };
  }

  // Partial refund: invoice stays valid, only the proportional status is stored.
  const alreadyRefunded = Number(order.refunded_amount ?? 0);
  const refundedAmount = Math.max(alreadyRefunded, refunded / 100);
  await deps.updateOrder(order.id, {
    payment_status: "partially_refunded",
    refunded_amount: refundedAmount,
    ...(createdAt ? { last_stripe_event_at: createdAt } : {}),
  });
  log(
    "Partial refund recorded, invoice kept:",
    order.order_number,
    refundedAmount,
  );
  return { outcome: "partial_refund", orderNumber: order.order_number };
}
