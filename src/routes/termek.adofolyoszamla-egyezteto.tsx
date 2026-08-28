import { createFileRoute } from "@tanstack/react-router";
import { ProductDetail } from "@/components/ProductDetail";

const TITLE = "XLNT Adófolyószámla egyeztető program | EXCELlent Business Intelligence";
const DESCRIPTION = "Egyeztesd automatikusan a NAV adófolyószámla adatait a könyveléseddel, és szűrd ki gyorsan az eltéréseket.";
const H1 = "XLNT Adófolyószámla egyeztető";
const CANONICAL = "https://xlntbi.hu/termek/adofolyoszamla-egyezteto";
const OG_IMAGE = "https://xlntbi.hu/og/cegaudit.jpg";

export const Route = createFileRoute("/termek/adofolyoszamla-egyezteto")({
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
      { rel: "canonical", href: "https://xlntbi.hu/termek/adofolyoszamla-egyezteto" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
                  "@context": "https://schema.org",
                  "@type": "SoftwareApplication",
                  "name": "Adófolyószámla egyeztető",
                  "description": "Egyeztesd automatikusan a NAV adófolyószámla adatait a könyveléseddel, és szűrd ki gyorsan az eltéréseket.",
                  "applicationCategory": "BusinessApplication",
                  "operatingSystem": "Windows",
                  "url": "https://xlntbi.hu/termek/adofolyoszamla-egyezteto",
                  "image": "https://xlntbi.hu/og/cegaudit.jpg",
                  "inLanguage": "hu",
                  "brand": {
                            "@type": "Brand",
                            "name": "EXCELlent Business Intelligence"
                  },
                  "offers": {
                            "@type": "Offer",
                            "price": "9900",
                            "priceCurrency": "HUF",
                            "availability": "https://schema.org/InStock",
                            "url": "https://xlntbi.hu/termek/adofolyoszamla-egyezteto"
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
                                      "name": "Adófolyószámla egyeztető",
                                      "item": "https://xlntbi.hu/termek/adofolyoszamla-egyezteto"
                            }
                  ]
        }),
      },
    ],
  }),
  component: ProductRoute,
});

function ProductRoute() {
  return <ProductDetail slug="adofolyoszamla-egyezteto" h1={H1} />;
}
