import { createFileRoute } from "@tanstack/react-router";
import { ServicePage } from "@/components/ServicePage";
import heroImage from "@/assets/bi.jpg";

const TITLE = "Fintech és Business Intelligence tanácsadás | EXCELlent Business Intelligence";
const DESCRIPTION = "Pénzügyi adatelemzés, BI riportok és fintech megoldások, hogy vállalkozásod számai valódi döntéstámogatást adjanak.";
const CANONICAL = "https://xlntbi.hu/fintech-es-bi";
const OG_IMAGE = "https://xlntbi.hu/og/bi.jpg";

export const Route = createFileRoute("/fintech-es-bi")({
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
              "name": "Fintech és BI tanácsadás",
              "description": "Pénzügyi adatelemzés, BI riportok és fintech megoldások vállalkozásoknak.",
              "serviceType": "Fintech és BI tanácsadás",
              "url": "https://xlntbi.hu/fintech-es-bi",
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
                              "name": "Fintech és BI tanácsadás",
                              "item": "https://xlntbi.hu/fintech-es-bi"
                      }
              ]
      }),
      },
    ],
  }),
  component: FintechBiPage,
});

function FintechBiPage() {
  return (
    <ServicePage
      title={"Fintech és BI tanácsadás"}
      lead={"Fintech és BI tanácsadás könyvelőirodáknak, cégeknek és magánszemélyeknek"}
      intro={["A pénzügyi adat önmagában még nem érték. Akkor válik hasznossá, ha jól össze van kötve, átlátható és döntést támogat. Ebben segít a Fintech és BI tanácsadás.", "A klasszikus számvitelt modern automatizációval, riportokkal, adatmodellezéssel, komplex makrókkal és AI-támogatott munkafolyamatokkal kapcsolom össze. A cél, hogy a pénzügyi működés gyorsabb, tisztább és jobban irányítható legyen."]}
      ctaLabel={"BI konzultációt kérek"}
      ctaTo={"/kapcsolat"}
      image={heroImage}
      imageAlt={"Fintech és BI – adatvezérelt pénzügyi működés"}
      listTitle={"Digitális és pénzügyi működés egyszerűbben, átláthatóbban"}
      listItems={["Power BI dashboardok", "Riportautomatizálás", "Adatösszekapcsolások", "Automatizált ellenőrzési logikák", "Digitális könyvelőirodai megoldások", "Pénzügyi folyamatok egyszerűsítése", "AI-val támogatott munkafolyamatok"]}
      closing={{"heading": "Kinek szól?", "items": ["Könyvelőirodáknak", "Cégeknek", "Magánszemélyeknek", "Olyan szakembereknek, akik technológiával akarnak hatékonyabbak lenni"], "ctaLabel": "BI konzultációt kérek", "ctaTo": "/kapcsolat"}}
    />
  );
}
