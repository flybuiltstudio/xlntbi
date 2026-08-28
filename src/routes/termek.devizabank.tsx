import { createFileRoute } from "@tanstack/react-router";
import { ProductDetail } from "@/components/ProductDetail";

const TITLE = "XLNT DEVIZABANK – devizás bankszámla nyilvántartó Excel | EXCELlent Business Intelligence";
const DESCRIPTION =
  "Devizaszámla nyilvántartás átlagáras és FIFO elszámolással, automatikus MNB árfolyam-lekérdezéssel. EUR, USD, GBP, JPY változat, 19 900 Ft-tól.";
const H1 = "XLNT DEVIZABANK – devizás bankszámla nyilvántartó és árfolyam-elszámoló";
const CANONICAL = "https://xlntbi.hu/termek/devizabank";
const OG_IMAGE = "https://xlntbi.hu/og/devizabank.jpg";

export const Route = createFileRoute("/termek/devizabank")({
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
    links: [{ rel: "canonical", href: CANONICAL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: "XLNT DEVIZABANK",
          description: DESCRIPTION,
          applicationCategory: "BusinessApplication",
          operatingSystem: "Windows, Microsoft Excel",
          url: CANONICAL,
          image: OG_IMAGE,
          inLanguage: "hu",
          brand: { "@type": "Brand", name: "EXCELlent Business Intelligence" },
          offers: {
            "@type": "Offer",
            price: "19900",
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
            { "@type": "ListItem", position: 3, name: "XLNT DEVIZABANK", item: CANONICAL },
          ],
        }),
      },
    ],
  }),
  component: ProductRoute,
});

function ProductRoute() {
  return <ProductDetail slug="devizabank" h1={H1} />;
}
