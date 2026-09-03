import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useRef, useState } from "react";
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

import { adminOrderStats, adminPageViewStats } from "@/lib/admin.functions";
import { formatPrice, products } from "@/lib/products";
import { serviceItems } from "@/lib/services";
import { PageHero } from "@/components/PageHero";
import { useAdminSession } from "@/components/admin-panels";
import {
  MONTHS,
  MONTHS_SHORT,
  PALETTE,
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
  pageViewTable,
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

function filterChip(active: boolean) {
  return `rounded-md px-3.5 py-1.5 text-sm font-semibold transition-colors ${
    active
      ? "bg-primary text-primary-foreground"
      : "border border-input text-muted-foreground hover:bg-accent hover:text-foreground"
  }`;
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

      {/* Teszt megrendelések mutatása – csak admin szerepkörrel kapcsolható */}
      {role === "admin" ? (
        <label className="mb-6 flex w-fit cursor-pointer items-center gap-2.5 rounded-xl border border-dashed border-border bg-muted/40 px-4 py-2.5 text-sm font-medium text-foreground">
          <input
            type="checkbox"
            checked={includeTests}
            onChange={(e) => setIncludeTests(e.target.checked)}
            className="h-4 w-4 accent-primary"
          />
          Teszt megrendelések (TESZT- előtag) mutatása a statisztikában és az exportokban
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

              {/* Megrendelői és terméklista – a kezdetektől, szűrőktől függetlenül */}
              <CustomerProductLists rows={rows} />

              <PageViewStats />

              {/* Grafikon – csak konkrét évre */}
              {activeYear !== null ? (
                <section className="mt-14">
                  <h2 className="text-xl font-bold text-foreground">Havi bontás grafikonon</h2>

                  <div className="mt-6 rounded-xl border border-border bg-card p-5 sm:p-6">
                    <p className="text-sm text-muted-foreground">
                      <strong className="text-foreground">{activeYear}</strong> – megrendelt
                      mennyiség havonta (db)
                      {payFilter !== "all"
                        ? ` – ${PAY_OPTIONS.find((o) => o.id === payFilter)?.label.toLowerCase()} megrendelések`
                        : ""}
                    </p>

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

                    {monthly.labels.length > 0 ? (
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
                    ) : (
                      <p className="mt-5 text-sm text-muted-foreground">
                        Ebben az évben még nincs megrendelés.
                      </p>
                    )}
                  </div>

                  {/* Havi táblázat */}
                  <div className="mt-6 overflow-x-auto rounded-xl border border-border bg-card">
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
                  </div>
                </section>
              ) : null}

            </>
          )}
        </>
      )}
    </div>
  );
}

const listExportBtn =
  "inline-flex items-center gap-1.5 rounded-md border border-input bg-background px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50";

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
  selected: Set<string>;
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

  const isAll = selected.size === 0;

  return (
    <div ref={ref} className="relative mt-3">
      <button
        type="button"
        className={listSelectBtn}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="truncate">{buttonLabel}</span>
        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
      </button>
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
  // Üres set = összes kiválasztva (alapértelmezett).
  const [customerSel, setCustomerSel] = useState<Set<string>>(new Set());
  const [productSel, setProductSel] = useState<Set<string>>(new Set());
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

  const isAllCustomers = customerSel.size === 0;
  const isAllProducts = productSel.size === 0;

  const selectedCustomerEmails = useMemo(() => {
    if (isAllCustomers) return new Set(customers.map((c) => c.email.trim().toLowerCase()));
    return new Set(
      customers
        .filter((c) => customerSel.has(c.email))
        .map((c) => c.email.trim().toLowerCase()),
    );
  }, [customers, customerSel, isAllCustomers]);

  const selectedProductSet = useMemo(() => {
    if (isAllProducts) return new Set(productLabels);
    return new Set(productLabels.filter((l) => productSel.has(l)));
  }, [productLabels, productSel, isAllProducts]);

  const toggleCustomer = (email: string) => {
    setCustomerSel((prev) => {
      // Ha épp "összes" módban vagyunk, indítsuk mindenki más kijelölésével.
      if (prev.size === 0) {
        const next = new Set(customers.map((c) => c.email));
        next.delete(email);
        return next;
      }
      const next = new Set(prev);
      if (next.has(email)) next.delete(email);
      else next.add(email);
      // Ha mind be van jelölve, térjünk vissza "összes" (üres set) módba.
      if (next.size === customers.length) return new Set();
      return next;
    });
  };

  const toggleAllCustomers = () => setCustomerSel(new Set());

  const toggleProduct = (label: string) => {
    setProductSel((prev) => {
      if (prev.size === 0) {
        const next = new Set(productLabels);
        next.delete(label);
        return next;
      }
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      if (next.size === productLabels.length) return new Set();
      return next;
    });
  };

  const toggleAllProducts = () => setProductSel(new Set());

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
    : customerSel.size === 1
      ? `Megrendelői lista – ${customers.find((c) => customerSel.has(c.email))?.name ?? ""}`
      : `Megrendelői lista – ${customerSel.size} megrendelő`;

  const productTitle = isAllProducts
    ? "Termék megrendelői – Összes termék"
    : productSel.size === 1
      ? `Termék megrendelői – ${productSel.values().next().value ?? ""}`
      : `Termék megrendelői – ${productSel.size} termék`;

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
      <button
        type="button"
        className={listExportBtn}
        disabled={!table || exporting !== null}
        onClick={() => runListExport(`${prefix}-xlsx`, base, table)}
      >
        {exporting === `${prefix}-xlsx` ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <FileSpreadsheet className="h-3.5 w-3.5" />
        )}
        Excel
      </button>
      <button
        type="button"
        className={listExportBtn}
        disabled={!table || exporting !== null}
        onClick={() => runListExport(`${prefix}-csv`, base, table)}
      >
        <FileText className="h-3.5 w-3.5" />
        CSV
      </button>
      <button
        type="button"
        className={listExportBtn}
        disabled={!table || exporting !== null}
        onClick={() => runListExport(`${prefix}-xml`, base, table)}
      >
        <FileCode2 className="h-3.5 w-3.5" />
        XML
      </button>
      <button
        type="button"
        className={listExportBtn}
        disabled={!table || exporting !== null}
        onClick={() => runListExport(`${prefix}-pdf`, base, table)}
      >
        {exporting === `${prefix}-pdf` ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <FileDown className="h-3.5 w-3.5" />
        )}
        PDF
      </button>
    </div>
  );

  const customerButtonLabel = isAllCustomers
    ? "Összes megrendelő"
    : customerSel.size === 1
      ? customers.find((c) => customerSel.has(c.email))?.name ?? "1 megrendelő"
      : `${customerSel.size} megrendelő kiválasztva`;

  const productButtonLabel = isAllProducts
    ? "Összes termék"
    : productSel.size === 1
      ? (productSel.values().next().value ?? "1 termék")
      : `${productSel.size} termék kiválasztva`;

  return (
    <section className="mt-14">
      <h2 className="text-xl font-bold text-foreground">Megrendelői és terméklista</h2>
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
    </section>
  );
}


// ---------------- Oldalletöltési statisztikák ----------------

function PageViewStats() {
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
    for (const row of [...counts.product, ...counts.service]) set.add(row.year);
    return [...set].sort((a, b) => b - a);
  }, [counts]);

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
        titleBase="Termék Részletek oldalak letöltései"
        note="Csak a publikált (éles) oldalon mért megnyitások. Minden termék szerepel, akkor is, ha nulla."
        firstColumn="Termék"
        entries={productEntries}
        counts={counts.product}
        years={years}
        fileBase="termek-oldalletoltesek"
        topN={5}
      />

      <PageViewBlock
        titleBase="Szolgáltatás aloldalak letöltései"
        note="Csak a publikált (éles) oldalon mért megnyitások. Minden szolgáltatás szerepel, akkor is, ha nulla."
        firstColumn="Szolgáltatás"
        entries={serviceEntries}
        counts={counts.service}
        years={years}
        fileBase="szolgaltatas-oldalletoltesek"
        topN={3}
      />
    </section>
  );
}

function PageViewBlock({
  titleBase,
  note,
  firstColumn,
  entries,
  counts,
  years,
  fileBase,
  topN,
}: {
  titleBase: string;
  note: string;
  firstColumn: string;
  entries: { key: string; label: string }[];
  counts: PageViewCount[];
  years: number[];
  fileBase: string;
  topN: number;
}) {
  const [exporting, setExporting] = useState<string | null>(null);
  const [yearSel, setYearSel] = useState<number>(new Date().getFullYear());
  const [month, setMonth] = useState<number | "all">("all");
  const year = years.includes(yearSel) ? yearSel : (years[0] ?? new Date().getFullYear());

  const rows = useMemo(() => pivotPageViews(entries, counts, year), [entries, counts, year]);
  const periodLabel = month === "all" ? String(year) : `${year}. ${MONTHS[month] ?? ""}`;
  const title = `${titleBase} – ${periodLabel}`;
  const table = pageViewTable(title, firstColumn, rows, year, month);
  const filename = `xlntbi-${fileBase}-${year}${month === "all" ? "" : `-${month + 1}`}`;
  const btn =
    "inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground transition hover:bg-muted disabled:opacity-60";


  const run = async (id: string, fn: () => void | Promise<void>) => {
    setExporting(id);
    try {
      await fn();
    } finally {
      setExporting(null);
    }
  };

  const monthIndexes = month === "all" ? MONTHS_SHORT.map((_, i) => i) : [month];
  const showTotal = month === "all";

  return (
    <div>
      <h2 className="text-xl font-bold text-foreground">{title}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{note}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          className={btn}
          disabled={exporting !== null}
          onClick={() => run("xlsx", () => exportTableXlsx(`${filename}.xlsx`, String(year), table))}
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
          className={btn}
          disabled={exporting !== null}
          onClick={() => run("csv", () => exportTableCsv(`${filename}.csv`, table))}
        >
          <FileText className="h-4 w-4" />
          CSV
        </button>
        <button
          type="button"
          className={btn}
          disabled={exporting !== null}
          onClick={() => run("xml", () => exportTableXml(`${filename}.xml`, table))}
        >
          <FileCode2 className="h-4 w-4" />
          XML
        </button>
        <button
          type="button"
          className={btn}
          disabled={exporting !== null}
          onClick={() => run("pdf", () => exportTablePdf(`${filename}.pdf`, table))}
        >
          {exporting === "pdf" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <FileDown className="h-4 w-4" />
          )}
          PDF
        </button>
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-border bg-card">
        <table className={`w-full text-sm ${showTotal ? "min-w-[880px]" : "min-w-[420px]"}`}>
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-3 font-semibold">{firstColumn}</th>
              {monthIndexes.map((i) => (
                <th key={i} className="px-2 py-3 text-right font-semibold">
                  {MONTHS_SHORT[i]}
                </th>
              ))}
              {showTotal ? (
                <th className="px-4 py-3 text-right font-semibold">Összesen</th>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.key} className="border-b border-border/60 last:border-0">
                <td className="px-4 py-3 font-medium text-foreground">{row.label}</td>
                {monthIndexes.map((i) => (
                  <td key={i} className="px-2 py-3 text-right text-muted-foreground">
                    {row.months[i] ?? 0}
                  </td>
                ))}
                {showTotal ? (
                  <td className="px-4 py-3 text-right font-semibold text-foreground">
                    {row.total}
                  </td>
                ) : null}
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

      <PageViewChart rows={rows} year={year} month={month} firstColumn={firstColumn} />

      <PageViewTopN rows={rows} month={month} year={year} firstColumn={firstColumn} topN={topN} />
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
  year: number;
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
  const colorOf = (index: number) => PALETTE[index % PALETTE.length] ?? "#14532d";

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
  year: number;
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

  const colorOf = (index: number) => PALETTE[index % PALETTE.length] ?? "#14532d";

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
        <div className="mt-6 flex h-60 items-end gap-1 sm:gap-2">
          {MONTHS_SHORT.map((label, i) => (
            <div key={label} className="flex min-w-0 flex-1 flex-col items-center gap-2">
              <span className="text-xs font-semibold text-foreground">{monthTotals[i]}</span>
              <div className="flex w-full flex-col justify-end" style={{ height: "100%" }}>
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
