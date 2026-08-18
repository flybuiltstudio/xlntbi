import { createFileRoute } from "@tanstack/react-router";
import { LegalPage, type LegalSection } from "@/components/LegalPage";

const TITLE = "Általános Szerződési Feltételek (ÁSZF) | EXCELlent";
const DESC =
  "Az xlntbi.hu weboldalon elérhető szolgáltatásokra, digitális termékekre és kalkulátorokra vonatkozó Általános Szerződési Feltételek.";

export const Route = createFileRoute("/aszf")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AszfPage,
});

const sections: LegalSection[] = [
  {
    heading: "1. Általános rendelkezések",
    paragraphs: [
      "Jelen Általános Szerződési Feltételek (ÁSZF) az xlntbi.hu weboldalon elérhető szolgáltatásokra, digitális termékekre, kalkulátorokra és egyéb online tartalmakra vonatkoznak.",
      "A weboldal használatával, termék megvásárlásával vagy szolgáltatás igénybevételével a Felhasználó elfogadja a jelen ÁSZF rendelkezéseit.",
    ],
  },
  {
    heading: "2. Az eladó adatai",
    list: [
      "Eladó: Sarinay Dávid",
      "E-mail: dsarinay@gmail.com",
      "Telefon: +36 20 962 2176",
      "Honlap: xlntbi.hu",
    ],
  },
  {
    heading: "3. A szolgáltatások és termékek köre",
    paragraphs: ["A weboldalon elérhető szolgáltatások és termékek különösen:"],
    list: [
      "Könyvelési szolgáltatások",
      "Adótanácsadás és ügyviteli tanácsadás",
      "Könyvvizsgálati, átvilágítási és audit szolgáltatások",
      "Fintech és BI tanácsadás",
      "Kontrolling és riportkészítési szolgáltatások",
      "Digitális auditok",
      "Kalkulátorok",
      "Oktatási anyagok",
      "Letölthető digitális termékek, akár komplex makrókkal támogatott megoldások",
    ],
  },
  {
    heading: "4. Megrendelés menete",
    paragraphs: [
      "A Felhasználó a weboldalon keresztül vagy közvetlen kapcsolatfelvétellel kérhet ajánlatot, konzultációt vagy terméket.",
      "A megrendelés vagy szerződés létrejötte a felek visszaigazolásával, az ajánlat elfogadásával vagy online vásárlással történik.",
    ],
  },
  {
    heading: "5. Fizetés",
    paragraphs: [
      "A fizetés módja a termék vagy szolgáltatás jellegétől függően lehet banki átutalás, online fizetés vagy más, a weboldalon feltüntetett fizetési mód.",
      "A szolgáltató fenntartja a jogot a fizetési feltételek egyedi meghatározására.",
    ],
  },
  {
    heading: "6. Teljesítés",
    paragraphs: [
      "A digitális termékek teljesítése jellemzően elektronikus úton történik.",
      "A szolgáltatások teljesítése egyedi egyeztetés alapján, az adott megbízásnak megfelelően történik.",
      "A teljesítés határidejét minden esetben az ajánlat, visszaigazolás vagy külön megállapodás tartalmazza.",
    ],
  },
  {
    heading: "7. Digitális termékek",
    paragraphs: [
      "A digitális termékek letölthető vagy online elérhető formában kerülhetnek átadásra, beleértve a komplex makrókat, automatizációs fájlokat és más digitális segédleteket is.",
      "A termékek felhasználása kizárólag a vásárló saját céljára történhet. A termékek továbbértékesítése, másolása vagy jogosulatlan megosztása tilos, kivéve, ha erre külön írásbeli engedély születik.",
    ],
  },
  {
    heading: "8. Elállás és felmondás",
    paragraphs: [
      "A digitális tartalomra és online teljesített szolgáltatásokra vonatkozó elállási jog a mindenkor hatályos jogszabályok szerint érvényesül.",
      "Ha a teljesítés a fogyasztó kifejezett hozzájárulásával megkezdődött, az elállási jog korlátozott lehet.",
    ],
  },
  {
    heading: "9. Felelősségkorlátozás",
    paragraphs: [
      "A weboldalon szereplő kalkulátorok, tájékoztatók és digitális eszközök tájékoztató jellegűek.",
      "A végső döntés és alkalmazás mindig a felhasználó egyedi felelőssége, illetve szakmai helyzetének figyelembevételével történik. A szolgáltató nem vállal felelősséget a helytelen adatmegadásból eredő károkért.",
    ],
  },
  {
    heading: "10. Szellemi tulajdon",
    paragraphs: [
      "A weboldalon található szövegek, grafikai elemek, logók, termékleírások, kalkulátorok, automatizációs fájlok, makrók és egyéb tartalmak a szolgáltató szellemi tulajdonát képezhetik.",
      "Ezek másolása, terjesztése vagy felhasználása a szolgáltató előzetes írásbeli engedélye nélkül tilos.",
    ],
  },
  {
    heading: "11. Panaszkezelés",
    paragraphs: [
      "Panasz esetén a Felhasználó az elérhetőségeken keresztül jogosult kapcsolatba lépni a szolgáltatóval.",
      "A panaszokat ésszerű határidőn belül kivizsgáljuk és megválaszoljuk.",
      "Fogyasztói jogvita esetén a fogyasztó a lakóhelye szerint illetékes békéltető testülethez fordulhat. A szolgáltató székhelye szerinti testület: Budapesti Békéltető Testület (1016 Budapest, Krisztina krt. 99., e-mail: bekelteto.testulet@bkik.hu). Panasszal a fogyasztóvédelmi hatósághoz is lehet fordulni.",
    ],
  },
  {
    heading: "12. Záró rendelkezések",
    paragraphs: [
      "A szolgáltató fenntartja a jogot az ÁSZF módosítására. A mindenkor hatályos változat a weboldalon kerül közzétételre.",
    ],
  },
];

function AszfPage() {
  return <LegalPage title="Általános Szerződési Feltételek" sections={sections} />;
}
