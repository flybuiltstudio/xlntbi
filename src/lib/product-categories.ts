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
    slugs: ["berszamfejto-2026"],
  },
  {
    key: "szamla-nyugta",
    title: "Számla, nyugta könyvelés",
    image: szamlaNyugtaImg,
    slugs: [
      "nav-online-szamla-letolto",
      "nav-penztargep-letolto",
      "rlb-kulfoldi-szamla-import",
      "penzszam-kulfoldi-szamla-import",
    ],
  },
  {
    key: "adozas",
    title: "Adózás",
    image: adozasImg,
    slugs: [
      "afa-2665-xml-generalo",
      "a60-osszesito-nyilatkozat-xml",
      "adofolyoszamla-egyezteto",
    ],
  },
  {
    key: "bank",
    title: "Bank",
    image: bankImg,
    slugs: [
      "rlb-bank-konverter",
      "rlb-bank-konverter-pro",
      "univerzalis-bank-konverter",
      "utalasi-csomag-keszito",
    ],
  },
  {
    key: "vegyes-konyveles",
    title: "Vegyes könyvelés",
    image: vegyesImg,
    slugs: [
      "telefonszamla-konyvelo",
      "utnyilvantartas-kikuldetesi-rendelveny",
      "kamatlekerdezo-potlekszamito",
      "rlb-nyito-vegyes-konyvelo",
    ],
  },
  {
    key: "riportok-beszamolok",
    title: "Riportok és beszámolók",
    image: riportokImg,
    slugs: [
      "havi-riport",
      "havi-riport-en",
      "beszamolo-2025",
      "szamviteli-konszolidalo",
      "ifrs-konszolidalo",
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
    ],
  },
];

export const productCategoryKeys = productCategories.map((c) => c.key);

export function getCategory(key?: string | null): ProductCategory | undefined {
  return productCategories.find((c) => c.key === key);
}

/** Products of a category, in the category's own order. */
export function categoryProducts(category: ProductCategory): Product[] {
  return category.slugs
    .map((slug) => products.find((p) => p.slug === slug))
    .filter((p): p is Product => Boolean(p));
}
