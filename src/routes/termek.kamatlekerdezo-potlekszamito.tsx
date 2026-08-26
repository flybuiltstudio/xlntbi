import { createFileRoute } from "@tanstack/react-router";
import { ProductDetail } from "@/components/ProductDetail";

const TITLE = "Késedelmi kamat és pótlékszámító program | EXCELlent Business Intelligence";
const DESCRIPTION = "Számold ki gyorsan és pontosan a késedelmi kamatot és az adóhatósági pótlékot a hatályos jegybanki alapkamat alapján.";
const H1 = "Kamatlekérdező, pótlékszámító";
const CANONICAL = "https://xlntbi.hu/termek/kamatlekerdezo-potlekszamito";
const OG_IMAGE = "https://xlntbi.hu/og/account-assets-audit-bank-bookkeeping-finance-concept.jpg";

export const Route = createFileRoute("/termek/kamatlekerdezo-potlekszamito")({
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
      { rel: "canonical", href: "https://xlntbi.hu/termek/kamatlekerdezo-potlekszamito" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
                  "@context": "https://schema.org",
                  "@type": "SoftwareApplication",
                  "name": "Kamatlekérdező, pótlékszámító",
                  "description": "Számold ki gyorsan és pontosan a késedelmi kamatot és az adóhatósági pótlékot a hatályos jegybanki alapkamat alapján.",
                  "applicationCategory": "BusinessApplication",
                  "operatingSystem": "Windows",
                  "url": "https://xlntbi.hu/termek/kamatlekerdezo-potlekszamito",
                  "image": "https://xlntbi.hu/og/account-assets-audit-bank-bookkeeping-finance-concept.jpg",
                  "inLanguage": "hu",
                  "brand": {
                            "@type": "Brand",
                            "name": "EXCELlent Business Intelligence"
                  },
                  "offers": {
                            "@type": "Offer",
                            "price": "7900",
                            "priceCurrency": "HUF",
                            "availability": "https://schema.org/InStock",
                            "url": "https://xlntbi.hu/termek/kamatlekerdezo-potlekszamito"
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
                                      "name": "Kamatlekérdező, pótlékszámító",
                                      "item": "https://xlntbi.hu/termek/kamatlekerdezo-potlekszamito"
                            }
                  ]
        }),
      },
    ],
  }),
  component: ProductRoute,
});

function ProductRoute() {
  return <ProductDetail slug="kamatlekerdezo-potlekszamito" h1={H1} />;
}
