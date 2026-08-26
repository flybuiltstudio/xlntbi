import { createFileRoute } from "@tanstack/react-router";
import { ServicePage } from "@/components/ServicePage";
import heroImage from "@/assets/account-assets-audit-bank-bookkeeping-finance-concept.jpg";

const TITLE = "Digitális időmegtakarítási audit | EXCELlent Business Intelligence";
const DESCRIPTION = "Derítsd ki, mennyi időt takaríthatsz meg cégednél a pénzügyi és könyvelési folyamatok digitalizálásával és automatizálásával.";
const CANONICAL = "https://xlntbi.hu/digitalis-idomegtakaritasi-audit";
const OG_IMAGE = "https://xlntbi.hu/og/termekek.jpg";

export const Route = createFileRoute("/digitalis-idomegtakaritasi-audit")({
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
              "name": "Digitális időmegtakarítási audit",
              "description": "Pénzügyi és könyvelési folyamatok digitalizálási és automatizálási lehetőségeinek feltárása.",
              "serviceType": "Digitális időmegtakarítási audit",
              "url": "https://xlntbi.hu/digitalis-idomegtakaritasi-audit",
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
                              "name": "Digitális időmegtakarítási audit",
                              "item": "https://xlntbi.hu/digitalis-idomegtakaritasi-audit"
                      }
              ]
      }),
      },
    ],
  }),
  component: DigitalisAuditPage,
});

function DigitalisAuditPage() {
  return (
    <ServicePage
      title={"Digitális időmegtakarítási audit"}
      intro={["Ha a mindennapi munkád része az Excel, a Power BI, az AI-eszközök vagy más digitális rendszerek használata, akár komplex makrókkal együtt, rengeteg idő el tud menni felesleges lépésekre, kézi javításokra és rosszul felépített folyamatokra. Az időmegtakarítási audit célja, hogy ezeket megtaláljuk és megszüntessük.", "Az audit során átnézem a használt fájlokat, folyamatokat és rendszereket, majd megmutatom, hol lehet időt nyerni. A cél nem több eszköz, hanem kevesebb munka ugyanannyi vagy jobb eredményért."]}
      ctaLabel={"Audit időpontot kérek"}
      ctaTo={"/konzultacio"}
      image={heroImage}
      imageAlt={"Digitális időmegtakarítási audit – folyamatok elemzése"}
      listTitle={"Amit vizsgálok"}
      listItems={["Képletek és függőségek", "Makrók és automatizmusok", "Adatbeviteli pontok", "Riportkészítés", "Felesleges manuális lépések", "Hibaforrások", "AI-alapú gyorsítási lehetőségek"]}
      closing={{"heading": "Kinek ajánlott?", "items": ["Könyvelőknek", "Pénzügyi szakembereknek", "Kontrollereknek", "Irodai csapatoknak", "Cégeknek, amelyek sokat dolgoznak digitális eszközökkel"], "ctaLabel": "Konzultációt kérek", "ctaTo": "/konzultacio"}}
    />
  );
}
