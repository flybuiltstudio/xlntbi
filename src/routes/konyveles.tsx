import { createFileRoute } from "@tanstack/react-router";
import { ServicePage } from "@/components/ServicePage";
import heroImage from "@/assets/close-up-busy-businesswoman.jpg";

const TITLE = "Könyvelési szolgáltatás vállalkozásoknak | EXCELlent Business Intelligence";
const DESCRIPTION = "Pontos, naprakész könyvelés egyéni vállalkozóknak és cégeknek. Digitális folyamatok, átlátható díjazás, szakértői háttér.";
const CANONICAL = "https://xlntbi.hu/konyveles";
const OG_IMAGE = "https://xlntbi.hu/og/close-up-busy-businesswoman.jpg";

export const Route = createFileRoute("/konyveles")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: CANONICAL },
      { property: "og:image", content: OG_IMAGE },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
      { name: "twitter:image", content: OG_IMAGE },
    ],
    links: [
      { rel: "canonical", href: CANONICAL },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Service",
              "name": "Könyvelés",
              "description": "Pontos, naprakész könyvelés egyéni vállalkozóknak és cégeknek, digitális folyamatokkal.",
              "serviceType": "Könyvelés",
              "url": "https://xlntbi.hu/konyveles",
              "areaServed": "HU",
              "provider": {
                      "@type": "ProfessionalService",
                      "name": "EXCELlent Business Intelligence",
                      "url": "https://xlntbi.hu/"
              }
      }),
      },
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
                              "name": "Szolgáltatásaim",
                              "item": "https://xlntbi.hu/szolgaltatasaim"
                      },
                      {
                              "@type": "ListItem",
                              "position": 3,
                              "name": "Könyvelés",
                              "item": "https://xlntbi.hu/konyveles"
                      }
              ]
      }),
      },
    ],
  }),
  component: KonyvelesPage,
});

function KonyvelesPage() {
  return (
    <ServicePage
      title={"Könyvelés"}
      lead={"Könyvelés cégeknek, egyéni vállalkozóknak, magánszemélyeknek"}
      intro={["A könyvelés nálam nem puszta adminisztráció, hanem a stabil és tervezhető működés egyik alapja. Arra törekszem, hogy az adataidból ne csak kötelező jelentések, hanem valódi üzleti információk is szülessenek.", "Teljes körű könyvelési szolgáltatást nyújtok cégeknek, egyéni vállalkozóknak és magánszemélyeknek. A munkát mindig az ügyfél tevékenységéhez, igényeihez és működési sajátosságaihoz igazítom."]}
      ctaLabel={"Konzultációt kérek"}
      ctaTo={"/kapcsolat"}
      image={heroImage}
      imageAlt={"Könyvelés – irodai munka közben"}
      listTitle={"Szolgáltatások"}
      listItems={["Teljes körű könyvelés", "Bevallások előkészítése és benyújtása", "Éves zárás és beszámoló-előkészítés", "Folyamatos szakmai egyeztetés", "Online ügyintézés", "Digitális, papírmentes működés támogatása"]}
      closing={{"eyebrow": "Kinek ajánlott?", "heading": "Rendezett könyvelés azoknak, akik tisztán szeretnének látni", "items": ["Cégeknek", "Egyéni vállalkozóknak", "Magánszemélyeknek", "Olyan ügyfeleknek, akik rendezett és átlátható könyvelést szeretnének"]}}
    />
  );
}
