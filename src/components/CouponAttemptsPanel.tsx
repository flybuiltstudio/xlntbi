import { useServerFn } from "@tanstack/react-start";
import { AlertTriangle, Loader2, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { adminListCouponAttempts } from "@/lib/admin.functions";
import { COUPON_REASON_LABEL } from "@/lib/coupon-reasons";

type Row = Awaited<ReturnType<typeof adminListCouponAttempts>>["rows"][number];

function dateHu(iso: string): string {
  return new Date(iso).toLocaleString("hu-HU", { timeZone: "Europe/Budapest" });
}

/** Every failed coupon attempt with its reason code and the buyer. */
export function CouponAttemptsPanel() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [env, setEnv] = useState<"all" | "live" | "sandbox">("all");
  const [reason, setReason] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [filter, setFilter] = useState("");
  const load = useServerFn(adminListCouponAttempts);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await load();
      setRows(result.rows);
    } catch {
      setError("A sikertelen kuponkísérleteket nem tudtam betölteni.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [load]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const needle = filter.trim().toUpperCase();
  const fromTime = from ? new Date(`${from}T00:00:00`).getTime() : null;
  const toTime = to ? new Date(`${to}T23:59:59`).getTime() : null;

  const visible = rows.filter((r) => {
    if (env !== "all" && r.environment !== env) return false;
    if (reason !== "all" && r.reason !== reason) return false;
    if (needle) {
      const match = [r.code, r.email, r.orderNumber, r.message]
        .filter(Boolean)
        .some((v) => String(v).toUpperCase().includes(needle));
      if (!match) return false;
    }
    const created = new Date(r.createdAt).getTime();
    if (fromTime !== null && created < fromTime) return false;
    if (toTime !== null && created > toTime) return false;
    return true;
  });

  const reasons = [...new Set(rows.map((r) => r.reason))];

  function exportCsv() {
    const header = [
      "Dátum",
      "Környezet",
      "Kuponkód",
      "Hibakód",
      "Hiba",
      "Részletek",
      "Felhasználó (e-mail)",
      "Rendelésszám",
      "Összeg",
    ];
    const lines = visible.map((r) =>
      [
        dateHu(r.createdAt),
        r.environment,
        r.code,
        r.reason,
        r.message,
        r.detail ?? "",
        r.email ?? "",
        r.orderNumber ?? "",
        r.amount ?? "",
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
    a.download = "sikertelen-kuponkiserletek.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="mt-12">
      <h2 className="flex items-center gap-2 text-xl font-bold text-foreground">
        <AlertTriangle className="h-5 w-5 text-destructive" aria-hidden="true" />
        Sikertelen kuponkísérletek
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Minden elutasított kuponkód-ellenőrzés hibakóddal és a vevő e-mail címével (ha már megadta a
        megrendelőlapon).
      </p>

      <div className="mt-4 flex flex-wrap items-end gap-3">
        <label className="text-sm">
          <span className="block text-xs font-medium text-muted-foreground">Környezet</span>
          <select
            value={env}
            onChange={(e) => setEnv(e.target.value as "all" | "live" | "sandbox")}
            className="mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
          >
            <option value="all">Mind</option>
            <option value="live">Éles</option>
            <option value="sandbox">Teszt</option>
          </select>
        </label>
        <label className="text-sm">
          <span className="block text-xs font-medium text-muted-foreground">Hiba típusa</span>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
          >
            <option value="all">Mind</option>
            {reasons.map((r) => (
              <option key={r} value={r}>
                {COUPON_REASON_LABEL[r] ?? r}
              </option>
            ))}
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
            placeholder="Kód, e-mail, rendelésszám"
            className="mt-1 min-w-[14rem] rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
          />
        </label>
        <button
          type="button"
          onClick={() => void refresh()}
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
      </div>

      {error ? (
        <p className="mt-4 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <div className="mt-4 overflow-x-auto rounded-lg border border-border">
        <table className="w-full min-w-[64rem] text-left text-sm">
          <thead className="bg-secondary text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-3 py-2">Dátum</th>
              <th className="px-3 py-2">Kuponkód</th>
              <th className="px-3 py-2">Hiba</th>
              <th className="px-3 py-2">Felhasználó</th>
              <th className="px-3 py-2">Rendelés</th>
              <th className="px-3 py-2">Összeg</th>
              <th className="px-3 py-2">Környezet</th>
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 && !loading ? (
              <tr>
                <td colSpan={7} className="px-3 py-6 text-center text-muted-foreground">
                  Nincs sikertelen kuponkísérlet a szűrésnek megfelelően.
                </td>
              </tr>
            ) : null}
            {visible.map((r) => (
              <tr key={r.id} className="border-t border-border align-top">
                <td className="whitespace-nowrap px-3 py-2 text-muted-foreground">
                  {dateHu(r.createdAt)}
                </td>
                <td className="px-3 py-2 font-semibold text-foreground">{r.code}</td>
                <td className="px-3 py-2">
                  <span className="inline-flex rounded-md bg-destructive/10 px-2 py-0.5 text-xs font-semibold text-destructive">
                    {COUPON_REASON_LABEL[r.reason] ?? r.reason}
                  </span>
                  <span className="mt-1 block text-xs text-muted-foreground">
                    {r.message}
                    {r.detail ? ` ${r.detail}` : ""}
                  </span>
                  <span className="mt-0.5 block text-[11px] uppercase tracking-wide text-muted-foreground">
                    {r.reason}
                  </span>
                </td>
                <td className="px-3 py-2 text-muted-foreground">{r.email ?? "—"}</td>
                <td className="px-3 py-2 text-muted-foreground">{r.orderNumber ?? "—"}</td>
                <td className="whitespace-nowrap px-3 py-2 text-muted-foreground">
                  {typeof r.amount === "number"
                    ? `${r.amount.toLocaleString("hu-HU")} Ft`
                    : "—"}
                </td>
                <td className="px-3 py-2 text-muted-foreground">
                  {r.environment === "live" ? "Éles" : "Teszt"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
