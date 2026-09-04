import { createFileRoute } from "@tanstack/react-router";
import { ProductDetail } from "@/components/ProductDetail";

const TITLE = "XLNT évA60 összesítő nyilatkozat XML-generáló | EXCELlent Business Intelligence";
const DESCRIPTION = "Készítsd el gyorsan a NAV-kompatibilis XML fájlt az A60 összesítő nyilatkozathoz, Excel alapú adatokból. A licenc a megrendelés évére érvényes.";
const H1 = "XLNT évA60 összesítő nyilatkozat XML-generáló";
const CANONICAL = "https://xlntbi.hu/termek/a60-osszesito-nyilatkozat-xml";
const OG_IMAGE = "https://xlntbi.hu/og/controlling.jpg";

export const Route = createFileRoute("/termek/a60-osszesito-nyilatkozat-xml")({
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
      { rel: "canonical", href: "https://xlntbi.hu/termek/a60-osszesito-nyilatkozat-xml" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
                  "@context": "https://schema.org",
                  "@type": "SoftwareApplication",
                  "name": "XLNT évA60 összesítő nyilatkozat XML-generáló",
                  "description": "Készítsd el gyorsan a NAV-kompatibilis XML fájlt az A60 összesítő nyilatkozathoz, Excel alapú adatokból. A licenc a megrendelés évére érvényes.",
                  "applicationCategory": "BusinessApplication",
                  "operatingSystem": "Windows",
                  "url": "https://xlntbi.hu/termek/a60-osszesito-nyilatkozat-xml",
                  "image": "https://xlntbi.hu/og/controlling.jpg",
                  "inLanguage": "hu",
                  "brand": {
                            "@type": "Brand",
                            "name": "EXCELlent Business Intelligence"
                  },
                  "offers": {
                            "@type": "Offer",
                            "price": "24900",
                            "priceCurrency": "HUF",
                            "availability": "https://schema.org/InStock",
                            "url": "https://xlntbi.hu/termek/a60-osszesito-nyilatkozat-xml"
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
                                      "name": "XLNT évA60 összesítő nyilatkozat XML-generáló",
                                      "item": "https://xlntbi.hu/termek/a60-osszesito-nyilatkozat-xml"
                            }
                  ]
        }),
      },
    ],
  }),
  component: ProductRoute,
});

function ProductRoute() {
  return <ProductDetail slug="a60-osszesito-nyilatkozat-xml" h1={H1} />;
}
