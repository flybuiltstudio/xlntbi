/**
 * Admin-created products and categories.
 *
 * The bundled catalog in `products.ts` stays the source of the original
 * products. Anything the admin creates on the "Friss verzió" page lives in the
 * database and is layered onto the catalog at request time (see
 * `product-overrides.ts`), so the Hungarian and English product pages, the
 * product list, the order form and the payment flow all see it — SSR included.
 */

export type CustomTier = {
  id: string;
  label: string;
  price: number;
  note: string | null;
};

export type CustomProductRow = {
  slug: string;
  name: string;
  tagline: string | null;
  status: "available" | "coming_soon";
  categoryKey: string;
  position: number;
  imagePath: string | null;
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
  tiers: CustomTier[];
  downloadFileName: string | null;
  downloadStoragePath: string | null;
  stripeError: string | null;
  updatedAt: string;
};

export type CustomCategoryRow = {
  key: string;
  title: string;
  titleEn: string;
  sortOrder: number;
};

/** Public URL of an admin-uploaded product image (served from private storage). */
export function customProductImageUrl(slug: string): string {
  return `/api/public/termek-kep/${slug}`;
}

/** Storage folder of a custom product's downloadable file. */
export function customProductFolder(slug: string): string {
  return `sajat-termekek/${slug}`;
}

/** Stripe price lookup key of one licence tier. */
export function customPriceId(slug: string, tierId: string): string {
  return `${slug}_${tierId}`.replace(/-/g, "_").toLowerCase();
}

/** URL-safe slug from a Hungarian product name. */
export function slugifyName(name: string): string {
  const map: Record<string, string> = {
    á: "a", é: "e", í: "i", ó: "o", ö: "o", ő: "o", ú: "u", ü: "u", ű: "u",
    Á: "a", É: "e", Í: "i", Ó: "o", Ö: "o", Ő: "o", Ú: "u", Ü: "u", Ű: "u",
  };
  return name
    .split("")
    .map((ch) => map[ch] ?? ch)
    .join("")
    .toLowerCase()
    .replace(/xlnt/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}
