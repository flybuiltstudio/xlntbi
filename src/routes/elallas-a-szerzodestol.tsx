import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/LegalPage";

const TITLE = "Elállási tájékoztató | EXCELlent";
const DESC =
  "Elállási és felmondási jog digitális termékek megrendelése esetén – tájékoztatás fogyasztók számára.";

export const Route = createFileRoute("/elallas-a-szerzodestol")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <LegalPage
      title="Elállási tájékoztató"
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
