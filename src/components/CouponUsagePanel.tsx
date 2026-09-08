import { useServerFn } from "@tanstack/react-start";
import { Loader2, RefreshCw, TicketPercent } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { adminListCouponUsage } from "@/lib/admin.functions";
import { getStripeEnvironment } from "@/lib/stripe";

type Row = Awaited<ReturnType<typeof adminListCouponUsage>>["rows"][number];
type Env = "sandbox" | "live";

function huf(value: number, currency: string): string {
  return currency === "HUF"
    ? `${Math.round(value).toLocaleString("hu-HU")} Ft`
    : `${value.toLocaleString("hu-HU")} ${currency}`;
}

function dateHu(iso: string): string {
  return new Date(iso).toLocaleString("hu-HU", { timeZone: "Europe/Budapest" });
}

const PAYMENT_LABEL: Record<string, string> = {
  paid: "Kifizetve",
  unpaid: "Nincs kifizetve",
  no_payment_required: "Fizetés nem szükséges",
};

/** Admin view of coupon redemptions: when, how much, which order. */
export function CouponUsagePanel() {
  const [env, setEnv] = useState<Env>(() => getStripeEnvironment());
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [type, setType] = useState<"all" | "percent" | "fixed">("all");
  const load = useServerFn(adminListCouponUsage);

  const refresh = useCallback(
    async (environment: Env) => {
      setLoading(true);
      setError(null);
      try {
        const result = await load({ data: { environment } });
        setRows(result.rows);
        if (result.error) setError(result.error);
      } catch {
        setError("A kupon előzményeket nem tudtam betölteni.");
        setRows([]);
      } finally {
        setLoading(false);
      }
    },
    [load],
  );

  useEffect(() => {
    void refresh(env);
  }, [env, refresh]);

  const needle = filter.trim().toUpperCase();
  const fromTime = from ? new Date(`${from}T00:00:00`).getTime() : null;
  const toTime = to ? new Date(`${to}T23:59:59`).getTime() : null;

  const visible = rows.filter((r) => {
    if (needle) {
      const match = [
        r.code,
        r.orderNumber,
        r.customerEmail,
        r.order?.billingName,
        r.order?.productName,
      ]
        .filter(Boolean)
        .some((v) => String(v).toUpperCase().includes(needle));
      if (!match) return false;
    }
    const created = new Date(r.createdAt).getTime();
    if (fromTime !== null && created < fromTime) return false;
    if (toTime !== null && created > toTime) return false;
    if (type !== "all" && r.discountType !== type) return false;
    return true;
  });

  const totalDiscount = visible.reduce((sum, r) => sum + r.discountAmount, 0);

  function exportCsv() {
    const header = [
      "Dátum",
      "Kuponkód",
      "Kedvezmény szabály",
      "Kedvezmény",
      "Fizetett",
      "Eredeti",
      "Fizetési státusz",
      "Rendelésszám",
      "Termék",
      "Vevő",
      "E-mail",
      "Számlaszám",
    ];
    const lines = visible.map((r) =>
      [
        dateHu(r.createdAt),
        r.code ?? "",
        r.rule ?? "",
        r.discountAmount,
        r.paidAmount,
        r.originalAmount,
        PAYMENT_LABEL[r.paymentStatus] ?? r.paymentStatus,
        r.orderNumber ?? "",
        r.order?.productName ?? "",
        r.order?.billingName ?? "",
        r.customerEmail ?? r.order?.email ?? "",
        r.order?.billingoInvoiceNumber ?? "",
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(";"),
    );
    const blob = new Blob([`\uFEFF${[header.join(";"), ...lines].join("\r\n")}`], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kupon-felhasznalas-${env}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="mt-4">
      <div className="flex flex-wrap items-end gap-3">
        <label className="text-sm">
          <span className="block text-xs font-medium text-muted-foreground">Környezet</span>
          <select
            value={env}
            onChange={(e) => setEnv(e.target.value as Env)}
            className="mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
          >
            <option value="live">Éles</option>
            <option value="sandbox">Teszt</option>
          </select>
        </label>
        <label className="text-sm">
          <span className="block text-xs font-medium text-muted-foreground">Kedvezmény típusa</span>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as "all" | "percent" | "fixed")}
            className="mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
          >
            <option value="all">Mind</option>
            <option value="percent">Százalékos</option>
            <option value="fixed">Fix összeg</option>
          </select>
        </label>
        <label className="text-sm">
          <span className="block text-xs font-medium text-muted-foreground">Ettől</span>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
          />
        </label>
        <label className="text-sm">
          <span className="block text-xs font-medium text-muted-foreground">Eddig</span>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
          />
        </label>
        <label className="text-sm">
          <span className="block text-xs font-medium text-muted-foreground">Keresés</span>
          <input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Kód, rendelésszám, vevő"
            className="mt-1 min-w-[14rem] rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
          />
        </label>
        <button
          type="button"
          onClick={() => void refresh(env)}
          className="inline-flex items-center gap-2 rounded-md border border-input px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
          )}
          Frissítés
        </button>
        <button
          type="button"
          onClick={exportCsv}
          disabled={visible.length === 0}
          className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-brand-dark disabled:opacity-60"
        >
          CSV export
        </button>
        {from || to || type !== "all" || filter ? (
          <button
            type="button"
            onClick={() => {
              setFrom("");
              setTo("");
              setType("all");
              setFilter("");
            }}
            className="inline-flex items-center rounded-md border border-input px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Szűrők törlése
          </button>
        ) : null}
      </div>

      <div className="mt-4 flex flex-wrap gap-4">
        <div className="rounded-lg border border-border bg-card px-4 py-3">
          <p className="text-xs text-muted-foreground">Beváltások száma</p>
          <p className="text-xl font-bold text-foreground">{visible.length}</p>
        </div>
        <div className="rounded-lg border border-border bg-card px-4 py-3">
          <p className="text-xs text-muted-foreground">Összes kedvezmény</p>
          <p className="text-xl font-bold text-foreground">
            {huf(totalDiscount, visible[0]?.currency ?? "HUF")}
          </p>
        </div>
      </div>

      {error ? (
        <p className="mt-4 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <div className="mt-4 overflow-x-auto rounded-lg border border-border">
        <table className="w-full min-w-[70rem] text-left text-sm">
          <thead className="bg-secondary text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-3 py-2">Dátum</th>
              <th className="px-3 py-2">Kuponkód</th>
              <th className="px-3 py-2">Kedvezmény</th>
              <th className="px-3 py-2">Fizetett / eredeti</th>
              <th className="px-3 py-2">Fizetés</th>
              <th className="px-3 py-2">Rendelés</th>
              <th className="px-3 py-2">Vevő</th>
              <th className="px-3 py-2">Számla</th>
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 && !loading ? (
              <tr>
                <td colSpan={8} className="px-3 py-6 text-center text-muted-foreground">
                  Ebben a környezetben még nincs kuponos beváltás.
                </td>
              </tr>
            ) : null}
            {visible.map((r) => (
              <tr key={r.sessionId} className="border-t border-border align-top">
                <td className="whitespace-nowrap px-3 py-2 text-muted-foreground">
                  {dateHu(r.createdAt)}
                </td>
                <td className="px-3 py-2 font-semibold text-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <TicketPercent className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                    {r.code ?? "—"}
                  </span>
                  {r.rule ? (
                    <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
                      {r.rule}
                    </span>
                  ) : null}
                </td>
                <td className="whitespace-nowrap px-3 py-2 font-semibold text-primary">
                  −{huf(r.discountAmount, r.currency)}
                </td>
                <td className="whitespace-nowrap px-3 py-2 text-foreground">
                  {huf(r.paidAmount, r.currency)}
                  <span className="block text-xs text-muted-foreground line-through">
                    {huf(r.originalAmount, r.currency)}
                  </span>
                </td>
                <td className="px-3 py-2 text-muted-foreground">
                  {PAYMENT_LABEL[r.paymentStatus] ?? r.paymentStatus}
                </td>
                <td className="px-3 py-2">
                  <span className="font-medium text-foreground">{r.orderNumber ?? "—"}</span>
                  {r.order ? (
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      {r.order.productName} · {r.order.status} / {r.order.paymentStatus}
                    </span>
                  ) : r.orderNumber ? (
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      Nincs hozzá rendelés az adatbázisban.
                    </span>
                  ) : null}
                </td>
                <td className="px-3 py-2 text-muted-foreground">
                  {r.order?.billingName ?? "—"}
                  <span className="mt-0.5 block text-xs">
                    {r.customerEmail ?? r.order?.email ?? ""}
                  </span>
                </td>
                <td className="px-3 py-2 text-muted-foreground">
                  {r.order?.billingoInvoiceNumber ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
