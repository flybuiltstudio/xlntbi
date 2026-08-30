/**
 * Shared types for the order-level Billingo audit (invoice ↔ storno pairing).
 *
 * Client-safe: the admin panel imports these types without pulling any
 * server-only module into the browser bundle.
 */

export type OrderAuditSeverity = "ok" | "warn" | "error";

export type InvoiceEventKind = "issued" | "canceled" | "error" | "cancel_error";

export type InvoiceEvent = {
  id: string;
  kind: InvoiceEventKind;
  /** Billingo invoice id the event belongs to (null on early failures). */
  invoiceId: number | null;
  invoiceNumber: string | null;
  source: string;
  message: string | null;
  createdAt: string;
};

/** One Billingo invoice with its storno counterpart, if any. */
export type InvoicePair = {
  invoiceId: number | null;
  invoiceNumber: string | null;
  issuedAt: string | null;
  canceledAt: string | null;
  /** Gross total from the stored invoice snapshot, in HUF. */
  grossTotal: number | null;
  state: "active" | "canceled" | "cancel_failed";
};

export type OrderAuditRow = {
  orderId: string | null;
  orderNumber: string;
  createdAt: string | null;
  productName: string;
  totalPrice: number | null;
  currency: string;
  email: string;
  paymentStatus: string;
  paymentProvider: string | null;
  /** Invoice id/number currently stored on the order row. */
  orderInvoiceId: number | null;
  orderInvoiceNumber: string | null;
  pairs: InvoicePair[];
  events: InvoiceEvent[];
  activeInvoiceCount: number;
  canceledInvoiceCount: number;
  severity: OrderAuditSeverity;
  findings: string[];
};

export type OrderAuditReport = {
  ranAt: string;
  rows: OrderAuditRow[];
  summary: {
    orderCount: number;
    ok: number;
    warn: number;
    error: number;
    activeInvoices: number;
    canceledInvoices: number;
    orphanLogs: number;
  };
};

export const SEVERITY_LABEL: Record<OrderAuditSeverity, string> = {
  ok: "Rendben",
  warn: "Figyelmeztetés",
  error: "Hiba",
};

export const EVENT_LABEL: Record<InvoiceEventKind, string> = {
  issued: "Számla kiállítva",
  canceled: "Sztornózva",
  error: "Számlázási hiba",
  cancel_error: "Sztornó hiba",
};

export const PAIR_STATE_LABEL: Record<InvoicePair["state"], string> = {
  active: "Élő számla",
  canceled: "Sztornózva",
  cancel_failed: "Sztornó nem sikerült",
};

/** CSV export of the audit table (one row per order). */
export function orderAuditToCsv(report: OrderAuditReport): string {
  const esc = (value: unknown) => `"${String(value ?? "").replace(/"/g, '""')}"`;
  const lines: string[] = [
    [
      "rendelesszam",
      "datum",
      "termek",
      "osszeg_ft",
      "email",
      "fizetesi_statusz",
      "szamlak",
      "elo_szamla",
      "sztornozott",
      "statusz",
      "eszrevetelek",
    ]
      .map(esc)
      .join(";"),
  ];

  for (const row of report.rows) {
    lines.push(
      [
        row.orderNumber,
        row.createdAt ? row.createdAt.slice(0, 19).replace("T", " ") : "",
        row.productName,
        row.totalPrice ?? "",
        row.email,
        row.paymentStatus,
        row.pairs
          .map(
            (p) =>
              `${p.invoiceNumber ?? p.invoiceId ?? "—"} (${
                p.state === "canceled" ? "sztornó" : p.state === "active" ? "élő" : "sztornó hiba"
              })`,
          )
          .join(" | "),
        row.activeInvoiceCount,
        row.canceledInvoiceCount,
        SEVERITY_LABEL[row.severity],
        row.findings.join(" | "),
      ]
        .map(esc)
        .join(";"),
    );
  }

  return `\uFEFF${lines.join("\r\n")}\r\n`;
}
