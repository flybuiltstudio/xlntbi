import { useServerFn } from "@tanstack/react-start";
import { useCallback, useEffect, useState } from "react";

import { useAdminSession } from "@/components/admin-panels";
import {
  adminCatalogAudit,
  adminCatalogAuditCronState,
  adminFixCatalogIssues,
} from "@/lib/catalog-audit.functions";
import {
  AUDIT_STATUS_LABEL,
  auditReportToCsv,
  type AuditStatus,
  type CatalogAuditReport,
} from "@/lib/catalog-audit";
import { FIX_KIND_LABEL, type CatalogFixResult } from "@/lib/catalog-fix";
import type { CatalogAuditCronState } from "@/lib/catalog-audit-cron";
import { getStripeEnvironmentSafe } from "@/lib/stripe";

type Env = "sandbox" | "live";

const STATUS_CLASS: Record<AuditStatus, string> = {
  ok: "text-primary",
  warn: "text-amber-600",
  error: "text-destructive",
};

function formatFt(value: number | null): string {
  return value === null ? "—" : `${value.toLocaleString("hu-HU")} Ft`;
}

function formatSize(value: number | null): string {
  if (value === null) return "—";
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(0)} KB`;
  return `${(value / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Admin panel: one-click audit of every product and licence tier — Stripe
 * lookup key, active price, amount, and the download file in storage.
 */
export function CatalogAuditPanel() {
  const { role } = useAdminSession();
  const isAdmin = role === "admin";

  const [env, setEnv] = useState<Env>(() => getStripeEnvironmentSafe() ?? "sandbox");
  const [report, setReport] = useState<CatalogAuditReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [onlyProblems, setOnlyProblems] = useState(true);

  const auditFn = useServerFn(adminCatalogAudit);

  const run = useCallback(
    async (environment: Env) => {
      if (!isAdmin) return;
      setLoading(true);
      setError(null);
      try {
        const res = await auditFn({ data: { environment } });
        setReport(res.report);
      } catch {
        setReport(null);
        setError("Az ellenőrzés futtatása sikertelen.");
      } finally {
        setLoading(false);
      }
    },
    [auditFn, isAdmin],
  );

  useEffect(() => {
    void run(env);
  }, [env, run]);

  function exportCsv() {
    if (!report) return;
    const blob = new Blob([auditReportToCsv(report)], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `katalogus-ellenorzes-${report.environment}-${report.ranAt.slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (!isAdmin) {
    return (
      <p className="mt-6 text-sm text-muted-foreground">
        A katalógus-ellenőrzés csak admin szerepkörrel érhető el.
      </p>
    );
  }

  const tierRows = (report?.tiers ?? []).filter(
    (r) => !onlyProblems || r.status !== "ok",
  );
  const downloadRows = (report?.downloads ?? []).filter(
    (r) => !onlyProblems || r.status !== "ok",
  );

  return (
    <section className="mt-8">
      <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm text-muted-foreground">
          Környezet{" "}
          <select
            value={env}
            onChange={(e) => setEnv(e.target.value as Env)}
            className="ml-1 rounded-md border border-input bg-background px-2 py-1 text-sm text-foreground"
          >
            <option value="sandbox">Teszt (sandbox)</option>
            <option value="live">Éles (live)</option>
          </select>
        </label>
        <button
          type="button"
          onClick={() => void run(env)}
          disabled={loading}
          className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Ellenőrzés folyamatban…" : "Ellenőrzés futtatása"}
        </button>
        <button
          type="button"
          onClick={exportCsv}
          disabled={!report}
          className="rounded-md border border-input px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-accent disabled:opacity-50"
        >
          CSV export
        </button>
        <button
          type="button"
          onClick={() => void fix()}
          disabled={loading || fixing}
          title="Csak a biztonságosan javítható hibákat módosítja: Stripe terméknév, inaktív ár újraaktiválása, elavult letöltési token útvonala."
          className="rounded-md border border-primary px-3 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-primary/10 disabled:opacity-50"
        >
          {fixing ? "Javítás folyamatban…" : "Talált hibák javítása"}
        </button>
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            checked={onlyProblems}
            onChange={(e) => setOnlyProblems(e.target.checked)}
          />
          Csak a hibás sorok
        </label>
      </div>

      {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
      {report?.stripeError ? (
        <p className="mt-3 text-sm text-destructive">Stripe hiba: {report.stripeError}</p>
      ) : null}

      {cron ? (
        <p className="mt-3 rounded-md border border-border bg-card p-3 text-sm text-muted-foreground">
          <strong className="text-foreground">Heti automatikus audit</strong> — minden hétfőn
          3:00-kor fut az éles környezetre, hiba esetén e-mail értesítéssel. Utolsó futás:{" "}
          {new Date(cron.lastRunAt ?? "").toLocaleString("hu-HU")} ({cron.environment}):{" "}
          {cron.errorCount} hiba, {cron.warnCount} figyelmeztetés
          {cron.notified ? " · értesítő elküldve" : ""}
          {cron.error ? ` · futási hiba: ${cron.error}` : ""}
        </p>
      ) : (
        <p className="mt-3 rounded-md border border-border bg-card p-3 text-sm text-muted-foreground">
          <strong className="text-foreground">Heti automatikus audit</strong> — minden hétfőn
          3:00-kor fut az éles környezetre; hiba esetén e-mail értesítés megy. Még nem volt
          ütemezett futás.
        </p>
      )}

      {fixResult ? (
        <div className="mt-3 rounded-md border border-border bg-card p-3 text-sm">
          <p className="text-foreground">
            Javítás: {fixResult.summary.fixed} sikeres, {fixResult.summary.failed} sikertelen,{" "}
            {fixResult.summary.manual} kézi beavatkozást igényel.
          </p>
          {fixResult.actions.length > 0 ? (
            <ul className="mt-2 list-disc space-y-0.5 pl-5 text-muted-foreground">
              {fixResult.actions.map((action, i) => (
                <li key={`${action.kind}-${action.target}-${i}`}>
                  <span className={action.ok ? "text-primary" : "text-destructive"}>
                    {FIX_KIND_LABEL[action.kind]}
                  </span>{" "}
                  – {action.target}: {action.detail}
                </li>
              ))}
            </ul>
          ) : null}
          {fixResult.manual.length > 0 ? (
            <>
              <p className="mt-3 font-medium text-foreground">
                Automatikusan nem javítható (kézi döntés kell):
              </p>
              <ul className="mt-1 list-disc space-y-0.5 pl-5 text-muted-foreground">
                {fixResult.manual.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </>
          ) : null}
        </div>
      ) : null}

      {report ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <p className="rounded-md border border-border bg-card p-3 text-sm text-muted-foreground">
            <strong className="text-foreground">Stripe árak</strong> — összesen{" "}
            {report.summary.tierCount} licenszverzió: rendben {report.summary.tierOk},
            figyelmeztetés {report.summary.tierWarn}, hiba {report.summary.tierError}.
          </p>
          <p className="rounded-md border border-border bg-card p-3 text-sm text-muted-foreground">
            <strong className="text-foreground">Letöltések</strong> — összesen{" "}
            {report.summary.productCount} termék: rendben {report.summary.downloadOk},
            figyelmeztetés {report.summary.downloadWarn}, hiba {report.summary.downloadError}.
          </p>
        </div>
      ) : null}

      <h2 className="mt-8 text-xl font-semibold text-foreground">
        Stripe lookup key és ár – licenszverziónként
      </h2>
      <div className="mt-3 overflow-x-auto rounded-md border border-border">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="bg-muted/50 text-muted-foreground">
            <tr>
              <th className="px-3 py-2 font-medium">Termék</th>
              <th className="px-3 py-2 font-medium">Licensz</th>
              <th className="px-3 py-2 font-medium">Lookup key</th>
              <th className="px-3 py-2 font-medium">Katalógus</th>
              <th className="px-3 py-2 font-medium">Stripe</th>
              <th className="px-3 py-2 font-medium">Aktív</th>
              <th className="px-3 py-2 font-medium">Státusz</th>
              <th className="px-3 py-2 font-medium">Észrevétel</th>
            </tr>
          </thead>
          <tbody>
            {tierRows.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-3 py-4 text-muted-foreground">
                  {loading ? "Ellenőrzés folyamatban…" : "Nincs megjelenítendő sor."}
                </td>
              </tr>
            ) : (
              tierRows.map((row) => (
                <tr key={`${row.slug}-${row.tierId}`} className="border-t border-border">
                  <td className="px-3 py-2 text-foreground">{row.productName}</td>
                  <td className="px-3 py-2 text-muted-foreground">{row.tierLabel}</td>
                  <td className="px-3 py-2 font-mono text-xs text-muted-foreground">
                    {row.priceId}
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">
                    {formatFt(row.expectedPrice)}
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">
                    {formatFt(row.stripePrice)}
                    {row.stripeCurrency && row.stripeCurrency !== "HUF"
                      ? ` (${row.stripeCurrency})`
                      : ""}
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">
                    {row.stripeActive === null ? "—" : row.stripeActive ? "igen" : "nem"}
                  </td>
                  <td className={`px-3 py-2 font-medium ${STATUS_CLASS[row.status]}`}>
                    {AUDIT_STATUS_LABEL[row.status]}
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">
                    {row.issues.join(" ") || "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <h2 className="mt-10 text-xl font-semibold text-foreground">
        Letöltési fájl és tokenek – termékenként
      </h2>
      <div className="mt-3 overflow-x-auto rounded-md border border-border">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="bg-muted/50 text-muted-foreground">
            <tr>
              <th className="px-3 py-2 font-medium">Termék</th>
              <th className="px-3 py-2 font-medium">Fájlnév</th>
              <th className="px-3 py-2 font-medium">Tároló útvonal</th>
              <th className="px-3 py-2 font-medium">Méret</th>
              <th className="px-3 py-2 font-medium">Tokenek</th>
              <th className="px-3 py-2 font-medium">Státusz</th>
              <th className="px-3 py-2 font-medium">Észrevétel</th>
            </tr>
          </thead>
          <tbody>
            {downloadRows.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-3 py-4 text-muted-foreground">
                  {loading ? "Ellenőrzés folyamatban…" : "Nincs megjelenítendő sor."}
                </td>
              </tr>
            ) : (
              downloadRows.map((row) => (
                <tr key={row.slug} className="border-t border-border">
                  <td className="px-3 py-2 text-foreground">{row.productName}</td>
                  <td className="px-3 py-2 text-muted-foreground">{row.fileName ?? "—"}</td>
                  <td className="px-3 py-2 font-mono text-xs text-muted-foreground">
                    {row.storagePath ?? "—"}
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">{formatSize(row.fileSize)}</td>
                  <td className="px-3 py-2 text-muted-foreground">
                    {row.tokenCount}
                    {row.staleTokenCount > 0 ? ` (elavult: ${row.staleTokenCount})` : ""}
                  </td>
                  <td className={`px-3 py-2 font-medium ${STATUS_CLASS[row.status]}`}>
                    {AUDIT_STATUS_LABEL[row.status]}
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">
                    {row.issues.join(" ") || "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
