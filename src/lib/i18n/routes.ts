/**
 * Hungarian <-> English route mapping.
 * Hungarian paths are the canonical default language and never change.
 * English pages live under the /en prefix with descriptive English slugs.
 */

export const LANGS = ["hu", "en"] as const;
export type Lang = (typeof LANGS)[number];

export const DEFAULT_LANG: Lang = "hu";

export type RoutePair = { hu: string; en: string };

export const ROUTE_PAIRS: RoutePair[] = [
  { hu: "/", en: "/en" },
  { hu: "/szolgaltatasaim", en: "/en/services" },
  { hu: "/konyveles", en: "/en/bookkeeping" },
  { hu: "/ev-konyveles", en: "/en/sole-trader-bookkeeping" },
  { hu: "/adotanacsadas", en: "/en/tax-advisory" },
  { hu: "/fintech-es-bi", en: "/en/fintech-and-bi" },
  { hu: "/kontrolling", en: "/en/controlling" },
  { hu: "/cegaudit", en: "/en/company-audit" },
  { hu: "/konyvvizsgalat", en: "/en/statutory-audit" },
  { hu: "/konyveloiroda-audit", en: "/en/accounting-firm-audit" },
  { hu: "/digitalis-idomegtakaritasi-audit", en: "/en/digital-time-saving-audit" },
  { hu: "/kalkulatorok", en: "/en/calculators" },
  { hu: "/kalkulatorok/berteszt", en: "/en/calculators/salary-test" },
  { hu: "/kalkulatorok/jovedelemado", en: "/en/calculators/income-tax" },
  { hu: "/kalkulatorok/atalanyado", en: "/en/calculators/flat-rate-tax" },
  { hu: "/kalkulatorok/szamla-datumok", en: "/en/calculators/invoice-dates" },
  { hu: "/termekeim", en: "/en/products" },
  { hu: "/oktatas", en: "/en/training" },
  { hu: "/rolam", en: "/en/about" },
  { hu: "/kapcsolat", en: "/en/contact" },
  { hu: "/konzultacio", en: "/en/consultation" },
  { hu: "/impresszum", en: "/en/imprint" },
  { hu: "/adatvedelmi-tajekoztato", en: "/en/privacy-policy" },
  { hu: "/cookie-tajekoztato", en: "/en/cookie-policy" },
  { hu: "/aszf", en: "/en/terms" },
  { hu: "/elallas-a-szerzodestol", en: "/en/right-of-withdrawal" },
  { hu: "/fizetes-es-teljesites", en: "/en/payment-and-delivery" },
  { hu: "/fogyasztovedelem", en: "/en/consumer-information" },
];

export const SITE_ORIGIN = "https://xlntbi.hu";

function normalise(pathname: string): string {
  if (!pathname) return "/";
  const trimmed = pathname.replace(/\/+$/, "");
  return trimmed === "" ? "/" : trimmed;
}

export function isEnglishPath(pathname: string): boolean {
  const p = normalise(pathname);
  return p === "/en" || p.startsWith("/en/");
}

export function langFromPath(pathname: string): Lang {
  return isEnglishPath(pathname) ? "en" : "hu";
}

/**
 * The same content page in the requested language.
 * Falls back to the language home page when no counterpart exists
 * (for example the Hungarian-only admin or order pages).
 */
export function counterpartPath(pathname: string, target: Lang): string {
  const p = normalise(pathname);
  const pair = ROUTE_PAIRS.find((r) => r.hu === p || r.en === p);
  if (pair) return target === "en" ? pair.en : pair.hu;
  return target === "en" ? "/en" : "/";
}

export function pairFor(pathname: string): RoutePair | undefined {
  const p = normalise(pathname);
  return ROUTE_PAIRS.find((r) => r.hu === p || r.en === p);
}

/** Localised path for a Hungarian canonical path. */
export function localisedPath(huPath: string, lang: Lang): string {
  if (lang === "hu") return huPath;
  return counterpartPath(huPath, "en");
}
