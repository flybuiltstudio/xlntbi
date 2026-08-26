import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/LegalPage";


const TITLE = "Cookie tájékoztató | EXCELlent Business Intelligence";
const DESCRIPTION = "Tájékoztató a weboldalon használt sütikről (cookie-król) és azok kezeléséről.";
const CANONICAL = "https://xlntbi.hu/cookie-tajekoztato";

export const Route = createFileRoute("/cookie-tajekoztato")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: CANONICAL },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
      { name: "robots", content: "noindex, follow" },
    ],
    links: [
      { rel: "canonical", href: CANONICAL },
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
                              "name": "Cookie tájékoztató",
                              "item": "https://xlntbi.hu/cookie-tajekoztato"
                      }
              ]
      }),
      },
    ],
  }),
  component: () => (
    <LegalPage
      title="Cookie tájékoztató"
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
            "Működéshez szükséges sütik: az oldal és az űrlapok biztonságos működését szolgálják (például a beküldések védelme visszaélés ellen). Ezek használata a működéshez elengedhetetlen, ezért az elektronikus hírközlési szabályok szerint hozzájárulás nélkül is elhelyezhetők.",
            "Fizetéshez kapcsolódó sütik: bankkártyás fizetés indításakor a Stripe Payments Europe, Ltd. helyez el sütiket a tranzakció biztonságos lebonyolítása és a csalásmegelőzés céljából. Ezek szintén a szolgáltatás nyújtásához szükségesek.",
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
