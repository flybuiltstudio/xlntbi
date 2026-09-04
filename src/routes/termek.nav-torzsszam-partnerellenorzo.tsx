import { createFileRoute } from "@tanstack/react-router";
import { ProductDetail } from "@/components/ProductDetail";

const TITLE = "XLNT NAV törzsszám, partnerellenőrző program | EXCELlent Business Intelligence";
const DESCRIPTION = "Ellenőrizd tömegesen partnereid adószámát és NAV státuszát, hogy elkerüld a kockázatos üzleti partnerkapcsolatokat.";
const H1 = "XLNT NAV törzsszám, partnerellenőrző";
const CANONICAL = "https://xlntbi.hu/termek/nav-torzsszam-partnerellenorzo";
const OG_IMAGE = "https://xlntbi.hu/og/bi.jpg";

export const Route = createFileRoute("/termek/nav-torzsszam-partnerellenorzo")({
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
      { rel: "canonical", href: "https://xlntbi.hu/termek/nav-torzsszam-partnerellenorzo" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
                  "@context": "https://schema.org",
                  "@type": "SoftwareApplication",
                  "name": "XLNT NAV törzsszám, partnerellenőrző",
                  "description": "Ellenőrizd tömegesen partnereid adószámát és NAV státuszát, hogy elkerüld a kockázatos üzleti partnerkapcsolatokat.",
                  "applicationCategory": "BusinessApplication",
                  "operatingSystem": "Windows",
                  "url": "https://xlntbi.hu/termek/nav-torzsszam-partnerellenorzo",
                  "image": "https://xlntbi.hu/og/bi.jpg",
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
                            "url": "https://xlntbi.hu/termek/nav-torzsszam-partnerellenorzo"
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
                                      "name": "XLNT NAV törzsszám, partnerellenőrző",
                                      "item": "https://xlntbi.hu/termek/nav-torzsszam-partnerellenorzo"
                            }
                  ]
        }),
      },
    ],
  }),
  component: ProductRoute,
});

function ProductRoute() {
  return <ProductDetail slug="nav-torzsszam-partnerellenorzo" h1={H1} />;
}
