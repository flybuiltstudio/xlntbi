import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import {
  Banknote,
  Download,
  FileCode2,
  FileDown,
  FileSpreadsheet,
  FileText,
  Loader2,
  Package,
  ShoppingCart,
} from "lucide-react";

import { adminOrderStats } from "@/lib/admin.functions";
import { formatPrice } from "@/lib/products";
import { PageHero } from "@/components/PageHero";
import {
  MONTHS,
  MONTHS_SHORT,
  PALETTE,
  exportStatsCsv,
  exportStatsXlsx,
  exportStatsXml,
  exportYearPdf,
  productLabel,
} from "@/lib/stats-export";

export const Route = createFileRoute("/admin/statisztika")({
  head: () => ({
    meta: [
      { title: "Admin – statisztika | EXCELlent Business Intelligence" },
      {
        name: "description",
        content: "Termékstatisztika táblázatban és grafikonon, éves és havi bontásban.",
      },
      { property: "og:title", content: "Admin – statisztika" },
      { property: "og:description", content: "Belső adminisztrációs felület." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminStatsPage,
});

type StatRow = Awaited<ReturnType<typeof adminOrderStats>>["rows"][number];
type PayFilter = "all" | "paid" | "unpaid";
type YearSel = number | "all";
type MonthSel = number | "all";

const PAY_OPTIONS: Array<{ id: PayFilter; label: string }> = [
  { id: "all", label: "Összes" },
  { id: "paid", label: "Rendezett" },
  { id: "unpaid", label: "Fizetésre vár" },
];

function AdminStatsPage() {
  return (
    <>
      <PageHero>
        <h1 className="text-3xl font-bold leading-tight text-primary-foreground md:text-4xl">
          Statisztika
        </h1>
      </PageHero>
      <div className="mx-auto max-w-6xl px-4 py-14">
        <p className="text-sm text-muted-foreground">
          Megrendelt termékek összesítve, szűrhetően fizetési állapot, év és hónap szerint. A
          teszt megrendelések nem szerepelnek a statisztikában.
        </p>
        <StatsPanel />
      </div>
    </>
  );
}

function filterChip(active: boolean) {
  return `rounded-md px-3.5 py-1.5 text-sm font-semibold transition-colors ${
    active
      ? "bg-primary text-primary-foreground"
      : "border border-input text-muted-foreground hover:bg-accent hover:text-foreground"
  }`;
}

function StatsPanel() {
  const load = useServerFn(adminOrderStats);
  const [rows, setRows] = useState<StatRow[] | null>(null);
  const [error, setError] = useState("");
  const [payFilter, setPayFilter] = useState<PayFilter>("all");
  const [yearSel, setYearSel] = useState<YearSel>("all");
  const [monthSel, setMonthSel] = useState<MonthSel>("all");
  const [exporting, setExporting] = useState<string | null>(null);

  useEffect(() => {
    load()
      .then((result) => setRows(result.rows))
      .catch((e) => {
        setError(e instanceof Error ? e.message : "A statisztika betöltése nem sikerült.");
        setRows([]);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const years = useMemo(() => {
    const set = new Set<number>();
    for (const row of rows ?? []) set.add(new Date(row.createdAt).getFullYear());
    return [...set].sort((a, b) => b - a);
  }, [rows]);

  /** Rows filtered by payment status only (basis for charts). */
  const payFiltered = useMemo(() => {
    if (payFilter === "all") return rows ?? [];
    return (rows ?? []).filter((r) =>
      payFilter === "paid" ? r.paymentStatus === "paid" : r.paymentStatus !== "paid",
    );
  }, [rows, payFilter]);

  const activeYear = yearSel === "all" ? null : yearSel;
  const activeMonth = activeYear === null ? "all" : monthSel;

  /** Rows for the KPI cards and the product table (payment + period filter). */
  const periodRows = useMemo(
    () =>
      payFiltered.filter((r) => {
        const date = new Date(r.createdAt);
        if (activeYear !== null && date.getFullYear() !== activeYear) return false;
        if (activeMonth !== "all" && date.getMonth() !== activeMonth) return false;
        return true;
      }),
    [payFiltered, activeYear, activeMonth],
  );

  const kpi = useMemo(
    () =>
      periodRows.reduce(
        (acc, r) => ({
          orders: acc.orders + 1,
          qty: acc.qty + r.quantity,
          revenue: acc.revenue + r.totalPrice,
        }),
        { orders: 0, qty: 0, revenue: 0 },
      ),
    [periodRows],
  );

  const periodLabel =
    activeYear === null
      ? "Összes év"
      : activeMonth === "all"
        ? `${activeYear} egész éve`
        : `${activeYear}. ${MONTHS[activeMonth]}`;

  const products = useMemo(() => {
    const map = new Map<string, { label: string; orders: number; qty: number; revenue: number }>();
    for (const row of periodRows) {
      const label = productLabel(row);
      const entry = map.get(label) ?? { label, orders: 0, qty: 0, revenue: 0 };
      entry.orders += 1;
      entry.qty += row.quantity;
      entry.revenue += row.totalPrice;
      map.set(label, entry);
    }
    return [...map.values()].sort((a, b) => b.qty - a.qty || b.revenue - a.revenue);
  }, [periodRows]);

  /** Monthly buckets for the selected year (payment-filtered, all months shown). */
  const monthly = useMemo(() => {
    const months = Array.from({ length: 12 }, (_, month) => ({
      month,
      orders: 0,
      qty: 0,
      revenue: 0,
      perProduct: new Map<string, number>(),
    }));
    if (activeYear === null) return { months, labels: [] as string[], yearTotals: { orders: 0, qty: 0, revenue: 0 } };
    for (const row of payFiltered) {
      const date = new Date(row.createdAt);
      if (date.getFullYear() !== activeYear) continue;
      const bucket = months[date.getMonth()];
      if (!bucket) continue;
      bucket.orders += 1;
      bucket.qty += row.quantity;
      bucket.revenue += row.totalPrice;
      const label = productLabel(row);
      bucket.perProduct.set(label, (bucket.perProduct.get(label) ?? 0) + row.quantity);
    }
    const labels = [
      ...new Set(months.flatMap((m) => [...m.perProduct.keys()])),
    ].sort();
    const yearTotals = months.reduce(
      (acc, m) => ({
        orders: acc.orders + m.orders,
        qty: acc.qty + m.qty,
        revenue: acc.revenue + m.revenue,
      }),
      { orders: 0, qty: 0, revenue: 0 },
    );
    return { months, labels, yearTotals };
  }, [payFiltered, activeYear]);

  /** Per-year buckets when "Összes év" is selected. */
  const yearly = useMemo(() => {
    const map = new Map<number, { year: number; orders: number; qty: number; revenue: number }>();
    for (const row of payFiltered) {
      const year = new Date(row.createdAt).getFullYear();
      const entry = map.get(year) ?? { year, orders: 0, qty: 0, revenue: 0 };
      entry.orders += 1;
      entry.qty += row.quantity;
      entry.revenue += row.totalPrice;
      map.set(year, entry);
    }
    return [...map.values()].sort((a, b) => a.year - b.year);
  }, [payFiltered]);

  const maxMonthQty = Math.max(1, ...monthly.months.map((m) => m.qty));
  const maxYearQty = Math.max(1, ...yearly.map((y) => y.qty));

  const runExport = async (kind: string, fn: () => Promise<void> | void) => {
    if (!rows || exporting) return;
    setError("");
    setExporting(kind);
    try {
      await fn();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Az exportálás nem sikerült.");
    } finally {
      setExporting(null);
    }
  };

  const exportBtn =
    "inline-flex items-center gap-1.5 rounded-md border border-input bg-background px-3.5 py-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50";

  const selectYear = (y: YearSel) => {
    setYearSel(y);
    if (y === "all") setMonthSel("all");
  };

  return (
    <div className="mt-8">
      {error ? (
        <p className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      {rows === null ? (
        <p className="text-sm text-muted-foreground">Betöltés…</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">Még nincs megrendelés, nincs mit összesíteni.</p>
      ) : (
        <>
          {/* Szűrők */}
          <div className="mb-8 space-y-4 rounded-xl border border-border bg-card px-4 py-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="mr-1 w-32 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Fizetés
              </span>
              {PAY_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  className={filterChip(payFilter === opt.id)}
                  onClick={() => setPayFilter(opt.id)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="mr-1 w-32 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Év
              </span>
              <button
                type="button"
                className={filterChip(yearSel === "all")}
                onClick={() => selectYear("all")}
              >
                Összes év
              </button>
              {years.map((y) => (
                <button
                  key={y}
                  type="button"
                  className={filterChip(yearSel === y)}
                  onClick={() => selectYear(y)}
                >
                  {y}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="mr-1 w-32 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Hónap
              </span>
              <button
                type="button"
                disabled={activeYear === null}
                className={filterChip(activeMonth === "all") + " disabled:cursor-not-allowed disabled:opacity-50"}
                onClick={() => setMonthSel("all")}
              >
                Összes
              </button>
              {MONTHS_SHORT.map((label, i) => (
                <button
                  key={label}
                  type="button"
                  disabled={activeYear === null}
                  className={filterChip(activeMonth === i) + " disabled:cursor-not-allowed disabled:opacity-50"}
                  onClick={() => setMonthSel(i)}
                  title={MONTHS[i]}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* KPI kártyák */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <Banknote className="h-4 w-4 text-primary" />
                Árbevétel
              </div>
              <p className="mt-2 text-2xl font-bold text-foreground">{formatPrice(kpi.revenue)}</p>
              <p className="mt-1 text-xs text-muted-foreground">{periodLabel}</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <Package className="h-4 w-4 text-primary" />
                Megrendelt mennyiség
              </div>
              <p className="mt-2 text-2xl font-bold text-foreground">{kpi.qty} db</p>
              <p className="mt-1 text-xs text-muted-foreground">{periodLabel}</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <ShoppingCart className="h-4 w-4 text-primary" />
                Megrendelések száma
              </div>
              <p className="mt-2 text-2xl font-bold text-foreground">{kpi.orders} db</p>
              <p className="mt-1 text-xs text-muted-foreground">{periodLabel}</p>
            </div>
          </div>

          {periodRows.length === 0 ? (
            <p className="mt-8 rounded-xl border border-border bg-card px-4 py-6 text-sm text-muted-foreground">
              A kiválasztott szűréshez ({periodLabel}
              {payFilter !== "all"
                ? `, ${PAY_OPTIONS.find((o) => o.id === payFilter)?.label.toLowerCase()}`
                : ""}
              ) nem tartozik megrendelés.
            </p>
          ) : (
            <>
              {/* Exportálás */}
              <div className="mt-10 mb-10 flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card px-4 py-3">
                <span className="mr-1 inline-flex items-center gap-1.5 text-sm font-semibold text-foreground">
                  <Download className="h-4 w-4 text-primary" />
                  Exportálás:
                </span>
                <button
                  type="button"
                  className={exportBtn}
                  disabled={exporting !== null}
                  onClick={() => runExport("xlsx", () => exportStatsXlsx(periodRows))}
                >
                  {exporting === "xlsx" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <FileSpreadsheet className="h-4 w-4" />
                  )}
                  Excel (.xlsx)
                </button>
                <button
                  type="button"
                  className={exportBtn}
                  disabled={exporting !== null}
                  onClick={() => runExport("csv", () => exportStatsCsv(periodRows))}
                >
                  <FileText className="h-4 w-4" />
                  CSV
                </button>
                <button
                  type="button"
                  className={exportBtn}
                  disabled={exporting !== null}
                  onClick={() => runExport("xml", () => exportStatsXml(periodRows))}
                >
                  <FileCode2 className="h-4 w-4" />
                  XML
                </button>
                <button
                  type="button"
                  className={exportBtn}
                  disabled={exporting !== null || activeYear === null}
                  title={
                    activeYear === null ? "A PDF exportálásához válassz ki egy évet." : undefined
                  }
                  onClick={() =>
                    activeYear !== null &&
                    runExport("pdf", () => exportYearPdf(payFiltered, activeYear))
                  }
                >
                  {exporting === "pdf" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <FileDown className="h-4 w-4" />
                  )}
                  PDF{activeYear !== null ? ` – ${activeYear}` : ""}
                </button>
                <span className="w-full text-xs text-muted-foreground">
                  Az Excel / CSV / XML a szűrt időszak ({periodLabel}) adatait tartalmazza. A PDF a
                  kiválasztott év táblázatait és a grafikont tartalmazza, egyetlen oldalon – ehhez
                  válassz konkrét évet.
                </span>
              </div>

              {/* Termék-összesítő táblázat, csökkenő sorrendben */}
              <section>
                <h2 className="text-xl font-bold text-foreground">
                  Megrendelt termékek – {periodLabel}
                </h2>
                <div className="mt-4 overflow-x-auto rounded-xl border border-border bg-card">
                  <table className="w-full min-w-[560px] text-sm">
                    <thead>
                      <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                        <th className="px-4 py-3 font-semibold">Termék</th>
                        <th className="px-4 py-3 text-right font-semibold">Megrendelés</th>
                        <th className="px-4 py-3 text-right font-semibold">Mennyiség</th>
                        <th className="px-4 py-3 text-right font-semibold">Árbevétel</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((p) => (
                        <tr key={p.label} className="border-b border-border/60 last:border-0">
                          <td className="px-4 py-3 font-medium text-foreground">{p.label}</td>
                          <td className="px-4 py-3 text-right text-muted-foreground">{p.orders} db</td>
                          <td className="px-4 py-3 text-right font-semibold text-foreground">
                            {p.qty} db
                          </td>
                          <td className="px-4 py-3 text-right text-muted-foreground">
                            {formatPrice(p.revenue)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t border-border bg-muted/50 text-sm font-semibold text-foreground">
                        <td className="px-4 py-3">Összesen</td>
                        <td className="px-4 py-3 text-right">{kpi.orders} db</td>
                        <td className="px-4 py-3 text-right">{kpi.qty} db</td>
                        <td className="px-4 py-3 text-right">{formatPrice(kpi.revenue)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </section>

              {/* Grafikon */}
              <section className="mt-14">
                <h2 className="text-xl font-bold text-foreground">
                  {activeYear !== null ? "Havi bontás grafikonon" : "Éves bontás grafikonon"}
                </h2>

                <div className="mt-6 rounded-xl border border-border bg-card p-5 sm:p-6">
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">
                      {activeYear !== null ? activeYear : "Összes év"}
                    </strong>{" "}
                    – megrendelt mennyiség {activeYear !== null ? "havonta" : "évente"} (db)
                    {payFilter !== "all"
                      ? ` – ${PAY_OPTIONS.find((o) => o.id === payFilter)?.label.toLowerCase()} megrendelések`
                      : ""}
                  </p>

                  {activeYear !== null ? (
                    <div className="mt-6 flex h-60 items-end gap-1 sm:gap-2">
                      {monthly.months.map((m) => (
                        <div
                          key={m.month}
                          className={`flex min-w-0 flex-1 flex-col items-center gap-2 ${
                            activeMonth !== "all" && m.month !== activeMonth ? "opacity-40" : ""
                          }`}
                        >
                          <span className="text-xs font-semibold text-foreground">
                            {m.qty > 0 ? m.qty : ""}
                          </span>
                          <div
                            className={`flex h-44 w-full max-w-12 flex-col justify-end overflow-hidden rounded-t-md ${
                              m.qty > 0 ? "bg-muted/50" : "border-b-2 border-border/60"
                            }`}
                            title={`${MONTHS[m.month]}: ${m.qty} db, ${formatPrice(m.revenue)}`}
                          >
                            {monthly.labels.map((label, li) => {
                              const q = m.perProduct.get(label) ?? 0;
                              if (q === 0) return null;
                              return (
                                <div
                                  key={label}
                                  style={{
                                    height: `${(q / maxMonthQty) * 100}%`,
                                    backgroundColor: PALETTE[li % PALETTE.length],
                                  }}
                                  title={`${label}: ${q} db`}
                                />
                              );
                            })}
                          </div>
                          <span className="text-[11px] text-muted-foreground">
                            {MONTHS_SHORT[m.month]}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-6 flex h-60 items-end gap-2 sm:gap-4">
                      {yearly.map((y) => (
                        <div key={y.year} className="flex min-w-0 flex-1 flex-col items-center gap-2">
                          <span className="text-xs font-semibold text-foreground">
                            {y.qty > 0 ? y.qty : ""}
                          </span>
                          <div
                            className={`flex h-44 w-full max-w-24 flex-col justify-end overflow-hidden rounded-t-md ${
                              y.qty > 0 ? "bg-muted/50" : "border-b-2 border-border/60"
                            }`}
                            title={`${y.year}: ${y.qty} db, ${formatPrice(y.revenue)}`}
                          >
                            {y.qty > 0 ? (
                              <div
                                style={{
                                  height: `${(y.qty / maxYearQty) * 100}%`,
                                  backgroundColor: PALETTE[0],
                                }}
                                title={`${y.year}: ${y.qty} db`}
                              />
                            ) : null}
                          </div>
                          <span className="text-[11px] text-muted-foreground">{y.year}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeYear !== null && monthly.labels.length > 0 ? (
                    <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
                      {monthly.labels.map((label, li) => (
                        <li
                          key={label}
                          className="inline-flex items-center gap-2 text-xs text-muted-foreground"
                        >
                          <span
                            className="h-3 w-3 shrink-0 rounded-sm"
                            style={{ backgroundColor: PALETTE[li % PALETTE.length] }}
                          />
                          {label}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  {activeYear !== null && monthly.labels.length === 0 ? (
                    <p className="mt-5 text-sm text-muted-foreground">
                      Ebben az évben még nincs megrendelés.
                    </p>
                  ) : null}
                </div>

                {/* Havi / éves táblázat */}
                <div className="mt-6 overflow-x-auto rounded-xl border border-border bg-card">
                  {activeYear !== null ? (
                    <table className="w-full min-w-[520px] text-sm">
                      <thead>
                        <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                          <th className="px-4 py-3 font-semibold">{activeYear}</th>
                          <th className="px-4 py-3 text-right font-semibold">Megrendelés</th>
                          <th className="px-4 py-3 text-right font-semibold">Mennyiség</th>
                          <th className="px-4 py-3 text-right font-semibold">Árbevétel</th>
                        </tr>
                      </thead>
                      <tbody>
                        {monthly.months
                          .filter((m) => activeMonth === "all" || m.month === activeMonth)
                          .map((m) => (
                            <tr
                              key={m.month}
                              className={`border-b border-border/60 last:border-0 ${
                                m.qty === 0 ? "text-muted-foreground/60" : ""
                              }`}
                            >
                              <td className="px-4 py-2.5 font-medium text-foreground">
                                {MONTHS[m.month]}
                              </td>
                              <td className="px-4 py-2.5 text-right">{m.orders} db</td>
                              <td className="px-4 py-2.5 text-right">{m.qty} db</td>
                              <td className="px-4 py-2.5 text-right">{formatPrice(m.revenue)}</td>
                            </tr>
                          ))}
                      </tbody>
                      <tfoot>
                        <tr className="border-t border-border bg-muted/50 font-semibold text-foreground">
                          <td className="px-4 py-3">Összesen ({periodLabel})</td>
                          <td className="px-4 py-3 text-right">{kpi.orders} db</td>
                          <td className="px-4 py-3 text-right">{kpi.qty} db</td>
                          <td className="px-4 py-3 text-right">{formatPrice(kpi.revenue)}</td>
                        </tr>
                      </tfoot>
                    </table>
                  ) : (
                    <table className="w-full min-w-[520px] text-sm">
                      <thead>
                        <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                          <th className="px-4 py-3 font-semibold">Év</th>
                          <th className="px-4 py-3 text-right font-semibold">Megrendelés</th>
                          <th className="px-4 py-3 text-right font-semibold">Mennyiség</th>
                          <th className="px-4 py-3 text-right font-semibold">Árbevétel</th>
                        </tr>
                      </thead>
                      <tbody>
                        {yearly.map((y) => (
                          <tr key={y.year} className="border-b border-border/60 last:border-0">
                            <td className="px-4 py-2.5 font-medium text-foreground">{y.year}</td>
                            <td className="px-4 py-2.5 text-right">{y.orders} db</td>
                            <td className="px-4 py-2.5 text-right">{y.qty} db</td>
                            <td className="px-4 py-2.5 text-right">{formatPrice(y.revenue)}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="border-t border-border bg-muted/50 font-semibold text-foreground">
                          <td className="px-4 py-3">Összesen</td>
                          <td className="px-4 py-3 text-right">{kpi.orders} db</td>
                          <td className="px-4 py-3 text-right">{kpi.qty} db</td>
                          <td className="px-4 py-3 text-right">{formatPrice(kpi.revenue)}</td>
                        </tr>
                      </tfoot>
                    </table>
                  )}
                </div>
              </section>
            </>
          )}
        </>
      )}
    </div>
  );
}
