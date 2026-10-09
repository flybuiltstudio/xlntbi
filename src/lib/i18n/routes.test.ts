import { describe, expect, it } from "vitest";
import { STATIC_CALCULATORS } from "../calculators/order";
import { counterpartPath } from "./routes";

describe("calculator language switching", () => {
  it.each(STATIC_CALCULATORS)("switches $key in both directions", ({ huPath, enPath }) => {
    expect(counterpartPath(huPath, "en")).toBe(enPath);
    expect(counterpartPath(enPath, "hu")).toBe(huPath);
    expect(counterpartPath(huPath, "hu")).toBe(huPath);
    expect(counterpartPath(enPath, "en")).toBe(enPath);
  });

  it("switches future admin-uploaded calculators without a static entry", () => {
    expect(counterpartPath("/kalkulatorok/uj-feltoltott-kalkulator", "en"))
      .toBe("/en/calculators/uj-feltoltott-kalkulator");
    expect(counterpartPath("/en/calculators/uj-feltoltott-kalkulator", "hu"))
      .toBe("/kalkulatorok/uj-feltoltott-kalkulator");
  });
});