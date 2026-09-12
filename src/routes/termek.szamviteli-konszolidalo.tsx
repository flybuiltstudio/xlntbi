import { createFileRoute } from "@tanstack/react-router";
import { ProductDetail } from "@/components/ProductDetail";
import {
  productMetaDescription,
  productMetaTitle,
  productTierPrice,
} from "@/lib/product-overrides";

const TITLE_BASE = "XLNT Számviteli konszolidáló program | EXCELlent Business Intelligence";
const DESCRIPTION_BASE = "Konszolidált éves beszámoló Excelben, mérleggel, eredménykimutatással, cash flow-val, OBR-fájllal és beépített ellenőrzésekkel.";
const H1 = "XLNT Számviteli konszolidáló";
const CANONICAL = "https://xlntbi.hu/termek/szamviteli-konszolidalo";
const SLUG = "szamviteli-konszolidalo";
// Admin-managed description overrides take precedence over the bundled text.
const TITLE = () => productMetaTitle(SLUG, TITLE_BASE);
const DESCRIPTION = () => productMetaDescription(SLUG, DESCRIPTION_BASE);
const OG_IMAGE = "https://xlntbi.hu/og/controlling.jpg";

export const Route = createFileRoute("/termek/szamviteli-konszolidalo")({
  head: () => ({
    meta: [
      { title: TITLE() },
      { name: "description", content: DESCRIPTION() },
      { property: "og:title", content: TITLE() },
      { property: "og:description", content: DESCRIPTION() },
      { property: "og:type", content: "product" },
      { property: "og:url", content: CANONICAL },
      { property: "og:locale", content: "hu_HU" },
      { property: "og:image", content: OG_IMAGE },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE() },
      { name: "twitter:description", content: DESCRIPTION() },
      { name: "twitter:image", content: OG_IMAGE },
    ],
    links: [
      { rel: "canonical", href: "https://xlntbi.hu/termek/szamviteli-konszolidalo" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
                  "@context": "https://schema.org",
                  "@type": "SoftwareApplication",
                  "name": "XLNT Számviteli konszolidáló",
                  "description": "Konszolidált éves beszámoló Excelben, mérleggel, eredménykimutatással, cash flow-val, OBR-fájllal és beépített ellenőrzésekkel.",
                  "applicationCategory": "BusinessApplication",
                  "operatingSystem": "Windows",
                  "url": "https://xlntbi.hu/termek/szamviteli-konszolidalo",
                  "image": "https://xlntbi.hu/og/controlling.jpg",
                  "inLanguage": "hu",
                  "brand": {
                            "@type": "Brand",
                            "name": "EXCELlent Business Intelligence"
                  },
                  "offers": {
                            "@type": "Offer",
                            "price": "79900",
                            "priceCurrency": "HUF",
                            "availability": "https://schema.org/InStock",
                            "url": "https://xlntbi.hu/termek/szamviteli-konszolidalo"
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
                                      "name": "XLNT Számviteli konszolidáló",
                                      "item": "https://xlntbi.hu/termek/szamviteli-konszolidalo"
                            }
                  ]
        }),
      },
    ],
  }),
  component: ProductRoute,
});

function ProductRoute() {
  return <ProductDetail slug="szamviteli-konszolidalo" h1={H1} />;
}
