import { describe, expect, it, vi } from "vitest";
import { servicePageItems } from "./services";
import { pivotPageViews, pageViewTable } from "./stats-export";

vi.mock("./products", () => ({ getProduct: () => undefined }));
import { servedPageTarget } from "./page-views.server";

const expectedPaths = [
  "/konyveles", "/en/bookkeeping",
  "/ev-konyveles", "/en/sole-trader-bookkeeping",
  "/adotanacsadas", "/en/tax-advisory",
  "/fintech-es-bi", "/en/fintech-and-bi",
  "/kontrolling", "/en/controlling",
  "/cegaudit", "/en/company-audit",
  "/konyvvizsgalat", "/en/statutory-audit",
  "/konyveloiroda-audit", "/en/accounting-firm-audit",
  "/digitalis-idomegtakaritasi-audit", "/en/digital-time-saving-audit",
];
const entries = servicePageItems.map((item) => ({ key: item.to, label: item.label }));

describe("service views from recording through admin exports", () => {
  it("lists all 18 distinct HU/EN service pages without replacing stored keys", () => {
    expect(entries.map((item) => item.key).sort()).toEqual([...expectedPaths].sort());
    expect(new Set(entries.map((item) => item.key)).size).toBe(18);
  });

  it.each(expectedPaths)("keeps recorded views for %s in the monthly report and export", (path) => {
    const target = servedPageTarget(path);
    expect(target).toEqual({ pageType: "service", pageKey: path });
    if (!target) throw new Error("Service page must resolve");
    const counts = [
      { pageKey: target.pageKey, year: 2026, month: 10, views: 3 },
      { pageKey: target.pageKey, year: 2026, month: 11, views: 7 },
      { pageKey: target.pageKey, year: 2025, month: 11, views: 99 },
    ];
    const rows = pivotPageViews(entries, counts, 2026);
    const row = rows.find((item) => item.key === path);
    expect(row?.months[9]).toBe(3);
    expect(row?.months[10]).toBe(7);
    expect(row?.total).toBe(10);
    const exported = pageViewTable("Services", "Service", rows, 2026, 10);
    expect(exported.foot?.[1]).toBe(7);
    expect(exported.body.reduce((sum, cells) => sum + Number(cells[1]), 0)).toBe(7);
  });
});