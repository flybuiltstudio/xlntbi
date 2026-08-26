import { formatPrice } from "@/lib/products";

export interface StatExportRow {
  productName: string;
  tierLabel: string | null;
  quantity: number;
  totalPrice: number;
  createdAt: string;
  orderNumber?: string;
  billingName?: string;
  email?: string;
}

export function formatDateHu(iso: string) {
  return new Date(iso).toLocaleDateString("hu-HU", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export function slugify(text: string) {
  return (
    text
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "lista"
  );
}

export function paymentLabel(status: string) {
  return status === "paid" ? "Rendezett" : "Fizetésre vár";
}

export const MONTHS = [
  "január", "február", "március", "április", "május", "június",
  "július", "augusztus", "szeptember", "október", "november", "december",
];
export const MONTHS_SHORT = [
  "jan.", "febr.", "márc.", "ápr.", "máj.", "jún.",
  "júl.", "aug.", "szept.", "okt.", "nov.", "dec.",
];
export const PALETTE = [
  "#14532d", "#1d6a3f", "#2c8653", "#3fa46b", "#5bbd87", "#83d1a6",
  "#0f766e", "#14b8a6", "#65a30d", "#a3c94f", "#b45309", "#6d28d9",
];

export function productLabel(row: Pick<StatExportRow, "productName" | "tierLabel">) {
  return row.tierLabel ? `${row.productName} – ${row.tierLabel}` : row.productName;
}

export interface ProductAgg {
  label: string;
  orders: number;
  qty: number;
  revenue: number;
}
export interface MonthAgg {
  month: number;
  orders: number;
  qty: number;
  revenue: number;
  perProduct: Map<string, number>;
}

export function aggregateProducts(rows: StatExportRow[]): ProductAgg[] {
  const map = new Map<string, ProductAgg>();
  for (const row of rows) {
    const label = productLabel(row);
    const entry = map.get(label) ?? { label, orders: 0, qty: 0, revenue: 0 };
    entry.orders += 1;
    entry.qty += row.quantity;
    entry.revenue += row.totalPrice;
    map.set(label, entry);
  }
  return [...map.values()].sort((a, b) => b.qty - a.qty || b.revenue - a.revenue);
}

export function aggregateMonths(rows: StatExportRow[], year: number): MonthAgg[] {
  const months = Array.from({ length: 12 }, (_, month) => ({
    month,
    orders: 0,
    qty: 0,
    revenue: 0,
    perProduct: new Map<string, number>(),
  }));
  for (const row of rows) {
    const date = new Date(row.createdAt);
    if (date.getFullYear() !== year) continue;
    const bucket = months[date.getMonth()];
    if (!bucket) continue;
    bucket.orders += 1;
    bucket.qty += row.quantity;
    bucket.revenue += row.totalPrice;
    const label = productLabel(row);
    bucket.perProduct.set(label, (bucket.perProduct.get(label) ?? 0) + row.quantity);
  }
  return months;
}

export function sumAggs(list: { orders: number; qty: number; revenue: number }[]) {
  return list.reduce(
    (acc, item) => ({
      orders: acc.orders + item.orders,
      qty: acc.qty + item.qty,
      revenue: acc.revenue + item.revenue,
    }),
    { orders: 0, qty: 0, revenue: 0 },
  );
}

export function statYears(rows: StatExportRow[]): number[] {
  const set = new Set<number>();
  for (const row of rows) set.add(new Date(row.createdAt).getFullYear());
  return [...set].sort((a, b) => b - a);
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

// ---------------- CSV ----------------

function csvCell(value: string | number) {
  const s = String(value);
  return /[;"\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function exportStatsCsv(rows: StatExportRow[]) {
  const products = aggregateProducts(rows);
  const pTotals = sumAggs(products);
  const lines: string[] = [];
  lines.push("Termék;Megrendelés (db);Mennyiség (db);Árbevétel (Ft)");
  for (const p of products) {
    lines.push([csvCell(p.label), p.orders, p.qty, p.revenue].join(";"));
  }
  lines.push(["Összesen", pTotals.orders, pTotals.qty, pTotals.revenue].join(";"));
  lines.push("");
  lines.push("Év;Hónap;Megrendelés (db);Mennyiség (db);Árbevétel (Ft)");
  for (const year of statYears(rows)) {
    for (const m of aggregateMonths(rows, year)) {
      lines.push([year, csvCell(MONTHS[m.month] ?? ""), m.orders, m.qty, m.revenue].join(";"));
    }
  }
  downloadBlob(
    new Blob(["\uFEFF" + lines.join("\r\n")], { type: "text/csv;charset=utf-8" }),
    "xlntbi-statisztika.csv",
  );
}

// ---------------- XML ----------------

function xmlEsc(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function exportStatsXml(rows: StatExportRow[]) {
  const products = aggregateProducts(rows);
  const pTotals = sumAggs(products);
  const lines: string[] = [];
  lines.push('<?xml version="1.0" encoding="UTF-8"?>');
  lines.push(
    `<statisztika forras="xlntbi.hu" generalva="${new Date().toISOString()}">`,
  );
  lines.push("  <termek_osszesito>");
  for (const p of products) {
    lines.push(
      `    <termek nev="${xmlEsc(p.label)}" megrendeles_db="${p.orders}" mennyiseg_db="${p.qty}" arbevetel_huf="${p.revenue}" />`,
    );
  }
  lines.push(
    `    <osszesen megrendeles_db="${pTotals.orders}" mennyiseg_db="${pTotals.qty}" arbevetel_huf="${pTotals.revenue}" />`,
  );
  lines.push("  </termek_osszesito>");
  lines.push("  <havi_bontas>");
  for (const year of statYears(rows)) {
    lines.push(`    <ev ev="${year}">`);
    for (const m of aggregateMonths(rows, year)) {
      lines.push(
        `      <honap sorszam="${m.month + 1}" nev="${xmlEsc(MONTHS[m.month] ?? "")}" megrendeles_db="${m.orders}" mennyiseg_db="${m.qty}" arbevetel_huf="${m.revenue}" />`,
      );
    }
    lines.push("    </ev>");
  }
  lines.push("  </havi_bontas>");
  lines.push("</statisztika>");
  downloadBlob(
    new Blob([lines.join("\n")], { type: "application/xml;charset=utf-8" }),
    "xlntbi-statisztika.xml",
  );
}

// ---------------- XLSX ----------------

export async function exportStatsXlsx(rows: StatExportRow[]) {
  const XLSX = await import("xlsx");
  const wb = XLSX.utils.book_new();

  const products = aggregateProducts(rows);
  const pTotals = sumAggs(products);
  const summary = XLSX.utils.aoa_to_sheet([
    ["EXCELlent Business Intelligence – megrendelési statisztika"],
    [],
    ["Termék", "Megrendelés (db)", "Mennyiség (db)", "Árbevétel (Ft)"],
    ...products.map((p) => [p.label, p.orders, p.qty, p.revenue]),
    ["Összesen", pTotals.orders, pTotals.qty, pTotals.revenue],
  ]);
  summary["!cols"] = [{ wch: 46 }, { wch: 16 }, { wch: 15 }, { wch: 16 }];
  XLSX.utils.book_append_sheet(wb, summary, "Összesítő");

  for (const year of statYears(rows)) {
    const months = aggregateMonths(rows, year);
    const mTotals = sumAggs(months);
    const yearProducts = aggregateProducts(
      rows.filter((r) => new Date(r.createdAt).getFullYear() === year),
    );
    const ypTotals = sumAggs(yearProducts);
    const sheet = XLSX.utils.aoa_to_sheet([
      [`${year} – havi bontás`],
      [],
      ["Hónap", "Megrendelés (db)", "Mennyiség (db)", "Árbevétel (Ft)"],
      ...months.map((m) => [MONTHS[m.month] ?? "", m.orders, m.qty, m.revenue]),
      ["Összesen", mTotals.orders, mTotals.qty, mTotals.revenue],
      [],
      [`${year} – termékek`],
      ["Termék", "Megrendelés (db)", "Mennyiség (db)", "Árbevétel (Ft)"],
      ...yearProducts.map((p) => [p.label, p.orders, p.qty, p.revenue]),
      ["Összesen", ypTotals.orders, ypTotals.qty, ypTotals.revenue],
    ]);
    sheet["!cols"] = [{ wch: 46 }, { wch: 16 }, { wch: 15 }, { wch: 16 }];
    XLSX.utils.book_append_sheet(wb, sheet, String(year));
  }

  XLSX.writeFile(wb, "xlntbi-statisztika.xlsx");
}

// ---------------- PDF ----------------

let fontsPromise: Promise<{ regular: string; bold: string }> | null = null;

function arrayBufferToBase64(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

function loadPdfFonts() {
  if (!fontsPromise) {
    fontsPromise = (async () => {
      const [regular, bold] = await Promise.all([
        fetch("/fonts/DejaVuSans.ttf").then((r) => r.arrayBuffer()),
        fetch("/fonts/DejaVuSans-Bold.ttf").then((r) => r.arrayBuffer()),
      ]);
      return { regular: arrayBufferToBase64(regular), bold: arrayBufferToBase64(bold) };
    })();
  }
  return fontsPromise;
}

const BRAND: [number, number, number] = [20, 83, 45];
const INK: [number, number, number] = [35, 35, 35];
const MUTED: [number, number, number] = [110, 110, 110];

export async function exportYearPdf(rows: StatExportRow[], year: number) {
  const [{ jsPDF }, autoTable, fonts] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable").then((m) => m.default),
    loadPdfFonts(),
  ]);

  const doc = new jsPDF({ unit: "mm", format: "a4" });
  doc.addFileToVFS("DejaVuSans.ttf", fonts.regular);
  doc.addFont("DejaVuSans.ttf", "DejaVuSans", "normal");
  doc.addFileToVFS("DejaVuSans-Bold.ttf", fonts.bold);
  doc.addFont("DejaVuSans-Bold.ttf", "DejaVuSans", "bold");

  const pageW = 210;
  const pageH = 297;
  const margin = 14;
  const contentW = pageW - margin * 2;

  const yearRows = rows.filter((r) => new Date(r.createdAt).getFullYear() === year);
  const products = aggregateProducts(yearRows);
  const pTotals = sumAggs(products);
  const months = aggregateMonths(rows, year);
  const mTotals = sumAggs(months);
  const labels = products
    .filter((p) => months.some((m) => (m.perProduct.get(p.label) ?? 0) > 0))
    .map((p) => p.label);

  let y = margin + 2;

  // Fejléc
  doc.setFont("DejaVuSans", "bold");
  doc.setFontSize(15);
  doc.setTextColor(...BRAND);
  doc.text(`Megrendelési statisztika – ${year}`, margin, y);
  y += 6;
  doc.setFont("DejaVuSans", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...MUTED);
  doc.text(
    `EXCELlent Business Intelligence · xlntbi.hu · Készült: ${new Date().toLocaleDateString("hu-HU")}`,
    margin,
    y,
  );
  y += 2.5;
  doc.setDrawColor(...BRAND);
  doc.setLineWidth(0.6);
  doc.line(margin, y, pageW - margin, y);
  y += 6;

  const sectionTitle = (text: string) => {
    doc.setFont("DejaVuSans", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(...BRAND);
    doc.text(text, margin, y);
    y += 2;
  };

  const tableStyles = {
    font: "DejaVuSans",
    fontSize: 8,
    cellPadding: 1.5,
    textColor: INK,
  } as const;

  // Termék táblázat
  sectionTitle(`Megrendelt termékek – ${year}`);
  autoTable(doc, {
    startY: y,
    head: [["Termék", "Megrendelés", "Mennyiség", "Árbevétel"]],
    body: products.map((p) => [
      p.label,
      `${p.orders} db`,
      `${p.qty} db`,
      formatPrice(p.revenue),
    ]),
    foot: [
      ["Összesen", `${pTotals.orders} db`, `${pTotals.qty} db`, formatPrice(pTotals.revenue)],
    ],
    styles: tableStyles,
    headStyles: {
      font: "DejaVuSans",
      fontStyle: "bold",
      fillColor: BRAND,
      textColor: [255, 255, 255],
    },
    footStyles: {
      font: "DejaVuSans",
      fontStyle: "bold",
      fillColor: [231, 240, 233],
      textColor: BRAND,
    },
    alternateRowStyles: { fillColor: [247, 250, 248] },
    columnStyles: {
      1: { halign: "right", cellWidth: 24 },
      2: { halign: "right", cellWidth: 22 },
      3: { halign: "right", cellWidth: 32 },
    },
    margin: { left: margin, right: margin },
    theme: "grid",
    tableLineColor: [220, 228, 222],
    tableLineWidth: 0.2,
  });
  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 7;

  // Havi táblázat
  sectionTitle(`Havi bontás – ${year}`);
  autoTable(doc, {
    startY: y,
    head: [["Hónap", "Megrendelés", "Mennyiség", "Árbevétel"]],
    body: months.map((m) => [
      MONTHS[m.month] ?? "",
      `${m.orders} db`,
      `${m.qty} db`,
      formatPrice(m.revenue),
    ]),
    foot: [
      ["Összesen", `${mTotals.orders} db`, `${mTotals.qty} db`, formatPrice(mTotals.revenue)],
    ],
    styles: tableStyles,
    headStyles: {
      font: "DejaVuSans",
      fontStyle: "bold",
      fillColor: BRAND,
      textColor: [255, 255, 255],
    },
    footStyles: {
      font: "DejaVuSans",
      fontStyle: "bold",
      fillColor: [231, 240, 233],
      textColor: BRAND,
    },
    alternateRowStyles: { fillColor: [247, 250, 248] },
    columnStyles: {
      1: { halign: "right", cellWidth: 24 },
      2: { halign: "right", cellWidth: 22 },
      3: { halign: "right", cellWidth: 32 },
    },
    margin: { left: margin, right: margin },
    theme: "grid",
    tableLineColor: [220, 228, 222],
    tableLineWidth: 0.2,
  });
  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 7;

  // Grafikon (natív vektoros rajzolás, egy oldalra méretezve)
  sectionTitle(`Megrendelt mennyiség havonta (db) – ${year}`);

  const remaining = pageH - margin - y;
  doc.setFont("DejaVuSans", "normal");
  doc.setFontSize(7);
  let legendLines = labels.length > 0 ? 1 : 0;
  let lineW = 0;
  const itemWidths = labels.map((l) => 2.6 + 1.4 + doc.getTextWidth(l) + 5);
  for (const w of itemWidths) {
    if (lineW + w > contentW) {
      legendLines += 1;
      lineW = 0;
    }
    lineW += w;
  }
  const legendH = legendLines * 4.2;
  const chartH = Math.max(26, Math.min(56, remaining - legendH - 9));
  const chartY = y + 3;
  const maxQty = Math.max(1, ...months.map((m) => m.qty));
  const slotW = contentW / 12;
  const barW = Math.min(slotW - 2, 10);
  const topPad = 4.5;

  doc.setDrawColor(210, 210, 210);
  doc.setLineWidth(0.3);
  doc.line(margin, chartY + chartH, pageW - margin, chartY + chartH);

  months.forEach((m, i) => {
    const cx = margin + slotW * i + slotW / 2;
    if (m.qty > 0) {
      let cumH = 0;
      labels.forEach((label, li) => {
        const q = m.perProduct.get(label) ?? 0;
        if (q <= 0) return;
        const h = (q / maxQty) * (chartH - topPad);
        doc.setFillColor(PALETTE[li % PALETTE.length] ?? "#14532d");
        doc.rect(cx - barW / 2, chartY + chartH - cumH - h, barW, h, "F");
        cumH += h;
      });
      doc.setFont("DejaVuSans", "bold");
      doc.setFontSize(6.5);
      doc.setTextColor(...INK);
      doc.text(String(m.qty), cx, chartY + chartH - cumH - 1.4, { align: "center" });
    }
    doc.setFont("DejaVuSans", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(...MUTED);
    doc.text(MONTHS_SHORT[i] ?? "", cx, chartY + chartH + 3.6, { align: "center" });
  });

  // Jelmagyarázat
  let ly = chartY + chartH + 8.5;
  let lx = margin;
  doc.setFontSize(7);
  labels.forEach((label, li) => {
    const w = 2.6 + 1.4 + doc.getTextWidth(label) + 5;
    if (lx + w > pageW - margin) {
      lx = margin;
      ly += 4.2;
    }
    doc.setFillColor(PALETTE[li % PALETTE.length] ?? "#14532d");
    doc.rect(lx, ly - 2.4, 2.6, 2.6, "F");
    doc.setFont("DejaVuSans", "normal");
    doc.setTextColor(...INK);
    doc.text(label, lx + 4, ly);
    lx += w;
  });

  doc.save(`xlntbi-statisztika-${year}.pdf`);
}

// ---------------- Táblázatos listák (megrendelőnként / termékenként) ----------------

export interface ListTable {
  title: string;
  subtitle?: string;
  head: string[];
  body: (string | number)[][];
  foot?: (string | number)[];
  /** Indexek, amelyeket jobbra igazítunk (PDF-ben) */
  rightCols?: number[];
}

export function exportTableCsv(filename: string, table: ListTable) {
  const lines: string[] = [];
  lines.push(table.head.map(csvCell).join(";"));
  for (const row of table.body) lines.push(row.map(csvCell).join(";"));
  if (table.foot) lines.push(table.foot.map(csvCell).join(";"));
  downloadBlob(
    new Blob(["\uFEFF" + lines.join("\r\n")], { type: "text/csv;charset=utf-8" }),
    filename,
  );
}

export function exportTableXml(filename: string, table: ListTable) {
  const lines: string[] = [];
  lines.push('<?xml version="1.0" encoding="UTF-8"?>');
  lines.push(
    `<lista forras="xlntbi.hu" cim="${xmlEsc(table.title)}" generalva="${new Date().toISOString()}">`,
  );
  lines.push("  <oszlopok>");
  for (const h of table.head) lines.push(`    <oszlop>${xmlEsc(h)}</oszlop>`);
  lines.push("  </oszlopok>");
  for (const row of table.body) {
    lines.push("  <sor>");
    row.forEach((cell, i) => {
      lines.push(
        `    <cella oszlop="${xmlEsc(table.head[i] ?? `oszlop_${i + 1}`)}">${xmlEsc(String(cell))}</cella>`,
      );
    });
    lines.push("  </sor>");
  }
  if (table.foot) {
    lines.push("  <osszesen>");
    table.foot.forEach((cell, i) => {
      lines.push(
        `    <cella oszlop="${xmlEsc(table.head[i] ?? `oszlop_${i + 1}`)}">${xmlEsc(String(cell))}</cella>`,
      );
    });
    lines.push("  </osszesen>");
  }
  lines.push("</lista>");
  downloadBlob(
    new Blob([lines.join("\n")], { type: "application/xml;charset=utf-8" }),
    filename,
  );
}

export async function exportTableXlsx(filename: string, sheetName: string, table: ListTable) {
  const XLSX = await import("xlsx");
  const wb = XLSX.utils.book_new();
  const allRows = [
    [table.title],
    table.subtitle ? [table.subtitle] : [],
    [],
    table.head,
    ...table.body,
    ...(table.foot ? [table.foot] : []),
  ] as (string | number)[][];
  const sheet = XLSX.utils.aoa_to_sheet(allRows);
  sheet["!cols"] = table.head.map((h, i) => {
    let w = h.length;
    for (const row of [...table.body, ...(table.foot ? [table.foot] : [])]) {
      const cell = row[i];
      const len = cell == null ? 0 : String(cell).length;
      if (len > w) w = len;
    }
    return { wch: Math.max(12, Math.min(48, w + 3)) };
  });
  XLSX.utils.book_append_sheet(wb, sheet, sheetName.slice(0, 31) || "Lista");
  XLSX.writeFile(wb, filename);
}

export async function exportTablePdf(filename: string, table: ListTable) {
  const [{ jsPDF }, autoTable, fonts] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable").then((m) => m.default),
    loadPdfFonts(),
  ]);

  const doc = new jsPDF({ unit: "mm", format: "a4" });
  doc.addFileToVFS("DejaVuSans.ttf", fonts.regular);
  doc.addFont("DejaVuSans.ttf", "DejaVuSans", "normal");
  doc.addFileToVFS("DejaVuSans-Bold.ttf", fonts.bold);
  doc.addFont("DejaVuSans-Bold.ttf", "DejaVuSans", "bold");

  const pageW = 210;
  const margin = 14;
  let y = margin + 2;

  doc.setFont("DejaVuSans", "bold");
  doc.setFontSize(15);
  doc.setTextColor(...BRAND);
  doc.text(table.title, margin, y);
  y += 6;
  doc.setFont("DejaVuSans", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...MUTED);
  const subtitle =
    (table.subtitle ? `${table.subtitle} · ` : "") +
    `EXCELlent Business Intelligence · xlntbi.hu · Készült: ${new Date().toLocaleDateString("hu-HU")}`;
  doc.text(subtitle, margin, y);
  y += 2.5;
  doc.setDrawColor(...BRAND);
  doc.setLineWidth(0.6);
  doc.line(margin, y, pageW - margin, y);
  y += 5;

  const columnStyles: Record<number, { halign: "right" }> = {};
  for (const i of table.rightCols ?? []) columnStyles[i] = { halign: "right" };

  const fmtCell = (cell: string | number) =>
    typeof cell === "number" ? cell.toLocaleString("hu-HU") : cell;

  autoTable(doc, {
    startY: y,
    head: [table.head],
    body: table.body.map((row) => row.map(fmtCell)),
    ...(table.foot ? { foot: [table.foot.map(fmtCell)] } : {}),
    styles: { font: "DejaVuSans", fontSize: 8, cellPadding: 1.5, textColor: INK },
    headStyles: {
      font: "DejaVuSans",
      fontStyle: "bold",
      fillColor: BRAND,
      textColor: [255, 255, 255],
    },
    footStyles: {
      font: "DejaVuSans",
      fontStyle: "bold",
      fillColor: [231, 240, 233],
      textColor: BRAND,
    },
    alternateRowStyles: { fillColor: [247, 250, 248] },
    columnStyles,
    margin: { left: margin, right: margin, bottom: 12 },
    theme: "grid",
    tableLineColor: [220, 228, 222],
    tableLineWidth: 0.2,
  });

  doc.save(filename);
}

// ---------------- Oldalletöltési statisztika (havi pivot) ----------------

export interface PageViewCount {
  pageKey: string;
  year: number;
  month: number;
  views: number;
}

export interface PageViewPivotRow {
  key: string;
  label: string;
  months: number[]; // 12 elem, január..december
  total: number;
}

/**
 * Minden felsorolt oldalt visszaad (nullás értékkel is), magyar ABC szerint,
 * a megadott évre havi bontásban.
 */
export function pivotPageViews(
  entries: { key: string; label: string }[],
  counts: PageViewCount[],
  year: number,
): PageViewPivotRow[] {
  const rows = entries.map((entry) => ({
    key: entry.key,
    label: entry.label,
    months: Array.from({ length: 12 }, () => 0),
    total: 0,
  }));
  const byKey = new Map(rows.map((row) => [row.key, row]));
  for (const count of counts) {
    if (count.year !== year) continue;
    const row = byKey.get(count.pageKey);
    if (!row) continue;
    const index = count.month - 1;
    if (index < 0 || index > 11) continue;
    row.months[index] = (row.months[index] ?? 0) + count.views;
    row.total += count.views;
  }
  return rows.sort((a, b) => a.label.localeCompare(b.label, "hu"));
}

export function pageViewTable(
  title: string,
  firstColumn: string,
  rows: PageViewPivotRow[],
  year: number,
): ListTable {
  const totals = Array.from({ length: 12 }, (_, i) =>
    rows.reduce((sum, row) => sum + (row.months[i] ?? 0), 0),
  );
  return {
    title,
    subtitle: `${year} – havi bontás`,
    head: [firstColumn, ...MONTHS_SHORT, "Összesen"],
    body: rows.map((row) => [row.label, ...row.months, row.total]),
    foot: ["Összesen", ...totals, totals.reduce((a, b) => a + b, 0)],
    rightCols: Array.from({ length: 13 }, (_, i) => i + 1),
  };
}
