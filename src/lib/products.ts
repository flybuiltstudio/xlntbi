import szamlaImg from "@/assets/account-assets-audit-bank-bookkeeping-finance-concept.jpg";
import penztargepImg from "@/assets/close-up-busy-businesswoman.jpg";

export type Product = {
  slug: string;
  name: string;
  price: number;
  currency: "HUF";
  image: string;
  metaTitle: string;
  metaDescription: string;
  intro: string[];
  features: string[];
  why?: string;
};

export const products: Product[] = [
  {
    slug: "nav-online-szamla-letolto",
    name: "NAV Online Számla letöltő",
    price: 19900,
    currency: "HUF",
    image: szamlaImg,
    metaTitle: "NAV Online Számla letöltő | EXCELlent",
    metaDescription:
      "Asztali segédprogram a NAV Online Számla adatok lekérdezéséhez és Excelbe exportálásához. 19 900 Ft.",
    intro: [
      "Ez a NAV Online Számla letöltő egy kényelmes, asztali segédprogram, amellyel néhány kattintással lekérdezhetők és menthetők a NAV Online Számla rendszerből a számlaadatok. A program gyorsabbá teszi a napi adminisztrációt, csökkenti a kézi másolgatást, és segít abban, hogy a letöltött adatok rendezett, Excelben is könnyen használható, akár onnan könyvelőprogramba importálható formában álljanak rendelkezésre.",
    ],
    features: [
      "NAV Online Számla adatok lekérdezése és Excelbe exportálása.",
      "Bejövő és kimenő számlák kezelése, időszak szerinti szűréssel.",
      "A NAV által megszabott max. 35 napos időintervallum-korlát áttörése, így tetszőleges hosszúságú időszak választható ki és dolgozható fel.",
      "Külön munkalap a fejlécadatoknak és külön munkalap a tételsoroknak.",
      "Rögzített fejléc, szűrhető táblázat és automatikusan formázott oszlopok az átlátható használatért.",
      "Használható akár Ügyfél általi ellenőrzésre, hogy összegyűjtött-e minden számlát",
      "Különös hasznos külföldi könyvelőprogramokat (pl. SAP, NAVISION, Business Central, Oracle stb.) használóknak, akár erre épülően importálás is megvalósítható",
    ],
    why: "A program különösen hasznos, ha nagyobb időszakokat kell feldolgozni, vagy ha a NAV korlátja miatt eddig több részletben kellett lekérdezned az adatokat. Ezzel az eszközzel egyetlen kiválasztott időszakból is kényelmesen készíthetsz rendezett, tovább feldolgozható Excel-fájlt.",
  },
  {
    slug: "nav-penztargep-letolto",
    name: "NAV Pénztárgép letöltő",
    price: 19900,
    currency: "HUF",
    image: penztargepImg,
    metaTitle: "NAV Pénztárgép letöltő | EXCELlent",
    metaDescription:
      "Asztali segédprogram a pénztárgépes adatok és AEE naplóállományok letöltéséhez, könyvelőbarát Excel kimenettel. 19 900 Ft.",
    intro: [
      "NAV Pénztárgép letöltő – egy praktikus asztali segédprogram, amellyel gyorsan és átláthatóan lekérhetők és menthetők a pénztárgéphez kapcsolódó adatok. A program úgy készült, hogy a napi adminisztrációt egyszerűbbé tegye, csökkentse a kézi munkát, és rendezett, jól kezelhető kimenetet adjon.",
      "A szoftver fő előnye, hogy egy helyen kezeli a szükséges lekérdezéseket, a mentést és az adatfeldolgozást, így kevesebb kattintással lehet eljutni a használható eredményig. Ez különösen hasznos lehet azoknak, akik rendszeresen dolgoznak pénztárgépes adatokkal, és fontos nekik az áttekinthető, megbízható működés.",
    ],
    features: [
      "Pénztárgépes adatok lekérdezése és letöltése.",
      "Rendezett adatmentés és feldolgozás.",
      "Áttekinthető kezelőfelület a gyors napi használathoz.",
      "A munkafolyamatok egyszerűsítése, kevesebb manuális adatkezeléssel.",
      "NAV Online Pénztárgép (OPG) hiteles AEE naplóállományok letöltése, teszt és éles környezetben egyaránt.",
      "Az aláírt P7B állományokból a tényleges napló-adat automatikus kinyerése és feldolgozása.",
      "Az adatok RLB-szerű, könyvelőbarát Excel munkafüzetbe rendezve: Fejléc, Tétel, Pénztárjelentés, Forgalmi jelentés és Beállítások lapok, valamint Pénztárgép státusz és Naplóállományok.",
      "A pénztárgép AP száma és típusa, valamint a cégnév automatikus kitöltése (a saját adószám alapján).",
      "Időszak szerinti szűrés gyorsgombokkal, vagy egyetlen kattintással az „Összes elérhető” teljes tartomány letöltése.",
      "Profi Excel-formázás: valós dátum + időpont, ezres elválasztós összegek, középszürke rögzített fejléc, automatikus oszlopszélesség.",
    ],
  },
];

export function getProduct(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function formatPrice(value: number): string {
  return `${value.toLocaleString("hu-HU").replace(/\u00a0/g, " ")} Ft`;
}
