import { createFileRoute } from "@tanstack/react-router";
import { ProductDetail } from "@/components/ProductDetail";

const TITLE = "ÉV65 ÁFA-bevallás ÁNYK XML-generáló | EXCELlent Business Intelligence";
const DESCRIPTION = "Generálj gyorsan, hibamentesen NAV kompatibilis XML fájlt az ÉV65-ös ÁFA-bevalláshoz, Excelből kiindulva.";
const H1 = "ÉV65 ÁFA-bevallás ÁNYK XML-generáló";
const CANONICAL = "https://xlntbi.hu/termek/afa-ev65-xml-generalo";
const OG_IMAGE = "https://xlntbi.hu/og/account-assets-audit-bank-bookkeeping-finance-concept.jpg";

export const Route = createFileRoute("/termek/afa-ev65-xml-generalo")({
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
      { rel: "canonical", href: "https://xlntbi.hu/termek/afa-ev65-xml-generalo" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
                  "@context": "https://schema.org",
                  "@type": "SoftwareApplication",
                  "name": "ÉV65 ÁFA-bevallás ÁNYK XML-generáló",
                  "description": "Generálj gyorsan, hibamentesen NAV kompatibilis XML fájlt az ÉV65-ös ÁFA-bevalláshoz, Excelből kiindulva.",
                  "applicationCategory": "BusinessApplication",
                  "operatingSystem": "Windows",
                  "url": "https://xlntbi.hu/termek/afa-ev65-xml-generalo",
                  "image": "https://xlntbi.hu/og/account-assets-audit-bank-bookkeeping-finance-concept.jpg",
                  "inLanguage": "hu",
                  "brand": {
                            "@type": "Brand",
                            "name": "EXCELlent Business Intelligence"
                  },
                  "offers": {
                            "@type": "Offer",
                            "price": "34900",
                            "priceCurrency": "HUF",
                            "availability": "https://schema.org/InStock",
                            "url": "https://xlntbi.hu/termek/afa-ev65-xml-generalo"
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
                                      "name": "ÉV65 ÁFA-bevallás ÁNYK XML-generáló",
                                      "item": "https://xlntbi.hu/termek/afa-ev65-xml-generalo"
                            }
                  ]
        }),
      },
    ],
  }),
  component: ProductRoute,
});

function ProductRoute() {
  return <ProductDetail slug="afa-ev65-xml-generalo" h1={H1} />;
}
