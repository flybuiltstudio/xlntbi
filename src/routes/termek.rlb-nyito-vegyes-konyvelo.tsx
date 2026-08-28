import { createFileRoute } from "@tanstack/react-router";
import { ProductDetail } from "@/components/ProductDetail";

const TITLE = "XLNT RLB nyitó és vegyes könyvelő program | EXCELlent Business Intelligence";
const DESCRIPTION = "Generálj nyitó és vegyes könyvelési tételeket az RLB rendszerhez gyorsan, Excel alapú sablonból kiindulva.";
const H1 = "XLNT RLB nyitó, vegyes könyvelő";
const CANONICAL = "https://xlntbi.hu/termek/rlb-nyito-vegyes-konyvelo";
const OG_IMAGE = "https://xlntbi.hu/og/nyito-vegyes-konyvelo.jpg";

export const Route = createFileRoute("/termek/rlb-nyito-vegyes-konyvelo")({
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
      { rel: "canonical", href: "https://xlntbi.hu/termek/rlb-nyito-vegyes-konyvelo" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
                  "@context": "https://schema.org",
                  "@type": "SoftwareApplication",
                  "name": "XLNT RLB nyitó, vegyes könyvelő",
                  "description": "Generálj nyitó és vegyes könyvelési tételeket az RLB rendszerhez gyorsan, Excel alapú sablonból kiindulva.",
                  "applicationCategory": "BusinessApplication",
                  "operatingSystem": "Windows",
                  "url": "https://xlntbi.hu/termek/rlb-nyito-vegyes-konyvelo",
                  "image": "https://xlntbi.hu/og/nyito-vegyes-konyvelo.jpg",
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
                            "url": "https://xlntbi.hu/termek/rlb-nyito-vegyes-konyvelo"
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
                                      "name": "XLNT RLB nyitó, vegyes könyvelő",
                                      "item": "https://xlntbi.hu/termek/rlb-nyito-vegyes-konyvelo"
                            }
                  ]
        }),
      },
    ],
  }),
  component: ProductRoute,
});

function ProductRoute() {
  return <ProductDetail slug="rlb-nyito-vegyes-konyvelo" h1={H1} />;
}
