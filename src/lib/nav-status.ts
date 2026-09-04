/**
 * NAV (Online Számla) delivery status of Billingo invoices — shared types and
 * labels used by both the server check and the admin panel.
 */

export type NavState = "ok" | "pending" | "rejected" | "not_sent" | "unknown";

export type NavInvoiceStatus = {
  orderId: string;
  orderNumber: string;
  email: string;
  createdAt: string;
  totalPrice: number;
  taxNumber: string | null;
  invoiceId: number;
  invoiceNumber: string | null;
  state: NavState;
  /** Raw status string returned by Billingo, when available. */
  rawStatus: string | null;
  /** Rejection reason / error text, when available. */
  message: string | null;
};

export type NavStatusReport = {
  ranAt: string;
  checked: number;
  counts: Record<NavState, number>;
  rows: NavInvoiceStatus[];
};

export const NAV_STATE_LABEL: Record<NavState, string> = {
  ok: "NAV befogadta",
  pending: "Feldolgozás alatt",
  rejected: "NAV elutasította",
  not_sent: "Nem lett elküldve",
  unknown: "Nem meghatározható",
};

export const NAV_STATE_CLASS: Record<NavState, string> = {
  ok: "text-primary",
  pending: "text-muted-foreground",
  rejected: "text-destructive font-semibold",
  not_sent: "text-amber-600",
  unknown: "text-muted-foreground",
};

/** Classifies a raw Billingo/NAV status string. */
export function classifyNavStatus(raw: string | null | undefined): NavState {
  const value = (raw ?? "").trim().toUpperCase();
  if (!value) return "unknown";
  if (/ERROR|ABORT|REJECT|FAIL|INVALID|WARN/.test(value)) return "rejected";
  if (/DONE|OK|SUCCES|ACCEPT|FINISH/.test(value)) return "ok";
  if (/NOT_SENT|NOTSENT|UNSENT|NONE|DISABLED/.test(value)) return "not_sent";
  if (/PROGRESS|PENDING|SENT|SAVED|RECEIVED|PROCESS|QUEUE/.test(value)) return "pending";
  return "unknown";
}

export function navReportToCsv(report: NavStatusReport): string {
  const head = [
    "Rendelésszám",
    "Számlaszám",
    "Billingo azonosító",
    "Állapot",
    "NAV státusz",
    "Hibaüzenet",
    "Vevő e-mail",
    "Adószám",
    "Összeg",
    "Létrehozva",
  ];
  const escape = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const lines = report.rows.map((r) =>
    [
      r.orderNumber,
      r.invoiceNumber ?? "",
      r.invoiceId,
      NAV_STATE_LABEL[r.state],
      r.rawStatus ?? "",
      r.message ?? "",
      r.email,
      r.taxNumber ?? "",
      r.totalPrice,
      r.createdAt,
    ]
      .map(escape)
      .join(";"),
  );
  return [head.map(escape).join(";"), ...lines].join("\n");
}
