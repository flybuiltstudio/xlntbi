import { describe, expect, it } from "vitest";

import { hasXlntPrefix, withXlntPrefix } from "./product-name";

describe("withXlntPrefix", () => {
  it("prefixes a plain name", () => {
    expect(withXlntPrefix("Beszámoló")).toBe("XLNT Beszámoló");
  });

  it("does not double the prefix", () => {
    expect(withXlntPrefix("XLNT Beszámoló")).toBe("XLNT Beszámoló");
  });

  it("normalizes casing and extra whitespace", () => {
    expect(withXlntPrefix("xlnt  Beszámoló")).toBe("XLNT Beszámoló");
    expect(withXlntPrefix("  Xlnt Bérszámfejtő ")).toBe("XLNT Bérszámfejtő");
  });

  it("keeps names that only start with a similar word", () => {
    expect(withXlntPrefix("XLNTBI riport")).toBe("XLNT XLNTBI riport");
  });

  it("handles empty input", () => {
    expect(withXlntPrefix("")).toBe("");
    expect(withXlntPrefix(null)).toBe("");
    expect(withXlntPrefix(undefined)).toBe("");
  });

  it("detects the prefix", () => {
    expect(hasXlntPrefix("XLNT Devizabank")).toBe(true);
    expect(hasXlntPrefix("Devizabank")).toBe(false);
  });
});

describe("catalog", () => {
  it("every product name in products.ts is prefixed", async () => {
    const { readFileSync } = await import("node:fs");
    const source = readFileSync(
      new URL("./products.ts", import.meta.url).pathname,
      "utf8",
    );
    // Only top-level product `name:` fields (2-space indent inside the array).
    const names = [...source.matchAll(/^ {4}name: "([^"]+)",$/gm)].map((m) => m[1]);
    expect(names.length).toBeGreaterThan(20);
    expect(names.filter((n) => !hasXlntPrefix(n))).toEqual([]);
  });
});

describe("catalog and Stripe naming", () => {
  it("every catalog product name and meta title is prefixed", async () => {
    const { products } = await import("./products");
    for (const product of products) {
      expect(hasXlntPrefix(product.name)).toBe(true);
      expect(hasXlntPrefix(product.metaTitle)).toBe(true);
    }
  });

  it("the Stripe name target of every price is prefixed and stable", async () => {
    const { catalogNameTargets } = await import("./stripe-product-names.server");
    const targets = catalogNameTargets();
    expect(targets.length).toBeGreaterThan(0);
    const seen = new Set<string>();
    for (const target of targets) {
      expect(hasXlntPrefix(target.desiredName)).toBe(true);
      // Idempotent: running the normalizer again changes nothing.
      expect(withXlntPrefix(target.desiredName)).toBe(target.desiredName);
      expect(seen.has(target.priceId)).toBe(false);
      seen.add(target.priceId);
    }
  });
});
