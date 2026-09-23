/**
 * Scheduled maintenance jobs (pg_cron → /api/public/* endpoints).
 *
 *  - runWeeklyCleanup(): closes expired download / DEMO links, disables expired
 *    coupons, and stores a read-only storage orphan report. Links without an
 *    expiry (free Tudástár downloads) are never closed.
 *  - runMonthlyStatsClose(): freezes the finished month's per-product totals.
 *  - runStaleUnpaidCheck(): notifies about orders waiting too long for payment.
 *  - runMissingInvoiceCheck(): notifies about paid orders with no Billingo invoice.
 *
 * Every job is read-mostly, idempotent, and reports through the internal
 * maintenance email template.
 */

import { setSetting } from "./app-settings.server";
import { disableAdminCoupon } from "./coupons-admin.server";
import { sendEmails } from "./notify.server";
import { scanStorageOrphans } from "./storage-cleanup.server";
import type { StripeEnv } from "./stripe.server";

const OWNER_EMAIL = "xllentac@gmail.com";
export const STORAGE_CLEANUP_KEY = "storage_cleanup_report";

/** Orders unpaid for longer than this are flagged as stale. */
export const STALE_UNPAID_DAYS = 8;

function huTime(date = new Date()): string {
  return new Intl.DateTimeFormat("hu-HU", {
    timeZone: "Europe/Budapest",
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

function dayKey(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

async function report(input: {
  title: string;
  summary: string;
  rows: Array<[string, string]>;
  issues: string[];
  key: string;
}): Promise<void> {
  await sendEmails([
    {
      template: "belso-karbantartas",
      to: OWNER_EMAIL,
      key: input.key,
      data: {
        title: input.title,
        ranAt: huTime(),
        summary: input.summary,
        rows: input.rows,
        issues: input.issues.slice(0, 40),
      },
    },
  ]);
}

// ---------------------------------------------------------------------------
// Weekly cleanup
// ---------------------------------------------------------------------------

type CleanupCounts = {
  demoClosed: number;
  orderLinksClosed: number;
  freeLinksClosed: number;
  couponsDisabled: number;
  orphanFiles: number;
};

/**
 * Closes the rows of one download table whose link is genuinely spent: the
 * expiry exists and has passed, or the download budget is used up. Rows without
 * an expiry and without a positive limit stay open forever.
 */
async function closeSpentLinks(
  table: "demo_requests" | "order_downloads" | "free_download_requests",
): Promise<{ closed: number; notes: string[] }> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const nowIso = new Date().toISOString();
  const notes: string[] = [];

  const { data, error } = await (supabaseAdmin as any)
    .from(table)
    .select("id, expires_at, download_count, max_downloads, closed_at")
    .is("closed_at", null)
    .limit(2000);
  if (error) {
    notes.push(`${table}: ${error.message}`);
    return { closed: 0, notes };
  }

  const rows = (data ?? []) as Array<{
    id: string;
    expires_at: string | null;
    download_count: number | null;
    max_downloads: number | null;
    closed_at: string | null;
  }>;

  const spent = rows.filter((row) => {
    const expired = row.expires_at ? Date.parse(row.expires_at) < Date.now() : false;
    const limit = row.max_downloads ?? 0;
    const usedUp = limit > 0 && (row.download_count ?? 0) >= limit;
    return expired || usedUp;
  });
  if (spent.length === 0) return { closed: 0, notes };

  const { error: updateError } = await (supabaseAdmin as any)
    .from(table)
    .update({ closed_at: nowIso })
    .in(
      "id",
      spent.map((row) => row.id),
    );
  if (updateError) {
    notes.push(`${table}: ${updateError.message}`);
    return { closed: 0, notes };
  }
  return { closed: spent.length, notes };
}

/** Disables admin coupons whose expiry has passed but are still active. */
async function disableExpiredCoupons(): Promise<{ disabled: number; notes: string[] }> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const notes: string[] = [];
  const { data, error } = await (supabaseAdmin as any)
    .from("admin_coupons")
    .select("code, environment, expires_at, disabled_at")
    .is("disabled_at", null)
    .not("expires_at", "is", null)
    .lt("expires_at", new Date().toISOString())
    .limit(200);
  if (error) {
    notes.push(`admin_coupons: ${error.message}`);
    return { disabled: 0, notes };
  }

  let disabled = 0;
  for (const row of (data ?? []) as Array<{ code: string; environment: string }>) {
    const result = await disableAdminCoupon(row.code, row.environment as StripeEnv);
    if (result.ok) {
      disabled += 1;
      notes.push(`${row.code} (${row.environment}) lejárt kupon letiltva.`);
    } else {
      notes.push(`${row.code} (${row.environment}) letiltása nem sikerült: ${result.error}`);
    }
  }
  return { disabled, notes };
}

export async function runWeeklyCleanup(): Promise<CleanupCounts & { issues: string[] }> {
  const issues: string[] = [];

  const demo = await closeSpentLinks("demo_requests");
  const orderLinks = await closeSpentLinks("order_downloads");
  const freeLinks = await closeSpentLinks("free_download_requests");
  const coupons = await disableExpiredCoupons();
  issues.push(...demo.notes, ...orderLinks.notes, ...freeLinks.notes, ...coupons.notes);

  // Live coupon guard: keeps only allowlisted / admin-created codes active.
  let guardDeactivated = 0;
  try {
    const { sweepLivePromotionCodes } = await import("./coupon-guard.server");
    const guard = await sweepLivePromotionCodes();
    guardDeactivated = guard.deactivated.length;
    if (!guard.ok) {
      issues.push(`Éles kuponvédelem hiba: ${guard.error ?? "ismeretlen hiba"}`);
    } else if (guardDeactivated > 0) {
      issues.push(`Éles kuponvédelem kikapcsolta: ${guard.deactivated.join(", ")}`);
    }
  } catch (error) {
    issues.push(
      `Éles kuponvédelem hiba: ${error instanceof Error ? error.message : String(error)}`,
    );
  }

  let orphanFiles = 0;
  try {
    const scan = await scanStorageOrphans();
    orphanFiles = scan.orphans.length;
    await setSetting(STORAGE_CLEANUP_KEY, scan as unknown as Record<string, any>);
    if (orphanFiles > 0) {
      issues.push(
        `${orphanFiles} hivatkozás nélküli fájl a tárolóban (törlés csak kézzel, az admin Tároló-takarítás lapon).`,
      );
    }
  } catch (error) {
    issues.push(
      `Tároló-ellenőrzés hiba: ${error instanceof Error ? error.message : String(error)}`,
    );
  }

  const counts: CleanupCounts = {
    demoClosed: demo.closed,
    orderLinksClosed: orderLinks.closed,
    freeLinksClosed: freeLinks.closed,
    couponsDisabled: coupons.disabled,
    orphanFiles,
  };

  const touched =
    counts.demoClosed + counts.orderLinksClosed + counts.freeLinksClosed + counts.couponsDisabled;
  if (touched > 0 || orphanFiles > 0 || issues.length > 0) {
    await report({
      title: "Heti karbantartás",
      summary: `${touched} tétel lezárva/letiltva, ${orphanFiles} hivatkozás nélküli fájl.`,
      rows: [
        ["Lezárt DEMO linkek", String(counts.demoClosed)],
        ["Lezárt éles letöltési linkek", String(counts.orderLinksClosed)],
        ["Lezárt ingyenes letöltési linkek", String(counts.freeLinksClosed)],
        ["Letiltott lejárt kuponok", String(counts.couponsDisabled)],
        ["Éles kuponvédelem – kikapcsolt kódok", String(guardDeactivated)],
        ["Hivatkozás nélküli fájlok", String(orphanFiles)],
      ],
      issues,
      key: `weekly-${dayKey()}`,
    });
  }

  return { ...counts, issues };
}

// ---------------------------------------------------------------------------
// Monthly statistics close
// ---------------------------------------------------------------------------

/** Freezes the previous month's per-product totals into monthly_stats_snapshots. */
export async function runMonthlyStatsClose(): Promise<{
  year: number;
  month: number;
  products: number;
  issues: string[];
}> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const issues: string[] = [];

  const now = new Date();
  const target = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
  const year = target.getUTCFullYear();
  const month = target.getUTCMonth() + 1; // 1-12

  const from = new Date(Date.UTC(year, month - 1, 1)).toISOString();
  const to = new Date(Date.UTC(year, month, 1)).toISOString();

  const [views, orders] = await Promise.all([
    (supabaseAdmin as any)
      .from("page_views")
      .select("page_key, views")
      .eq("page_type", "product")
      .eq("year", year)
      .eq("month", month),
    (supabaseAdmin as any)
      .from("orders")
      .select("product_slug, product_name, total_price, payment_status, created_at")
      .gte("created_at", from)
      .lt("created_at", to),
  ]);

  const stats = new Map<
    string,
    { name: string; views: number; ordersCount: number; paid: number; revenue: number }
  >();
  const bucket = (slug: string) => {
    const existing = stats.get(slug);
    if (existing) return existing;
    const fresh = { name: "", views: 0, ordersCount: 0, paid: 0, revenue: 0 };
    stats.set(slug, fresh);
    return fresh;
  };

  for (const row of (views.data ?? []) as Array<{ page_key: string; views: number }>) {
    bucket(row.page_key).views += row.views ?? 0;
  }
  for (const row of (orders.data ?? []) as Array<{
    product_slug: string;
    product_name: string;
    total_price: number;
    payment_status: string;
  }>) {
    const entry = bucket(row.product_slug);
    if (!entry.name) entry.name = row.product_name ?? "";
    entry.ordersCount += 1;
    if (row.payment_status === "paid") {
      entry.paid += 1;
      entry.revenue += row.total_price ?? 0;
    }
  }

  const rows = Array.from(stats.entries()).map(([slug, value]) => ({
    year,
    month,
    product_slug: slug,
    product_name: value.name,
    views: value.views,
    orders_count: value.ordersCount,
    paid_count: value.paid,
    revenue: value.revenue,
    closed_at: new Date().toISOString(),
  }));

  if (rows.length > 0) {
    const { error } = await (supabaseAdmin as any)
      .from("monthly_stats_snapshots")
      .upsert(rows, { onConflict: "year,month,product_slug" });
    if (error) issues.push(`monthly_stats_snapshots: ${error.message}`);
  }

  await report({
    title: "Havi statisztika-zárás",
    summary: `${year}. ${String(month).padStart(2, "0")}. hónap lezárva, ${rows.length} termék adata rögzítve.`,
    rows: [
      ["Időszak", `${year}. ${String(month).padStart(2, "0")}.`],
      ["Rögzített termékek", String(rows.length)],
    ],
    issues,
    key: `monthly-${year}-${month}`,
  });

  return { year, month, products: rows.length, issues };
}

// ---------------------------------------------------------------------------
// Daily checks
// ---------------------------------------------------------------------------

type AlertType = "stale_unpaid" | "missing_invoice";

type AlertOrder = {
  order_number: string;
  product_name: string;
  total_price: number;
  email: string;
  created_at: string;
};

/**
 * Splits the found orders into the ones never alerted about before and the ones
 * already reported earlier. Only the new ones trigger an email, so a still
 * broken order is never mailed twice.
 */
async function splitAlreadyAlerted(
  alertType: AlertType,
  rows: AlertOrder[],
): Promise<{ fresh: AlertOrder[]; repeated: number }> {
  if (rows.length === 0) return { fresh: [], repeated: 0 };
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await (supabaseAdmin as any)
    .from("order_alerts_sent")
    .select("order_number")
    .eq("alert_type", alertType)
    .in(
      "order_number",
      rows.map((row) => row.order_number),
    );
  const seen = new Set(
    ((data ?? []) as Array<{ order_number: string }>).map((row) => row.order_number),
  );
  const fresh = rows.filter((row) => !seen.has(row.order_number));
  return { fresh, repeated: rows.length - fresh.length };
}

/** Records the alerted order numbers so the next run stays quiet about them. */
async function markAlerted(alertType: AlertType, rows: AlertOrder[]): Promise<void> {
  if (rows.length === 0) return;
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { error } = await (supabaseAdmin as any).from("order_alerts_sent").upsert(
    rows.map((row) => ({
      order_number: row.order_number,
      alert_type: alertType,
      sent_at: new Date().toISOString(),
    })),
    { onConflict: "alert_type,order_number" },
  );
  if (error) console.error(`order_alerts_sent (${alertType}):`, error.message);
}

/** Orders still unpaid after STALE_UNPAID_DAYS days. */
export async function runStaleUnpaidCheck(): Promise<{ count: number; repeated?: number }> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const cutoff = new Date(Date.now() - STALE_UNPAID_DAYS * 24 * 60 * 60 * 1000).toISOString();

  const { data } = await (supabaseAdmin as any)
    .from("orders")
    .select("order_number, product_name, total_price, email, created_at, payment_status")
    .neq("payment_status", "paid")
    .lt("created_at", cutoff)
    .order("created_at", { ascending: true })
    .limit(200);

  const rows = (data ?? []) as AlertOrder[];
  const { fresh, repeated } = await splitAlreadyAlerted("stale_unpaid", rows);
  if (fresh.length === 0) return { count: 0, repeated };

  const issues = fresh.map(
    (row) =>
      `${row.order_number} – ${row.product_name} – ${row.total_price} Ft – ${row.email} – ${huTime(
        new Date(row.created_at),
      )}`,
  );
  if (repeated > 0) {
    issues.push(`(${repeated} korábban már jelzett megrendelés továbbra is fizetésre vár.)`);
  }

  await report({
    title: "Régóta fizetésre vár",
    summary:
      `${fresh.length} új megrendelés több mint ${STALE_UNPAID_DAYS} napja nincs kifizetve.` +
      " Csak a korábban még nem jelzett tételek szerepelnek a levélben.",
    rows: [
      ["Új megrendelés", String(fresh.length)],
      ["Korábban már jelzett", String(repeated)],
    ],
    issues,
    key: `stale-unpaid-${dayKey()}`,
  });

  await markAlerted("stale_unpaid", fresh);
  return { count: fresh.length, repeated };
}

/** Paid orders with no Billingo invoice yet (0 Ft / DEMO requests excluded). */
export async function runMissingInvoiceCheck(): Promise<{ count: number; repeated?: number }> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const { data } = await (supabaseAdmin as any)
    .from("orders")
    .select("order_number, product_name, total_price, email, created_at")
    .eq("payment_status", "paid")
    .is("billingo_invoice_id", null)
    .gt("total_price", 0)
    .order("created_at", { ascending: true })
    .limit(200);

  const rows = (data ?? []) as AlertOrder[];
  const { fresh, repeated } = await splitAlreadyAlerted("missing_invoice", rows);
  if (fresh.length === 0) return { count: 0, repeated };

  const issues = fresh.map(
    (row) =>
      `${row.order_number} – ${row.product_name} – ${row.total_price} Ft – ${huTime(
        new Date(row.created_at),
      )}`,
  );
  if (repeated > 0) {
    issues.push(`(${repeated} korábban már jelzett megrendeléshez továbbra sincs számla.)`);
  }

  await report({
    title: "Számla hiányzik",
    summary:
      `${fresh.length} új kifizetett megrendeléshez nincs Billingo számla.` +
      " Csak a korábban még nem jelzett tételek szerepelnek a levélben.",
    rows: [
      ["Új megrendelés", String(fresh.length)],
      ["Korábban már jelzett", String(repeated)],
    ],
    issues,
    key: `missing-invoice-${dayKey()}`,
  });

  await markAlerted("missing_invoice", fresh);
  return { count: fresh.length, repeated };
}

// ---------------------------------------------------------------------------
// Combined daily order alerts (one run, one email)
// ---------------------------------------------------------------------------

async function collectStaleUnpaid(): Promise<{ fresh: AlertOrder[]; repeated: number }> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const cutoff = new Date(Date.now() - STALE_UNPAID_DAYS * 24 * 60 * 60 * 1000).toISOString();
  const { data } = await (supabaseAdmin as any)
    .from("orders")
    .select("order_number, product_name, total_price, email, created_at, payment_status")
    .neq("payment_status", "paid")
    .lt("created_at", cutoff)
    .order("created_at", { ascending: true })
    .limit(200);
  return splitAlreadyAlerted("stale_unpaid", (data ?? []) as AlertOrder[]);
}

async function collectMissingInvoice(): Promise<{ fresh: AlertOrder[]; repeated: number }> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await (supabaseAdmin as any)
    .from("orders")
    .select("order_number, product_name, total_price, email, created_at")
    .eq("payment_status", "paid")
    .is("billingo_invoice_id", null)
    .gt("total_price", 0)
    .order("created_at", { ascending: true })
    .limit(200);
  return splitAlreadyAlerted("missing_invoice", (data ?? []) as AlertOrder[]);
}

function alertLine(row: AlertOrder): string {
  return `${row.order_number} – ${row.product_name} – ${row.total_price} Ft – ${row.email} – ${huTime(
    new Date(row.created_at),
  )}`;
}

/**
 * Runs both daily order checks and sends a single email with two sections.
 * Orders already reported earlier stay out of the email.
 */
export async function runDailyOrderAlerts(): Promise<{
  staleUnpaid: number;
  missingInvoice: number;
  repeated: number;
  emailed: boolean;
}> {
  const stale = await collectStaleUnpaid();
  const invoice = await collectMissingInvoice();
  const repeated = stale.repeated + invoice.repeated;

  if (stale.fresh.length === 0 && invoice.fresh.length === 0) {
    return { staleUnpaid: 0, missingInvoice: 0, repeated, emailed: false };
  }

  const issues: string[] = [];
  if (stale.fresh.length > 0) {
    issues.push(`Régóta fizetésre vár (${STALE_UNPAID_DAYS}+ nap):`);
    issues.push(...stale.fresh.map(alertLine));
  }
  if (invoice.fresh.length > 0) {
    issues.push("Kifizetve, de nincs számla:");
    issues.push(...invoice.fresh.map(alertLine));
  }
  if (repeated > 0) {
    issues.push(`(${repeated} korábban már jelzett megrendelés továbbra is nyitott.)`);
  }

  await report({
    title: "Napi megrendelés-jelzések",
    summary:
      `${stale.fresh.length} új fizetésre váró és ${invoice.fresh.length} új számla nélküli` +
      " megrendelés. Csak a korábban még nem jelzett tételek szerepelnek a levélben.",
    rows: [
      ["Régóta fizetésre vár", String(stale.fresh.length)],
      ["Számla hiányzik", String(invoice.fresh.length)],
      ["Korábban már jelzett", String(repeated)],
    ],
    issues,
    key: `daily-order-alerts-${dayKey()}`,
  });

  await markAlerted("stale_unpaid", stale.fresh);
  await markAlerted("missing_invoice", invoice.fresh);

  return {
    staleUnpaid: stale.fresh.length,
    missingInvoice: invoice.fresh.length,
    repeated,
    emailed: true,
  };
}
