import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/LegalPage";

const TITLE = "Cookie-tájékoztató | EXCELlent";
const DESC =
  "Milyen sütiket használ a xlntbi.hu weboldal, mire szolgálnak, és hogyan tudod őket kezelni.";

export const Route = createFileRoute("/cookie-tajekoztato")({
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
      title="Cookie-tájékoztató"
      intro={[
        "Ez a tájékoztató arról szól, hogy a xlntbi.hu weboldal milyen sütiket (cookie-kat) és hasonló technológiákat használ.",
      ]}
      sections={[
        {
          heading: "Mi az a süti?",
          paragraphs: [
            "A süti egy kis adatfájl, amelyet a weboldal a böngésződben tárol. Segítségével a weboldal felismeri a beállításaidat, és biztosítani tudja az alapvető működést.",
          ],
        },
        {
          heading: "Milyen sütiket használ ez az oldal?",
          list: [
            "Működéshez szükséges sütik: az oldal és az űrlapok biztonságos működését szolgálják (például a beküldések védelme visszaélés ellen). Ezek használata a működéshez elengedhetetlen.",
            "Statisztikai és marketing sütik: jelenleg nem futnak ilyen sütik ezen az oldalon. Ha később analitikai vagy hirdetési mérőkód kerül az oldalra, az csak a hozzájárulásod után töltődik be, és ez a tájékoztató is frissül.",
          ],
        },
        {
          heading: "Hogyan kezelheted a sütiket?",
          paragraphs: [
            "A böngésződ beállításaiban bármikor törölheted a tárolt sütiket, vagy letilthatod azok tárolását. A működéshez szükséges sütik letiltása esetén előfordulhat, hogy egyes funkciók – például az űrlapbeküldés – nem működnek megfelelően.",
          ],
        },
        {
          heading: "Kapcsolat",
          paragraphs: [
            "Sütikkel kapcsolatos kérdésed van? Írj az info@xlntbi.hu címre. A személyes adatok kezeléséről az Adatvédelmi tájékoztatóban olvashatsz részletesen.",
          ],
        },
      ]}
    />
  ),
});
