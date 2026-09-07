/**
 * Registry of embeddable calculators. The `key` is used by the
 * calculator_overrides table and by the admin "Friss verzió feltöltés" page
 * to target a calculator regardless of the uploaded file's name.
 *
 * Hungarian and English calculators have SEPARATE keys, so a Hungarian
 * upload never leaks onto the English page. Each Hungarian entry names its
 * English counterpart in `enKey`; uploading a Hungarian version regenerates
 * that English entry automatically (AI translation of the visible text).
 * Order follows the public calculator listing pages.
 */
export type CalculatorEntry = {
  key: string;
  label: string;
  lang: "hu" | "en";
  /** English counterpart key (Hungarian entries only). */
  enKey?: string;
};

export const CALCULATORS: readonly CalculatorEntry[] = [
  { key: "szamla-datumok", label: "Számla dátumok", lang: "hu", enKey: "invoice-dates-en" },
  { key: "berteszt", label: "Bérteszt", lang: "hu", enKey: "berteszt-en" },
  { key: "atalanyado", label: "Átalányadó", lang: "hu", enKey: "atalanyado-en" },
  { key: "jovedelemado", label: "Jövedelemadó", lang: "hu", enKey: "jovedelemado-en" },
  { key: "invoice-dates-en", label: "Invoice dates", lang: "en" },
  { key: "berteszt-en", label: "Salary test", lang: "en" },
  { key: "atalanyado-en", label: "Flat-rate tax", lang: "en" },
  { key: "jovedelemado-en", label: "Personal income tax", lang: "en" },
  // Legacy key kept for backwards compatibility with earlier uploads; it is
  // intentionally not offered in the admin UI.
  { key: "invoice-dates", label: "Invoice Dates (régi kulcs)", lang: "en" },
] as const;

export type CalculatorKey = (typeof CALCULATORS)[number]["key"];

const CALCULATOR_KEYS = new Set<string>(CALCULATORS.map((c) => c.key));

const HIDDEN_KEYS = new Set<string>(["invoice-dates"]);

export function isCalculatorKey(value: string): value is CalculatorKey {
  return CALCULATOR_KEYS.has(value);
}

export function calculatorLabel(key: string): string {
  const entry = CALCULATORS.find((c) => c.key === key);
  if (!entry) return key;
  return entry.lang === "en" ? `${entry.label} (EN)` : entry.label;
}

/** Calculators offered in the admin dropdown, grouped by language. */
export const HU_CALCULATORS = CALCULATORS.filter(
  (c) => c.lang === "hu" && !HIDDEN_KEYS.has(c.key),
);
export const EN_CALCULATORS = CALCULATORS.filter(
  (c) => c.lang === "en" && !HIDDEN_KEYS.has(c.key),
);

/** English counterpart key of a Hungarian calculator, if any. */
export function englishCounterpart(key: string): string | null {
  return CALCULATORS.find((c) => c.key === key)?.enKey ?? null;
}
