import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ProductOverrideData } from "./product-overrides";

vi.mock("@tanstack/react-start", () => ({
  createServerFn: () => ({ handler: (handler: () => unknown) => handler }),
}));
vi.mock("./product-overrides.server", () => ({ readProductOverrides: vi.fn() }));

import { readProductOverrides } from "./product-overrides.server";
import { applyProductOverrides } from "./product-overrides";
import { getProductOverrides } from "./product-overrides.functions";
import { getProduct } from "./products";

const privatePath = "sajat-termekek/regression-download/program.exe";
const data: ProductOverrideData = {
  content: [], prices: [], categories: [],
  custom: [{
    slug: "regression-download", name: "XLNT Test", tagline: null,
    status: "available", categoryKey: "egyebek", position: 0, imagePath: null,
    intro: [], features: [], why: null, summary: null, metaTitle: null,
    metaDescription: null, introEn: [], featuresEn: [], whyEn: null,
    summaryEn: null, metaTitleEn: null, metaDescriptionEn: null,
    tiers: [{ id: "licenc", label: "Licenc", price: 1000, note: null }],
    downloadFileName: "program.exe", downloadStoragePath: privatePath,
    stripeError: "private Stripe error", updatedAt: "2026-11-09",
  }],
};

beforeEach(() => {
  applyProductOverrides({ content: [], prices: [], custom: [], categories: [] });
  vi.mocked(readProductOverrides).mockResolvedValue(data);
});

describe("public product override reads", () => {
  it("keeps the real download path in the server catalog on cold and repeated page loads", async () => {
    await getProductOverrides();
    expect(getProduct("regression-download")?.download?.storagePath).toBe(privatePath);
    await getProductOverrides();
    expect(getProduct("regression-download")?.download?.storagePath).toBe(privatePath);
  });

  it("never serializes private download paths or Stripe errors to visitors", async () => {
    const publicData = await getProductOverrides();
    expect(publicData.custom[0]?.downloadStoragePath).toBe("protected");
    expect(publicData.custom[0]?.stripeError).toBeNull();
    expect(JSON.stringify(publicData)).not.toContain(privatePath);
    expect(data.custom[0]?.downloadStoragePath).toBe(privatePath);
  });
});