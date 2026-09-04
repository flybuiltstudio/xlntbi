import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/LegalPage";


const TITLE = "Elállás a szerződéstől | EXCELlent Business Intelligence";
const DESCRIPTION = "Tájékoztató a szerződéstől való elállás feltételeiről és a folyamat lépéseiről.";
const CANONICAL = "https://xlntbi.hu/elallas-a-szerzodestol";

export const Route = createFileRoute("/elallas-a-szerzodestol")({
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
      { rel: "alternate", hrefLang: "hu", href: "https://xlntbi.hu/elallas-a-szerzodestol" },
      { rel: "alternate", hrefLang: "en", href: "https://xlntbi.hu/en/right-of-withdrawal" },
      { rel: "alternate", hrefLang: "x-default", href: "https://xlntbi.hu/elallas-a-szerzodestol" },
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
                              "name": "Elállás a szerződéstől",
                              "item": "https://xlntbi.hu/elallas-a-szerzodestol"
                      }
              ]
      }),
      },
    ],
  }),
  component: () => (
    <LegalPage
      title="Elállás a szerződéstől"
      intro={[
        "Ez a tájékoztató a fogyasztónak minősülő megrendelőket illető elállási és felmondási jogról szól, a 45/2014. (II. 26.) Korm. rendelet alapján.",
      ]}
      sections={[
        {
          heading: "Az elállási jog általános szabálya",
          paragraphs: [
            "A fogyasztó a szerződéstől 14 napon belül indokolás nélkül elállhat. Digitális tartalom (letölthető szoftver, Excel- vagy Google Sheets-alapú megoldás) esetén ez a határidő a szerződés megkötésének napjától indul.",
          ],
        },
        {
          heading: "Mikor szűnik meg az elállási jog?",
          paragraphs: [
            "Nem tárgyi adathordozón nyújtott digitális tartalom esetén az elállási jog nem gyakorolható, ha a teljesítés a fogyasztó előzetes, kifejezett hozzájárulásával megkezdődött, és a fogyasztó e hozzájárulásával egyidejűleg nyilatkozott arról, hogy tudomásul veszi az elállási joga elvesztését.",
            "Ezért a megrendelőlapon külön jelölni kell ezt a nyilatkozatot. A jelölés hiányában a megrendelés nem adható le.",
          ],
        },
        {
          heading: "Hogyan lehet elállni a teljesítés megkezdése előtt?",
          paragraphs: [
            "Ha a letöltés vagy a hozzáférés még nem indult el, az elállási szándékot elég egyértelműen jelezni az info@xlntbi.hu címen vagy a 06 20 962 2176 telefonszámon, a rendelésszám megadásával. Az elállás esetén a már megfizetett összeget legkésőbb 14 napon belül visszautaljuk, ugyanazzal a fizetési módon, amelyen a fizetés történt.",
          ],
        },
        {
          heading: "Kellékszavatosság, hibás teljesítés",
          paragraphs: [
            "Ha a megrendelt digitális termék nem működik a leírásnak megfelelően, jelezd az info@xlntbi.hu címen. A hiba orvoslására – javításra, kijavított verzió küldésére vagy indokolt esetben az ellenérték visszafizetésére – a jogszabályi szavatossági szabályok szerint kerül sor.",
          ],
        },
        {
          heading: "Jogorvoslat",
          paragraphs: [
            "Ha a panaszod kezelését nem tartod megfelelőnek, a Fogyasztóvédelmi tájékoztatás oldalon találod a békéltető testületi és hatósági elérhetőségeket.",
          ],
        },
      ]}
    />
  ),
});
