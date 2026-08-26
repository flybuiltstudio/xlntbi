import { createFileRoute } from "@tanstack/react-router";
import { ProductDetail } from "@/components/ProductDetail";

const TITLE = "WiFi jelszó néző program | EXCELlent Business Intelligence";
const DESCRIPTION = "Nézd meg egyszerűen a számítógépeden korábban mentett WiFi hálózatok jelszavait egy kattintással.";
const H1 = "WiFi jelszó néző";
const CANONICAL = "https://xlntbi.hu/termek/wifi-jelszo-nezo";
const OG_IMAGE = "https://xlntbi.hu/og/wifi-jelszo-nezo.jpg";

export const Route = createFileRoute("/termek/wifi-jelszo-nezo")({
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
      { rel: "canonical", href: "https://xlntbi.hu/termek/wifi-jelszo-nezo" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
                  "@context": "https://schema.org",
                  "@type": "SoftwareApplication",
                  "name": "WiFi jelszó néző",
                  "description": "Nézd meg egyszerűen a számítógépeden korábban mentett WiFi hálózatok jelszavait egy kattintással.",
                  "applicationCategory": "BusinessApplication",
                  "operatingSystem": "Windows",
                  "url": "https://xlntbi.hu/termek/wifi-jelszo-nezo",
                  "image": "https://xlntbi.hu/og/wifi-jelszo-nezo.jpg",
                  "inLanguage": "hu",
                  "brand": {
                            "@type": "Brand",
                            "name": "EXCELlent Business Intelligence"
                  },
                  "offers": {
                            "@type": "Offer",
                            "price": "2900",
                            "priceCurrency": "HUF",
                            "availability": "https://schema.org/InStock",
                            "url": "https://xlntbi.hu/termek/wifi-jelszo-nezo"
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
                                      "name": "WiFi jelszó néző",
                                      "item": "https://xlntbi.hu/termek/wifi-jelszo-nezo"
                            }
                  ]
        }),
      },
    ],
  }),
  component: ProductRoute,
});

function ProductRoute() {
  return <ProductDetail slug="wifi-jelszo-nezo" h1={H1} />;
}
