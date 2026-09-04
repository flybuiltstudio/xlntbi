import { createFileRoute } from "@tanstack/react-router";
import { ProductDetail } from "@/components/ProductDetail";

const TITLE = "XLNT Havi pénzügyi riport sablon | EXCELlent Business Intelligence";
const DESCRIPTION = "Automatizált havi pénzügyi riport sablon, ami áttekinthetően mutatja cége havi teljesítményét és a fontos mutatókat.";
const H1 = "XLNT Havi riport";
const CANONICAL = "https://xlntbi.hu/termek/havi-riport";
const OG_IMAGE = "https://xlntbi.hu/og/online-kalkulator.jpg";

export const Route = createFileRoute("/termek/havi-riport")({
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
      { rel: "canonical", href: "https://xlntbi.hu/termek/havi-riport" },
      { rel: "alternate", hrefLang: "hu", href: "https://xlntbi.hu/termek/havi-riport" },
      { rel: "alternate", hrefLang: "en", href: "https://xlntbi.hu/termek/havi-riport-en" },
      { rel: "alternate", hrefLang: "x-default", href: "https://xlntbi.hu/termek/havi-riport" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
                  "@context": "https://schema.org",
                  "@type": "SoftwareApplication",
                  "name": "XLNT Havi riport",
                  "description": "Automatizált havi pénzügyi riport sablon, ami áttekinthetően mutatja cége havi teljesítményét és a fontos mutatókat.",
                  "applicationCategory": "BusinessApplication",
                  "operatingSystem": "Windows",
                  "url": "https://xlntbi.hu/termek/havi-riport",
                  "image": "https://xlntbi.hu/og/online-kalkulator.jpg",
                  "inLanguage": "hu",
                  "brand": {
                            "@type": "Brand",
                            "name": "EXCELlent Business Intelligence"
                  },
                  "offers": {
                            "@type": "Offer",
                            "price": "49900",
                            "priceCurrency": "HUF",
                            "availability": "https://schema.org/InStock",
                            "url": "https://xlntbi.hu/termek/havi-riport"
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
                                      "name": "XLNT Havi riport",
                                      "item": "https://xlntbi.hu/termek/havi-riport"
                            }
                  ]
        }),
      },
    ],
  }),
  component: ProductRoute,
});

function ProductRoute() {
  return <ProductDetail slug="havi-riport" h1={H1} />;
}
