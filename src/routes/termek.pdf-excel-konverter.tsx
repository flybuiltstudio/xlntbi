import { createFileRoute } from "@tanstack/react-router";
import { ProductDetail } from "@/components/ProductDetail";
import {
  productMetaDescription,
  productMetaTitle,
  productTierPrice,
} from "@/lib/product-overrides";

const TITLE_BASE = "XLNT PDF Excel konverter könyvelőknek | EXCELlent Business Intelligence";
const DESCRIPTION_BASE = "Alakíts át PDF dokumentumokat, kimutatásokat és bankkivonatokat gyorsan szerkeszthető Excel táblázattá.";
const H1 = "XLNT PDF Excel konverter";
const CANONICAL = "https://xlntbi.hu/termek/pdf-excel-konverter";
const SLUG = "pdf-excel-konverter";
// Admin-managed description overrides take precedence over the bundled text.
const TITLE = () => productMetaTitle(SLUG, TITLE_BASE);
const DESCRIPTION = () => productMetaDescription(SLUG, DESCRIPTION_BASE);
const OG_IMAGE = "https://xlntbi.hu/og/pdf-excel-konverter.jpg";

export const Route = createFileRoute("/termek/pdf-excel-konverter")({
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
      { rel: "canonical", href: "https://xlntbi.hu/termek/pdf-excel-konverter" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
                  "@context": "https://schema.org",
                  "@type": "SoftwareApplication",
                  "name": "XLNT PDF Excel konverter",
                  "description": "Alakíts át PDF dokumentumokat, kimutatásokat és bankkivonatokat gyorsan szerkeszthető Excel táblázattá.",
                  "applicationCategory": "BusinessApplication",
                  "operatingSystem": "Windows",
                  "url": "https://xlntbi.hu/termek/pdf-excel-konverter",
                  "image": "https://xlntbi.hu/og/pdf-excel-konverter.jpg",
                  "inLanguage": "hu",
                  "brand": {
                            "@type": "Brand",
                            "name": "EXCELlent Business Intelligence"
                  },
                  "offers": {
                            "@type": "Offer",
                            "price": "12900",
                            "priceCurrency": "HUF",
                            "availability": "https://schema.org/InStock",
                            "url": "https://xlntbi.hu/termek/pdf-excel-konverter"
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
                                      "name": "XLNT PDF Excel konverter",
                                      "item": "https://xlntbi.hu/termek/pdf-excel-konverter"
                            }
                  ]
        }),
      },
    ],
  }),
  component: ProductRoute,
});

function ProductRoute() {
  return <ProductDetail slug="pdf-excel-konverter" h1={H1} />;
}
