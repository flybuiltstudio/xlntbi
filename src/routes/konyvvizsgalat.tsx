import { createFileRoute } from "@tanstack/react-router";
import { ServicePage } from "@/components/ServicePage";
import heroImage from "@/assets/135731.jpg";

const TITLE = "Könyvvizsgálat vállalkozásoknak | EXCELlent Business Intelligence";
const DESCRIPTION = "Törvényi és önkéntes könyvvizsgálat szakértői háttérrel, átlátható folyamatokkal és határidőre teljesítve.";
const CANONICAL = "https://xlntbi.hu/konyvvizsgalat";
const OG_IMAGE = "https://xlntbi.hu/og/135731.jpg";

export const Route = createFileRoute("/konyvvizsgalat")({
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
      { rel: "alternate", hrefLang: "hu", href: "https://xlntbi.hu/konyvvizsgalat" },
      { rel: "alternate", hrefLang: "en", href: "https://xlntbi.hu/en/statutory-audit" },
      { rel: "alternate", hrefLang: "x-default", href: "https://xlntbi.hu/konyvvizsgalat" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Service",
              "name": "Könyvvizsgálat",
              "description": "Törvényi és önkéntes könyvvizsgálat, átvilágítás és due diligence.",
              "serviceType": "Könyvvizsgálat",
              "url": "https://xlntbi.hu/konyvvizsgalat",
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
                              "name": "Könyvvizsgálat",
                              "item": "https://xlntbi.hu/konyvvizsgalat"
                      }
              ]
      }),
      },
    ],
  }),
  component: KonyvvizsgalatPage,
});

function KonyvvizsgalatPage() {
  return (
    <ServicePage
      title={"Könyvvizsgálat"}
      lead={"Könyvvizsgálat, átvilágítás, audit szolgáltatások"}
      intro={["A könyvvizsgálat és az átvilágítás célja nem csak az ellenőrzés, hanem az is, hogy valódi képet kapj a működésedről. Egy jól megcsinált audit megmutatja, hol vannak a kockázatok, és hol lehet javítani a folyamatokon.", "Könyvvizsgálati, due diligence és audit szolgáltatásaim során a pénzügyi, számviteli és működési megbízhatóságot vizsgálom."]}
      ctaLabel={"Audit konzultációt kérek"}
      ctaTo={"/konzultacio"}
      image={heroImage}
      imageAlt={"Könyvvizsgálat – pénzügyi adatok ellenőrzése"}
      listTitle={"Szolgáltatások"}
      listItems={["Könyvvizsgálat", "Átvilágítás", "Due diligence", "Audit előkészítés", "Belső kontrollok áttekintése", "Kockázatelemzés"]}
      closing={{"heading": "Kinek hasznos?", "items": ["Tulajdonosoknak", "Vezetőknek", "Befektetőknek", "Cégvásárlás előtt állóknak", "Olyan szervezeteknek, ahol fontos a transzparencia"], "ctaLabel": "Konzultációt kérek", "ctaTo": "/konzultacio"}}
    />
  );
}
