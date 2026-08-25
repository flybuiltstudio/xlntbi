import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";

import {
  adminBillingoAudit,
  adminBillingoWebhookState,
  adminInvoiceSnapshot,
  adminSetBillingoWebhook,
} from "@/lib/admin.functions";

type AuditRow = {
  orderId: string;
  orderNumber: string;
  createdAt: string;
  email: string;
  paymentProvider: string | null;
  paymentReference: string | null;
  paymentStatus: string;
  billingoInvoiceId: number | null;
  billingoInvoiceNumber: string | null;
  invoiceComment: string | null;
  commentOrderNumber: string | null;
  status: "ok" | "mismatch" | "missing_comment" | "no_invoice" | "no_snapshot";
  snapshotFetchedAt: string | null;
};

const STATUS_LABEL: Record<AuditRow["status"], string> = {
  ok: "Egyezik",
  mismatch: "NEM egyezik",
  missing_comment: "Nincs rendelésszám a megjegyzésben",
  no_invoice: "Nincs Billingo számla",
  no_snapshot: "Nincs betöltött számlaadat",
};

const STATUS_CLASS: Record<AuditRow["status"], string> = {
  ok: "bg-primary/10 text-primary",
  mismatch: "bg-destructive/10 text-destructive",
  missing_comment: "bg-destructive/10 text-destructive",
  no_invoice: "bg-muted text-muted-foreground",
  no_snapshot: "bg-muted text-muted-foreground",
};

function hunDate(value: string | null): string {
  if (!value) return "–";
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? "–"
    : `${d.getFullYear()}. ${String(d.getMonth() + 1).padStart(2, "0")}. ${String(
        d.getDate(),
      ).padStart(2, "0")}. ${String(d.getHours()).padStart(2, "0")}:${String(
        d.getMinutes(),
      ).padStart(2, "0")}`;
}

export function BillingoAuditPanel() {
  const loadState = useServerFn(adminBillingoWebhookState);
  const setWebhook = useServerFn(adminSetBillingoWebhook);
  const loadAudit = useServerFn(adminBillingoAudit);
  const invoiceSnapshot = useServerFn(adminInvoiceSnapshot);

  const [webhook, setWebhookState] = useState<{ enabled: boolean; updatedAt: string | null } | null>(
    null,
  );
  const [toggling, setToggling] = useState(false);
  const [rows, setRows] = useState<AuditRow[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [onlyProblems, setOnlyProblems] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [bulkBusy, setBulkBusy] = useState(false);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const [state, audit] = await Promise.all([loadState(), loadAudit()]);
      setWebhookState(state);
      setRows(audit.rows as AuditRow[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "A betöltés nem sikerült.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onToggle() {
    if (!webhook) return;
    setToggling(true);
    setNotice(null);
    try {
      const next = await setWebhook({ data: { enabled: !webhook.enabled } });
      setWebhookState(next);
      setNotice(
        next.enabled
          ? "A Billingo webhook végpont bekapcsolva — a beérkező értesítéseket feldolgozza."
          : "A Billingo webhook végpont kikapcsolva — a beérkező hívások 410 választ kapnak.",
      );
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "A kapcsoló átállítása nem sikerült.");
    } finally {
      setToggling(false);
    }
  }

  async function onReload(row: AuditRow) {
    setBusy(row.orderId);
    setNotice(null);
    try {
      const result = await invoiceSnapshot({ data: { orderId: row.orderId, refresh: true } });
      if (!result.ok) {
        setNotice(`${row.orderNumber}: ${result.error}`);
      } else {
        setNotice(`${row.orderNumber}: számlaadatok újratöltve a Billingóból.`);
        await refresh();
      }
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "Az újratöltés nem sikerült.");
    } finally {
      setBusy(null);
    }
  }

  async function onBulkReload() {
    const targets = (rows ?? []).filter(
      (r) => selected.includes(r.orderId) && r.billingoInvoiceId,
    );
    if (targets.length === 0) {
      setNotice("Nincs kiválasztott rendelés Billingo számlával.");
      return;
    }
    setBulkBusy(true);
    setNotice(null);
    let ok = 0;
    const failed: string[] = [];
    for (const row of targets) {
      try {
        const result = await invoiceSnapshot({ data: { orderId: row.orderId, refresh: true } });
        if (result.ok) ok += 1;
        else failed.push(`${row.orderNumber}: ${result.error}`);
      } catch (e) {
        failed.push(`${row.orderNumber}: ${e instanceof Error ? e.message : "hiba"}`);
      }
    }
    setBulkBusy(false);
    setNotice(
      `${ok} rendelés számlaadata újratöltve.` +
        (failed.length ? ` Sikertelen: ${failed.join("; ")}` : ""),
    );
    await refresh();
  }

  function csvCell(value: string | number | null): string {
    const s = value === null || value === undefined ? "" : String(value);
    return `"${s.replace(/"/g, '""')}"`;
  }

  function onExportCsv() {
    const problemRows = (rows ?? []).filter((r) => r.status !== "ok");
    if (problemRows.length === 0) {
      setNotice("Nincs exportálható eltérés vagy hiányzó rekord.");
      return;
    }
    const header = [
      "Rendelésszám",
      "Dátum",
      "E-mail",
      "Fizetési szolgáltató",
      "Stripe azonosító",
      "Fizetési állapot",
      "Billingo számla ID",
      "Számlaszám",
      "Billingo megjegyzés",
      "Megjegyzésben lévő rendelésszám",
      "Állapot",
      "Számlaadat betöltve",
    ];
    const lines = [
      header.map(csvCell).join(";"),
      ...problemRows.map((r) =>
        [
          r.orderNumber,
          r.createdAt,
          r.email,
          r.paymentProvider,
          r.paymentReference,
          r.paymentStatus,
          r.billingoInvoiceId,
          r.billingoInvoiceNumber,
          r.invoiceComment,
          r.commentOrderNumber,
          STATUS_LABEL[r.status],
          r.snapshotFetchedAt,
        ]
          .map(csvCell)
          .join(";"),
      ),
    ];
    const blob = new Blob(["\uFEFF" + lines.join("\r\n")], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `billingo-ellenorzes-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setNotice(`${problemRows.length} problémás rekord exportálva CSV-be.`);
  }

  const visible = (rows ?? []).filter((r) => (onlyProblems ? r.status !== "ok" : true));
  const allVisibleSelected =
    visible.length > 0 && visible.every((r) => selected.includes(r.orderId));
  const problems = (rows ?? []).filter(
    (r) => r.status === "mismatch" || r.status === "missing_comment",
  ).length;

  return (
    <div className="mt-8 space-y-8">
      <section className="rounded-lg border border-border bg-card p-5">
        <h2 className="text-lg font-semibold text-foreground">Billingo webhook végpont</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Ha be van kapcsolva, a Billingóból érkező értesítéseket a rendszer feldolgozza
          (fizetett állapot és számlaszám átvétele). Kikapcsolva minden hívás
          <span className="font-mono"> 410 Gone</span> választ kap, és semmi nem módosul.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              webhook?.enabled ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
            }`}
          >
            {webhook === null ? "Betöltés…" : webhook.enabled ? "Bekapcsolva" : "Kikapcsolva"}
          </span>
          <button
            type="button"
            onClick={() => void onToggle()}
            disabled={toggling || webhook === null}
            className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
          >
            {webhook?.enabled ? "Kikapcsolom" : "Bekapcsolom"}
          </button>
          <span className="text-xs text-muted-foreground">
            Utolsó módosítás: {hunDate(webhook?.updatedAt ?? null)}
          </span>
        </div>
      </section>

      <section className="rounded-lg border border-border bg-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Stripe azonosítók ↔ Billingo megjegyzések
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Minden rendelésnél összevetve a Stripe fizetési azonosító és a Billingo számla
              megjegyzésmezőjében szereplő rendelésszám.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              <input
                type="checkbox"
                checked={onlyProblems}
                onChange={(e) => setOnlyProblems(e.target.checked)}
                className="h-4 w-4 rounded border-input"
              />
              Csak a problémás sorok
            </label>
            <button
              type="button"
              onClick={() => void onBulkReload()}
              disabled={bulkBusy || selected.length === 0}
              className="rounded-md bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
            >
              {bulkBusy
                ? "Újratöltés folyamatban…"
                : `Kijelöltek újratöltése (${selected.length})`}
            </button>
            <button
              type="button"
              onClick={onExportCsv}
              className="rounded-md border border-input px-3 py-2 text-xs font-semibold text-foreground hover:bg-accent"
            >
              CSV export
            </button>
            <button
              type="button"
              onClick={() => void refresh()}
              className="rounded-md border border-input px-3 py-2 text-xs font-semibold text-foreground hover:bg-accent"
            >
              Újraellenőrzés
            </button>
          </div>
        </div>

        {notice ? (
          <p className="mt-3 rounded-md border border-border bg-muted/40 p-3 text-xs text-foreground">
            {notice}
          </p>
        ) : null}
        {error ? (
          <p className="mt-3 rounded-md border border-destructive/40 bg-destructive/5 p-3 text-xs text-destructive">
            {error}
          </p>
        ) : null}

        {loading ? (
          <p className="mt-4 text-sm text-muted-foreground">Betöltés…</p>
        ) : (
          <>
            <p className="mt-3 text-xs text-muted-foreground">
              {rows?.length ?? 0} rendelés ellenőrizve, ebből {problems} eltérés vagy hiányzó
              megjegyzés.
            </p>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-xs">
                <thead className="text-muted-foreground">
                  <tr className="border-b border-border">
                    <th className="py-2 pr-3 font-semibold">
                      <input
                        type="checkbox"
                        aria-label="Összes látható sor kijelölése"
                        checked={allVisibleSelected}
                        onChange={(e) =>
                          setSelected(
                            e.target.checked
                              ? visible.filter((r) => r.billingoInvoiceId).map((r) => r.orderId)
                              : [],
                          )
                        }
                        className="h-4 w-4 rounded border-input"
                      />
                    </th>
                    <th className="py-2 pr-3 font-semibold">Rendelés</th>
                    <th className="py-2 pr-3 font-semibold">Dátum</th>
                    <th className="py-2 pr-3 font-semibold">Stripe azonosító</th>
                    <th className="py-2 pr-3 font-semibold">Számlaszám</th>
                    <th className="py-2 pr-3 font-semibold">Billingo megjegyzés</th>
                    <th className="py-2 pr-3 font-semibold">Állapot</th>
                    <th className="py-2 font-semibold">Művelet</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((row) => (
                    <tr key={row.orderId} className="border-b border-border/60 align-top">
                      <td className="py-2 pr-3">
                        <input
                          type="checkbox"
                          aria-label={`${row.orderNumber} kijelölése`}
                          disabled={!row.billingoInvoiceId}
                          checked={selected.includes(row.orderId)}
                          onChange={(e) =>
                            setSelected((prev) =>
                              e.target.checked
                                ? [...prev, row.orderId]
                                : prev.filter((id) => id !== row.orderId),
                            )
                          }
                          className="h-4 w-4 rounded border-input"
                        />
                      </td>
                      <td className="py-2 pr-3 font-mono text-foreground">{row.orderNumber}</td>
                      <td className="py-2 pr-3 text-muted-foreground">{hunDate(row.createdAt)}</td>
                      <td className="py-2 pr-3 break-all font-mono text-muted-foreground">
                        {row.paymentReference ?? "–"}
                        <div className="font-sans text-[10px]">
                          {row.paymentProvider ?? "–"} · {row.paymentStatus}
                        </div>
                      </td>
                      <td className="py-2 pr-3 text-muted-foreground">
                        {row.billingoInvoiceNumber ?? "–"}
                        {row.billingoInvoiceId ? (
                          <div className="text-[10px]">#{row.billingoInvoiceId}</div>
                        ) : null}
                      </td>
                      <td className="py-2 pr-3 text-muted-foreground">
                        {row.invoiceComment ?? "–"}
                      </td>
                      <td className="py-2 pr-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                            STATUS_CLASS[row.status]
                          }`}
                        >
                          {STATUS_LABEL[row.status]}
                        </span>
                        {row.snapshotFetchedAt ? (
                          <div className="mt-1 text-[10px] text-muted-foreground">
                            Betöltve: {hunDate(row.snapshotFetchedAt)}
                          </div>
                        ) : null}
                      </td>
                      <td className="py-2">
                        {row.billingoInvoiceId ? (
                          <button
                            type="button"
                            disabled={busy === row.orderId}
                            onClick={() => void onReload(row)}
                            className="rounded-md border border-input px-3 py-1 text-[11px] font-semibold text-foreground hover:bg-accent disabled:opacity-60"
                            title="Számlaadatok újratöltése közvetlenül a Billingo API-ból"
                          >
                            {busy === row.orderId ? "Töltés…" : "Számlaadat újratöltése"}
                          </button>
                        ) : (
                          <span className="text-[10px] text-muted-foreground">–</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {visible.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-4 text-sm text-muted-foreground">
                        Nincs megjeleníthető sor.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
