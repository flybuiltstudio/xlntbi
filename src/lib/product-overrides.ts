/**
 * Runtime overrides for product descriptions and license prices.
 *
 * The catalog in `products.ts` stays the source of the default values. When an
 * admin uploads a new Word description or edits a license price, the change is
 * stored in the database and layered on top of the catalog at request time, so
 * the product pages, the product list, the order form and the server-side
 * order/price logic all see the same fresh values (SSR included).
 *
 * The layer is applied by mutating the catalog objects in place: every consumer
 * of `products` / `getProduct()` / `getTier()` picks the override up without
 * further changes. The original values are snapshotted on first apply, so
 * removing an override restores the bundled text and price.
 */

import { products, type Product } from "./products";
import { PRODUCT_SUMMARY_EN } from "./products-en";
import { withXlntPrefix } from "./product-name";

export type ProductContentOverride = {
  slug: string;
  intro: string[];
  features: string[];
  why: string | null;
  summary: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  introEn: string[];
  featuresEn: string[];
  whyEn: string | null;
  summaryEn: string | null;
  metaTitleEn: string | null;
  metaDescriptionEn: string | null;
  sourceFileName: string;
  updatedAt: string;
};

export type ProductPriceOverride = {
  slug: string;
  tierId: string;
  price: number;
};

export type ProductOverrideData = {
  content: ProductContentOverride[];
  prices: ProductPriceOverride[];
};

type Snapshot = {
  intro: string[];
  features: string[];
  why: string | undefined;
  metaTitle: string;
  metaDescription: string;
  price: number;
  tierPrices: Record<string, number>;
  summaryEn: string | undefined;
};

const originals = new Map<string, Snapshot>();
const contentBySlug = new Map<string, ProductContentOverride>();
const priceBySlug = new Map<string, Record<string, number>>();

function snapshotOf(product: Product): Snapshot {
  const existing = originals.get(product.slug);
  if (existing) return existing;
  const snap: Snapshot = {
    intro: [...product.intro],
    features: [...product.features],
    why: product.why,
    metaTitle: product.metaTitle,
    metaDescription: product.metaDescription,
    price: product.price,
    tierPrices: Object.fromEntries(product.tiers.map((t) => [t.id, t.price])),
    summaryEn: PRODUCT_SUMMARY_EN[product.slug],
  };
  originals.set(product.slug, snap);
  return snap;
}

let fingerprint = "";

/** Layers the given overrides onto the catalog (idempotent). */
export function applyProductOverrides(data: ProductOverrideData): void {
  const next = JSON.stringify(data);
  if (next === fingerprint) return;
  fingerprint = next;

  contentBySlug.clear();
  priceBySlug.clear();
  for (const row of data.content) contentBySlug.set(row.slug, row);
  for (const row of data.prices) {
    const map = priceBySlug.get(row.slug) ?? {};
    map[row.tierId] = row.price;
    priceBySlug.set(row.slug, map);
  }

  for (const product of products) {
    const snap = snapshotOf(product);

    // 1) restore the bundled values, so removed overrides revert cleanly
    product.intro = [...snap.intro];
    product.features = [...snap.features];
    if (snap.why === undefined) delete product.why;
    else product.why = snap.why;
    product.metaTitle = snap.metaTitle;
    product.metaDescription = snap.metaDescription;
    for (const tier of product.tiers) {
      const original = snap.tierPrices[tier.id];
      if (typeof original === "number") tier.price = original;
    }
    product.price = snap.price;
    if (snap.summaryEn === undefined) delete PRODUCT_SUMMARY_EN[product.slug];
    else PRODUCT_SUMMARY_EN[product.slug] = snap.summaryEn;

    // 2) layer the description override
    const content = contentBySlug.get(product.slug);
    if (content) {
      if (content.intro.length) product.intro = [...content.intro];
      if (content.features.length) product.features = [...content.features];
      if (content.why) product.why = content.why;
      if (content.metaTitle) product.metaTitle = withXlntPrefix(content.metaTitle);
      if (content.metaDescription) product.metaDescription = content.metaDescription;
      if (content.summaryEn) PRODUCT_SUMMARY_EN[product.slug] = content.summaryEn;
    }

    // 3) layer the price overrides
    const prices = priceBySlug.get(product.slug);
    if (prices) {
      for (const tier of product.tiers) {
        const override = prices[tier.id];
        if (typeof override === "number" && override > 0) tier.price = override;
      }
      product.price = product.tiers[0]?.price ?? product.price;
    }
  }
}

/** Short Hungarian card summary: override first, otherwise the intro. */
export function productSummaryHu(product: Product): string {
  return contentBySlug.get(product.slug)?.summary ?? product.intro[0] ?? "";
}

/** English detail content for a product, when an override supplied one. */
export function englishProductContent(
  slug: string,
): { intro: string[]; features: string[]; why: string | null } | null {
  const row = contentBySlug.get(slug);
  if (!row) return null;
  if (!row.introEn.length && !row.featuresEn.length && !row.whyEn) return null;
  return { intro: row.introEn, features: row.featuresEn, why: row.whyEn };
}

/** Catalog price of a tier before any override (used by the admin panel). */
export function catalogTierPrice(slug: string, tierId: string): number | null {
  const snap = originals.get(slug);
  const value = snap?.tierPrices[tierId];
  return typeof value === "number" ? value : null;
}

/** Meta title/description shown for a product, override-aware. */
export function productMetaTitle(slug: string, fallback: string): string {
  const row = contentBySlug.get(slug);
  return row?.metaTitle ? withXlntPrefix(row.metaTitle) : fallback;
}

export function productMetaDescription(slug: string, fallback: string): string {
  return contentBySlug.get(slug)?.metaDescription ?? fallback;
}

/** Price of a product's tier (default tier when `tierId` is null). */
export function productTierPrice(
  slug: string,
  tierId: string | null,
  fallback: number,
): number {
  const prices = priceBySlug.get(slug);
  if (!prices) return fallback;
  if (tierId) return prices[tierId] ?? fallback;
  const product = products.find((p) => p.slug === slug);
  const firstTier = product?.tiers[0]?.id;
  return (firstTier ? prices[firstTier] : undefined) ?? fallback;
}
