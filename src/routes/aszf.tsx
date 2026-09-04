import { createFileRoute } from "@tanstack/react-router";
import { LegalPage, type LegalSection } from "@/components/LegalPage";
import { AUTHORITIES, COMPANY, HOSTING } from "@/lib/company";


const TITLE = "Általános Szerződési Feltételek | EXCELlent Business Intelligence";
const DESCRIPTION = "Az EXCELlent Business Intelligence szolgáltatásaira és termékeire vonatkozó Általános Szerződési Feltételek.";
const CANONICAL = "https://xlntbi.hu/aszf";

export const Route = createFileRoute("/aszf")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: CANONICAL },
      { property: "og:locale", content: "hu_HU" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
      { name: "robots", content: "noindex, follow" },
    ],
    links: [
      { rel: "canonical", href: CANONICAL },
      { rel: "alternate", hrefLang: "hu", href: "https://xlntbi.hu/aszf" },
      { rel: "alternate", hrefLang: "en", href: "https://xlntbi.hu/en/terms" },
      { rel: "alternate", hrefLang: "x-default", href: "https://xlntbi.hu/aszf" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              "itemListElement": [
                      {
                              "@type": "ListItem",
                              "position": 1,
                              "name": "Főoldal",
                              "item": "https://xlntbi.hu/"
                      },
                      {
                              "@type": "ListItem",
                              "position": 2,
                              "name": "Általános Szerződési Feltételek",
                              "item": "https://xlntbi.hu/aszf"
                      }
              ]
      }),
      },
    ],
  }),
  component: AszfPage,
});

const sections: LegalSection[] = [
  {
    heading: "1. Általános rendelkezések",
    paragraphs: [
      "Jelen Általános Szerződési Feltételek (ÁSZF) az xlntbi.hu weboldalon elérhető szolgáltatásokra, digitális termékekre, kalkulátorokra és egyéb online tartalmakra vonatkoznak.",
      "A weboldal használatával, termék megvásárlásával vagy szolgáltatás igénybevételével a Felhasználó elfogadja a jelen ÁSZF rendelkezéseit. A megrendelőlapon az ÁSZF elfogadását külön jelölni kell.",
      "A szerződés nyelve magyar, a szerződés elektronikus úton jön létre, és nem minősül írásbeli szerződésnek. A szolgáltató a megrendelést elektronikusan tárolja, az utólag hozzáférhető.",
      "Az itt nem szabályozott kérdésekben a Polgári Törvénykönyvről szóló 2013. évi V. törvény (Ptk.), az elektronikus kereskedelmi szolgáltatásokról szóló 2001. évi CVIII. törvény (Ekertv.), valamint a fogyasztó és a vállalkozás közötti szerződések részletes szabályairól szóló 45/2014. (II. 26.) Korm. rendelet rendelkezései alkalmazandók.",
    ],
  },
  {
    heading: "2. Az eladó (szolgáltató) adatai",
    list: [
      `Név: ${COMPANY.legalName}`,
      `Márkanév: ${COMPANY.brand}`,
      `Székhely és levelezési cím: ${COMPANY.address}`,
      `Nyilvántartási szám: ${COMPANY.registrationNumber}`,
      `Adószám: ${COMPANY.taxNumber}`,
      `Statisztikai (KSH) számjel: ${COMPANY.statisticalNumber}`,
      `E-mail: ${COMPANY.email}`,
      `Telefon: ${COMPANY.phone}`,
      `Weboldal: ${COMPANY.website}`,
      `Tárhelyszolgáltató: ${HOSTING.name} (${HOSTING.contact})`,
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
      "Digitális termék esetén a termékoldalon a „Megrendelem” gombra kattintva nyílik meg a megrendelőlap, ahol a darabszámot és a számlázási adatokat kell megadni. Az oldalon kizárólag digitális termékek érhetők el, ezért szállítási címre nincs szükség.",
      "A megrendelés elküldése után automatikus visszaigazoló e-mail érkezik a rendelésszámmal. A szerződés a megrendelés szolgáltatói visszaigazolásával, illetve a sikeres online fizetéssel jön létre.",
      "Az adatbeviteli hibák a megrendelés elküldése előtt az űrlapon javíthatók. Ha a beküldés után derül ki hiba, azt a rendelésszám megadásával, e-mailben lehet jelezni.",
    ],
  },
  {
    heading: "5. Árak és számlázás",
    paragraphs: [
      `A weboldalon feltüntetett árak forintban értendők. A szolgáltató ${COMPANY.vatStatus} adózói körbe tartozik, ezért az árak áfát nem tartalmaznak, a számlán áfa nem kerül felszámításra.`,
      "A megrendelésről elektronikus számla készül, amelyet a Billingo számlázási rendszerén keresztül, a megadott e-mail címre küldünk meg. A számla befogadását a Felhasználó a megrendelés leadásával elfogadja.",
      "Az árváltoztatás jogát a szolgáltató fenntartja; a változás a már leadott megrendeléseket nem érinti.",
    ],
  },
  {
    heading: "6. Fizetési módok",
    paragraphs: [
      "A megrendelés során az alábbi fizetési módok közül lehet választani:",
    ],
    list: [
      "Banki átutalás: a megrendelés visszaigazolása után megküldött számla, illetve fizetési tudnivalók alapján. A teljesítés az összeg beérkezése után indul.",
      "Bankkártyás online fizetés: a fizetést a Stripe Payments Europe, Ltd. biztonságos fizetési felülete bonyolítja le. A kártyaadatokat kizárólag a Stripe kezeli, azok a szolgáltatóhoz nem jutnak el, és a szolgáltató azokat nem tárolja.",
    ],
    afterList: [
      "A bankkártyás fizetés során a Stripe felületén megadott adatokra a Stripe saját adatkezelési tájékoztatója is vonatkozik. Sikeres fizetés után a rendszer automatikus visszaigazoló e-mailt küld.",
      "Sikertelen vagy megszakadt fizetés esetén a megrendelés fizetésre váró állapotban marad; a fizetés újraindítható, vagy átutalásos fizetésre lehet váltani a szolgáltatóval egyeztetve.",
    ],
  },
  {
    heading: "7. Teljesítés, digitális termékek",
    paragraphs: [
      "A digitális termékek teljesítése elektronikus úton történik: a fájlt vagy a letöltési hozzáférést a fizetés beérkezését követően, legkésőbb 2 munkanapon belül küldjük meg a megadott e-mail címre.",
      "A szolgáltatások teljesítése egyedi egyeztetés alapján, az adott megbízásnak megfelelően történik. A teljesítés határidejét az ajánlat, a visszaigazolás vagy külön megállapodás tartalmazza.",
      "A termékek használatához szükséges technikai feltételekről (például Microsoft Excel verzió, makróengedélyezés) a termékleírás tájékoztat. A Felhasználó felelőssége, hogy ezek a feltételek nála rendelkezésre álljanak.",
      "A termékek felhasználása a vásárló saját, illetve saját ügyfélköre kiszolgálására irányuló céljára történhet. A termékek továbbértékesítése, nyilvános közzététele vagy jogosulatlan megosztása tilos, kivéve, ha erre külön írásbeli engedély születik.",
    ],
  },
  {
    heading: "8. Elállás és felmondás",
    paragraphs: [
      "Nem tárgyi adathordozón nyújtott digitális tartalom esetén a fogyasztót a 45/2014. (II. 26.) Korm. rendelet szerinti 14 napos elállási jog illeti meg, azonban ez a jog nem gyakorolható, ha a teljesítés a fogyasztó előzetes, kifejezett hozzájárulásával megkezdődött, és a fogyasztó e hozzájárulásával egyidejűleg nyilatkozott arról, hogy tudomásul veszi az elállási joga elvesztését.",
      "Ezt a nyilatkozatot a megrendelőlapon külön jelölni kell; jelölés hiányában a megrendelés nem adható le. A részletes szabályokat az Elállási tájékoztató oldal tartalmazza.",
    ],
  },
  {
    heading: "9. Kellékszavatosság, hibás teljesítés",
    paragraphs: [
      `Ha a megrendelt digitális termék nem működik a leírásnak megfelelően, a hibát a ${COMPANY.email} címen kell jelezni. A hiba orvoslására – javításra, kijavított verzió megküldésére vagy indokolt esetben az ellenérték visszafizetésére – a Ptk. szavatossági szabályai szerint kerül sor.`,
      "Digitális tartalom esetén jótállás (garancia) nem terheli a szolgáltatót, a kellékszavatossági jogok azonban a jogszabály szerint érvényesíthetők.",
    ],
  },
  {
    heading: "10. Felelősségkorlátozás",
    paragraphs: [
      "A weboldalon szereplő kalkulátorok, tájékoztatók és digitális eszközök tájékoztató jellegűek, nem minősülnek adótanácsadásnak vagy egyedi szakmai állásfoglalásnak.",
      "A végső döntés és alkalmazás mindig a felhasználó egyedi felelőssége, a saját szakmai helyzetének figyelembevételével. A szolgáltató nem vállal felelősséget a helytelen adatmegadásból, illetve a termék nem a leírás szerinti használatából eredő károkért.",
    ],
  },
  {
    heading: "11. Szellemi tulajdon",
    paragraphs: [
      "A weboldalon található szövegek, grafikai elemek, logók, termékleírások, kalkulátorok, automatizációs fájlok, makrók és egyéb tartalmak a szolgáltató szellemi tulajdonát képezik.",
      "Ezek másolása, terjesztése vagy felhasználása a szolgáltató előzetes írásbeli engedélye nélkül tilos.",
    ],
  },
  {
    heading: "12. Adatkezelés",
    paragraphs: [
      "A megrendeléssel és a kapcsolatfelvétellel összefüggő adatkezelésről az Adatvédelmi tájékoztató oldal ad részletes felvilágosítást, az általános adatvédelmi rendelet (EU 2016/679, GDPR) követelményei szerint.",
    ],
  },
  {
    heading: "13. Panaszkezelés és jogorvoslat",
    paragraphs: [
      `Panasz esetén a Felhasználó a ${COMPANY.email} címen vagy a ${COMPANY.phone} telefonszámon jogosult kapcsolatba lépni a szolgáltatóval. A panaszokat a jogszabályi határidőn belül kivizsgáljuk és megválaszoljuk.`,
      `Fogyasztói jogvita esetén a fogyasztó a lakóhelye szerint illetékes békéltető testülethez fordulhat. A szolgáltató székhelye szerint illetékes testület: ${AUTHORITIES.bekelteto}.`,
      `Fogyasztóvédelmi hatósági eljárás a lakóhely szerint illetékes kormányhivatalnál indítható; a szolgáltató székhelye szerint: ${AUTHORITIES.fogyasztovedelem}.`,
    ],
  },
  {
    heading: "14. Záró rendelkezések",
    paragraphs: [
      "A szolgáltató fenntartja a jogot az ÁSZF módosítására. A mindenkor hatályos változat a weboldalon kerül közzétételre, és a közzététel napjától hatályos. A már leadott megrendelésekre a megrendelés napján hatályos ÁSZF alkalmazandó.",
      "Hatályos: 2026. augusztus 19-től.",
    ],
  },
];

function AszfPage() {
  return <LegalPage title="Általános Szerződési Feltételek" sections={sections} />;
}
