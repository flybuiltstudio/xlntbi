/**
 * Shared ordering model for the calculator listing pages.
 *
 * Both the built-in (static) calculators and the admin-uploaded custom ones
 * live in one list. The saved order is a single array of ids, so the Hungarian
 * and English listings always mirror each other.
 */

export type StaticCalculator = {
  key: string;
  nameHu: string;
  nameEn: string;
  huPath: string;
  enPath: string;
};

export const STATIC_CALCULATORS: readonly StaticCalculator[] = [
  {
    key: "szamla-datumok",
    nameHu: "Számla dátumok",
    nameEn: "Invoice dates",
    huPath: "/kalkulatorok/szamla-datumok",
    enPath: "/en/calculators/invoice-dates",
  },
  {
    key: "berteszt",
    nameHu: "Bérteszt",
    nameEn: "Salary test",
    huPath: "/kalkulatorok/berteszt",
    enPath: "/en/calculators/salary-test",
  },
  {
    key: "atalanyado",
    nameHu: "Átalányadó",
    nameEn: "Flat-rate tax",
    huPath: "/kalkulatorok/atalanyado",
    enPath: "/en/calculators/flat-rate-tax",
  },
  {
    key: "jovedelemado",
    nameHu: "Jövedelemadó",
    nameEn: "Personal income tax",
    huPath: "/kalkulatorok/jovedelemado",
    enPath: "/en/calculators/income-tax",
  },
] as const;

export const CALCULATOR_ORDER_KEY = "calculator_order";

export function staticCalculatorId(key: string): string {
  return `static:${key}`;
}

export function customCalculatorId(slug: string): string {
  return `custom:${slug}`;
}

export type CalculatorCard = {
  id: string;
  kind: "static" | "custom";
  /** Static key or custom slug. */
  key: string;
  name: string;
  path: string;
};

export type CalculatorOrderRow = {
  id: string;
  kind: "static" | "custom";
  key: string;
  nameHu: string;
  nameEn: string;
};

/**
 * Applies a saved id order to the full set of calculators. Unknown ids are
 * dropped, missing ones are appended in their default order.
 */
export function applyCalculatorOrder<T extends { id: string }>(
  items: readonly T[],
  savedIds: readonly string[],
): T[] {
  const byId = new Map(items.map((item) => [item.id, item]));
  const ordered: T[] = [];
  for (const id of savedIds) {
    const item = byId.get(id);
    if (item) {
      ordered.push(item);
      byId.delete(id);
    }
  }
  for (const item of items) if (byId.has(item.id)) ordered.push(item);
  return ordered;
}
