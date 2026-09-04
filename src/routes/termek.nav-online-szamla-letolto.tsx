import { createFileRoute } from "@tanstack/react-router";
import { ProductDetail } from "@/components/ProductDetail";

const TITLE = "XLNT NAV Online Számla letöltő program | EXCELlent Business Intelligence";
const DESCRIPTION = "Töltsd le automatikusan a NAV Online Számla rendszeréből a bejövő és kimenő számlák adatait, könyvelésre kész formátumban.";
const H1 = "XLNT NAV Online Számla letöltő";
const CANONICAL = "https://xlntbi.hu/termek/nav-online-szamla-letolto";
const OG_IMAGE = "https://xlntbi.hu/og/nav-online-szamla-letolto.jpg";

export const Route = createFileRoute("/termek/nav-online-szamla-letolto")({
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
      { rel: "canonical", href: "https://xlntbi.hu/termek/nav-online-szamla-letolto" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
                  "@context": "https://schema.org",
                  "@type": "SoftwareApplication",
                  "name": "XLNT NAV Online Számla letöltő",
                  "description": "Töltsd le automatikusan a NAV Online Számla rendszeréből a bejövő és kimenő számlák adatait, könyvelésre kész formátumban.",
                  "applicationCategory": "BusinessApplication",
                  "operatingSystem": "Windows",
                  "url": "https://xlntbi.hu/termek/nav-online-szamla-letolto",
                  "image": "https://xlntbi.hu/og/account-assets-audit-bank-bookkeeping-finance-concept.jpg",
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
                            "url": "https://xlntbi.hu/termek/nav-online-szamla-letolto"
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
                                      "name": "XLNT NAV Online Számla letöltő",
                                      "item": "https://xlntbi.hu/termek/nav-online-szamla-letolto"
                            }
                  ]
        }),
      },
    ],
  }),
  component: ProductRoute,
});

function ProductRoute() {
  return <ProductDetail slug="nav-online-szamla-letolto" h1={H1} />;
}
