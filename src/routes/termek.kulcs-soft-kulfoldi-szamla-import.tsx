import { createFileRoute } from "@tanstack/react-router";
import { ProductDetail } from "@/components/ProductDetail";

const TITLE = "XLNT Kulcs-Soft Bejövő Külföldi Számla Import | EXCELlent Business Intelligence";
const DESCRIPTION =
  "Excel-alapú importáló eszköz könyvelőirodáknak: EU-s és harmadik országbeli bejövő számlák Kulcs-Soft CSV importja, kézi rögzítés nélkül.";
const H1 = "XLNT Kulcs-Soft Bejövő Külföldi Számla Import";
const CANONICAL = "https://xlntbi.hu/termek/kulcs-soft-kulfoldi-szamla-import";
const OG_IMAGE = "https://xlntbi.hu/og/account-assets-audit-bank-bookkeeping-finance-concept.jpg";

export const Route = createFileRoute("/termek/kulcs-soft-kulfoldi-szamla-import")({
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
    links: [{ rel: "canonical", href: CANONICAL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: H1,
          description: DESCRIPTION,
          applicationCategory: "BusinessApplication",
          operatingSystem: "Windows",
          url: CANONICAL,
          image: OG_IMAGE,
          inLanguage: "hu",
          brand: { "@type": "Brand", name: "EXCELlent Business Intelligence" },
          offers: {
            "@type": "Offer",
            price: "12900",
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
  return <ProductDetail slug="kulcs-soft-kulfoldi-szamla-import" h1={H1} />;
}
