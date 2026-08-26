import { createFileRoute } from "@tanstack/react-router";
import { ProductDetail } from "@/components/ProductDetail";

const TITLE = "IFRS konszolidáló program | EXCELlent Business Intelligence";
const DESCRIPTION = "Állítsd össze cégcsoportod IFRS szerinti konszolidált beszámolóját gyorsan, egységes Excel alapú munkafolyamattal.";
const H1 = "IFRS konszolidáló";
const CANONICAL = "https://xlntbi.hu/termek/ifrs-konszolidalo";
const OG_IMAGE = "https://xlntbi.hu/og/ifrs-konszolidalo.jpg";

export const Route = createFileRoute("/termek/ifrs-konszolidalo")({
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
      { rel: "canonical", href: "https://xlntbi.hu/termek/ifrs-konszolidalo" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
                  "@context": "https://schema.org",
                  "@type": "SoftwareApplication",
                  "name": "IFRS konszolidáló",
                  "description": "Állítsd össze cégcsoportod IFRS szerinti konszolidált beszámolóját gyorsan, egységes Excel alapú munkafolyamattal.",
                  "applicationCategory": "BusinessApplication",
                  "operatingSystem": "Windows",
                  "url": "https://xlntbi.hu/termek/ifrs-konszolidalo",
                  "image": "https://xlntbi.hu/og/ifrs-konszolidalo.jpg",
                  "inLanguage": "hu",
                  "brand": {
                            "@type": "Brand",
                            "name": "EXCELlent Business Intelligence"
                  },
                  "offers": {
                            "@type": "Offer",
                            "price": "149900",
                            "priceCurrency": "HUF",
                            "availability": "https://schema.org/InStock",
                            "url": "https://xlntbi.hu/termek/ifrs-konszolidalo"
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
                                      "name": "IFRS konszolidáló",
                                      "item": "https://xlntbi.hu/termek/ifrs-konszolidalo"
                            }
                  ]
        }),
      },
    ],
  }),
  component: ProductRoute,
});

function ProductRoute() {
  return <ProductDetail slug="ifrs-konszolidalo" h1={H1} />;
}
