import { createFileRoute } from "@tanstack/react-router";
import { ProductDetail } from "@/components/ProductDetail";

const TITLE = "XLNT Utalási csomag készítő program | EXCELlent Business Intelligence";
const DESCRIPTION = "Generálj gyorsan banki utalási csomagot (pl. bér, szállítói) Excel adatokból, a bankod által elfogadott formátumban.";
const H1 = "XLNT Utalási csomag készítő";
const CANONICAL = "https://xlntbi.hu/termek/utalasi-csomag-keszito";
const OG_IMAGE = "https://xlntbi.hu/og/utalasi-csomag-keszito.jpg";

export const Route = createFileRoute("/termek/utalasi-csomag-keszito")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "product" },
      { property: "og:url", content: CANONICAL },
      { property: "og:image", content: OG_IMAGE },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
      { name: "twitter:image", content: OG_IMAGE },
    ],
    links: [
      { rel: "canonical", href: "https://xlntbi.hu/termek/utalasi-csomag-keszito" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
                  "@context": "https://schema.org",
                  "@type": "SoftwareApplication",
                  "name": "XLNT Utalási csomag készítő",
                  "description": "Generálj gyorsan banki utalási csomagot (pl. bér, szállítói) Excel adatokból, a bankod által elfogadott formátumban.",
                  "applicationCategory": "BusinessApplication",
                  "operatingSystem": "Windows",
                  "url": "https://xlntbi.hu/termek/utalasi-csomag-keszito",
                  "image": "https://xlntbi.hu/og/utalasi-csomag-keszito.jpg",
                  "inLanguage": "hu",
                  "brand": {
                            "@type": "Brand",
                            "name": "EXCELlent Business Intelligence"
                  },
                  "offers": {
                            "@type": "Offer",
                            "price": "19900",
                            "priceCurrency": "HUF",
                            "availability": "https://schema.org/InStock",
                            "url": "https://xlntbi.hu/termek/utalasi-csomag-keszito"
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
                                      "name": "Termékeim",
                                      "item": "https://xlntbi.hu/termekeim"
                            },
                            {
                                      "@type": "ListItem",
                                      "position": 3,
                                      "name": "XLNT Utalási csomag készítő",
                                      "item": "https://xlntbi.hu/termek/utalasi-csomag-keszito"
                            }
                  ]
        }),
      },
    ],
  }),
  component: ProductRoute,
});

function ProductRoute() {
  return <ProductDetail slug="utalasi-csomag-keszito" h1={H1} />;
}
