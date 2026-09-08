import { useServerFn } from "@tanstack/react-start";
import { Fragment, useCallback, useEffect, useState } from "react";

import { useAdminSession } from "@/components/admin-panels";
import { adminOrderAudit } from "@/lib/order-audit.functions";
import {
  EVENT_LABEL,
  PAIR_STATE_LABEL,
  SEVERITY_LABEL,
  orderAuditToCsv,
  type OrderAuditReport,
  type OrderAuditSeverity,
} from "@/lib/order-audit";

const SEVERITY_CLASS: Record<OrderAuditSeverity, string> = {
  ok: "text-primary",
  warn: "text-amber-600",
  error: "text-destructive",
};

const PAYMENT_LABEL: Record<string, string> = {
  paid: "Kifizetve",
  pending: "Fizetésre vár",
  failed: "Sikertelen",
  cancelled: "Törölve",
  canceled: "Törölve",
  refunded: "Visszatérítve",
  unknown: "Ismeretlen",
};

function formatDate(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleString("hu-HU", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatFt(value: number | null): string {
  return value === null ? "—" : `${value.toLocaleString("hu-HU")} Ft`;
}

/**
 * Admin panel: per-order Billingo audit that pairs each issued invoice with
 * its storno and flags mismatches (paid without invoice, double live invoice,
 * failed cancellation, voided payment with a live invoice).
 */
export function OrderAuditPanel() {
  const { role } = useAdminSession();
  const isAdmin = role === "admin";

  const [report, setReport] = useState<OrderAuditReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [onlyProblems, setOnlyProblems] = useState(true);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState<string | null>(null);

  const auditFn = useServerFn(adminOrderAudit);

  const run = useCallback(async () => {
    if (!isAdmin) return;
    setLoading(true);
    setError(null);
    try {
      setReport(await auditFn());
    } catch {
      setReport(null);
      setError("A rendelési audit futtatása sikertelen.");
    } finally {
      setLoading(false);
    }
  }, [auditFn, isAdmin]);

  useEffect(() => {
    void run();
  }, [run]);

  function exportCsv() {
    if (!report) return;
    const blob = new Blob([orderAuditToCsv(report)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rendelesi-audit-${report.ranAt.slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (!isAdmin) {
    return (
      <p className="mt-6 text-sm text-muted-foreground">
        A rendelési audit csak admin szerepkörrel érhető el.
      </p>
    );
  }

  const term = search.trim().toLowerCase();
  const rows = (report?.rows ?? []).filter((row) => {
    if (onlyProblems && row.severity === "ok") return false;
    if (!term) return true;
    return (
      row.orderNumber.toLowerCase().includes(term) ||
      row.email.toLowerCase().includes(term) ||
      row.productName.toLowerCase().includes(term) ||
      row.pairs.some((p) => (p.invoiceNumber ?? "").toLowerCase().includes(term))
    );
  });

  return (
    <section className="mt-4">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => void run()}
          disabled={loading}
          className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Audit folyamatban…" : "Audit futtatása"}
        </button>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rendelésszám, e-mail, számlaszám…"
          className="rounded-md border border-input bg-background px-2 py-1.5 text-sm text-foreground"
        />
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            checked={onlyProblems}
            onChange={(e) => setOnlyProblems(e.target.checked)}
          />
          Csak a problémás rendelések
        </label>
        <button
          type="button"
          onClick={exportCsv}
          disabled={!report}
          className="rounded-md border border-input px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50"
        >
          CSV export
        </button>
      </div>

      {error ? <p className="mt-4 text-sm text-destructive">{error}</p> : null}

      {report ? (
        <div className="mt-6 grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {[
            { label: "Vizsgált rendelés", value: report.summary.orderCount },
            { label: "Rendben", value: report.summary.ok },
            { label: "Figyelmeztetés", value: report.summary.warn },
            { label: "Hiba", value: report.summary.error },
            { label: "Élő számla", value: report.summary.activeInvoices },
            { label: "Sztornózott", value: report.summary.canceledInvoices },
          ].map((kpi) => (
            <div key={kpi.label} className="rounded-lg border border-border bg-card p-3">
              <p className="text-xs text-muted-foreground">{kpi.label}</p>
              <p className="mt-1 text-xl font-semibold text-foreground">{kpi.value}</p>
            </div>
          ))}
        </div>
      ) : null}

      {report ? (
        <p className="mt-3 text-xs text-muted-foreground">
          Utolsó futás: {formatDate(report.ranAt)}
          {report.summary.orphanLogs > 0
            ? ` · ${report.summary.orphanLogs} naplóbejegyzés törölt rendeléshez tartozik`
            : ""}
        </p>
      ) : null}

      <div className="mt-6 overflow-x-auto rounded-lg border border-border">
        <table className="w-full min-w-[960px] text-left text-sm">
          <thead className="bg-muted/60 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-3 py-2">Rendelés</th>
              <th className="px-3 py-2">Dátum</th>
              <th className="px-3 py-2">Termék</th>
              <th className="px-3 py-2">Összeg</th>
              <th className="px-3 py-2">Fizetés</th>
              <th className="px-3 py-2">Számlák és sztornók</th>
              <th className="px-3 py-2">Státusz</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-3 py-6 text-center text-muted-foreground">
                  {loading ? "Betöltés…" : "Nincs megjeleníthető rendelés."}
                </td>
              </tr>
            ) : null}
            {rows.map((row) => {
              const key = row.orderId ?? `num-${row.orderNumber}`;
              const isOpen = open === key;
              return (
                <Fragment key={key}>
                  <tr className="border-t border-border align-top">
                    <td className="px-3 py-2 font-medium text-foreground">
                      <button
                        type="button"
                        onClick={() => setOpen(isOpen ? null : key)}
                        className="text-left underline-offset-2 hover:underline"
                      >
                        {row.orderNumber || "—"}
                      </button>
                      <p className="text-xs text-muted-foreground">{row.email}</p>
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">{formatDate(row.createdAt)}</td>
                    <td className="px-3 py-2 text-foreground">{row.productName}</td>
                    <td className="px-3 py-2 text-foreground">{formatFt(row.totalPrice)}</td>
                    <td className="px-3 py-2 text-muted-foreground">
                      {PAYMENT_LABEL[row.paymentStatus] ?? row.paymentStatus}
                    </td>
                    <td className="px-3 py-2">
                      {row.pairs.length === 0 ? (
                        <span className="text-muted-foreground">Nincs számla</span>
                      ) : (
                        <ul className="space-y-1">
                          {row.pairs.map((pair, i) => (
                            <li key={`${key}-${pair.invoiceId ?? pair.invoiceNumber ?? i}`}>
                              <span className="font-medium text-foreground">
                                {pair.invoiceNumber ?? pair.invoiceId ?? "—"}
                              </span>{" "}
                              <span
                                className={
                                  pair.state === "canceled"
                                    ? "text-muted-foreground"
                                    : pair.state === "cancel_failed"
                                      ? "text-destructive"
                                      : "text-primary"
                                }
                              >
                                {PAIR_STATE_LABEL[pair.state]}
                              </span>
                              <span className="block text-xs text-muted-foreground">
                                Kiállítva: {formatDate(pair.issuedAt)}
                                {pair.canceledAt ? ` · Sztornó: ${formatDate(pair.canceledAt)}` : ""}
                                {pair.grossTotal != null ? ` · ${formatFt(pair.grossTotal)}` : ""}
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </td>
                    <td className={`px-3 py-2 font-medium ${SEVERITY_CLASS[row.severity]}`}>
                      {SEVERITY_LABEL[row.severity]}
                      {row.findings.length > 0 ? (
                        <ul className="mt-1 list-disc space-y-0.5 pl-4 text-xs font-normal text-muted-foreground">
                          {row.findings.map((finding) => (
                            <li key={finding}>{finding}</li>
                          ))}
                        </ul>
                      ) : null}
                    </td>
                  </tr>
                  {isOpen ? (
                    <tr className="border-t border-border bg-muted/30">
                      <td colSpan={7} className="px-3 py-3">
                        <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
                          Billingo naplóbejegyzések
                        </p>
                        <ul className="space-y-1 text-xs text-muted-foreground">
                          {row.events.length === 0 ? <li>Nincs naplóbejegyzés.</li> : null}
                          {row.events.map((event) => (
                            <li key={event.id}>
                              <span className="text-foreground">{formatDate(event.createdAt)}</span>{" "}
                              · {EVENT_LABEL[event.kind]} ·{" "}
                              {event.invoiceNumber ?? event.invoiceId ?? "—"} · forrás:{" "}
                              {event.source}
                              {event.message ? ` · ${event.message}` : ""}
                            </li>
                          ))}
                        </ul>
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
