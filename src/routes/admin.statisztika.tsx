import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import {
  Download,
  FileCode2,
  FileDown,
  FileSpreadsheet,
  FileText,
  Loader2,
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
          Megrendelt termékek összesítve, éves és havi bontásban. Minden megrendelés számít
          (rendezett és fizetésre váró egyaránt).
        </p>
        <StatsPanel />
      </div>
    </>
  );
}

function StatsPanel() {
  const load = useServerFn(adminOrderStats);
  const [rows, setRows] = useState<StatRow[] | null>(null);
  const [error, setError] = useState("");
  const [year, setYear] = useState<number | null>(null);
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

  const products = useMemo(() => {
    const map = new Map<string, { label: string; orders: number; qty: number; revenue: number }>();
    for (const row of rows ?? []) {
      const label = productLabel(row);
      const entry = map.get(label) ?? { label, orders: 0, qty: 0, revenue: 0 };
      entry.orders += 1;
      entry.qty += row.quantity;
      entry.revenue += row.totalPrice;
      map.set(label, entry);
    }
    return [...map.values()].sort((a, b) => b.qty - a.qty || b.revenue - a.revenue);
  }, [rows]);

  const totals = useMemo(
    () =>
      products.reduce(
        (acc, p) => ({
          orders: acc.orders + p.orders,
          qty: acc.qty + p.qty,
          revenue: acc.revenue + p.revenue,
        }),
        { orders: 0, qty: 0, revenue: 0 },
      ),
    [products],
  );

  const years = useMemo(() => {
    const set = new Set<number>();
    for (const row of rows ?? []) set.add(new Date(row.createdAt).getFullYear());
    return [...set].sort((a, b) => b - a);
  }, [rows]);

  const activeYear = year ?? years[0] ?? new Date().getFullYear();

  const monthly = useMemo(() => {
    const months = Array.from({ length: 12 }, (_, month) => ({
      month,
      orders: 0,
      qty: 0,
      revenue: 0,
      perProduct: new Map<string, number>(),
    }));
    for (const row of rows ?? []) {
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
    const labels = products
      .map((p) => p.label)
      .filter((label) => months.some((m) => m.perProduct.has(label)));
    const yearTotals = months.reduce(
      (acc, m) => ({
        orders: acc.orders + m.orders,
        qty: acc.qty + m.qty,
        revenue: acc.revenue + m.revenue,
      }),
      { orders: 0, qty: 0, revenue: 0 },
    );
    return { months, labels, yearTotals };
  }, [rows, products, activeYear]);

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
          {/* Exportálás */}
          <div className="mb-10 flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card px-4 py-3">
            <span className="mr-1 inline-flex items-center gap-1.5 text-sm font-semibold text-foreground">
              <Download className="h-4 w-4 text-primary" />
              Exportálás:
            </span>
            <button
              type="button"
              className={exportBtn}
              disabled={exporting !== null}
              onClick={() => runExport("xlsx", () => exportStatsXlsx(rows))}
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
              onClick={() => runExport("csv", () => exportStatsCsv(rows))}
            >
              <FileText className="h-4 w-4" />
              CSV
            </button>
            <button
              type="button"
              className={exportBtn}
              disabled={exporting !== null}
              onClick={() => runExport("xml", () => exportStatsXml(rows))}
            >
              <FileCode2 className="h-4 w-4" />
              XML
            </button>
            <button
              type="button"
              className={exportBtn}
              disabled={exporting !== null}
              onClick={() => runExport("pdf", () => exportYearPdf(rows, activeYear))}
            >
              {exporting === "pdf" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileDown className="h-4 w-4" />
              )}
              PDF – {activeYear}
            </button>
            <span className="w-full text-xs text-muted-foreground">
              A PDF a kiválasztott év ({activeYear}) táblázatait és a grafikont tartalmazza,
              egyetlen oldalon.
            </span>
          </div>

          {/* Termék-összesítő táblázat, csökkenő sorrendben */}
          <section>
            <h2 className="text-xl font-bold text-foreground">Megrendelt termékek – összesítve</h2>
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
                    <td className="px-4 py-3 text-right">{totals.orders} db</td>
                    <td className="px-4 py-3 text-right">{totals.qty} db</td>
                    <td className="px-4 py-3 text-right">{formatPrice(totals.revenue)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </section>

          {/* Éves / havi grafikon */}
          <section className="mt-14">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-bold text-foreground">Havi bontás grafikonon</h2>
              <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Év választó">
                {years.map((y) => (
                  <button
                    key={y}
                    type="button"
                    role="tab"
                    aria-selected={y === activeYear}
                    onClick={() => setYear(y)}
                    className={`rounded-md px-4 py-1.5 text-sm font-semibold transition-colors ${
                      y === activeYear
                        ? "bg-primary text-primary-foreground"
                        : "border border-input text-muted-foreground hover:bg-accent hover:text-foreground"
                    }`}
                  >
                    {y}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-border bg-card p-5 sm:p-6">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">{activeYear}</strong> – megrendelt mennyiség
                havonta (db)
              </p>

              <div className="mt-6 flex h-60 items-end gap-1 sm:gap-2">
                {monthly.months.map((m) => (
                  <div key={m.month} className="flex min-w-0 flex-1 flex-col items-center gap-2">
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
                  {monthly.months.map((m) => (
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
                    <td className="px-4 py-3">Összesen</td>
                    <td className="px-4 py-3 text-right">{monthly.yearTotals.orders} db</td>
                    <td className="px-4 py-3 text-right">{monthly.yearTotals.qty} db</td>
                    <td className="px-4 py-3 text-right">
                      {formatPrice(monthly.yearTotals.revenue)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
