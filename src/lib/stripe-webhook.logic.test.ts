import { describe, expect, it, vi } from "vitest";

import {
  processStripeEvent,
  type OrderState,
  type WebhookDeps,
} from "./stripe-webhook.logic";

function order(overrides: Partial<OrderState> = {}): OrderState {
  return {
    id: "order-1",
    order_number: "XLNT-1",
    payment_status: "pending",
    status: "new",
    total_price: 12900,
    refunded_amount: 0,
    last_stripe_event_at: null,
    billingo_invoice_id: null,
    billingo_invoice_number: null,
    ...overrides,
  };
}

function deps(current: OrderState | null, processedIds: string[] = []) {
  const seen = new Set(processedIds);
  const d: WebhookDeps = {
    getOrderByNumber: vi.fn(async () => current),
    getOrderByPaymentReference: vi.fn(async () => current),
    markOrderPaid: vi.fn(async () => {}),
    cancelInvoice: vi.fn(async () => {}),
    updateOrder: vi.fn(async () => {}),
    isEventProcessed: vi.fn(async (id: string) => seen.has(id)),
    recordEvent: vi.fn(async (entry) => {
      seen.add(entry.eventId);
    }),
    log: () => {},
  };
  return d;
}

const ts = (iso: string) => Math.floor(new Date(iso).getTime() / 1000);

describe("paid orders are protected", () => {
  const paid = () =>
    order({
      payment_status: "paid",
      status: "paid",
      billingo_invoice_id: 123,
      billingo_invoice_number: "SDB-2026-1",
    });

  for (const type of [
    "payment_intent.payment_failed",
    "payment_intent.canceled",
    "checkout.session.expired",
    "checkout.session.async_payment_failed",
  ]) {
    it(`${type} never cancels the invoice of a paid order`, async () => {
      const d = deps(paid());
      const res = await processStripeEvent(
        {
          id: `evt_${type}`,
          type,
          created: ts("2026-08-27T10:00:00Z"),
          data: { object: { id: "pi_1", metadata: { orderNumber: "XLNT-1" } } },
        },
        d,
      );
      expect(res.outcome).toBe("ignored_paid_order");
      expect(d.cancelInvoice).not.toHaveBeenCalled();
      expect(d.updateOrder).not.toHaveBeenCalled();
    });
  }

  it("unpaid order failure does unwind and storno the invoice", async () => {
    const d = deps(order({ payment_status: "pending", billingo_invoice_id: 9 }));
    const res = await processStripeEvent(
      {
        id: "evt_fail_unpaid",
        type: "payment_intent.payment_failed",
        created: ts("2026-08-27T10:00:00Z"),
        data: { object: { id: "pi_2", metadata: { orderNumber: "XLNT-1" } } },
      },
      d,
    );
    expect(res.outcome).toBe("failed");
    expect(d.cancelInvoice).toHaveBeenCalledTimes(1);
    expect(d.updateOrder).toHaveBeenCalledWith(
      "order-1",
      expect.objectContaining({ payment_status: "failed" }),
    );
  });
});

describe("refunds", () => {
  it("partial refund keeps the invoice and stores the proportional status", async () => {
    const d = deps(order({ payment_status: "paid", billingo_invoice_id: 55 }));
    const res = await processStripeEvent(
      {
        id: "evt_partial",
        type: "charge.refunded",
        created: ts("2026-08-27T11:00:00Z"),
        data: {
          object: {
            id: "ch_1",
            amount: 1290000,
            amount_refunded: 500000,
            metadata: { orderNumber: "XLNT-1" },
          },
        },
      },
      d,
    );
    expect(res.outcome).toBe("partial_refund");
    expect(d.cancelInvoice).not.toHaveBeenCalled();
    expect(d.updateOrder).toHaveBeenCalledWith(
      "order-1",
      expect.objectContaining({ payment_status: "partially_refunded", refunded_amount: 5000 }),
    );
  });

  it("full refund cancels the invoice and marks the order refunded", async () => {
    const d = deps(order({ payment_status: "paid", billingo_invoice_id: 55 }));
    const res = await processStripeEvent(
      {
        id: "evt_full",
        type: "charge.refunded",
        created: ts("2026-08-27T11:00:00Z"),
        data: {
          object: {
            id: "ch_2",
            amount: 1290000,
            amount_refunded: 1290000,
            metadata: { orderNumber: "XLNT-1" },
          },
        },
      },
      d,
    );
    expect(res.outcome).toBe("refunded");
    expect(d.cancelInvoice).toHaveBeenCalledTimes(1);
    expect(d.updateOrder).toHaveBeenCalledWith(
      "order-1",
      expect.objectContaining({ payment_status: "refunded" }),
    );
  });

  it("never lowers an already recorded refunded amount", async () => {
    const d = deps(order({ payment_status: "partially_refunded", refunded_amount: 8000 }));
    await processStripeEvent(
      {
        id: "evt_partial_2",
        type: "charge.refunded",
        created: ts("2026-08-27T12:00:00Z"),
        data: {
          object: { id: "ch_3", amount: 1290000, amount_refunded: 200000, metadata: { orderNumber: "XLNT-1" } },
        },
      },
      d,
    );
    expect(d.updateOrder).toHaveBeenCalledWith(
      "order-1",
      expect.objectContaining({ refunded_amount: 8000 }),
    );
  });
});

describe("idempotency and ordering", () => {
  it("ignores a re-delivered event id", async () => {
    const d = deps(order(), ["evt_dup"]);
    const res = await processStripeEvent(
      {
        id: "evt_dup",
        type: "checkout.session.completed",
        created: ts("2026-08-27T10:00:00Z"),
        data: { object: { id: "cs_1", payment_status: "paid", metadata: { orderNumber: "XLNT-1" } } },
      },
      d,
    );
    expect(res.outcome).toBe("duplicate");
    expect(d.markOrderPaid).not.toHaveBeenCalled();
  });

  it("processes the same event only once across two deliveries", async () => {
    const d = deps(order());
    const event = {
      id: "evt_once",
      type: "checkout.session.completed",
      created: ts("2026-08-27T10:00:00Z"),
      data: { object: { id: "cs_2", payment_status: "paid", metadata: { orderNumber: "XLNT-1" } } },
    };
    const first = await processStripeEvent(event, d);
    const second = await processStripeEvent(event, d);
    expect(first.outcome).toBe("fulfilled");
    expect(second.outcome).toBe("duplicate");
    expect(d.markOrderPaid).toHaveBeenCalledTimes(1);
  });

  it("ignores an event older than the last processed one for the order", async () => {
    const d = deps(
      order({ payment_status: "pending", last_stripe_event_at: "2026-08-27T12:00:00Z" }),
    );
    const res = await processStripeEvent(
      {
        id: "evt_late",
        type: "payment_intent.payment_failed",
        created: ts("2026-08-27T09:00:00Z"),
        data: { object: { id: "pi_9", metadata: { orderNumber: "XLNT-1" } } },
      },
      d,
    );
    expect(res.outcome).toBe("stale_event");
    expect(d.cancelInvoice).not.toHaveBeenCalled();
    expect(d.updateOrder).not.toHaveBeenCalled();
  });

  it("records the outcome of every processed event", async () => {
    const d = deps(order());
    await processStripeEvent(
      {
        id: "evt_log",
        type: "checkout.session.completed",
        created: ts("2026-08-27T10:00:00Z"),
        data: { object: { id: "cs_3", payment_status: "paid", metadata: { orderNumber: "XLNT-1" } } },
      },
      d,
    );
    expect(d.recordEvent).toHaveBeenCalledWith(
      expect.objectContaining({ eventId: "evt_log", outcome: "fulfilled", orderNumber: "XLNT-1" }),
    );
  });

  it("unpaid checkout session is not fulfilled", async () => {
    const d = deps(order());
    const res = await processStripeEvent(
      {
        id: "evt_unpaid",
        type: "checkout.session.completed",
        created: ts("2026-08-27T10:00:00Z"),
        data: { object: { id: "cs_4", payment_status: "unpaid", metadata: { orderNumber: "XLNT-1" } } },
      },
      d,
    );
    expect(res.outcome).toBe("unpaid_session");
    expect(d.markOrderPaid).not.toHaveBeenCalled();
  });
});
