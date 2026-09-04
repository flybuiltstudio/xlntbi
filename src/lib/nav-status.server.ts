/**
 * NAV (Online Számla) error monitoring.
 *
 * Billingo forwards every electronic invoice to the NAV Online Számla system.
 * When NAV rejects the data report, the invoice exists in Billingo but is not
 * accepted by the tax authority — something we must notice immediately.
 *
 * This module re-reads the invoices of recent orders from the Billingo API and
 * extracts whatever NAV status the document carries. The extraction is
 * deliberately defensive (Billingo has changed field names over time): every
 * key whose name mentions NAV / online számla is inspected, so a renamed field
 * degrades to "nem meghatározható" instead of silently reporting success.
 *
 * Newly appearing rejections trigger one internal e-mail; already notified
 * invoices are remembered in app_settings (`nav_check`) so the alert does not
 * repeat on every visit to the admin page.
 */

import { fetchInvoiceSnapshot } from "./billingo.server";
import { getSetting, setSetting } from "./app-settings.server";
import { sendEmails } from "./notify.server";
import {
  classifyNavStatus,
  type NavInvoiceStatus,
  type NavState,
  type NavStatusReport,
} from "./nav-status";

const NAV_CHECK_KEY = "nav_check";
const OWNER_EMAIL = "xllentac@gmail.com";
const DEFAULT_LIMIT = 40;

const STATUS_KEY = /(online_?szamla|onlineinvoice|online_invoice|nav)/i;
const MESSAGE_KEY = /(message|error|reason|description|text|result)/i;

type Extracted = { status: string | null; message: string | null };

/** Walks the document object and collects NAV-related status + message strings. */
function extractNav(doc: any): Extracted {
  let status: string | null = null;
  let message: string | null = null;

  const visit = (node: any, navContext: boolean, depth: number) => {
    if (!node || typeof node !== "object" || depth > 6) return;
    for (const [key, value] of Object.entries(node)) {
      const inNav = navContext || STATUS_KEY.test(key);
      if (typeof value === "string" && value.trim()) {
        if (!status && STATUS_KEY.test(key) && /status|state/i.test(key)) status = value.trim();
        else if (!status && STATUS_KEY.test(key) && value.length < 40) status = value.trim();
        if (!message && inNav && MESSAGE_KEY.test(key)) message = value.trim();
      } else if (value && typeof value === "object") {
        visit(value, inNav, depth + 1);
      }
    }
  };

  visit(doc, false, 0);
  return { status, message };
}

function emptyCounts(): Record<NavState, number> {
  return { ok: 0, pending: 0, rejected: 0, not_sent: 0, unknown: 0 };
}

/**
 * Checks the NAV status of the most recent invoiced orders. Read-only towards
 * Billingo; never throws.
 */
export async function runNavStatusCheck(
  options: { limit?: number; notify?: boolean } = {},
): Promise<NavStatusReport> {
  const limit = Math.min(Math.max(options.limit ?? DEFAULT_LIMIT, 1), 200);
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const { data } = await (supabaseAdmin as any)
    .from("orders")
    .select(
      "id, order_number, email, created_at, total_price, tax_number, billingo_invoice_id, billingo_invoice_number",
    )
    .not("billingo_invoice_id", "is", null)
    .order("created_at", { ascending: false })
    .limit(limit);

  const orders: any[] = data ?? [];
  const rows: NavInvoiceStatus[] = [];

  // Small sequential batches keep us well inside Billingo's rate limits.
  for (let i = 0; i < orders.length; i += 3) {
    const batch = orders.slice(i, i + 3);
    const results = await Promise.all(
      batch.map(async (order): Promise<NavInvoiceStatus> => {
        const base = {
          orderId: order.id as string,
          orderNumber: (order.order_number as string) ?? "",
          email: (order.email as string) ?? "",
          createdAt: (order.created_at as string) ?? "",
          totalPrice: Number(order.total_price ?? 0),
          taxNumber: (order.tax_number as string | null) ?? null,
          invoiceId: Number(order.billingo_invoice_id),
          invoiceNumber: (order.billingo_invoice_number as string | null) ?? null,
        };
        const fetched = await fetchInvoiceSnapshot(base.invoiceId);
        if (!fetched.ok) {
          return { ...base, state: "unknown", rawStatus: null, message: fetched.error };
        }
        const { status, message } = extractNav(fetched.raw);
        return {
          ...base,
          invoiceNumber: fetched.snapshot.invoiceNumber ?? base.invoiceNumber,
          state: classifyNavStatus(status),
          rawStatus: status,
          message,
        };
      }),
    );
    rows.push(...results);
  }

  const counts = emptyCounts();
  for (const row of rows) counts[row.state] += 1;

  const report: NavStatusReport = {
    ranAt: new Date().toISOString(),
    checked: rows.length,
    counts,
    rows,
  };

  if (options.notify !== false) {
    await notifyNewRejections(report);
  }
  return report;
}

/** Sends one internal e-mail per newly discovered NAV rejection batch. */
async function notifyNewRejections(report: NavStatusReport): Promise<void> {
  try {
    const rejected = report.rows.filter((r) => r.state === "rejected");
    const setting = await getSetting(NAV_CHECK_KEY);
    const notified: number[] = Array.isArray(setting["notified"]) ? setting["notified"] : [];
    const fresh = rejected.filter((r) => !notified.includes(r.invoiceId));

    if (fresh.length > 0) {
      await sendEmails([
        {
          template: "belso-nav-hiba",
          to: OWNER_EMAIL,
          key: `nav-${fresh.map((r) => r.invoiceId).join("-")}`,
          data: {
            count: fresh.length,
            ranAt: new Date(report.ranAt).toLocaleString("hu-HU"),
            rows: fresh.map((r) => [
              `${r.orderNumber} · ${r.invoiceNumber ?? `#${r.invoiceId}`}`,
              r.message ?? r.rawStatus ?? "A NAV nem adott vissza okot.",
            ]) as Array<[string, string]>,
          },
        },
      ]);
    }

    // Keep the memory small and drop entries that are no longer rejected, so a
    // fixed-then-re-broken invoice alerts again.
    const stillRejected = rejected.map((r) => r.invoiceId);
    await setSetting(NAV_CHECK_KEY, {
      ...setting,
      lastRunAt: report.ranAt,
      lastRejectedCount: rejected.length,
      notified: stillRejected.slice(0, 200),
    });
  } catch (e: any) {
    console.error("NAV rejection notification failed:", e?.message ?? e);
  }
}

/** Last run metadata (for the admin panel header). */
export async function navCheckState(): Promise<{
  lastRunAt: string | null;
  lastRejectedCount: number | null;
}> {
  const setting = await getSetting(NAV_CHECK_KEY);
  return {
    lastRunAt: (setting["lastRunAt"] as string | undefined) ?? null,
    lastRejectedCount:
      typeof setting["lastRejectedCount"] === "number" ? setting["lastRejectedCount"] : null,
  };
}
