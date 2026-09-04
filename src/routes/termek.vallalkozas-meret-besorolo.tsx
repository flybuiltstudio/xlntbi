import { createFileRoute } from "@tanstack/react-router";
import { ProductDetail } from "@/components/ProductDetail";

const TITLE = "XLNT Vállalkozásméret-besoroló Excel | XLNTBI";
const DESCRIPTION =
  "Excel kalkulátor a KKV-besoroláshoz: létszám, árbevétel és mérlegfőösszeg alapján mikro-, kis-, közép- vagy nagyvállalat. Év végi és év eleji lap, 4 990 Ft AAM.";
const H1 = "XLNT Vállalkozásméret-besoroló";
const CANONICAL = "https://xlntbi.hu/termek/vallalkozas-meret-besorolo";
const OG_IMAGE = "https://xlntbi.hu/og/vallalkozas-meret-besorolo.jpg";

export const Route = createFileRoute("/termek/vallalkozas-meret-besorolo")({
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
          operatingSystem: "Windows, Microsoft Excel",
          url: CANONICAL,
          image: OG_IMAGE,
          inLanguage: "hu",
          brand: { "@type": "Brand", name: "EXCELlent Business Intelligence" },
          offers: {
            "@type": "Offer",
            price: "4990",
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
  return <ProductDetail slug="vallalkozas-meret-besorolo" h1={H1} />;
}
