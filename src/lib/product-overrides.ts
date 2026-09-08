/**
 * Runtime overrides for product descriptions, license prices, admin-created
 * products and admin-managed categories.
 *
 * The catalog in `products.ts` stays the source of the default values. When an
 * admin uploads a new Word description, edits a license price or creates a new
 * product, the change is stored in the database and layered on top of the
 * catalog at request time, so the product pages, the product list, the order
 * form and the server-side order/price logic all see the same fresh values
 * (SSR included).
 *
 * The layer is applied by mutating the catalog objects in place: every consumer
 * of `products` / `getProduct()` / `getTier()` picks the override up without
 * further changes. The original values are snapshotted on first apply, so
 * removing an override restores the bundled text, price and category.
 */

import { products, type Product } from "./products";
import { PRODUCT_SUMMARY_EN } from "./products-en";
import { withXlntPrefix } from "./product-name";
import { productCategories, type ProductCategory } from "./product-categories";
import {
  customPriceId,
  customProductImageUrl,
  type CustomCategoryRow,
  type CustomProductRow,
} from "./custom-products";
import fallbackImg from "@/assets/kategoriak/egyebek.jpg";

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
  custom: CustomProductRow[];
  categories: CustomCategoryRow[];
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
const customBySlug = new Map<string, CustomProductRow>();

let bundledCategories: ProductCategory[] | null = null;

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

/** Turns a database row into a catalog product object. */
function toProduct(row: CustomProductRow): Product {
  const tiers = row.tiers.map((tier) => ({
    id: tier.id,
    label: tier.label,
    price: tier.price,
    priceId: customPriceId(row.slug, tier.id),
    ...(tier.note ? { note: tier.note } : {}),
  }));
  const product: Product = {
    slug: row.slug,
    priceId: tiers[0]?.priceId ?? customPriceId(row.slug, "licenc"),
    name: row.name,
    status: row.status,
    price: tiers[0]?.price ?? 0,
    currency: "HUF",
    image: row.imagePath ? customProductImageUrl(row.slug) : fallbackImg,
    metaTitle: withXlntPrefix(row.metaTitle ?? row.name),
    metaDescription: row.metaDescription ?? row.summary ?? row.intro[0] ?? row.name,
    intro: [...row.intro],
    features: [...row.features],
    tiers,
  };
  if (row.tagline) product.tagline = row.tagline;
  if (row.why) product.why = row.why;
  if (row.downloadFileName && row.downloadStoragePath) {
    product.download = {
      fileName: row.downloadFileName,
      storagePath: row.downloadStoragePath,
    };
  }
  return product;
}

/** Rebuilds the category list: bundled categories + admin changes. */
function applyCategories(
  categories: CustomCategoryRow[],
  custom: CustomProductRow[],
): void {
  if (!bundledCategories) {
    bundledCategories = productCategories.map((c) => ({ ...c, slugs: [...c.slugs] }));
  }
  const next: ProductCategory[] = bundledCategories.map((c) => ({
    ...c,
    slugs: [...c.slugs],
  }));
  const order = new Map<string, number>();

  for (const row of categories) {
    const existing = next.find((c) => c.key === row.key);
    if (existing) {
      existing.title = row.title;
      existing.titleEn = row.titleEn;
    } else {
      next.push({
        key: row.key,
        title: row.title,
        titleEn: row.titleEn,
        image: fallbackImg,
        slugs: [],
      });
    }
    order.set(row.key, row.sortOrder);
  }

  for (const row of [...custom].sort((a, b) => a.position - b.position)) {
    const target = next.find((c) => c.key === row.categoryKey) ?? next[next.length - 1];
    if (!target) continue;
    const index = Math.max(0, Math.min(row.position, target.slugs.length));
    target.slugs.splice(index, 0, row.slug);
  }

  if (order.size) {
    next.sort((a, b) => {
      const ra = order.get(a.key) ?? Number.MAX_SAFE_INTEGER;
      const rb = order.get(b.key) ?? Number.MAX_SAFE_INTEGER;
      return ra - rb;
    });
  }

  productCategories.length = 0;
  productCategories.push(...next);
}

let fingerprint = "";

/** Layers the given overrides onto the catalog (idempotent). */
export function applyProductOverrides(data: ProductOverrideData): void {
  const next = JSON.stringify(data);
  if (next === fingerprint) return;
  fingerprint = next;

  contentBySlug.clear();
  priceBySlug.clear();
  customBySlug.clear();
  for (const row of data.content) contentBySlug.set(row.slug, row);
  for (const row of data.prices) {
    const map = priceBySlug.get(row.slug) ?? {};
    map[row.tierId] = row.price;
    priceBySlug.set(row.slug, map);
  }
  for (const row of data.custom) customBySlug.set(row.slug, row);

  // admin-created products: replace the previously injected set
  for (let i = products.length - 1; i >= 0; i -= 1) {
    if (injected.has(products[i]!.slug)) products.splice(i, 1);
  }
  for (const row of data.custom) {
    injected.add(row.slug);
    products.push(toProduct(row));
  }

  applyCategories(data.categories, data.custom);

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

    // 3) English summary of an admin-created product
    const custom = customBySlug.get(product.slug);
    if (custom?.summaryEn) PRODUCT_SUMMARY_EN[product.slug] = custom.summaryEn;

    // 4) layer the price overrides
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

const injected = new Set<string>();

function isInjected(slug: string): boolean {
  return injected.has(slug);
}

/** Short Hungarian card summary: override first, otherwise the intro. */
export function productSummaryHu(product: Product): string {
  return (
    contentBySlug.get(product.slug)?.summary ??
    customBySlug.get(product.slug)?.summary ??
    product.intro[0] ??
    ""
  );
}

/** English detail content for a product, when a translation exists. */
export function englishProductContent(
  slug: string,
): { intro: string[]; features: string[]; why: string | null } | null {
  const custom = customBySlug.get(slug);
  if (custom && (custom.introEn.length || custom.featuresEn.length || custom.whyEn)) {
    return { intro: custom.introEn, features: custom.featuresEn, why: custom.whyEn };
  }
  const row = contentBySlug.get(slug);
  if (!row) return null;
  if (!row.introEn.length && !row.featuresEn.length && !row.whyEn) return null;
  return { intro: row.introEn, features: row.featuresEn, why: row.whyEn };
}

/** English meta title / description for a product, when a translation exists. */
export function englishProductMeta(
  slug: string,
): { title: string | null; description: string | null } {
  const custom = customBySlug.get(slug);
  if (custom && (custom.metaTitleEn || custom.metaDescriptionEn)) {
    return { title: custom.metaTitleEn, description: custom.metaDescriptionEn };
  }
  const row = contentBySlug.get(slug);
  return { title: row?.metaTitleEn ?? null, description: row?.metaDescriptionEn ?? null };
}

/** True when the product was created by an admin (not part of the bundle). */
export function isCustomProduct(slug: string): boolean {
  return customBySlug.has(slug);
}

/** Every admin-created product row (admin panel + sitemap). */
export function customProductRows(): CustomProductRow[] {
  return [...customBySlug.values()];
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
