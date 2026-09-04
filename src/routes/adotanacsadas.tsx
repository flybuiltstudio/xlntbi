import { createFileRoute } from "@tanstack/react-router";
import { ServicePage } from "@/components/ServicePage";
import heroImage from "@/assets/account-assets-audit-bank-bookkeeping-finance-concept.jpg";

const TITLE = "Adótanácsadás vállalkozásoknak | EXCELlent Business Intelligence";
const DESCRIPTION = "Szakértői adótanácsadás cégeknek és vállalkozóknak: adóoptimalizálás, adózási kérdések, NAV ügyintézés támogatása.";
const CANONICAL = "https://xlntbi.hu/adotanacsadas";
const OG_IMAGE = "https://xlntbi.hu/og/account-assets-audit-bank-bookkeeping-finance-concept.jpg";

export const Route = createFileRoute("/adotanacsadas")({
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
      { rel: "alternate", hrefLang: "hu", href: "https://xlntbi.hu/adotanacsadas" },
      { rel: "alternate", hrefLang: "en", href: "https://xlntbi.hu/en/tax-advisory" },
      { rel: "alternate", hrefLang: "x-default", href: "https://xlntbi.hu/adotanacsadas" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Service",
              "name": "Adótanácsadás",
              "description": "Szakértői adótanácsadás cégeknek és vállalkozóknak: adóoptimalizálás, adózási kérdések, NAV ügyintézés támogatása.",
              "serviceType": "Adótanácsadás",
              "url": "https://xlntbi.hu/adotanacsadas",
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
                              "name": "Adótanácsadás",
                              "item": "https://xlntbi.hu/adotanacsadas"
                      }
              ]
      }),
      },
    ],
  }),
  component: AdotanacsadasPage,
});

function AdotanacsadasPage() {
  return (
    <ServicePage
      title={"Adótanácsadás"}
      lead={"Adótanácsadás és ügyviteli tanácsadás"}
      intro={["Az adózásban egy jó döntés sokszor évekig meghatározza a működésedet. Ezért nem sablonválaszokat adok, hanem a konkrét helyzetedre szabott szakmai megoldást keresek.", "Adótanácsadási és ügyviteli tanácsadási szolgáltatásaim célja, hogy a vállalkozásod adózási és működési kérdései tiszták, tervezhetők és kontrollálhatók legyenek."]}
      ctaLabel={"Konzultációt kérek"}
      ctaTo={"/kapcsolat"}
      image={heroImage}
      imageAlt={"Adótanácsadás – pénzügyi dokumentumok elemzése"}
      listTitle={"Tipikus témák"}
      listItems={["Adózási forma kiválasztása", "Kifizetések és juttatások kezelése", "NAV- és adózási kockázatok csökkentése", "Céges működési kérdések", "Ügyviteli folyamatok egyszerűsítése", "Döntéselőkészítés"]}
      closing={{"heading": "Miben segít?", "text": "Átláthatóbbá teszi a működésedet, és segít elkerülni a felesleges hibákat, plusz terheket és bizonytalanságot.", "ctaLabel": "Konzultációt kérek", "ctaTo": "/kapcsolat"}}
    />
  );
}
