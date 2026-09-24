import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  Banknote,
  ChevronDown,
  Download,
  FileCode2,
  FileDown,
  FileSpreadsheet,
  FileText,
  Loader2,
  Package,
  ShoppingCart,
  Users,
} from "lucide-react";

import { adminOrderStats, adminPageViewStats, adminDemoStats } from "@/lib/admin.functions";
import { formatPrice, products, resolveProductSlug } from "@/lib/products";
import { serviceItems } from "@/lib/services";
import { PageHero } from "@/components/PageHero";
import { useAdminSession } from "@/components/admin-panels";
import { AdminSectionNav, BackToTop } from "@/components/admin-toc";
import { TableExportButtons } from "@/components/TableExportButtons";
import { Button } from "@/components/ui/button";

const STATS_NAV_LEFT = [
  ["megrendelt-termekek", "Megrendelt termékek"],
  ["havi-bontas", "Havi bontás"],
  ["termek-konverzio", "Termékenkénti konverziós arány"],
  ["megrendelesek-orankent", "Megrendelések óránként"],
  ["megrendeloi-lista", "Megrendelői és terméklista"],
  ["demo-letoltesek", "DEMO letöltések"],
] as const;

const STATS_NAV_RIGHT = [
  ["termek-oldalletoltesek", "Termék Részletek oldalak letöltései"],
  ["szolgaltatas-oldalletoltesek", "Szolgáltatás aloldalak letöltései"],
] as const;
import {
  MONTHS,
  MONTHS_SHORT,
  exportStatsCsv,
  exportStatsXlsx,
  exportStatsXml,
  exportTableCsv,
  exportTablePdf,
  exportTableXlsx,
  exportTableXml,
  exportYearPdf,
  formatDateHu,
  paymentLabel,
  productLabel,
  slugify,
  pivotPageViews,
  type ListTable,
  type PageViewCount,
  type PageViewPivotRow,
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
type TopMetric = "revenue" | "quantity";
type DemoTopMetric = "downloads" | "requests";

const PAY_OPTIONS: Array<{ id: PayFilter; label: string }> = [
  { id: "all", label: "Összes" },
  { id: "paid", label: "Rendezett" },
  { id: "unpaid", label: "Fizetésre vár" },
];

function AdminStatsPage() {
  const { role } = useAdminSession();
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
          teszt megrendelések (TESZT- előtag) alapból nem szerepelnek a statisztikában és az
          exportokban
          {role === "admin" ? " – a lenti kapcsolóval jeleníthetők meg." : "."}
        </p>
        <AdminSectionNav columns={[STATS_NAV_LEFT, STATS_NAV_RIGHT]} />
        <MeasurementLegend />
        <StatsPanel />
      </div>
    </>
  );
}

/** Rövid magyarázat arról, hogy pontosan mit számol a mérés. */
function MeasurementLegend() {
  return (
    <div className="mt-6 rounded-xl border border-border bg-muted/40 p-5">
      <h2 className="text-base font-bold text-foreground">Mit mutatnak ezek a számok?</h2>
      <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
        <li>
          <strong className="text-foreground">Megrendelési adatok:</strong> a beérkezett
          megrendelések tételei – egy megrendelés annyi darabbal számít, amennyit a vevő rendelt. A
          TESZT- előtagú rendelések alapból ki vannak szűrve.
        </li>
        <li>
          <strong className="text-foreground">Oldalletöltés:</strong> egy termék Részletek oldalának
          vagy egy szolgáltatás-aloldalnak a megnyitása. Az oldal újratöltése (F5) és az oda
          visszatérés új letöltésnek számít; ez nem egyedi látogatószám.
        </li>
        <li>
          <strong className="text-foreground">Csak a publikált nézet számít:</strong> az
          xlntbi.hu és a publikált cím megnyitásai kerülnek bele. A szerkesztői előnézet, a helyi
          fejlesztés és a felismert robotok nem.
        </li>
        <li>
          <strong className="text-foreground">Szolgáltatás-aloldal azonosítása:</strong> az aloldal
          útvonala alapján (például /konyveles), tehát a Szolgáltatásaim gyűjtőoldal megnyitása nem
          számít bele egyik aloldalnál sem.
        </li>
        <li>
          <strong className="text-foreground">Miért nulla egy sor?</strong> Minden termék és
          szolgáltatás szerepel a listában, akkor is, ha nincs adata. Nulla akkor látszik, ha az
          adott hónapban nem nyitották meg az oldalt, vagy ha a mérés indulása előtti hónapot néz –
          a korábbi hónapokra visszamenőleg nincs adat. Személyes adatot (IP-cím, böngésző, süti)
          nem tárolunk, csak havi darabszámot.
        </li>
      </ul>
    </div>
  );
}

const CONNECTED_FILTER_NOTE =
  "Ez az év- és hónapszűrő a Megrendelt termékek, Havi bontás, Termékenkénti konverziós arány, Megrendelések óránként, DEMO letöltések és mindkét oldalletöltési blokk adatait együtt frissíti.";

const DISTINCT_CHART_COLORS = [
  "var(--chart-1)", "var(--chart-4)", "var(--chart-3)", "var(--chart-6)", "var(--chart-7)",
  "var(--chart-2)", "var(--chart-8)", "var(--chart-9)", "var(--chart-10)", "var(--chart-5)",
];

function PeriodFilters({
  years,
  year,
  month,
  onYearChange,
  onMonthChange,
  payFilter,
  onPayFilterChange,
}: {
  years: number[];
  year: YearSel;
  month: MonthSel;
  onYearChange: (value: YearSel) => void;
  onMonthChange: (value: MonthSel) => void;
  payFilter?: PayFilter;
  onPayFilterChange?: (value: PayFilter) => void;
}) {
  // Keep this filter panel at the same screen position when shared filters
  // resize other blocks above it (otherwise the page jumps away).
  const rootRef = useRef<HTMLDivElement>(null);
  const anchorTop = useRef<number | null>(null);
  const keep = <T,>(fn: (v: T) => void) => (v: T) => {
    anchorTop.current = rootRef.current?.getBoundingClientRect().top ?? null;
    fn(v);
  };
  useLayoutEffect(() => {
    if (anchorTop.current === null || !rootRef.current) return;
    const delta = rootRef.current.getBoundingClientRect().top - anchorTop.current;
    anchorTop.current = null;
    if (Math.abs(delta) > 1) window.scrollBy({ top: delta, behavior: "instant" as ScrollBehavior });
  });
  onYearChange = keep(onYearChange);
  onMonthChange = keep(onMonthChange);
  if (onPayFilterChange) onPayFilterChange = keep(onPayFilterChange);
  return (
    <div ref={rootRef} className="mt-4 space-y-4 rounded-xl border border-border bg-card px-4 py-4">
      <p className="text-sm text-muted-foreground">{CONNECTED_FILTER_NOTE}</p>
      {payFilter && onPayFilterChange ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 w-32 text-xs font-semibold uppercase text-muted-foreground">Fizetés</span>
          {PAY_OPTIONS.map((option) => (
            <Button key={option.id} type="button" size="sm" variant={payFilter === option.id ? "default" : "outline"} onClick={() => onPayFilterChange(option.id)}>
              {option.label}
            </Button>
          ))}
          <span className="w-full text-xs text-muted-foreground">Csak a Megrendelt termékek és a Havi bontás blokkra hat.</span>
        </div>
      ) : null}
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 w-32 text-xs font-semibold uppercase text-muted-foreground">Év</span>
        <Button type="button" size="sm" variant={year === "all" ? "default" : "outline"} onClick={() => onYearChange("all")}>Összes év</Button>
        {years.map((value) => (
          <Button key={value} type="button" size="sm" variant={year === value ? "default" : "outline"} onClick={() => onYearChange(value)}>{value}</Button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 w-32 text-xs font-semibold uppercase text-muted-foreground">Hónap</span>
        <Button type="button" size="sm" variant={month === "all" ? "default" : "outline"} onClick={() => onMonthChange("all")}>Összes</Button>
        {MONTHS_SHORT.map((label, index) => (
          <Button key={label} type="button" size="sm" variant={month === index ? "default" : "outline"} onClick={() => onMonthChange(index)} title={MONTHS[index]}>{label}</Button>
        ))}
      </div>
    </div>
  );
}

function TopMetricSelector({ value, onChange }: { value: TopMetric; onChange: (value: TopMetric) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button type="button" size="sm" variant={value === "revenue" ? "default" : "outline"} onClick={() => onChange("revenue")}>Árbevétel</Button>
      <Button type="button" size="sm" variant={value === "quantity" ? "default" : "outline"} onClick={() => onChange("quantity")}>Mennyiség</Button>
    </div>
  );
}

function ProductTopFive({ items, metric, onMetricChange }: { items: Array<{ label: string; qty: number; revenue: number }>; metric: TopMetric; onMetricChange: (value: TopMetric) => void }) {
  const ranked = [...items].sort((a, b) => metric === "revenue" ? b.revenue - a.revenue : b.qty - a.qty).slice(0, 5);
  const max = Math.max(1, ...ranked.map((item) => metric === "revenue" ? item.revenue : item.qty));
  return (
    <div className="mt-6 rounded-xl border border-border bg-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-base font-bold text-foreground">Top 5 termék</h3>
        <TopMetricSelector value={metric} onChange={onMetricChange} />
      </div>
      {ranked.length === 0 ? <p className="mt-4 text-sm text-muted-foreground">A kiválasztott időszakhoz nincs rangsorolható adat.</p> : (
        <ol className="mt-4 space-y-3">{ranked.map((item, index) => {
          const value = metric === "revenue" ? item.revenue : item.qty;
          return <li key={item.label} className="grid grid-cols-[2rem_minmax(0,14rem)_1fr_auto] items-center gap-3 text-sm"><span className="font-bold">{index + 1}.</span><span className="truncate font-medium" title={item.label}>{item.label}</span><div className="h-3 overflow-hidden rounded bg-muted"><div className="h-full rounded bg-primary" style={{ width: `${(value / max) * 100}%` }} /></div><span className="font-semibold">{metric === "revenue" ? formatPrice(value) : `${value} db`}</span></li>;
        })}</ol>
      )}
    </div>
  );
}

function StatsPanel() {
  const { role } = useAdminSession();
  const load = useServerFn(adminOrderStats);
  const [rows, setRows] = useState<StatRow[] | null>(null);
  const [error, setError] = useState("");
  const [includeTests, setIncludeTests] = useState(false);
  const [payFilter, setPayFilter] = useState<PayFilter>("all");
  const [yearSel, setYearSel] = useState<YearSel>("all");
  const [monthSel, setMonthSel] = useState<MonthSel>("all");
  const [productTopMetric, setProductTopMetric] = useState<TopMetric>("revenue");
  const [monthlyTopMetric, setMonthlyTopMetric] = useState<TopMetric>("revenue");
  const [exporting, setExporting] = useState<string | null>(null);

  useEffect(() => {
    setRows(null);
    load({ data: { includeTests } })
      .then((result) => setRows(result.rows))
      .catch((e) => {
        setError(e instanceof Error ? e.message : "A statisztika betöltése nem sikerült.");
        setRows([]);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [includeTests]);

  const years = useMemo(() => {
    const set = new Set<number>([new Date().getFullYear()]);
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
  const activeMonth = monthSel;

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
  const sharedPeriodRows = useMemo(
    () =>
      (rows ?? []).filter((row) => {
        const date = new Date(row.createdAt);
        return (yearSel === "all" || date.getFullYear() === yearSel) && (monthSel === "all" || date.getMonth() === monthSel);
      }),
    [rows, yearSel, monthSel],
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
      ? activeMonth === "all"
        ? "Összes év"
        : `Összes év – ${MONTHS[activeMonth]}`
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

  /** Monthly buckets for the shared period (all years can be merged month by month). */
  const monthly = useMemo(() => {
    const months = Array.from({ length: 12 }, (_, month) => ({
      month,
      orders: 0,
      qty: 0,
      revenue: 0,
      perProduct: new Map<string, number>(),
    }));
    for (const row of payFiltered) {
      const date = new Date(row.createdAt);
      if (yearSel !== "all" && date.getFullYear() !== yearSel) continue;
      if (monthSel !== "all" && date.getMonth() !== monthSel) continue;
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
  }, [payFiltered, yearSel, monthSel]);

  const maxMonthQty = Math.max(1, ...monthly.months.map((m) => m.qty));


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

  const monthlyTable: ListTable = {
    title: `Havi bontás – ${periodLabel}`,
    head: ["Hónap", "Megrendelés (db)", "Mennyiség (db)", "Árbevétel (Ft)"],
    body: monthly.months.filter((item) => monthSel === "all" || item.month === monthSel).map((item) => [MONTHS[item.month] ?? "", item.orders, item.qty, item.revenue]),
    foot: ["Összesen", monthly.yearTotals.orders, monthly.yearTotals.qty, monthly.yearTotals.revenue],
    rightCols: [1, 2, 3],
  };

  return (
    <div className="mt-8">
      {error ? (
        <p className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      {/* Teszt megrendelések mutatása – csak admin szerepkörrel kapcsolható */}
      {role === "admin" ? (
        <label className="mb-6 flex w-fit cursor-pointer items-center gap-2.5 rounded-xl border border-dashed border-border bg-muted/40 px-4 py-2.5 text-sm font-medium text-foreground">
          <input
            type="checkbox"
            checked={includeTests}
            onChange={(e) => setIncludeTests(e.target.checked)}
            className="h-4 w-4 accent-primary"
          />
          TESZT-rendelések mutatása a Megrendelt termékek, Havi bontás, konverzió, óránkénti és megrendelői riportokban
        </label>
      ) : null}

      {rows === null ? (
        <p className="text-sm text-muted-foreground">Betöltés…</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {includeTests
            ? "Még nincs megrendelés, nincs mit összesíteni."
            : "Még nincs éles megrendelés. A teszt megrendelések rejtve vannak – kapcsold be fent a mutatásukat, ha szükséges."}
        </p>
      ) : (
        <>
          <section id="megrendelt-termekek" className="scroll-mt-36">
            <h2 className="text-xl font-bold text-foreground">Megrendelt termékek – {periodLabel}</h2>

            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <Banknote className="h-4 w-4 text-primary" /> Árbevétel
                </div>
                <p className="mt-2 text-2xl font-bold text-foreground">{formatPrice(kpi.revenue)}</p>
                <p className="mt-1 text-xs text-muted-foreground">{periodLabel}</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <Package className="h-4 w-4 text-primary" /> Megrendelt mennyiség
                </div>
                <p className="mt-2 text-2xl font-bold text-foreground">{kpi.qty} db</p>
                <p className="mt-1 text-xs text-muted-foreground">{periodLabel}</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <ShoppingCart className="h-4 w-4 text-primary" /> Megrendelések száma
                </div>
                <p className="mt-2 text-2xl font-bold text-foreground">{kpi.orders} db</p>
                <p className="mt-1 text-xs text-muted-foreground">{periodLabel}</p>
              </div>
            </div>

            <PeriodFilters years={years} year={yearSel} month={monthSel} onYearChange={setYearSel} onMonthChange={setMonthSel} payFilter={payFilter} onPayFilterChange={setPayFilter} />
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3"><h3 className="text-base font-bold text-foreground">Top 5 beállítása</h3><TopMetricSelector value={productTopMetric} onChange={setProductTopMetric} /></div>
            <ProductTopFive items={products} metric={productTopMetric} />

            {periodRows.length === 0 ? (
              <p className="mt-6 rounded-xl border border-border bg-card px-4 py-6 text-sm text-muted-foreground">A kiválasztott szűréshez ({periodLabel}) nem tartozik megrendelés.</p>
            ) : (
              <>
                <div className="mt-6 mb-6 flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card px-4 py-3">
                  <span className="mr-1 inline-flex items-center gap-1.5 text-sm font-semibold text-foreground"><Download className="h-4 w-4 text-primary" /> Exportálás:</span>
                  <Button type="button" variant="outline" size="sm" disabled={exporting !== null} onClick={() => runExport("xlsx", () => exportStatsXlsx(periodRows))}>{exporting === "xlsx" ? <Loader2 className="animate-spin" /> : <FileSpreadsheet />} Excel</Button>
                  <Button type="button" variant="outline" size="sm" disabled={exporting !== null} onClick={() => runExport("csv", () => exportStatsCsv(periodRows))}><FileText /> CSV</Button>
                  <Button type="button" variant="outline" size="sm" disabled={exporting !== null} onClick={() => runExport("xml", () => exportStatsXml(periodRows))}><FileCode2 /> XML</Button>
                  <Button type="button" variant="outline" size="sm" disabled={exporting !== null || activeYear === null} title={activeYear === null ? "A PDF exportálásához válassz ki egy évet." : undefined} onClick={() => activeYear !== null && runExport("pdf", () => exportYearPdf(payFiltered, activeYear))}>{exporting === "pdf" ? <Loader2 className="animate-spin" /> : <FileDown />} PDF</Button>
                  <span className="w-full text-xs text-muted-foreground">Az Excel / CSV / XML a szűrt időszak ({periodLabel}) adatait tartalmazza. A PDF-hez válassz konkrét évet.</span>
                </div>
                <div className="overflow-x-auto rounded-xl border border-border bg-card">
                  <table className="w-full min-w-[560px] text-sm">
                    <thead><tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground"><th className="px-4 py-3 font-semibold">Termék</th><th className="px-4 py-3 text-right font-semibold">Megrendelés</th><th className="px-4 py-3 text-right font-semibold">Mennyiség</th><th className="px-4 py-3 text-right font-semibold">Árbevétel</th></tr></thead>
                    <tbody>{products.map((p) => <tr key={p.label} className="border-b border-border/60 last:border-0"><td className="px-4 py-3 font-medium text-foreground">{p.label}</td><td className="px-4 py-3 text-right text-muted-foreground">{p.orders} db</td><td className="px-4 py-3 text-right font-semibold text-foreground">{p.qty} db</td><td className="px-4 py-3 text-right text-muted-foreground">{formatPrice(p.revenue)}</td></tr>)}</tbody>
                    <tfoot><tr className="border-t border-border bg-muted/50 text-sm font-semibold text-foreground"><td className="px-4 py-3">Összesen</td><td className="px-4 py-3 text-right">{kpi.orders} db</td><td className="px-4 py-3 text-right">{kpi.qty} db</td><td className="px-4 py-3 text-right">{formatPrice(kpi.revenue)}</td></tr></tfoot>
                  </table>
                </div>
              </>
            )}
            <BackToTop />
          </section>

          <section id="havi-bontas" className="mt-14 scroll-mt-36">
            <h2 className="text-xl font-bold text-foreground">Havi bontás</h2>
            <PeriodFilters years={years} year={yearSel} month={monthSel} onYearChange={setYearSel} onMonthChange={setMonthSel} payFilter={payFilter} onPayFilterChange={setPayFilter} />
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3"><h3 className="text-base font-bold text-foreground">Top 5 beállítása</h3><TopMetricSelector value={monthlyTopMetric} onChange={setMonthlyTopMetric} /></div>
            <ProductTopFive items={products} metric={monthlyTopMetric} />
                <div className="mt-6 rounded-xl border border-border bg-card p-5 sm:p-6">
                  <p className="text-sm text-muted-foreground"><strong className="text-foreground">{periodLabel}</strong> – megrendelt mennyiség havonta (db)</p>
                  <div className="mt-6 flex h-60 items-end gap-1 sm:gap-2">
                    {monthly.months.map((m) => <div key={m.month} className={`flex min-w-0 flex-1 flex-col items-center gap-2 ${monthSel !== "all" && m.month !== monthSel ? "opacity-25" : ""}`}><span className="text-xs font-semibold text-foreground">{m.qty > 0 ? m.qty : ""}</span><div className={`flex h-44 w-full max-w-12 flex-col justify-end overflow-hidden rounded-t-md ${m.qty > 0 ? "bg-muted/50" : "border-b-2 border-border/60"}`} title={`${MONTHS[m.month]}: ${m.qty} db, ${formatPrice(m.revenue)}`}>{monthly.labels.map((label, li) => { const q = m.perProduct.get(label) ?? 0; return q === 0 ? null : <div key={label} style={{ height: `${(q / maxMonthQty) * 100}%`, backgroundColor: DISTINCT_CHART_COLORS[li % DISTINCT_CHART_COLORS.length] }} title={`${label}: ${q} db`} />; })}</div><span className="text-xs text-muted-foreground">{MONTHS_SHORT[m.month]}</span></div>)}
                  </div>
                  {monthly.labels.length > 0 ? <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2">{monthly.labels.map((label, li) => <li key={label} className="inline-flex items-center gap-2 text-sm text-muted-foreground"><span className="h-3 w-3 shrink-0 rounded-sm" style={{ backgroundColor: DISTINCT_CHART_COLORS[li % DISTINCT_CHART_COLORS.length] }} />{label}</li>)}</ul> : <p className="mt-5 text-sm text-muted-foreground">Ebben az időszakban még nincs megrendelés.</p>}
                </div>
                <div className="mt-6"><TableExportButtons baseName={`xlntbi-havi-bontas-${slugify(periodLabel)}`} sheetName="Havi bontás" table={monthlyTable} /></div>
                <div className="mt-4 overflow-x-auto rounded-xl border border-border bg-card"><table className="w-full min-w-[520px] text-sm"><thead><tr className="border-b border-border text-left text-xs uppercase text-muted-foreground"><th className="px-4 py-3 font-semibold">Hónap</th><th className="px-4 py-3 text-right font-semibold">Megrendelés</th><th className="px-4 py-3 text-right font-semibold">Mennyiség</th><th className="px-4 py-3 text-right font-semibold">Árbevétel</th></tr></thead><tbody>{monthly.months.filter((m) => monthSel === "all" || m.month === monthSel).map((m) => <tr key={m.month} className={`border-b border-border/60 last:border-0 ${m.qty === 0 ? "text-muted-foreground/60" : ""}`}><td className="px-4 py-2.5 font-medium text-foreground">{MONTHS[m.month]}</td><td className="px-4 py-2.5 text-right">{m.orders} db</td><td className="px-4 py-2.5 text-right">{m.qty} db</td><td className="px-4 py-2.5 text-right">{formatPrice(m.revenue)}</td></tr>)}</tbody></table></div>
            <BackToTop />
          </section>

          <ProductConversion rows={rows} yearSel={yearSel} monthSel={monthSel} years={years} onYearChange={setYearSel} onMonthChange={setMonthSel} />
          <HourlyOrdersChart rows={rows} yearSel={yearSel} monthSel={monthSel} years={years} onYearChange={setYearSel} onMonthChange={setMonthSel} />
          <CustomerProductLists rows={sharedPeriodRows} />
          <DemoDownloads yearSel={yearSel} monthSel={monthSel} years={years} onYearChange={setYearSel} onMonthChange={setMonthSel} />
          <PageViewStats yearSel={yearSel} monthSel={monthSel} years={years} onYearChange={setYearSel} onMonthChange={setMonthSel} />
        </>
      )}
    </div>
  );
}

const listSelectBtn =
  "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 text-sm text-foreground transition-colors hover:bg-accent hover:text-foreground";

const listCheckboxCls = "h-4 w-4 shrink-0 accent-primary";

function sumListQty(list: StatRow[]) {
  return list.reduce((a, r) => a + r.quantity, 0);
}
function sumListRevenue(list: StatRow[]) {
  return list.reduce((a, r) => a + r.totalPrice, 0);
}

/** Több elem (vagy az összes) kiválasztását engedélyező legördülő. Üres set = összes. */
function MultiSelect({
  items,
  selected,
  onToggle,
  onToggleAll,
  buttonLabel,
}: {
  items: { key: string; label: string }[];
  selected: Set<string> | null;
  onToggle: (key: string) => void;
  onToggleAll: () => void;
  buttonLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const isAll = selected === null;

  return (
    <div ref={ref} className="relative mt-3">
      <Button
        type="button"
        variant="outline"
        className={listSelectBtn}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="truncate">{buttonLabel}</span>
        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
      </Button>
      {open ? (
        <div className="absolute z-30 mt-1 max-h-80 w-full overflow-auto rounded-md border border-input bg-background shadow-lg">
          <label className="flex cursor-pointer items-center gap-2 border-b border-border px-3 py-2 text-sm font-semibold text-foreground">
            <input
              type="checkbox"
              checked={isAll}
              onChange={onToggleAll}
              className={listCheckboxCls}
            />
            Összes
          </label>
          {items.map((item) => (
            <label
              key={item.key}
              className="flex cursor-pointer items-center gap-2 px-3 py-1.5 text-sm text-foreground hover:bg-accent/50"
            >
              <input
                type="checkbox"
                checked={isAll || selected.has(item.key)}
                onChange={() => onToggle(item.key)}
                className={listCheckboxCls}
              />
              <span className="truncate">{item.label}</span>
            </label>
          ))}
        </div>
      ) : null}
    </div>
  );
}

/** Megrendelőnkénti és termékenkénti, a kezdetektől számított listák 4 formátumú exporttal. */
function CustomerProductLists({ rows }: { rows: StatRow[] }) {
  // null = összes, üres halmaz = egyik sem.
  const [customerSel, setCustomerSel] = useState<Set<string> | null>(null);
  const [productSel, setProductSel] = useState<Set<string> | null>(null);
  const [exporting, setExporting] = useState<string | null>(null);
  const [error, setError] = useState("");

  const customers = useMemo(() => {
    const map = new Map<string, { email: string; name: string }>();
    for (const r of rows) {
      const key = (r.email ?? "").trim().toLowerCase();
      if (!key) continue;
      // A sorok dátum szerint növekvők – a felülírás a legfrissebb nevet tartja meg.
      map.set(key, { email: r.email ?? "", name: r.billingName || r.email || "" });
    }
    return [...map.values()].sort((a, b) => a.name.localeCompare(b.name, "hu"));
  }, [rows]);

  const productLabels = useMemo(
    () => [...new Set(rows.map((r) => productLabel(r)))].sort((a, b) => a.localeCompare(b, "hu")),
    [rows],
  );

  const isAllCustomers = customerSel === null;
  const isAllProducts = productSel === null;

  const selectedCustomerEmails = useMemo(() => {
    if (isAllCustomers) return new Set(customers.map((c) => c.email.trim().toLowerCase()));
    return new Set(
      customers
        .filter((c) => customerSel?.has(c.email))
        .map((c) => c.email.trim().toLowerCase()),
    );
  }, [customers, customerSel, isAllCustomers]);

  const selectedProductSet = useMemo(() => {
    if (isAllProducts) return new Set(productLabels);
    return new Set(productLabels.filter((l) => productSel?.has(l)));
  }, [productLabels, productSel, isAllProducts]);

  const toggleCustomer = (email: string) => {
    setCustomerSel((prev) => {
      // Ha épp "összes" módban vagyunk, indítsuk mindenki más kijelölésével.
      if (prev === null) {
        const next = new Set(customers.map((c) => c.email));
        next.delete(email);
        return next;
      }
      const next = new Set(prev);
      if (next.has(email)) next.delete(email);
      else next.add(email);
      // Ha mind be van jelölve, térjünk vissza "összes" (üres set) módba.
      if (next.size === customers.length) return null;
      return next;
    });
  };

  const toggleAllCustomers = () => setCustomerSel((prev) => (prev === null ? new Set() : null));

  const toggleProduct = (label: string) => {
    setProductSel((prev) => {
      if (prev === null) {
        const next = new Set(productLabels);
        next.delete(label);
        return next;
      }
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      if (next.size === productLabels.length) return null;
      return next;
    });
  };

  const toggleAllProducts = () => setProductSel((prev) => (prev === null ? new Set() : null));

  const customerRows = useMemo(
    () => rows.filter((r) => selectedCustomerEmails.has((r.email ?? "").trim().toLowerCase())),
    [rows, selectedCustomerEmails],
  );

  const productRows = useMemo(
    () => rows.filter((r) => selectedProductSet.has(productLabel(r))),
    [rows, selectedProductSet],
  );

  const customerTitle = isAllCustomers
    ? "Megrendelői lista – Összes megrendelő"
    : customerSel?.size === 1
      ? `Megrendelői lista – ${customers.find((c) => customerSel.has(c.email))?.name ?? ""}`
      : `Megrendelői lista – ${customerSel?.size ?? 0} megrendelő`;

  const productTitle = isAllProducts
    ? "Termék megrendelői – Összes termék"
    : productSel?.size === 1
      ? `Termék megrendelői – ${productSel.values().next().value ?? ""}`
      : `Termék megrendelői – ${productSel?.size ?? 0} termék`;

  const customerTable: ListTable | null = customerRows.length
    ? {
        title: customerTitle,
        head: ["Dátum", "Rendelésszám", "Termék", "Mennyiség (db)", "Összeg (Ft)", "Fizetés"],
        body: customerRows.map((r) => [
          formatDateHu(r.createdAt),
          r.orderNumber ?? "",
          productLabel(r),
          r.quantity,
          r.totalPrice,
          paymentLabel(r.paymentStatus),
        ]),
        foot: [
          "Összesen",
          "",
          `${customerRows.length} megrendelés`,
          sumListQty(customerRows),
          sumListRevenue(customerRows),
          "",
        ],
        rightCols: [3, 4],
      }
    : null;

  const productTable: ListTable | null = productRows.length
    ? {
        title: productTitle,
        head: [
          "Dátum",
          "Rendelésszám",
          "Megrendelő",
          "E-mail",
          "Mennyiség (db)",
          "Összeg (Ft)",
          "Fizetés",
        ],
        body: productRows.map((r) => [
          formatDateHu(r.createdAt),
          r.orderNumber ?? "",
          r.billingName ?? "",
          r.email ?? "",
          r.quantity,
          r.totalPrice,
          paymentLabel(r.paymentStatus),
        ]),
        foot: [
          "Összesen",
          "",
          "",
          `${productRows.length} megrendelés`,
          sumListQty(productRows),
          sumListRevenue(productRows),
          "",
        ],
        rightCols: [4, 5],
      }
    : null;

  const runListExport = async (kind: string, base: string, table: ListTable | null) => {
    if (!table || exporting) return;
    setError("");
    setExporting(kind);
    try {
      if (kind.endsWith("csv")) exportTableCsv(`${base}.csv`, table);
      else if (kind.endsWith("xml")) exportTableXml(`${base}.xml`, table);
      else if (kind.endsWith("xlsx")) await exportTableXlsx(`${base}.xlsx`, table.title, table);
      else await exportTablePdf(`${base}.pdf`, table);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Az exportálás nem sikerült.");
    } finally {
      setExporting(null);
    }
  };

  const exportButtons = (prefix: string, base: string, table: ListTable | null) => (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground">
        <Download className="h-3.5 w-3.5 text-primary" />
        Exportálás:
      </span>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={!table || exporting !== null}
        onClick={() => runListExport(`${prefix}-xlsx`, base, table)}
      >
        {exporting === `${prefix}-xlsx` ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <FileSpreadsheet className="h-3.5 w-3.5" />
        )}
        Excel
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={!table || exporting !== null}
        onClick={() => runListExport(`${prefix}-csv`, base, table)}
      >
        <FileText className="h-3.5 w-3.5" />
        CSV
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={!table || exporting !== null}
        onClick={() => runListExport(`${prefix}-xml`, base, table)}
      >
        <FileCode2 className="h-3.5 w-3.5" />
        XML
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={!table || exporting !== null}
        onClick={() => runListExport(`${prefix}-pdf`, base, table)}
      >
        {exporting === `${prefix}-pdf` ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <FileDown className="h-3.5 w-3.5" />
        )}
        PDF
      </Button>
    </div>
  );

  const customerButtonLabel = isAllCustomers
    ? "Összes megrendelő"
    : customerSel?.size === 1
      ? customers.find((c) => customerSel.has(c.email))?.name ?? "1 megrendelő"
      : `${customerSel?.size ?? 0} megrendelő kiválasztva`;

  const productButtonLabel = isAllProducts
    ? "Összes termék"
    : productSel?.size === 1
      ? (productSel.values().next().value ?? "1 termék")
      : `${productSel?.size ?? 0} termék kiválasztva`;

  return (
    <section className="mt-14">
      <h2 id="megrendeloi-lista" className="scroll-mt-36 text-xl font-bold text-foreground">Megrendelői és terméklista</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Ezek a listák mindig a kezdetektől számított, teljes megrendelési előzményt mutatják – a
        fenti szűrők ezekre nem vonatkoznak. Több megrendelőt vagy terméket is ki lehet választani,
        illetve az összeset.
      </p>

      {error ? (
        <p className="mt-4 rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Megrendelőnként */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Users className="h-4 w-4 text-primary" />
            Megrendelőnként – mit rendelt?
          </div>
          <MultiSelect
            items={customers.map((c) => ({ key: c.email, label: `${c.name} (${c.email})` }))}
            selected={customerSel}
            onToggle={toggleCustomer}
            onToggleAll={toggleAllCustomers}
            buttonLabel={customerButtonLabel}
          />

          {customerTable ? (
            <>
              <div className="mt-4 max-h-80 overflow-auto rounded-lg border border-border">
                <table className="w-full min-w-[480px] text-xs">
                  <thead className="sticky top-0 bg-card">
                    <tr className="border-b border-border text-left uppercase tracking-wider text-muted-foreground">
                      <th className="px-3 py-2 font-semibold">Dátum</th>
                      <th className="px-3 py-2 font-semibold">Rendelésszám</th>
                      <th className="px-3 py-2 font-semibold">Termék</th>
                      <th className="px-3 py-2 text-right font-semibold">Menny.</th>
                      <th className="px-3 py-2 text-right font-semibold">Összeg</th>
                      <th className="px-3 py-2 font-semibold">Fizetés</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customerRows.map((r) => (
                      <tr
                        key={r.orderNumber}
                        className="border-b border-border/60 last:border-0"
                      >
                        <td className="px-3 py-2 text-muted-foreground">
                          {formatDateHu(r.createdAt)}
                        </td>
                        <td className="px-3 py-2 text-muted-foreground">{r.orderNumber}</td>
                        <td className="px-3 py-2 font-medium text-foreground">
                          {productLabel(r)}
                        </td>
                        <td className="px-3 py-2 text-right">{r.quantity} db</td>
                        <td className="px-3 py-2 text-right">{formatPrice(r.totalPrice)}</td>
                        <td className="px-3 py-2 text-muted-foreground">
                          {paymentLabel(r.paymentStatus)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-border bg-muted/50 font-semibold text-foreground">
                      <td className="px-3 py-2">Összesen</td>
                      <td className="px-3 py-2" colSpan={2}>
                        {customerRows.length} megrendelés
                      </td>
                      <td className="px-3 py-2 text-right">{sumListQty(customerRows)} db</td>
                      <td className="px-3 py-2 text-right">
                        {formatPrice(sumListRevenue(customerRows))}
                      </td>
                      <td className="px-3 py-2" />
                    </tr>
                  </tfoot>
                </table>
              </div>
              {exportButtons(
                "cust",
                `xlntbi-megrendelo-${isAllCustomers ? "osszes" : slugify(customerButtonLabel)}`,
                customerTable,
              )}
            </>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">Nincs megrendelő.</p>
          )}
        </div>

        {/* Termékenként */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Package className="h-4 w-4 text-primary" />
            Termékenként – kik rendelték?
          </div>
          <MultiSelect
            items={productLabels.map((label) => ({ key: label, label }))}
            selected={productSel}
            onToggle={toggleProduct}
            onToggleAll={toggleAllProducts}
            buttonLabel={productButtonLabel}
          />

          {productTable ? (
            <>
              <div className="mt-4 max-h-80 overflow-auto rounded-lg border border-border">
                <table className="w-full min-w-[520px] text-xs">
                  <thead className="sticky top-0 bg-card">
                    <tr className="border-b border-border text-left uppercase tracking-wider text-muted-foreground">
                      <th className="px-3 py-2 font-semibold">Dátum</th>
                      <th className="px-3 py-2 font-semibold">Rendelésszám</th>
                      <th className="px-3 py-2 font-semibold">Megrendelő</th>
                      <th className="px-3 py-2 text-right font-semibold">Menny.</th>
                      <th className="px-3 py-2 text-right font-semibold">Összeg</th>
                      <th className="px-3 py-2 font-semibold">Fizetés</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productRows.map((r) => (
                      <tr
                        key={`${r.orderNumber}-${r.email}`}
                        className="border-b border-border/60 last:border-0"
                      >
                        <td className="px-3 py-2 text-muted-foreground">
                          {formatDateHu(r.createdAt)}
                        </td>
                        <td className="px-3 py-2 text-muted-foreground">{r.orderNumber}</td>
                        <td className="px-3 py-2 font-medium text-foreground">
                          {r.billingName}
                          <span className="block text-muted-foreground">{r.email}</span>
                        </td>
                        <td className="px-3 py-2 text-right">{r.quantity} db</td>
                        <td className="px-3 py-2 text-right">{formatPrice(r.totalPrice)}</td>
                        <td className="px-3 py-2 text-muted-foreground">
                          {paymentLabel(r.paymentStatus)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-border bg-muted/50 font-semibold text-foreground">
                      <td className="px-3 py-2">Összesen</td>
                      <td className="px-3 py-2" colSpan={2}>
                        {productRows.length} megrendelés
                      </td>
                      <td className="px-3 py-2 text-right">{sumListQty(productRows)} db</td>
                      <td className="px-3 py-2 text-right">
                        {formatPrice(sumListRevenue(productRows))}
                      </td>
                      <td className="px-3 py-2" />
                    </tr>
                  </tfoot>
                </table>
              </div>
              {exportButtons(
                "prod",
                `xlntbi-termek-${isAllProducts ? "osszes" : slugify(productButtonLabel)}`,
                productTable,
              )}
            </>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">Nincs termék.</p>
          )}
        </div>
      </div>
      <BackToTop />
    </section>
  );
}


// ---------------- Oldalletöltési statisztikák ----------------

type SharedPeriodProps = {
  yearSel: YearSel;
  monthSel: MonthSel;
  years: number[];
  onYearChange: (value: YearSel) => void;
  onMonthChange: (value: MonthSel) => void;
};

function PageViewStats({ yearSel, monthSel, years: orderYears, onYearChange, onMonthChange }: SharedPeriodProps) {
  const fetchPageViews = useServerFn(adminPageViewStats);
  const [counts, setCounts] = useState<{ product: PageViewCount[]; service: PageViewCount[] }>({
    product: [],
    service: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchPageViews()
      .then((res) => {
        if (cancelled) return;
        const rows = res.rows ?? [];
        setCounts({
          product: rows.filter((r) => r.pageType === "product"),
          service: rows.filter((r) => r.pageType === "service"),
        });
      })
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : "Nem sikerült betölteni az adatokat."),
      )
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [fetchPageViews]);

  const years = useMemo(() => {
    const set = new Set<number>([new Date().getFullYear()]);
    for (const year of orderYears) set.add(year);
    for (const row of [...counts.product, ...counts.service]) set.add(row.year);
    return [...set].sort((a, b) => b - a);
  }, [counts, orderYears]);

  const productEntries = useMemo(
    () => products.map((p) => ({ key: p.slug, label: p.name })),
    [],
  );
  const serviceEntries = useMemo(
    () => serviceItems.map((item) => ({ key: item.to, label: item.label })),
    [],
  );

  if (loading) {
    return (
      <section className="mt-14 flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Oldalletöltési statisztika betöltése…
      </section>
    );
  }
  if (error) {
    return <section className="mt-14 text-sm text-destructive">{error}</section>;
  }

  return (
    <section className="mt-14 space-y-14">
      <PageViewBlock
        anchorId="termek-oldalletoltesek"
        titleBase="Termék Részletek oldalak letöltései"
        note="Csak a publikált (éles) oldalon mért megnyitások. Minden termék szerepel, akkor is, ha nulla."
        firstColumn="Termék"
        entries={productEntries}
        counts={counts.product}
        years={years}
        yearSel={yearSel}
        monthSel={monthSel}
        onYearChange={onYearChange}
        onMonthChange={onMonthChange}
        fileBase="termek-oldalletoltesek"
        topN={5}
      />

      <PageViewBlock
        anchorId="szolgaltatas-oldalletoltesek"
        titleBase="Szolgáltatás aloldalak letöltései"
        note="Csak a publikált (éles) oldalon mért megnyitások. Minden szolgáltatás szerepel, akkor is, ha nulla."
        firstColumn="Szolgáltatás"
        entries={serviceEntries}
        counts={counts.service}
        years={years}
        yearSel={yearSel}
        monthSel={monthSel}
        onYearChange={onYearChange}
        onMonthChange={onMonthChange}
        fileBase="szolgaltatas-oldalletoltesek"
        topN={3}
      />
      <BackToTop />
    </section>
  );
}

function PageViewBlock({
  anchorId,
  titleBase,
  note,
  firstColumn,
  entries,
  counts,
  years,
  yearSel,
  monthSel,
  onYearChange,
  onMonthChange,
  fileBase,
  topN,
}: {
  anchorId?: string;
  titleBase: string;
  note: string;
  firstColumn: string;
  entries: { key: string; label: string }[];
  counts: PageViewCount[];
  years: number[];
  yearSel: YearSel;
  monthSel: MonthSel;
  onYearChange: (value: YearSel) => void;
  onMonthChange: (value: MonthSel) => void;
  fileBase: string;
  topN: number;
}) {
  const [exporting, setExporting] = useState<string | null>(null);
  const rows = useMemo(() => {
    const selectedYears = yearSel === "all" ? years : [yearSel];
    const merged = new Map(entries.map((entry) => [entry.key, { key: entry.key, label: entry.label, months: Array.from({ length: 12 }, () => 0), total: 0 }]));
    for (const year of selectedYears) {
      for (const row of pivotPageViews(entries, counts, year)) {
        const target = merged.get(row.key);
        if (!target) continue;
        row.months.forEach((value, index) => { target.months[index] = (target.months[index] ?? 0) + value; });
      }
    }
    for (const row of merged.values()) row.total = monthSel === "all" ? row.months.reduce((sum, value) => sum + value, 0) : (row.months[monthSel] ?? 0);
    return [...merged.values()];
  }, [entries, counts, years, yearSel, monthSel]);
  const periodLabel = yearSel === "all" ? (monthSel === "all" ? "Összes év" : `Összes év – ${MONTHS[monthSel]}`) : (monthSel === "all" ? String(yearSel) : `${yearSel}. ${MONTHS[monthSel]}`);
  const title = titleBase;
  const monthIndexes = monthSel === "all" ? MONTHS_SHORT.map((_, index) => index) : [monthSel];
  const table: ListTable = {
    title,
    subtitle: periodLabel,
    head: [firstColumn, ...monthIndexes.map((index) => MONTHS_SHORT[index] ?? ""), ...(monthSel === "all" ? ["Összesen"] : [])],
    body: rows.map((row) => [row.label, ...monthIndexes.map((index) => row.months[index] ?? 0), ...(monthSel === "all" ? [row.total] : [])]),
    foot: ["Összesen", ...monthIndexes.map((index) => rows.reduce((sum, row) => sum + (row.months[index] ?? 0), 0)), ...(monthSel === "all" ? [rows.reduce((sum, row) => sum + row.total, 0)] : [])],
    rightCols: Array.from({ length: monthIndexes.length + (monthSel === "all" ? 1 : 0) }, (_, index) => index + 1),
  };
  const filename = `xlntbi-${fileBase}-${slugify(periodLabel)}`;


  const run = async (id: string, fn: () => void | Promise<void>) => {
    setExporting(id);
    try {
      await fn();
    } finally {
      setExporting(null);
    }
  };

  return (
    <div>
      <h2 id={anchorId} className="scroll-mt-36 text-xl font-bold text-foreground">{title}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{note}</p>

      <PeriodFilters years={years} year={yearSel} month={monthSel} onYearChange={onYearChange} onMonthChange={onMonthChange} />
      <PageViewTopN rows={rows} month="all" year={yearSel === "all" ? "Összes év" : yearSel} firstColumn={firstColumn} topN={topN} />
      <PageViewChart rows={rows} year={yearSel === "all" ? "Összes év" : yearSel} month={monthSel} firstColumn={firstColumn} />
      <div className="mt-6 flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline" size="sm"
          disabled={exporting !== null}
          onClick={() => run("xlsx", () => exportTableXlsx(`${filename}.xlsx`, title.slice(0, 31), table))}
        >
          {exporting === "xlsx" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <FileSpreadsheet className="h-4 w-4" />
          )}
          Excel
        </Button>
        <Button
          type="button"
          variant="outline" size="sm"
          disabled={exporting !== null}
          onClick={() => run("csv", () => exportTableCsv(`${filename}.csv`, table))}
        >
          <FileText className="h-4 w-4" />
          CSV
        </Button>
        <Button
          type="button"
          variant="outline" size="sm"
          disabled={exporting !== null}
          onClick={() => run("xml", () => exportTableXml(`${filename}.xml`, table))}
        >
          <FileCode2 className="h-4 w-4" />
          XML
        </Button>
        <Button
          type="button"
          variant="outline" size="sm"
          disabled={exporting !== null}
          onClick={() => run("pdf", () => exportTablePdf(`${filename}.pdf`, table))}
        >
          {exporting === "pdf" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <FileDown className="h-4 w-4" />
          )}
          PDF
        </Button>
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-border bg-card">
        <table className={`w-full text-sm ${monthSel === "all" ? "min-w-[880px]" : "min-w-[420px]"}`}>
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-3 font-semibold">{firstColumn}</th>
              {monthIndexes.map((index) => <th key={index} className="px-2 py-3 text-right font-semibold">{MONTHS_SHORT[index]}</th>)}
              {monthSel === "all" ? <th className="px-4 py-3 text-right font-semibold">Összesen</th> : null}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.key} className="border-b border-border/60 last:border-0">
                <td className="px-4 py-3 font-medium text-foreground">{row.label}</td>
                {monthIndexes.map((index) => <td key={index} className="px-2 py-3 text-right text-muted-foreground">{row.months[index] ?? 0}</td>)}
                {monthSel === "all" ? <td className="px-4 py-3 text-right font-semibold text-foreground">{row.total}</td> : null}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-border bg-muted/50 text-sm font-semibold text-foreground">
              {(table.foot ?? []).map((cell, i) => (
                <td key={i} className={i === 0 ? "px-4 py-3" : "px-2 py-3 text-right"}>
                  {cell}
                </td>
              ))}
            </tr>
          </tfoot>
        </table>
      </div>

    </div>
  );
}

/** Top N rangsor a kiválasztott időszakra az oldalletöltések alapján. */
function PageViewTopN({
  rows,
  month,
  year,
  firstColumn,
  topN,
}: {
  rows: PageViewPivotRow[];
  month: number | "all";
  year: number | string;
  firstColumn: string;
  topN: number;
}) {
  const periodValue = (row: PageViewPivotRow) =>
    month === "all" ? row.total : (row.months[month] ?? 0);

  const ranked = rows
    .map((row) => ({ row, value: periodValue(row) }))
    .filter((entry) => entry.value > 0)
    .sort((a, b) => b.value - a.value || a.row.label.localeCompare(b.row.label, "hu"))
    .slice(0, topN);

  const periodLabel = month === "all" ? String(year) : `${year}. ${MONTHS[month] ?? ""}`;
  const max = ranked.length > 0 ? (ranked[0]?.value ?? 1) : 1;
  const colorOf = (index: number) => DISTINCT_CHART_COLORS[index % DISTINCT_CHART_COLORS.length] ?? "var(--chart-1)";

  return (
    <div className="mt-6 rounded-xl border border-border bg-card p-5">
      <p className="text-sm text-muted-foreground">
        <strong className="text-foreground">Top {topN}</strong> {firstColumn.toLowerCase()} –{" "}
        {periodLabel} időszak oldalletöltései alapján
      </p>
      {ranked.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">
          Ebben az időszakban ({periodLabel}) még nincs mért oldalletöltés, ezért a rangsor üres.
        </p>
      ) : (
        <ol className="mt-4 space-y-2">
          {ranked.map((entry, i) => (
            <li key={entry.row.key} className="flex items-center gap-3">
              <span className="w-7 shrink-0 text-center text-sm font-bold text-foreground">
                {i + 1}.
              </span>
              <span
                className="w-56 shrink-0 truncate text-sm font-medium text-foreground"
                title={entry.row.label}
              >
                {entry.row.label}
              </span>
              <div className="h-4 flex-1 rounded bg-muted">
                <div
                  className="h-4 rounded"
                  style={{
                    width: `${((entry.value / max) * 100).toFixed(2)}%`,
                    backgroundColor: colorOf(i),
                  }}
                />
              </div>
              <span className="w-12 shrink-0 text-right text-sm font-semibold text-foreground">
                {entry.value}
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

/** Sávdiagram: havi (vagy egy hónapon belüli) oldalletöltések, elemenként színezve. */
function PageViewChart({
  rows,
  year,
  month,
  firstColumn,
}: {
  rows: ReturnType<typeof pivotPageViews>;
  year: number | string;
  month: number | "all";
  firstColumn: string;
}) {
  const active = rows.filter((row) =>
    month === "all" ? row.total > 0 : (row.months[month] ?? 0) > 0,
  );

  if (active.length === 0) {
    return (
      <p className="mt-4 rounded-xl border border-dashed border-border bg-card p-5 text-sm text-muted-foreground">
        Ehhez az időszakhoz ({month === "all" ? year : `${year}. ${MONTHS[month] ?? ""}`}) még nincs
        mért oldalletöltés, ezért a diagram üres.
      </p>
    );
  }

  const colorOf = (index: number) => DISTINCT_CHART_COLORS[index % DISTINCT_CHART_COLORS.length] ?? "var(--chart-1)";

  if (month === "all") {
    const monthTotals = MONTHS_SHORT.map((_, i) =>
      active.reduce((sum, row) => sum + (row.months[i] ?? 0), 0),
    );
    const max = Math.max(1, ...monthTotals);
    return (
      <div className="mt-6 rounded-xl border border-border bg-card p-5">
        <p className="text-sm text-muted-foreground">
          <strong className="text-foreground">{year}</strong> – oldalletöltések havonta (db),
          {firstColumn.toLowerCase()}enként színezve
        </p>
        <div className="mt-6 flex h-60 items-stretch gap-1 sm:gap-2">
          {MONTHS_SHORT.map((label, i) => (
            <div key={label} className="flex h-full min-w-0 flex-1 flex-col items-center gap-2">
              <span className="text-xs font-semibold text-foreground">{monthTotals[i]}</span>
              <div className="flex min-h-0 w-full max-w-12 flex-1 flex-col justify-end overflow-hidden rounded-t-md bg-muted/50">
                {active.map((row, ri) => {
                  const value = row.months[i] ?? 0;
                  if (value <= 0) return null;
                  return (
                    <div
                      key={row.key}
                      title={`${row.label} – ${MONTHS[i]}: ${value} db`}
                      style={{
                        height: `${((value / (max || 1)) * 100).toFixed(2)}%`,
                        backgroundColor: colorOf(ri),
                      }}
                    />
                  );
                })}
              </div>
              <span className="text-xs text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>

        <PageViewLegend items={active.map((row, ri) => ({ label: row.label, color: colorOf(ri) }))} />
      </div>
    );
  }

  const max = Math.max(1, ...active.map((row) => row.months[month] ?? 0));
  return (
    <div className="mt-6 rounded-xl border border-border bg-card p-5">
      <p className="text-sm text-muted-foreground">
        <strong className="text-foreground">
          {year}. {MONTHS[month] ?? ""}
        </strong>{" "}
        – oldalletöltések (db)
      </p>
      <div className="mt-5 space-y-2">
        {active.map((row, ri) => {
          const value = row.months[month] ?? 0;
          return (
            <div key={row.key} className="flex items-center gap-3">
              <span className="w-56 shrink-0 truncate text-sm text-foreground" title={row.label}>
                {row.label}
              </span>
              <div className="h-4 flex-1 rounded bg-muted">
                <div
                  className="h-4 rounded"
                  style={{
                    width: `${((value / max) * 100).toFixed(2)}%`,
                    backgroundColor: colorOf(ri),
                  }}
                />
              </div>
              <span className="w-12 shrink-0 text-right text-sm font-semibold text-foreground">
                {value}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PageViewLegend({ items }: { items: { label: string; color: string }[] }) {
  return (
    <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2">
      {items.map((item) => (
        <span key={item.label} className="flex items-center gap-2 text-xs text-muted-foreground">
          <span
            className="inline-block h-3 w-3 rounded-sm"
            style={{ backgroundColor: item.color }}
          />
          {item.label}
        </span>
      ))}
    </div>
  );
}

// ---------------- Termékenkénti konverziós arány ----------------

/**
 * Conversion per product: paid purchases divided by product detail page views
 * for the same period. Views only exist with month granularity, so the period
 * filter of the page (year + month) is applied to both sides identically.
 */
function ProductConversion({ rows, yearSel, monthSel, years, onYearChange, onMonthChange }: { rows: StatRow[] } & SharedPeriodProps) {
  const fetchPageViews = useServerFn(adminPageViewStats);
  const [counts, setCounts] = useState<PageViewCount[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchPageViews()
      .then((res) => {
        if (cancelled) return;
        setCounts((res.rows ?? []).filter((r) => r.pageType === "product"));
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Nem sikerült betölteni a megtekintéseket.");
        setCounts([]);
      });
    return () => { cancelled = true; };
  }, [fetchPageViews]);

  const periodLabel = yearSel === "all"
    ? monthSel === "all" ? "Összes év" : `Összes év – ${MONTHS[monthSel]}`
    : monthSel === "all" ? `${yearSel} egész éve` : `${yearSel}. ${MONTHS[monthSel]}`;

  const table = useMemo(() => {
    const names = new Map(products.map((p) => [p.slug, p.name]));
    const views = new Map<string, number>();
    for (const row of counts ?? []) {
      if (yearSel !== "all" && row.year !== yearSel) continue;
      if (monthSel !== "all" && row.month !== monthSel + 1) continue;
      const key = resolveProductSlug(row.pageKey);
      views.set(key, (views.get(key) ?? 0) + row.views);
    }
    const paid = new Map<string, number>();
    for (const row of rows) {
      if (row.paymentStatus !== "paid") continue;
      const date = new Date(row.createdAt);
      if (yearSel !== "all" && date.getFullYear() !== yearSel) continue;
      if (monthSel !== "all" && date.getMonth() !== monthSel) continue;
      const key = resolveProductSlug(row.productSlug);
      paid.set(key, (paid.get(key) ?? 0) + 1);
    }
    const keys = new Set<string>([...views.keys(), ...paid.keys()]);
    return [...keys].map((key) => {
      const v = views.get(key) ?? 0;
      const p = paid.get(key) ?? 0;
      return { key, label: names.get(key) ?? key, views: v, paid: p, rate: v > 0 ? (p / v) * 100 : null };
    }).sort((a, b) => (b.rate ?? -1) - (a.rate ?? -1) || b.views - a.views);
  }, [counts, rows, yearSel, monthSel]);

  const exportTable: ListTable | null = table.length ? {
    title: `Termékenkénti konverziós arány – ${periodLabel}`,
    subtitle: "Konverzió = kifizetett vásárlások / termékmegtekintések × 100",
    head: ["Termék", "Megtekintés (db)", "Kifizetett vásárlás (db)", "Konverzió"],
    body: table.map((row) => [row.label, row.views, row.paid, row.rate === null ? "—" : `${row.rate.toFixed(2).replace(".", ",")} %`]),
    xlsxBody: table.map((row) => [row.label, row.views, row.paid, row.rate === null ? "—" : row.rate / 100]),
    xlsxPercentCols: [3],
    rightCols: [1, 2, 3],
  } : null;

  return (
    <section id="termek-konverzio" className="mt-14 scroll-mt-36">
      <h2 className="text-xl font-bold text-foreground">Termékenkénti konverziós arány</h2>
      <p className="mt-2 max-w-3xl text-sm text-muted-foreground">Konverzió = kifizetett megrendelések száma ÷ a termék Részletek oldalának megtekintései × 100. Megtekintés nélkül a konverzió helyén „—” áll.</p>
      <PeriodFilters years={years} year={yearSel} month={monthSel} onYearChange={onYearChange} onMonthChange={onMonthChange} />
      <div className="mt-4"><TableExportButtons baseName={`xlntbi-termek-konverzio-${slugify(periodLabel)}`} sheetName="Termék konverzió" table={exportTable} /></div>
      {error ? <p className="mt-4 text-sm text-destructive">{error}</p> : counts === null ? <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Megtekintések betöltése…</p> : table.length === 0 ? <p className="mt-4 rounded-xl border border-border bg-card px-4 py-5 text-sm text-muted-foreground">Ehhez az időszakhoz nincs sem megtekintés, sem kifizetett megrendelés.</p> : <div className="mt-4 overflow-x-auto rounded-xl border border-border bg-card"><table className="w-full min-w-[560px] text-sm"><thead><tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground"><th className="px-4 py-3 font-semibold">Termék</th><th className="px-4 py-3 text-right font-semibold">Megtekintés</th><th className="px-4 py-3 text-right font-semibold">Kifizetett vásárlás</th><th className="px-4 py-3 text-right font-semibold">Konverzió</th></tr></thead><tbody>{table.map((r) => <tr key={r.key} className="border-b border-border/60 last:border-0"><td className="px-4 py-3 font-medium text-foreground">{r.label}</td><td className="px-4 py-3 text-right text-muted-foreground">{r.views} db</td><td className="px-4 py-3 text-right text-muted-foreground">{r.paid} db</td><td className="px-4 py-3 text-right font-semibold text-foreground">{r.rate === null ? "—" : `${r.rate.toFixed(2).replace(".", ",")} %`}</td></tr>)}</tbody></table></div>}
      <BackToTop />
    </section>
  );
}

// ---------------- Megrendelések óránként ----------------

const BUDAPEST_HOUR = new Intl.DateTimeFormat("hu-HU", {
  timeZone: "Europe/Budapest",
  hour: "2-digit",
  hour12: false,
});
const BUDAPEST_PARTS = new Intl.DateTimeFormat("hu-HU", {
  timeZone: "Europe/Budapest",
  year: "numeric",
  month: "2-digit",
  hour: "2-digit",
  hour12: false,
});

/** Year, month (0-based) and hour of a timestamp in Hungarian local time. */
function budapestBuckets(iso: string) {
  const parts = BUDAPEST_PARTS.formatToParts(new Date(iso));
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? "0");
  const hour = Number(BUDAPEST_HOUR.format(new Date(iso)).replace(/\D/g, ""));
  return { year: get("year"), month: get("month") - 1, hour: hour % 24 };
}

/**
 * Orders per hour of day (Europe/Budapest), all payment statuses, using the shared period filter.
 */
function HourlyOrdersChart({ rows, yearSel, monthSel, years, onYearChange, onMonthChange }: { rows: StatRow[] } & SharedPeriodProps) {

  const buckets = useMemo(() => rows.map((row) => budapestBuckets(row.createdAt)), [rows]);

  const hours = useMemo(() => {
    const counts = Array.from({ length: 24 }, () => 0);
    for (const b of buckets) {
      if (yearSel !== "all" && b.year !== yearSel) continue;
      if (monthSel !== "all" && b.month !== monthSel) continue;
      counts[b.hour] = (counts[b.hour] ?? 0) + 1;
    }
    return counts;
  }, [buckets, yearSel, monthSel]);

  const total = hours.reduce((a, b) => a + b, 0);
  const max = Math.max(1, ...hours);
  const periodLabel =
    yearSel === "all"
      ? monthSel === "all"
        ? "Összes év"
        : `Összes év – ${MONTHS[monthSel]}`
      : monthSel === "all"
        ? `${yearSel} egész éve`
        : `${yearSel}. ${MONTHS[monthSel]}`;

  return (
    <section className="mt-14">
      <h2 id="megrendelesek-orankent" className="scroll-mt-36 text-xl font-bold text-foreground">Megrendelések óránként</h2>
      <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
        A megrendelés leadásának időpontja szerint, magyar idő (Europe/Budapest) alapján, a nyári és
        téli időszámítást is helyesen kezelve. Minden leadott megrendelés beleszámít, fizetési
        állapottól függetlenül.
      </p>

      <PeriodFilters years={years} year={yearSel} month={monthSel} onYearChange={onYearChange} onMonthChange={onMonthChange} />

      <div className="mt-6 rounded-xl border border-border bg-card p-5 sm:p-6">
        <p className="text-sm text-muted-foreground">
          <strong className="text-foreground">{periodLabel}</strong> – összesen {total} megrendelés
        </p>
        <div className="mt-6 flex h-60 items-end gap-0.5 sm:gap-1">
          {hours.map((count, hour) => (
            <div key={hour} className="flex min-w-0 flex-1 flex-col items-center gap-2">
              <span className="text-xs font-semibold text-foreground">
                {count > 0 ? count : ""}
              </span>
              <div
                className="flex h-44 w-full flex-col justify-end"
                title={`${String(hour).padStart(2, "0")}:00–${String(hour).padStart(2, "0")}:59 – ${count} megrendelés`}
              >
                {count > 0 ? (
                  <div
                    className="w-full rounded-t-sm bg-primary"
                    style={{ height: `${(count / max) * 100}%` }}
                  />
                ) : (
                  <div className="w-full border-b-2 border-border/60" />
                )}
              </div>
              <span className="text-xs text-muted-foreground">
                {String(hour).padStart(2, "0")}
              </span>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          A vízszintes tengelyen a nap 24 órája (00–23), a függőleges tengelyen a megrendelések
          darabszáma. Az oszlopra húzva az egeret megjelenik az óraintervallum és a pontos darabszám.
        </p>
      </div>
      <BackToTop />
    </section>
  );
}

function DemoDownloads({ yearSel, monthSel, years, onYearChange, onMonthChange }: SharedPeriodProps) {
  const load = useServerFn(adminDemoStats);
  const [rows, setRows] = useState<any[] | null>(null);
  const [error, setError] = useState("");
  const [topMetric, setTopMetric] = useState<DemoTopMetric>("downloads");

  useEffect(() => {
    load()
      .then((r) => setRows(r.rows))
      .catch((e) => {
        setError(e instanceof Error ? e.message : "A DEMO adatok betöltése nem sikerült.");
        setRows([]);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (rows === null) {
    return (
      <section className="mt-14">
        <h2 id="demo-letoltesek" className="scroll-mt-36 text-xl font-bold text-foreground">DEMO letöltések</h2>
        <p className="mt-4 text-sm text-muted-foreground">Betöltés…</p>
      </section>
    );
  }

  const filteredRows = rows.filter((row) => {
    const date = new Date(row.createdAt);
    return (yearSel === "all" || date.getFullYear() === yearSel) && (monthSel === "all" || date.getMonth() === monthSel);
  });
  const activeCount = filteredRows.filter((r) => r.active).length;
  const totalDownloads = filteredRows.reduce((s, r) => s + r.downloadCount, 0);
  const demoTop = [...filteredRows.reduce((map, row) => {
    const entry = map.get(row.productName) ?? { label: row.productName, downloads: 0, requests: 0 };
    entry.downloads += row.downloadCount;
    entry.requests += 1;
    map.set(row.productName, entry);
    return map;
  }, new Map<string, { label: string; downloads: number; requests: number }>()).values()]
    .sort((a, b) => topMetric === "downloads" ? b.downloads - a.downloads : b.requests - a.requests)
    .slice(0, 5);
  const demoTopMax = Math.max(1, ...demoTop.map((item) => topMetric === "downloads" ? item.downloads : item.requests));

  const demoTable: ListTable | null = filteredRows.length
    ? {
        title: "DEMO letöltések",
        subtitle: "Fizetés nélküli DEMO licenc igénylések – nem szerepelnek a vásárlási statisztikában.",
        head: ["Dátum", "Termék", "Név", "E-mail", "Cégnév", "Adószám", "HWID", "Letöltések", "Állapot"],
        body: filteredRows.map((r) => [
          formatDateHu(r.createdAt),
          r.productName,
          r.name,
          r.email,
          r.companyName ?? "",
          r.taxNumber ?? "",
          r.hwid ?? "",
          `${r.downloadCount}/${r.maxDownloads}`,
          r.active ? "Aktív" : "Lejárt",
        ]),
        foot: ["Összesen", "", `${filteredRows.length} igénylés`, "", "", "", "", `${totalDownloads} letöltés`, `${activeCount} aktív`],
        rightCols: [7],
      }
    : null;
  const base = `xlntbi-demo-letoltesek-${slugify(yearSel === "all" ? (monthSel === "all" ? "osszes-ev" : `osszes-ev-${MONTHS[monthSel]}`) : (monthSel === "all" ? String(yearSel) : `${yearSel}-${MONTHS[monthSel]}`))}`;

  return (
    <section className="mt-14">
      <h2 id="demo-letoltesek" className="scroll-mt-36 text-xl font-bold text-foreground">DEMO letöltések</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Fizetés nélküli DEMO licenc igénylések. Ezek nem jelennek meg a vásárlási statisztikában
        és nem kerülnek számlázásra.
      </p>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        {[{ label: "DEMO igénylések", value: `${filteredRows.length} db` }, { label: "Aktív igénylések", value: `${activeCount} db` }, { label: "Tényleges letöltések", value: `${totalDownloads} db` }].map((item) => <div key={item.label} className="rounded-xl border border-border bg-card p-5"><p className="text-xs font-semibold uppercase text-muted-foreground">{item.label}</p><p className="mt-2 text-2xl font-bold text-foreground">{item.value}</p></div>)}
      </div>

      <PeriodFilters years={years} year={yearSel} month={monthSel} onYearChange={onYearChange} onMonthChange={onMonthChange} />
      <div className="mt-6 rounded-xl border border-border bg-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-3"><h3 className="text-base font-bold text-foreground">Top 5 termék</h3><div className="flex gap-2"><Button type="button" size="sm" variant={topMetric === "downloads" ? "default" : "outline"} onClick={() => setTopMetric("downloads")}>Tényleges letöltések</Button><Button type="button" size="sm" variant={topMetric === "requests" ? "default" : "outline"} onClick={() => setTopMetric("requests")}>Igénylések</Button></div></div>
        {demoTop.length === 0 ? <p className="mt-4 text-sm text-muted-foreground">A kiválasztott időszakhoz nincs rangsorolható adat.</p> : <ol className="mt-4 space-y-3">{demoTop.map((item, index) => { const value = topMetric === "downloads" ? item.downloads : item.requests; return <li key={item.label} className="grid grid-cols-[2rem_minmax(0,14rem)_1fr_auto] items-center gap-3 text-sm"><span className="font-bold">{index + 1}.</span><span className="truncate font-medium">{item.label}</span><div className="h-3 overflow-hidden rounded bg-muted"><div className="h-full rounded bg-primary" style={{ width: `${(value / demoTopMax) * 100}%` }} /></div><span className="font-semibold">{value} db</span></li>; })}</ol>}
      </div>

      {error ? <p className="mt-4 text-sm text-destructive">{error}</p> : null}

      <div className="mt-6"><TableExportButtons baseName={base} sheetName="DEMO letöltések" table={demoTable} /></div>

      {filteredRows.length > 0 ? (
        <div className="mt-6 overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/40 text-left">
              <tr>
                <th className="px-4 py-3 font-semibold text-foreground">Dátum</th>
                <th className="px-4 py-3 font-semibold text-foreground">Termék</th>
                <th className="px-4 py-3 font-semibold text-foreground">Név</th>
                <th className="px-4 py-3 font-semibold text-foreground">E-mail</th>
                <th className="px-4 py-3 font-semibold text-foreground">Cégnév</th>
                <th className="px-4 py-3 font-semibold text-foreground">Adószám</th>
                <th className="px-4 py-3 font-semibold text-foreground">HWID</th>
                <th className="px-4 py-3 text-right font-semibold text-foreground">Letöltések</th>
                <th className="px-4 py-3 font-semibold text-foreground">Állapot</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredRows.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-2.5 text-muted-foreground">
                    {formatDateHu(r.createdAt)}
                  </td>
                  <td className="px-4 py-2.5">{r.productName}</td>
                  <td className="px-4 py-2.5">{r.name}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{r.email}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{r.companyName ?? "—"}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{r.taxNumber ?? "—"}</td>
                  <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">
                    {r.hwid ?? "—"}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    {r.downloadCount}/{r.maxDownloads}
                  </td>
                  <td className="px-4 py-2.5">
                    {r.active ? (
                      <span className="inline-flex rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-600">
                        Aktív
                      </span>
                    ) : (
                      <span className="inline-flex rounded-md bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
                        Lejárt
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="mt-6 text-sm text-muted-foreground">Még nincs DEMO igénylés.</p>
      )}
      <BackToTop />
    </section>
  );
}
