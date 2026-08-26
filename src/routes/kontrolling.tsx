import { createFileRoute } from "@tanstack/react-router";
import { ServicePage } from "@/components/ServicePage";
import heroImage from "@/assets/controlling.jpg";

const TITLE = "Kontrolling szolgáltatás cégeknek | EXCELlent Business Intelligence";
const DESCRIPTION = "Kontrolling rendszer kiépítése és üzemeltetése, hogy mindig lásd cége valós pénzügyi teljesítményét és a döntési pontokat.";
const CANONICAL = "https://xlntbi.hu/kontrolling";
const OG_IMAGE = "https://xlntbi.hu/og/controlling.jpg";

export const Route = createFileRoute("/kontrolling")({
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
              "name": "Kontrolling",
              "description": "Kontrolling rendszer kiépítése és üzemeltetése, vezetői riportokkal és Power BI dashboardokkal.",
              "serviceType": "Kontrolling",
              "url": "https://xlntbi.hu/kontrolling",
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
                              "name": "Kontrolling",
                              "item": "https://xlntbi.hu/kontrolling"
                      }
              ]
      }),
      },
    ],
  }),
  component: KontrollingPage,
});

function KontrollingPage() {
  return (
    <ServicePage
      title={"Kontrolling"}
      lead={"Kontrolling, Excel és Power BI riportok cégeknek"}
      intro={["A kontrolling célja nálam az, hogy a vezetés ne utólag lássa a számokat, hanem időben kapjon használható információt. Egy jól felépített riport sokkal több, mint egy táblázat: döntéstámogató eszköz.", "Modern riport- és automatizációs megoldásokat készítek cégeknek, amelyek segítenek abban, hogy a pénzügyi és működési adatok ne elszigetelten, hanem egységes rendszerben legyenek láthatók, akár komplex makrókkal támogatva."]}
      ctaLabel={"Kontrolling konzultáció"}
      ctaTo={"/konzultacio"}
      image={heroImage}
      imageAlt={"Kontrolling riportok és elemzések"}
      listTitle={"Tipikus megoldások"}
      listItems={["Vezetői riportok", "Profitabilitási elemzések", "Projektkontrolling", "Havi zárási támogatás", "Automatizált modellek", "Power BI dashboardok"]}
      closing={{"heading": "Kinek való?", "items": ["KKV-knak", "Nagyobb cégeknek", "Pénzügyi vezetőknek", "Ügyvezetőknek", "Olyan csapatoknak, ahol gyors döntések kellenek"], "ctaLabel": "Konzultációt kérek", "ctaTo": "/kapcsolat"}}
    />
  );
}
