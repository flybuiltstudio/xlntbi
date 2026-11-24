import { describe, expect, it } from "vitest";
import { requiresCountedDocument } from "./page-view-navigation";
import { serviceItems } from "./services";
import { ROUTE_PAIRS } from "./i18n/routes";

describe("counted document navigation", () => {
  it.each(["/termek/berszamfejto", "/en/product/berszamfejto", "/termek/admin-added-product"])(
    "requests a countable document when entering %s from a listing", (path) => {
      expect(requiresCountedDocument(path, "/termekeim")).toBe(true);
    },
  );

  it.each(serviceItems.map((item) => item.to))("requests a document for service %s", (path) => {
    expect(requiresCountedDocument(path, "/")).toBe(true);
  });

  it.each(ROUTE_PAIRS.filter((pair) => serviceItems.some((item) => item.to === pair.hu)).map((pair) => pair.en))(
    "also requests a document for the English service %s", (path) => {
      expect(requiresCountedDocument(path, "/en")).toBe(true);
    },
  );

  it("counts navigation between two different product pages", () => {
    expect(requiresCountedDocument("/termek/berszamfejto", "/termek/rlb-bank-konverter")).toBe(true);
  });

  it.each(["/termek/berszamfejto", "/ev-konyveles", "/en/sole-trader-bookkeeping"])(
    "keeps same-page anchors and search changes client-side on %s", (path) => {
      expect(requiresCountedDocument(path, path)).toBe(false);
      expect(requiresCountedDocument(`${path}/`, path)).toBe(false);
    },
  );

  it.each(["/termekeim", "/en/products", "/megrendeles", "/konzultacio", "/admin/statisztika", "/api/public/test", "/termek/test/extra"])(
    "preserves client navigation for uncounted destination %s", (path) => {
      expect(requiresCountedDocument(path, "/")).toBe(false);
    },
  );
});