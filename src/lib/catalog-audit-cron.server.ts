/**
 * Weekly automated catalog audit.
 *
 * Called by the scheduled job (pg_cron → /api/public/katalogus-audit/cron).
 * Runs the read-only audit, stores the outcome in `app_settings`
 * (`catalog_audit_cron`) so the admin UI can show the last run, and emails the
 * owner ONLY when the audit found errors (or the run itself failed).
 * Warning-only results are recorded silently.
 */

import { runCatalogAudit } from "./catalog-audit.server";
import { getSetting, setSetting } from "./app-settings.server";
import { sendEmails } from "./notify.server";
import type { StripeEnv } from "./stripe.server";
import type { CatalogAuditReport } from "./catalog-audit";

export const CATALOG_AUDIT_CRON_KEY = "catalog_audit_cron";
const OWNER_EMAIL = "xllentac@gmail.com";
const MAX_ISSUES_IN_EMAIL = 25;

export type CatalogAuditCronState = {
  lastRunAt: string | null;
  environment: string | null;
  errorCount: number;
  warnCount: number;
  notified: boolean;
  error: string | null;
  issues: string[];
};

function collectIssues(report: CatalogAuditReport): string[] {
  const issues: string[] = [];
  for (const row of report.tiers) {
    if (row.status !== "error") continue;
    for (const issue of row.issues) {
      issues.push(`${row.productName} – ${row.tierLabel} (${row.priceId}): ${issue}`);
    }
  }
  for (const row of report.downloads) {
    if (row.status !== "error") continue;
    for (const issue of row.issues) issues.push(`${row.productName}: ${issue}`);
  }
  return issues;
}

function formatHu(iso: string): string {
  return new Date(iso).toLocaleString("hu-HU", {
    timeZone: "Europe/Budapest",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Runs the audit and notifies the owner on failure. Never throws. */
export async function runScheduledCatalogAudit(
  environment: StripeEnv,
): Promise<CatalogAuditCronState> {
  let state: CatalogAuditCronState = {
    lastRunAt: new Date().toISOString(),
    environment,
    errorCount: 0,
    warnCount: 0,
    notified: false,
    error: null,
    issues: [],
  };

  try {
    const report = await runCatalogAudit(environment);
    const errorCount = report.summary.tierError + report.summary.downloadError;
    const warnCount = report.summary.tierWarn + report.summary.downloadWarn;
    const issues = collectIssues(report);
    state = { ...state, lastRunAt: report.ranAt, errorCount, warnCount, issues };

    if (report.stripeError) {
      state.error = report.stripeError;
    }

    if (errorCount > 0 || report.stripeError) {
      state.notified = await sendEmails([
        {
          template: "belso-katalogus-audit",
          to: OWNER_EMAIL,
          // One notification per environment per day, even if the job retries.
          key: `${environment}-${report.ranAt.slice(0, 10)}`,
          data: {
            environment,
            ranAt: formatHu(report.ranAt),
            errorCount,
            warnCount,
            rows: [
              ["Környezet", environment],
              ["Licenszverziók", String(report.summary.tierCount)],
              ["Hibás licenszverzió", String(report.summary.tierError)],
              ["Termékek", String(report.summary.productCount)],
              ["Hibás termékfájl", String(report.summary.downloadError)],
              ...(report.stripeError ? [["Stripe hiba", report.stripeError]] : []),
            ],
            issues: issues.slice(0, MAX_ISSUES_IN_EMAIL),
          },
        },
      ]);
    }
  } catch (error) {
    state.error = error instanceof Error ? error.message : String(error);
    state.notified = await sendEmails([
      {
        template: "belso-katalogus-audit",
        to: OWNER_EMAIL,
        key: `${environment}-failed-${state.lastRunAt!.slice(0, 13)}`,
        data: {
          environment,
          ranAt: formatHu(state.lastRunAt!),
          errorCount: 1,
          warnCount: 0,
          rows: [["Az audit futása megszakadt", state.error]],
          issues: [state.error],
        },
      },
    ]);
  }

  try {
    await setSetting(CATALOG_AUDIT_CRON_KEY, state as unknown as Record<string, any>);
  } catch (error) {
    console.error("Catalog audit cron state save failed:", error);
  }

  return state;
}

/** Last scheduled run, for the admin panel. */
export async function catalogAuditCronState(): Promise<CatalogAuditCronState | null> {
  const value = await getSetting(CATALOG_AUDIT_CRON_KEY);
  if (!value || typeof value["lastRunAt"] !== "string") return null;
  return {
    lastRunAt: value["lastRunAt"] ?? null,
    environment: value["environment"] ?? null,
    errorCount: Number(value["errorCount"] ?? 0),
    warnCount: Number(value["warnCount"] ?? 0),
    notified: value["notified"] === true,
    error: value["error"] ?? null,
    issues: Array.isArray(value["issues"]) ? (value["issues"] as string[]) : [],
  };
}
