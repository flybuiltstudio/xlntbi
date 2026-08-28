import { describe, expect, it } from "vitest";

import { products } from "./product-name-fixtures";
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
  it("every product name is prefixed", () => {
    const missing = products.filter((p) => !hasXlntPrefix(p.name)).map((p) => p.name);
    expect(missing).toEqual([]);
  });
});
