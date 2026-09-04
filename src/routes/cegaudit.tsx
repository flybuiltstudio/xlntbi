import { createFileRoute } from "@tanstack/react-router";
import { ServicePage } from "@/components/ServicePage";
import heroImage from "@/assets/cegaudit.jpg";

const TITLE = "Cégaudit szolgáltatás | EXCELlent Business Intelligence";
const DESCRIPTION = "Átfogó cégaudit, amely feltárja vállalkozásod pénzügyi, számviteli és folyamatbeli kockázatait, konkrét javaslatokkal.";
const CANONICAL = "https://xlntbi.hu/cegaudit";
const OG_IMAGE = "https://xlntbi.hu/og/cegaudit.jpg";

export const Route = createFileRoute("/cegaudit")({
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
      { rel: "alternate", hrefLang: "hu", href: "https://xlntbi.hu/cegaudit" },
      { rel: "alternate", hrefLang: "en", href: "https://xlntbi.hu/en/company-audit" },
      { rel: "alternate", hrefLang: "x-default", href: "https://xlntbi.hu/cegaudit" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Service",
              "name": "Cégaudit",
              "description": "Átfogó cégaudit a pénzügyi, számviteli és folyamatbeli kockázatok feltárására.",
              "serviceType": "Cégaudit",
              "url": "https://xlntbi.hu/cegaudit",
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
                              "name": "Cégaudit",
                              "item": "https://xlntbi.hu/cegaudit"
                      }
              ]
      }),
      },
    ],
  }),
  component: CegauditPage,
});

function CegauditPage() {
  return (
    <ServicePage
      title={"Cégaudit"}
      intro={["A cégaudit célja, hogy külső szemmel nézzünk rá a működésedre, és megtaláljuk, hol lehet egyszerűsíteni, gyorsítani vagy biztonságosabbá tenni a folyamatokat.", "Ez nem hosszú elméleti anyag, hanem gyakorlati feltárás és fejlesztési javaslat. A hangsúly a használhatóságon van."]}
      ctaLabel={"Cégauditot kérek"}
      ctaTo={"/konzultacio"}
      image={heroImage}
      imageAlt={"Cégaudit – működési folyamatok átvilágítása"}
      listTitle={"Mit vizsgálunk?"}
      listItems={["Folyamatok", "Kontrollok", "Riportálás", "Határidők", "Hibaforrások", "Digitalizációs lehetőségek"]}
      closing={{"heading": "Kinek ajánlott?", "items": ["Tulajdonosoknak", "Ügyvezetőknek", "Pénzügyi vezetőknek", "Olyan cégeknek, amelyek javítani akarnak a működésükön"], "ctaLabel": "Konzultációt kérek", "ctaTo": "/konzultacio"}}
    />
  );
}
