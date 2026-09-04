import { createFileRoute } from "@tanstack/react-router";
import { ProductDetail } from "@/components/ProductDetail";

const TITLE = "XLNT Univerzális bankkivonat konverter | EXCELlent Business Intelligence";
const DESCRIPTION = "Alakíts át bármely bank kivonatát a könyvelőprogramod által elfogadott formátumra, rugalmasan testreszabható beállításokkal.";
const H1 = "XLNT Univerzális bank konverter";
const CANONICAL = "https://xlntbi.hu/termek/univerzalis-bank-konverter";
const OG_IMAGE = "https://xlntbi.hu/og/online-kalkulator.jpg";

export const Route = createFileRoute("/termek/univerzalis-bank-konverter")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "product" },
      { property: "og:url", content: CANONICAL },
      { property: "og:locale", content: "hu_HU" },
      { property: "og:image", content: OG_IMAGE },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
      { name: "twitter:image", content: OG_IMAGE },
    ],
    links: [
      { rel: "canonical", href: "https://xlntbi.hu/termek/univerzalis-bank-konverter" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
                  "@context": "https://schema.org",
                  "@type": "SoftwareApplication",
                  "name": "XLNT Univerzális bank konverter",
                  "description": "Alakíts át bármely bank kivonatát a könyvelőprogramod által elfogadott formátumra, rugalmasan testreszabható beállításokkal.",
                  "applicationCategory": "BusinessApplication",
                  "operatingSystem": "Windows",
                  "url": "https://xlntbi.hu/termek/univerzalis-bank-konverter",
                  "image": "https://xlntbi.hu/og/online-kalkulator.jpg",
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
                            "url": "https://xlntbi.hu/termek/univerzalis-bank-konverter"
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
                                      "name": "XLNT Univerzális bank konverter",
                                      "item": "https://xlntbi.hu/termek/univerzalis-bank-konverter"
                            }
                  ]
        }),
      },
    ],
  }),
  component: ProductRoute,
});

function ProductRoute() {
  return <ProductDetail slug="univerzalis-bank-konverter" h1={H1} />;
}
