import { createFileRoute } from "@tanstack/react-router";
import { ProductDetail } from "@/components/ProductDetail";

const TITLE = "XLNT RLB bank konverter Pro – bővített, automatizált banki import | EXCELlent Business Intelligence";
const DESCRIPTION = "Az RLB bank konverter PRO kiadása: több bankformátum, kötegelt feldolgozás, automatikus partner- és főkönyvi felismerés, gyorsabb, hibamentes import.";
const H1 = "XLNT RLB bank konverter Pro";
const CANONICAL = "https://xlntbi.hu/termek/rlb-bank-konverter-pro";
const OG_IMAGE = "https://xlntbi.hu/og/konyveloiroda-audit.jpg";

export const Route = createFileRoute("/termek/rlb-bank-konverter-pro")({
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
      { rel: "canonical", href: "https://xlntbi.hu/termek/rlb-bank-konverter-pro" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
                  "@context": "https://schema.org",
                  "@type": "SoftwareApplication",
                  "name": "XLNT RLB bank konverter Pro",
                  "description": "Az RLB bank konverter PRO kiadása: több bankformátum, kötegelt feldolgozás, automatikus partner- és főkönyvi felismerés, gyorsabb, hibamentes import.",
                  "applicationCategory": "BusinessApplication",
                  "operatingSystem": "Windows",
                  "url": "https://xlntbi.hu/termek/rlb-bank-konverter-pro",
                  "image": "https://xlntbi.hu/og/konyveloiroda-audit.jpg",
                  "inLanguage": "hu",
                  "brand": {
                            "@type": "Brand",
                            "name": "EXCELlent Business Intelligence"
                  },
                  "offers": {
                            "@type": "Offer",
                            "price": "29900",
                            "priceCurrency": "HUF",
                            "availability": "https://schema.org/InStock",
                            "url": "https://xlntbi.hu/termek/rlb-bank-konverter-pro"
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
                                      "name": "XLNT RLB bank konverter Pro",
                                      "item": "https://xlntbi.hu/termek/rlb-bank-konverter-pro"
                            }
                  ]
        }),
      },
    ],
  }),
  component: ProductRoute,
});

function ProductRoute() {
  return <ProductDetail slug="rlb-bank-konverter-pro" h1={H1} />;
}
