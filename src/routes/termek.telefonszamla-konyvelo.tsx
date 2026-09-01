import { createFileRoute } from "@tanstack/react-router";
import { ProductDetail } from "@/components/ProductDetail";

const TITLE = "XLNT Telefonszámla könyvelő program | EXCELlent Business Intelligence";
const DESCRIPTION = "Dolgozd fel és könyveld automatikusan a céges telefonszámlák tételeit, magán és üzleti hívások szétválasztásával.";
const H1 = "XLNT Telefonszámla könyvelő";
const CANONICAL = "https://xlntbi.hu/termek/telefonszamla-konyvelo";
const OG_IMAGE = "https://xlntbi.hu/og/termekek.jpg";

export const Route = createFileRoute("/termek/telefonszamla-konyvelo")({
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
      { rel: "canonical", href: "https://xlntbi.hu/termek/telefonszamla-konyvelo" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
                  "@context": "https://schema.org",
                  "@type": "SoftwareApplication",
                  "name": "XLNT Telefonszámla könyvelő",
                  "description": "Dolgozd fel és könyveld automatikusan a céges telefonszámlák tételeit, magán és üzleti hívások szétválasztásával.",
                  "applicationCategory": "BusinessApplication",
                  "operatingSystem": "Windows",
                  "url": "https://xlntbi.hu/termek/telefonszamla-konyvelo",
                  "image": "https://xlntbi.hu/og/termekek.jpg",
                  "inLanguage": "hu",
                  "brand": {
                            "@type": "Brand",
                            "name": "EXCELlent Business Intelligence"
                  },
                  "offers": {
                            "@type": "Offer",
                            "price": "14900",
                            "priceCurrency": "HUF",
                            "availability": "https://schema.org/InStock",
                            "url": "https://xlntbi.hu/termek/telefonszamla-konyvelo"
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
                                      "name": "XLNT Telefonszámla könyvelő",
                                      "item": "https://xlntbi.hu/termek/telefonszamla-konyvelo"
                            }
                  ]
        }),
      },
    ],
  }),
  component: ProductRoute,
});

function ProductRoute() {
  return <ProductDetail slug="telefonszamla-konyvelo" h1={H1} />;
}
