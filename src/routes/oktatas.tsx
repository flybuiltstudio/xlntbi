import { createFileRoute } from "@tanstack/react-router";
import { ServicePage } from "@/components/ServicePage";
import heroImage from "@/assets/oktatas.jpg";

const TITLE = "Oktatás és képzés vállalkozóknak, könyvelőknek | EXCELlent Business Intelligence";
const DESCRIPTION = "Gyakorlati pénzügyi és könyvelési képzések vállalkozóknak és szakembereknek, hogy magabiztosan kezeld cége számait.";
const CANONICAL = "https://xlntbi.hu/oktatas";
const OG_IMAGE = "https://xlntbi.hu/og/oktatas.jpg";

export const Route = createFileRoute("/oktatas")({
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
      { rel: "alternate", hrefLang: "hu", href: "https://xlntbi.hu/oktatas" },
      { rel: "alternate", hrefLang: "en", href: "https://xlntbi.hu/en/training" },
      { rel: "alternate", hrefLang: "x-default", href: "https://xlntbi.hu/oktatas" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Service",
              "name": "Oktatás és képzés",
              "description": "Gyakorlati pénzügyi, számviteli és Excel, Power BI képzések vállalkozóknak és könyvelőknek.",
              "serviceType": "Oktatás és képzés",
              "url": "https://xlntbi.hu/oktatas",
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
                              "name": "Oktatás",
                              "item": "https://xlntbi.hu/oktatas"
                      }
              ]
      }),
      },
    ],
  }),
  component: OktatasPage,
});

function OktatasPage() {
  return (
    <ServicePage
      title={"Oktatás"}
      intro={["Az oktatásban nem csak elméletet adok át, hanem használható, napi munkában is alkalmazható tudást. A cél az, hogy a résztvevő ne csak értse a témát, hanem tudja is használni.", "Az oktatási témák a könyvelés, az adózás, a digitális folyamatok, a Power BI és az automatizáció köré épülnek. A hangsúly mindig a gyakorlati alkalmazáson van."]}
      ctaLabel={"Oktatást kérek"}
      ctaTo={"/konzultacio"}
      image={heroImage}
      imageAlt={"Oktatás – szakmai képzés"}
      listTitle={"Témák"}
      listItems={["Könyvelési alapok és haladó gyakorlat", "Adózási logika és döntéstámogatás", "Excel használat szakmai szinten", "Power BI alapok", "Automatizálás pénzügyi szemlélettel", "AI használat a mindennapi munkában", "Vizsgára és gyakorlati munkára felkészítés"]}
      closing={{"heading": "Kinek szól?", "items": ["Főiskolai és egyetemi hallgatóknak", "Mérlegképes könyvelő hallgatóknak", "Adótanácsadó jelölteknek", "Pályakezdőknek", "Haladó szakembereknek"], "ctaLabel": "Konzultációt kérek", "ctaTo": "/konzultacio"}}
    />
  );
}
