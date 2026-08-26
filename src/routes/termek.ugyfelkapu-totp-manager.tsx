import { createFileRoute } from "@tanstack/react-router";
import { ProductDetail } from "@/components/ProductDetail";

const TITLE = "Ügyfélkapu TOTP kezelő program | EXCELlent Business Intelligence";
const DESCRIPTION = "Kezeld egy helyen több ügyfél Ügyfélkapus kétfaktoros hitelesítő kódjait, biztonságosan és gyorsan, könyvelőirodáknak.";
const H1 = "Ügyfélkapu TOTP kezelő";
const CANONICAL = "https://xlntbi.hu/termek/ugyfelkapu-totp-manager";
const OG_IMAGE = "https://xlntbi.hu/og/135731.jpg";

export const Route = createFileRoute("/termek/ugyfelkapu-totp-manager")({
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
      { rel: "canonical", href: "https://xlntbi.hu/termek/ugyfelkapu-totp-manager" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
                  "@context": "https://schema.org",
                  "@type": "SoftwareApplication",
                  "name": "Ügyfélkapu TOTP kezelő",
                  "description": "Kezeld egy helyen több ügyfél Ügyfélkapus kétfaktoros hitelesítő kódjait, biztonságosan és gyorsan, könyvelőirodáknak.",
                  "applicationCategory": "BusinessApplication",
                  "operatingSystem": "Windows",
                  "url": "https://xlntbi.hu/termek/ugyfelkapu-totp-manager",
                  "image": "https://xlntbi.hu/og/135731.jpg",
                  "inLanguage": "hu",
                  "brand": {
                            "@type": "Brand",
                            "name": "EXCELlent Business Intelligence"
                  },
                  "offers": {
                            "@type": "Offer",
                            "price": "7990",
                            "priceCurrency": "HUF",
                            "availability": "https://schema.org/InStock",
                            "url": "https://xlntbi.hu/termek/ugyfelkapu-totp-manager"
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
                                      "name": "Ügyfélkapu TOTP kezelő",
                                      "item": "https://xlntbi.hu/termek/ugyfelkapu-totp-manager"
                            }
                  ]
        }),
      },
    ],
  }),
  component: ProductRoute,
});

function ProductRoute() {
  return <ProductDetail slug="ugyfelkapu-totp-manager" h1={H1} />;
}
