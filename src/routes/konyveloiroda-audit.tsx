import { createFileRoute } from "@tanstack/react-router";
import { ServicePage } from "@/components/ServicePage";
import heroImage from "@/assets/konyveloiroda-audit.jpg";

const TITLE = "Könyvelőiroda audit, minőségellenőrzés | EXCELlent Business Intelligence";
const DESCRIPTION = "Auditáld a jelenlegi könyvelőirodád munkáját: hibák, kockázatok és fejlesztési pontok feltárása független szakértővel.";
const CANONICAL = "https://xlntbi.hu/konyveloiroda-audit";
const OG_IMAGE = "https://xlntbi.hu/og/konyveloiroda-audit.jpg";

export const Route = createFileRoute("/konyveloiroda-audit")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: CANONICAL },
      { property: "og:locale", content: "hu_HU" },
      { property: "og:image", content: OG_IMAGE },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
      { name: "twitter:image", content: OG_IMAGE },
    ],
    links: [
      { rel: "canonical", href: CANONICAL },
      { rel: "alternate", hrefLang: "hu", href: "https://xlntbi.hu/konyveloiroda-audit" },
      { rel: "alternate", hrefLang: "en", href: "https://xlntbi.hu/en/accounting-firm-audit" },
      { rel: "alternate", hrefLang: "x-default", href: "https://xlntbi.hu/konyveloiroda-audit" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Service",
              "name": "Könyvelőiroda audit",
              "description": "Könyvelőirodai folyamatok, minőségbiztosítás és határidőkezelés független szakmai felülvizsgálata.",
              "serviceType": "Könyvelőiroda audit",
              "url": "https://xlntbi.hu/konyveloiroda-audit",
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
                              "name": "Könyvelőiroda audit",
                              "item": "https://xlntbi.hu/konyveloiroda-audit"
                      }
              ]
      }),
      },
    ],
  }),
  component: KonyveloirodaAuditPage,
});

function KonyveloirodaAuditPage() {
  return (
    <ServicePage
      title={"Könyvelőiroda audit"}
      intro={["A könyvelőiroda audit azoknak szól, akik a saját irodájuk működését szeretnék szakmai szemmel felülvizsgálni. A cél az, hogy lássuk: a folyamatok mennyire rendezettek, hatékonyak és skálázhatók.", "Egy könyvelőirodában a minőség, a határidőkezelés és az egységes munkamódszer kulcsfontosságú. Az audit során ezeket nézem át, és gyakorlati fejlesztési javaslatokat adok."]}
      ctaLabel={"Auditot kérek"}
      ctaTo={"/kapcsolat"}
      image={heroImage}
      imageAlt={"Könyvelőiroda audit – irodai folyamatok"}
      listTitle={"Mit vizsgálok?"}
      listItems={["Folyamatok szervezettsége", "Csapatmunka és feladatkiosztás", "Minőségbiztosítás", "Határidőkezelés", "Automatizáció", "Ügyfélkommunikáció"]}
      closing={{"eyebrow": "Eredmény", "heading": "Egy működési térkép az irodádhoz", "text": "Megmutatja, hol lehet gyorsítani, egyszerűsíteni és stabilizálni a könyvelőirodád működését.", "ctaLabel": "Auditot kérek", "ctaTo": "/kapcsolat"}}
    />
  );
}
