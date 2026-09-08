import { useServerFn } from "@tanstack/react-start";
import { useCallback, useEffect, useState } from "react";

import { adminNavCheckState, adminNavStatusCheck } from "@/lib/nav-status.functions";
import {
  NAV_STATE_CLASS,
  NAV_STATE_LABEL,
  navReportToCsv,
  type NavStatusReport,
} from "@/lib/nav-status";

function formatDate(value: string | null): string {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleString("hu-HU");
}

/**
 * Admin panel: NAV (Online Számla) delivery status of the most recent Billingo
 * invoices, with the rejection reason and the order reference in one row.
 */
export function NavStatusPanel() {
  const [report, setReport] = useState<NavStatusReport | null>(null);
  const [state, setState] = useState<{ lastRunAt: string | null; lastRejectedCount: number | null } | null>(
    null,
  );
  const [limit, setLimit] = useState(40);
  const [onlyProblems, setOnlyProblems] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runFn = useServerFn(adminNavStatusCheck);
  const stateFn = useServerFn(adminNavCheckState);

  useEffect(() => {
    stateFn()
      .then((r) => setState(r.state))
      .catch(() => setState(null));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const run = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await runFn({ data: { limit } });
      setReport(result.report);
      setState({
        lastRunAt: result.report.ranAt,
        lastRejectedCount: result.report.counts.rejected,
      });
    } catch (e: any) {
      setError(e?.message ?? "Az ellenőrzés nem sikerült.");
    } finally {
      setLoading(false);
    }
  }, [limit, runFn]);

  const downloadCsv = () => {
    if (!report) return;
    const blob = new Blob([`\ufeff${navReportToCsv(report)}`], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nav-ellenorzes-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const rows =
    report?.rows.filter((r) => (onlyProblems ? r.state !== "ok" : true)) ?? [];

  return (
    <section className="mt-4">
      <div className="rounded-lg border border-border bg-card p-5">
        <div className="flex flex-wrap items-end gap-3">
          <label className="text-sm">
            <span className="mb-1 block font-medium text-foreground">Ellenőrzött rendelések</span>
            <select
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {[20, 40, 80, 150].map((v) => (
                <option key={v} value={v}>
                  legutóbbi {v}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={() => void run()}
            disabled={loading}
            className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
          >
            {loading ? "Ellenőrzés folyamatban…" : "Ellenőrzés indítása"}
          </button>
          {report ? (
            <button
              type="button"
              onClick={downloadCsv}
              className="inline-flex items-center rounded-md border border-input px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
            >
              CSV letöltése
            </button>
          ) : null}
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={onlyProblems}
              onChange={(e) => setOnlyProblems(e.target.checked)}
            />
            Csak a problémás számlák
          </label>
        </div>

        <p className="mt-3 text-xs text-muted-foreground">
          Utolsó ellenőrzés: {formatDate(state?.lastRunAt ?? null)}
          {state?.lastRejectedCount !== null && state?.lastRejectedCount !== undefined
            ? ` · akkor ${state.lastRejectedCount} elutasított számla`
            : ""}
          . Új elutasításról automatikusan e-mail értesítés is megy.
        </p>

        {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}

        {report ? (
          <>
            <div className="mt-5 grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {(
                [
                  ["rejected", report.counts.rejected],
                  ["ok", report.counts.ok],
                  ["pending", report.counts.pending],
                  ["not_sent", report.counts.not_sent],
                  ["unknown", report.counts.unknown],
                ] as const
              ).map(([key, value]) => (
                <div key={key} className="rounded-md border border-border p-3">
                  <div className="text-xs text-muted-foreground">{NAV_STATE_LABEL[key]}</div>
                  <div className={`text-xl font-semibold ${NAV_STATE_CLASS[key]}`}>{value}</div>
                </div>
              ))}
            </div>

            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[820px] text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase text-muted-foreground">
                    <th className="py-2 pr-3">Rendelés</th>
                    <th className="py-2 pr-3">Számla</th>
                    <th className="py-2 pr-3">Állapot</th>
                    <th className="py-2 pr-3">Ok / üzenet</th>
                    <th className="py-2 pr-3">Vevő</th>
                    <th className="py-2 pr-3">Adószám</th>
                    <th className="py-2">Dátum</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-4 text-muted-foreground">
                        {report.checked === 0
                          ? "Nincs kiállított Billingo számla az ellenőrzött rendelések között."
                          : "Nincs problémás számla — a NAV mindent befogadott."}
                      </td>
                    </tr>
                  ) : (
                    rows.map((r) => (
                      <tr key={`${r.orderId}-${r.invoiceId}`} className="border-b border-border/60">
                        <td className="py-2 pr-3 font-medium text-foreground">{r.orderNumber}</td>
                        <td className="py-2 pr-3">{r.invoiceNumber ?? `#${r.invoiceId}`}</td>
                        <td className={`py-2 pr-3 ${NAV_STATE_CLASS[r.state]}`}>
                          {NAV_STATE_LABEL[r.state]}
                          {r.rawStatus ? (
                            <span className="ml-1 text-xs text-muted-foreground">({r.rawStatus})</span>
                          ) : null}
                        </td>
                        <td className="py-2 pr-3 text-muted-foreground">{r.message ?? "—"}</td>
                        <td className="py-2 pr-3 text-muted-foreground">{r.email}</td>
                        <td className="py-2 pr-3 text-muted-foreground">{r.taxNumber ?? "—"}</td>
                        <td className="py-2 text-muted-foreground">{formatDate(r.createdAt)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        ) : null}
      </div>
    </section>
  );
}
