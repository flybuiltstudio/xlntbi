import { createFileRoute } from "@tanstack/react-router";
import { ProductDetail } from "@/components/ProductDetail";

const TITLE = "XLNT Külföldi számla import RLB könyvelőprogramba | EXCELlent Business Intelligence";
const DESCRIPTION = "Importáld gyorsan a külföldi bankszámlakivonatokat az RLB könyvelőprogramba, automatizált feldolgozással.";
const H1 = "XLNT Külföldi számla import, RLB";
const CANONICAL = "https://xlntbi.hu/termek/rlb-kulfoldi-szamla-import";
const OG_IMAGE = "https://xlntbi.hu/og/close-up-busy-businesswoman.jpg";

export const Route = createFileRoute("/termek/rlb-kulfoldi-szamla-import")({
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
      { rel: "canonical", href: "https://xlntbi.hu/termek/rlb-kulfoldi-szamla-import" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
                  "@context": "https://schema.org",
                  "@type": "SoftwareApplication",
                  "name": "XLNT Külföldi számla import, RLB",
                  "description": "Importáld gyorsan a külföldi bankszámlakivonatokat az RLB könyvelőprogramba, automatizált feldolgozással.",
                  "applicationCategory": "BusinessApplication",
                  "operatingSystem": "Windows",
                  "url": "https://xlntbi.hu/termek/rlb-kulfoldi-szamla-import",
                  "image": "https://xlntbi.hu/og/close-up-busy-businesswoman.jpg",
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
                            "url": "https://xlntbi.hu/termek/rlb-kulfoldi-szamla-import"
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
                                      "name": "XLNT Külföldi számla import, RLB",
                                      "item": "https://xlntbi.hu/termek/rlb-kulfoldi-szamla-import"
                            }
                  ]
        }),
      },
    ],
  }),
  component: ProductRoute,
});

function ProductRoute() {
  return <ProductDetail slug="rlb-kulfoldi-szamla-import" h1={H1} />;
}
