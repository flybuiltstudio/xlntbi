import { describe, expect, it } from "vitest";
import {
  couponInvoiceLineName,
  describeDiscountRule,
  formatHuf,
  formatMinorAsHuf,
  hufToMinor,
  minorToHuf,
  parseHufInput,
} from "./coupon-amount";

describe("parseHufInput (admin -> Stripe)", () => {
  it("converts whole forints to minor units", () => {
    expect(parseHufInput("5000")).toEqual({ ok: true, minor: 500000, huf: 5000 });
  });

  it("accepts two decimals with comma or dot", () => {
    expect(parseHufInput("1234,56")).toMatchObject({ ok: true, minor: 123456 });
    expect(parseHufInput("1234.5")).toMatchObject({ ok: true, minor: 123450 });
  });

  it("accepts thousand separators", () => {
    expect(parseHufInput("1 000")).toMatchObject({ ok: true, minor: 100000 });
    expect(parseHufInput("1.000")).toMatchObject({ ok: true, minor: 100000 });
  });

  it("rejects more than two decimals", () => {
    const res = parseHufInput("5000,555");
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error).toContain("két tizedesjeggyel");
  });

  it("rejects non-numeric, empty, zero and negative input", () => {
    for (const bad of ["", "abc", "5e3", "5000 Ft", "0", "-100"]) {
      expect(parseHufInput(bad).ok).toBe(false);
    }
  });
});

describe("minor <-> huf round trip", () => {
  it("is stable in both directions", () => {
    for (const huf of [1, 999, 5000, 24900, 149900, 1234.56]) {
      expect(minorToHuf(hufToMinor(huf))).toBe(huf);
    }
  });
});

describe("display formatting (list, CSV, usage log)", () => {
  it("prints minor units as forint, never 100x", () => {
    expect(formatMinorAsHuf(500000)).toBe("5000 Ft".replace("5000", (5000).toLocaleString("hu-HU")));
    expect(formatMinorAsHuf(500000)).not.toContain("500 000 000");
    expect(formatMinorAsHuf(null)).toBe("—");
  });

  it("keeps fillér precision when present", () => {
    expect(formatMinorAsHuf(123456).replace(/\u00A0|\s/g, "")).toBe("1234,56Ft");
  });

  it("formats plain forint amounts", () => {
    expect(formatHuf(24900).replace(/\u00A0|\s/g, "")).toBe("24900Ft");
  });
});

describe("describeDiscountRule", () => {
  it("handles percent and fixed HUF coupons", () => {
    expect(describeDiscountRule({ percent_off: 20 })).toBe("20%");
    expect(
      describeDiscountRule({ amount_off: 500000, currency: "huf" })!.replace(/\u00A0|\s/g, ""),
    ).toBe("5000Ft");
    expect(describeDiscountRule(null)).toBeNull();
  });
});

describe("couponInvoiceLineName (Billingo)", () => {
  it("shows the coupon code and the negative forint amount", () => {
    const label = couponInvoiceLineName("NYAR10", 5000).replace(/\u00A0|\s/g, "");
    expect(label).toBe("Kuponkedvezmény(NYAR10):-5000Ft");
  });

  it("falls back without a code", () => {
    expect(couponInvoiceLineName(null, 1000)).toContain("Kuponkedvezmény:");
  });
});
