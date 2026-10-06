import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/PageHero";
import { ServicesGrid } from "@/components/ServicesGrid";
import { serviceItems } from "@/lib/services";

const items = serviceItems.filter((item) => !item.to.startsWith("/en/"));


const TITLE = "Szolgáltatásaim: könyveléstől a BI tanácsadásig | EXCELlent Business Intelligence";
const DESCRIPTION = "Tekintsd át teljes szolgáltatási palettámat: könyvelés, adótanácsadás, kontrolling, cégaudit, könyvvizsgálat és fintech BI megoldások.";
const CANONICAL = "https://xlntbi.hu/szolgaltatasaim";
const OG_IMAGE = "https://xlntbi.hu/og/bi.jpg";

export const Route = createFileRoute("/szolgaltatasaim")({
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
      { rel: "alternate", hrefLang: "hu", href: "https://xlntbi.hu/szolgaltatasaim" },
      { rel: "alternate", hrefLang: "en", href: "https://xlntbi.hu/en/services" },
      { rel: "alternate", hrefLang: "x-default", href: "https://xlntbi.hu/szolgaltatasaim" },
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
                              "name": "Szolgáltatásaim",
                              "item": "https://xlntbi.hu/szolgaltatasaim"
                      }
              ]
      }),
      },
    ],
  }),
  component: SzolgaltatasaimPage,
});


function SzolgaltatasaimPage() {
  return (
    <>
      <PageHero>
        <h1 className="text-3xl font-bold text-primary-foreground md:text-4xl">
          Szolgáltatásaim
        </h1>
      </PageHero>

      <ServicesGrid items={items} more="Tovább" videoLabel="Szolgáltatások – hangulatvideó" />
    </>
  );
}
