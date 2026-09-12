import { createFileRoute } from "@tanstack/react-router";
import { ProductDetail } from "@/components/ProductDetail";
import {
  productMetaDescription,
  productMetaTitle,
  productTierPrice,
} from "@/lib/product-overrides";

const TITLE_BASE = "XLNT IFRS Beszámoló – kétnyelvű IFRS 18 sablon Excelben | XLNTBI";
const DESCRIPTION_BASE =
  "Főkönyvi kivonatból gombnyomásra IFRS 18 szerinti mérleg, eredménykimutatás, OCI, saját tőke és cash flow – magyarul és angolul, OBR-beadvánnyal.";
const H1 = "XLNT IFRS Beszámoló";
const CANONICAL = "https://xlntbi.hu/termek/ifrs-penzugyi-kimutatasok";
const SLUG = "ifrs-penzugyi-kimutatasok";
// Admin-managed description overrides take precedence over the bundled text.
const TITLE = () => productMetaTitle(SLUG, TITLE_BASE);
const DESCRIPTION = () => productMetaDescription(SLUG, DESCRIPTION_BASE);
const OG_IMAGE = "https://xlntbi.hu/og/ifrs-penzugyi-kimutatasok.jpg";

export const Route = createFileRoute("/termek/ifrs-penzugyi-kimutatasok")({
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
    links: [{ rel: "canonical", href: CANONICAL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: H1,
          description: DESCRIPTION(),
          applicationCategory: "BusinessApplication",
          operatingSystem: "Windows, Microsoft Excel",
          url: CANONICAL,
          image: OG_IMAGE,
          inLanguage: "hu",
          brand: { "@type": "Brand", name: "EXCELlent Business Intelligence" },
          offers: {
            "@type": "Offer",
            price: String(productTierPrice(SLUG, null, 149000)),
            priceCurrency: "HUF",
            availability: "https://schema.org/InStock",
            url: CANONICAL,
          },
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Főoldal", item: "https://xlntbi.hu/" },
            { "@type": "ListItem", position: 2, name: "Termékeim", item: "https://xlntbi.hu/termekeim" },
            { "@type": "ListItem", position: 3, name: H1, item: CANONICAL },
          ],
        }),
      },
    ],
  }),
  component: ProductRoute,
});

function ProductRoute() {
  return <ProductDetail slug="ifrs-penzugyi-kimutatasok" h1={H1} />;
}
