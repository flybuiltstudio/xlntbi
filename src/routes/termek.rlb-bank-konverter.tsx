import { createFileRoute } from "@tanstack/react-router";
import { ProductDetail } from "@/components/ProductDetail";

const TITLE = "XLNT RLB bank konverter – alap kiadás banki kivonat importhoz | EXCELlent Business Intelligence";
const DESCRIPTION = "Az alap kiadás: alakítsd át és importáld a banki kivonatokat egyszerűen az RLB könyvelőprogramba, kézi adatrögzítés nélkül. Bővített funkciókért válaszd a PRO verziót.";
const H1 = "XLNT RLB bank konverter";
const CANONICAL = "https://xlntbi.hu/termek/rlb-bank-konverter";
const OG_IMAGE = "https://xlntbi.hu/og/rlb-bank-konverter.jpg";

export const Route = createFileRoute("/termek/rlb-bank-konverter")({
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
      { rel: "canonical", href: "https://xlntbi.hu/termek/rlb-bank-konverter" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
                  "@context": "https://schema.org",
                  "@type": "SoftwareApplication",
                  "name": "XLNT RLB bank konverter",
                  "description": "Az alap kiadás: alakítsd át és importáld a banki kivonatokat egyszerűen az RLB könyvelőprogramba, kézi adatrögzítés nélkül. Bővített funkciókért válaszd a PRO verziót.",
                  "applicationCategory": "BusinessApplication",
                  "operatingSystem": "Windows",
                  "url": "https://xlntbi.hu/termek/rlb-bank-konverter",
                  "image": "https://xlntbi.hu/og/En-modern-konyveloirodaban.jpg",
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
                            "url": "https://xlntbi.hu/termek/rlb-bank-konverter"
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
                                      "name": "XLNT RLB bank konverter",
                                      "item": "https://xlntbi.hu/termek/rlb-bank-konverter"
                            }
                  ]
        }),
      },
    ],
  }),
  component: ProductRoute,
});

function ProductRoute() {
  return <ProductDetail slug="rlb-bank-konverter" h1={H1} />;
}
