/**
 * Registry of embeddable calculators. The `key` is used by the
 * calculator_overrides table and by the admin "Friss verzió feltöltés" page
 * to target a calculator regardless of the uploaded file's name.
 * Labels are Hungarian (admin UI), key order matches the menu order.
 */
export const CALCULATORS = [
  { key: "szamla-datumok", label: "Számla dátumok" },
  { key: "invoice-dates", label: "Invoice Dates (EN)" },
  { key: "berteszt", label: "Bérteszt" },
  { key: "jovedelemado", label: "Jövedelemadó" },
  { key: "atalanyado", label: "Átalányadó" },
] as const;

export type CalculatorKey = (typeof CALCULATORS)[number]["key"];

const CALCULATOR_KEYS = new Set<string>(CALCULATORS.map((c) => c.key));

export function isCalculatorKey(value: string): value is CalculatorKey {
  return CALCULATOR_KEYS.has(value);
}

export function calculatorLabel(key: string): string {
  return CALCULATORS.find((c) => c.key === key)?.label ?? key;
}
