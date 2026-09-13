/**
 * Admin-uploaded standalone calculators.
 *
 * The bundled calculators stay in `src/lib/calculators/*`; calculators created
 * on the admin "Termékek és Kalkulátorok" page live in the
 * `custom_calculators` table and are served at /kalkulatorok/<slug> (HU) and
 * /en/calculators/<slug> (EN) — same slug on both languages, like products.
 */

export type CustomCalculatorDraft = {
  slug: string;
  nameHu: string;
  nameEn: string;
  introHu: string;
  introEn: string;
  metaTitleHu: string;
  metaDescriptionHu: string;
  metaTitleEn: string;
  metaDescriptionEn: string;
  htmlHu: string;
  scriptHu: string;
  htmlEn: string;
  scriptEn: string;
};

export type CustomCalculatorCard = {
  slug: string;
  name: string;
  position: number;
};

/** Public URL of a custom calculator's card image (served from private storage). */
export function customCalculatorImageUrl(slug: string, lang: "hu" | "en"): string {
  return `/api/public/kalkulator-kep/${slug}?lang=${lang}`;
}

/** Storage folder of a custom calculator's assets. */
export function customCalculatorFolder(slug: string): string {
  return `sajat-kalkulatorok/${slug}`;
}

/** URL-safe slug from a Hungarian calculator name. */
export function slugifyCalculator(name: string): string {
  const map: Record<string, string> = {
    á: "a", é: "e", í: "i", ó: "o", ö: "o", ő: "o", ú: "u", ü: "u", ű: "u",
    Á: "a", É: "e", Í: "i", Ó: "o", Ö: "o", Ő: "o", Ú: "u", Ü: "u", Ű: "u",
  };
  return name
    .split("")
    .map((ch) => map[ch] ?? ch)
    .join("")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export const MAX_CALCULATOR_HTML_BYTES = 5 * 1024 * 1024;
