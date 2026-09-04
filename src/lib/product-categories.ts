import berszamfejtesImg from "@/assets/kategoriak/berszamfejtes.jpg";
import szamlaNyugtaImg from "@/assets/kategoriak/szamla-nyugta.jpg";
import adozasImg from "@/assets/kategoriak/adozas.jpg";
import bankImg from "@/assets/kategoriak/bank.jpg";
import vegyesImg from "@/assets/kategoriak/vegyes-konyveles.jpg";
import riportokImg from "@/assets/kategoriak/riportok.jpg";
import egyebekImg from "@/assets/kategoriak/egyebek.jpg";
import { products, type Product } from "@/lib/products";

export type ProductCategory = {
  /** URL-safe key used in the ?kategoria= search param. */
  key: string;
  title: string;
  image: string;
  /** Product slugs, in the order they should appear inside the category. */
  slugs: string[];
};

export const productCategories: ProductCategory[] = [
  {
    key: "berszamfejtes",
    title: "Bérszámfejtés",
    image: berszamfejtesImg,
    slugs: ["berszamfejto"],
  },
  {
    key: "szamla-nyugta",
    title: "Számla, nyugta könyvelés",
    image: szamlaNyugtaImg,
    slugs: [
      "nav-online-szamla-letolto",
      "nav-penztargep-letolto",
      "telefonszamla-konyvelo",
      "rlb-kulfoldi-szamla-import",
      "kulcs-soft-kulfoldi-szamla-import",
      "novitax-kulfoldi-szamla-import",
      "penzszam-kulfoldi-szamla-import",
    ],

  },
  {
    key: "vegyes-konyveles",
    title: "Vegyes könyvelés",
    image: vegyesImg,
    slugs: [
      "utnyilvantartas-kikuldetesi-rendelveny",
      "kamatlekerdezo-potlekszamito",
      "rlb-nyito-vegyes-konyvelo",
      "kulcs-nyito-vegyes-konyvelo",
      "sup-nyito-vegyes-konyvelo",
    ],
  },
  {
    key: "bank",
    title: "Bank",
    image: bankImg,
    slugs: [
      "rlb-bank-konverter",
      "rlb-bank-konverter-pro",
      "devizabank",
      "univerzalis-bank-konverter",
      "utalasi-csomag-keszito",
    ],

  },
  {
    key: "riportok-beszamolok",
    title: "Riportok és beszámolók",
    image: riportokImg,
    slugs: [
      "havi-riport",
      "havi-riport-en",
      "mnb-era-jelentesgenerator",
      "ingatlanalap-mnb-jelentes-elokeszito",
      "kapcsoltsag-ellenorzo",
      "beszamolo",
      "szamviteli-konszolidalo",
      "ifrs-konszolidalo",
    ],
  },
  {
    key: "adozas",
    title: "Adózás",
    image: adozasImg,
    slugs: [
      "afa-ev65-xml-generalo",
      "a60-osszesito-nyilatkozat-xml",
      "adofolyoszamla-egyezteto",
    ],
  },
  {
    key: "egyebek",
    title: "Egyebek",
    image: egyebekImg,
    slugs: [
      "ugyfelkapu-totp-manager",
      "cegkivonat-excel-konverter",
      "pdf-excel-konverter",
      "nav-torzsszam-partnerellenorzo",
      "wifi-jelszo-nezo",
      "auditxml-ellenorzo-javito",
    ],
  },
];

export const productCategoryKeys = productCategories.map((c) => c.key);

export function getCategory(
  key?: string | null,
  list: ProductCategory[] = productCategories,
): ProductCategory | undefined {
  return list.find((c) => c.key === key);
}

/** Products of a category, in the category's own order. */
export function categoryProducts(category: ProductCategory): Product[] {
  return category.slugs
    .map((slug) => products.find((p) => p.slug === slug))
    .filter((p): p is Product => Boolean(p));
}

/** Admin-managed override of a product's category and position. */
export type ProductPlacement = { slug: string; category: string; sortOrder: number };

/**
 * Returns the categories with the admin-managed placements applied.
 * Products without an override keep their bundled category and position.
 */
export function applyPlacements(
  placements: ProductPlacement[],
  categoryOrder: string[] = [],
): ProductCategory[] {
  const overrides = new Map(placements.map((p) => [p.slug, p]));
  const buckets = new Map<string, { slug: string; order: number; idx: number }[]>();
  for (const category of productCategories) buckets.set(category.key, []);

  productCategories.forEach((category) => {
    category.slugs.forEach((slug, idx) => {
      const override = overrides.get(slug);
      const target =
        override && buckets.has(override.category) ? override.category : category.key;
      buckets.get(target)!.push({ slug, order: override?.sortOrder ?? idx, idx });
    });
  });

  const resolved = productCategories.map((category) => ({
    ...category,
    slugs: buckets
      .get(category.key)!
      .sort((a, b) => a.order - b.order || a.idx - b.idx)
      .map((entry) => entry.slug),
  }));

  return sortCategories(resolved, categoryOrder);
}

/**
 * Orders categories by the admin-managed key list; unknown keys keep their
 * bundled position at the end.
 */
export function sortCategories(
  list: ProductCategory[],
  categoryOrder: string[],
): ProductCategory[] {
  if (!categoryOrder.length) return list;
  const rank = new Map(categoryOrder.map((key, index) => [key, index]));
  return [...list].sort((a, b) => {
    const ra = rank.get(a.key) ?? Number.MAX_SAFE_INTEGER;
    const rb = rank.get(b.key) ?? Number.MAX_SAFE_INTEGER;
    return ra - rb || list.indexOf(a) - list.indexOf(b);
  });
}
