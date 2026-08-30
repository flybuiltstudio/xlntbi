/**
 * Order-level Billingo audit: pairs every issued invoice with its storno
 * (cancellation) so the admin can see, per order, what is live and what has
 * been voided — plus anomalies that need a human decision.
 */

import type {
  InvoiceEvent,
  InvoiceEventKind,
  InvoicePair,
  OrderAuditReport,
  OrderAuditRow,
  OrderAuditSeverity,
} from "./order-audit";

const LOG_LIMIT = 2000;
const ORDER_LIMIT = 500;

function eventKind(status: string): InvoiceEventKind {
  if (status === "canceled") return "canceled";
  if (status === "cancel_error") return "cancel_error";
  if (status === "error") return "error";
  return "issued";
}

export async function buildOrderAudit(): Promise<OrderAuditReport> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const db = supabaseAdmin as any;

  const [ordersRes, logsRes, snapsRes] = await Promise.all([
    db
      .from("orders")
      .select(
        "id, order_number, created_at, product_name, total_price, currency, email, payment_status, payment_provider, billingo_invoice_id, billingo_invoice_number",
      )
      .order("created_at", { ascending: false })
      .limit(ORDER_LIMIT),
    db
      .from("billingo_invoice_logs")
      .select(
        "id, order_id, order_number, source, status, invoice_number, billingo_invoice_id, error_message, error_code, created_at",
      )
      .order("created_at", { ascending: true })
      .limit(LOG_LIMIT),
    db
      .from("billingo_invoice_snapshots")
      .select("billingo_invoice_id, order_id, gross_total, invoice_number, invoice_type")
      .limit(LOG_LIMIT),
  ]);

  const orders = (ordersRes?.data ?? []) as any[];
  const logs = (logsRes?.data ?? []) as any[];
  const snapshots = (snapsRes?.data ?? []) as any[];

  const grossByInvoice = new Map<number, number>();
  for (const snap of snapshots) {
    if (snap.billingo_invoice_id != null && snap.gross_total != null) {
      grossByInvoice.set(Number(snap.billingo_invoice_id), Number(snap.gross_total));
    }
  }

  // Group logs by order (order_id when present, otherwise order_number), so
  // logs whose order row was deleted still surface as orphans.
  const logsByKey = new Map<string, any[]>();
  for (const log of logs) {
    const key = log.order_id ? `id:${log.order_id}` : `num:${log.order_number ?? "?"}`;
    const list = logsByKey.get(key);
    if (list) list.push(log);
    else logsByKey.set(key, [log]);
  }

  const rows: OrderAuditRow[] = [];
  const usedKeys = new Set<string>();

  const buildRow = (
    base: {
      orderId: string | null;
      orderNumber: string;
      createdAt: string | null;
      productName: string;
      totalPrice: number | null;
      currency: string;
      email: string;
      paymentStatus: string;
      paymentProvider: string | null;
      orderInvoiceId: number | null;
      orderInvoiceNumber: string | null;
      orphan: boolean;
    },
    orderLogs: any[],
  ): OrderAuditRow => {
    const events: InvoiceEvent[] = orderLogs.map((log) => ({
      id: log.id,
      kind: eventKind(log.status),
      invoiceId: log.billingo_invoice_id != null ? Number(log.billingo_invoice_id) : null,
      invoiceNumber: log.invoice_number ?? null,
      source: log.source ?? "webhook",
      message: log.error_message ?? log.error_code ?? null,
      createdAt: log.created_at,
    }));

    // Pair issued invoices with their storno events by Billingo invoice id
    // (falling back to invoice number when the id was not recorded).
    const pairMap = new Map<string, InvoicePair>();
    const pairKey = (invoiceId: number | null, invoiceNumber: string | null) =>
      invoiceId != null ? `id:${invoiceId}` : invoiceNumber ? `num:${invoiceNumber}` : "unknown";

    for (const event of events) {
      if (event.kind === "error") continue;
      const key = pairKey(event.invoiceId, event.invoiceNumber);
      let pair = pairMap.get(key);
      if (!pair) {
        pair = {
          invoiceId: event.invoiceId,
          invoiceNumber: event.invoiceNumber,
          issuedAt: null,
          canceledAt: null,
          grossTotal: null,
          state: "active",
        };
        pairMap.set(key, pair);
      }
      if (event.invoiceId != null) pair.invoiceId = event.invoiceId;
      if (event.invoiceNumber) pair.invoiceNumber = event.invoiceNumber;
      if (event.kind === "issued") pair.issuedAt = pair.issuedAt ?? event.createdAt;
      if (event.kind === "canceled") {
        pair.canceledAt = event.createdAt;
        pair.state = "canceled";
      }
      if (event.kind === "cancel_error" && pair.state !== "canceled") {
        pair.state = "cancel_failed";
      }
    }

    const pairs = [...pairMap.values()].map((pair) => ({
      ...pair,
      grossTotal: pair.invoiceId != null ? grossByInvoice.get(pair.invoiceId) ?? null : null,
    }));

    const activeInvoiceCount = pairs.filter((p) => p.state !== "canceled").length;
    const canceledInvoiceCount = pairs.filter((p) => p.state === "canceled").length;

    const findings: string[] = [];
    let severity: OrderAuditSeverity = "ok";
    const raise = (level: OrderAuditSeverity, message: string) => {
      findings.push(message);
      if (level === "error" || (level === "warn" && severity === "ok")) severity = level;
    };

    if (base.orphan) {
      raise("warn", "A naplóhoz tartozó rendelés már nem létezik (törölt rendelés).");
    }

    const paid = base.paymentStatus === "paid";
    const voidLike =
      base.paymentStatus === "refunded" ||
      base.paymentStatus === "failed" ||
      base.paymentStatus === "cancelled" ||
      base.paymentStatus === "canceled";

    if (paid && pairs.length === 0) {
      raise("error", "Kifizetett rendelés, de nincs kiállított Billingo számla.");
    }
    if (paid && pairs.length > 0 && activeInvoiceCount === 0) {
      raise("error", "A rendelés ki van fizetve, de minden számlája sztornózva van.");
    }
    if (voidLike && activeInvoiceCount > 0) {
      raise("warn", "Nem teljesült fizetés, de van élő (nem sztornózott) számla.");
    }
    if (activeInvoiceCount > 1) {
      raise("error", `Több élő számla ugyanahhoz a rendeléshez (${activeInvoiceCount} db).`);
    }
    if (pairs.some((p) => p.state === "cancel_failed")) {
      raise("error", "Sikertelen sztornó kísérlet — a számla továbbra is élő.");
    }
    if (events.some((e) => e.kind === "error") && activeInvoiceCount === 0 && paid) {
      raise("warn", "Számlázási hiba szerepel a naplóban, számla nélkül.");
    }
    if (
      base.orderInvoiceNumber &&
      !pairs.some((p) => p.invoiceNumber === base.orderInvoiceNumber)
    ) {
      raise(
        "warn",
        `A rendelésen tárolt számlaszám (${base.orderInvoiceNumber}) nem szerepel a naplóban.`,
      );
    }
    if (!base.orderInvoiceNumber && activeInvoiceCount > 0 && !base.orphan) {
      raise("warn", "Élő számla van a naplóban, de a rendelésen nincs számlaszám.");
    }
    const activePair = pairs.find((p) => p.state !== "canceled");
    if (
      activePair?.grossTotal != null &&
      base.totalPrice != null &&
      Math.abs(activePair.grossTotal - base.totalPrice) > 1
    ) {
      raise(
        "warn",
        `Számla bruttó összeg (${activePair.grossTotal} Ft) eltér a rendelés végösszegétől (${base.totalPrice} Ft).`,
      );
    }

    return {
      orderId: base.orderId,
      orderNumber: base.orderNumber,
      createdAt: base.createdAt,
      productName: base.productName,
      totalPrice: base.totalPrice,
      currency: base.currency,
      email: base.email,
      paymentStatus: base.paymentStatus,
      paymentProvider: base.paymentProvider,
      orderInvoiceId: base.orderInvoiceId,
      orderInvoiceNumber: base.orderInvoiceNumber,
      pairs: pairs.sort((a, b) => (a.issuedAt ?? "").localeCompare(b.issuedAt ?? "")),
      events: events.slice().reverse(),
      activeInvoiceCount,
      canceledInvoiceCount,
      severity,
      findings,
    };
  };

  for (const order of orders) {
    const key = `id:${order.id}`;
    usedKeys.add(key);
    const orderLogs = logsByKey.get(key) ?? logsByKey.get(`num:${order.order_number}`) ?? [];
    if (logsByKey.has(`num:${order.order_number}`)) usedKeys.add(`num:${order.order_number}`);
    rows.push(
      buildRow(
        {
          orderId: order.id,
          orderNumber: order.order_number ?? "",
          createdAt: order.created_at ?? null,
          productName: order.product_name ?? "",
          totalPrice: order.total_price != null ? Number(order.total_price) : null,
          currency: order.currency ?? "HUF",
          email: order.email ?? "",
          paymentStatus: order.payment_status ?? "pending",
          paymentProvider: order.payment_provider ?? null,
          orderInvoiceId:
            order.billingo_invoice_id != null ? Number(order.billingo_invoice_id) : null,
          orderInvoiceNumber: order.billingo_invoice_number ?? null,
          orphan: false,
        },
        orderLogs,
      ),
    );
  }

  // Logs whose order row is gone (purged test orders, manual deletes).
  let orphanLogs = 0;
  for (const [key, orderLogs] of logsByKey) {
    if (usedKeys.has(key)) continue;
    orphanLogs += orderLogs.length;
    const first = orderLogs[0];
    rows.push(
      buildRow(
        {
          orderId: first.order_id ?? null,
          orderNumber: first.order_number ?? "—",
          createdAt: orderLogs[orderLogs.length - 1]?.created_at ?? null,
          productName: "—",
          totalPrice: null,
          currency: "HUF",
          email: "—",
          paymentStatus: "unknown",
          paymentProvider: null,
          orderInvoiceId: null,
          orderInvoiceNumber: null,
          orphan: true,
        },
        orderLogs,
      ),
    );
  }

  rows.sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));

  return {
    ranAt: new Date().toISOString(),
    rows,
    summary: {
      orderCount: rows.length,
      ok: rows.filter((r) => r.severity === "ok").length,
      warn: rows.filter((r) => r.severity === "warn").length,
      error: rows.filter((r) => r.severity === "error").length,
      activeInvoices: rows.reduce((sum, r) => sum + r.activeInvoiceCount, 0),
      canceledInvoices: rows.reduce((sum, r) => sum + r.canceledInvoiceCount, 0),
      orphanLogs,
    },
  };
}
