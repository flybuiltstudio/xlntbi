import { createFileRoute } from "@tanstack/react-router";
import { ProductDetail } from "@/components/ProductDetail";

const TITLE = "Bérszámfejtő program 2026 | EXCELlent Business Intelligence";
const DESCRIPTION = "Excel alapú bérszámfejtő program a 2026-os szabályok szerint, gyors és pontos bérszámfejtéshez kis és közepes cégeknek.";
const H1 = "Bérszámfejtő 2026";
const CANONICAL = "https://xlntbi.hu/termek/berszamfejto-2026";
const OG_IMAGE = "https://xlntbi.hu/og/konyveloiroda-audit.jpg";

export const Route = createFileRoute("/termek/berszamfejto-2026")({
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
      { rel: "canonical", href: "https://xlntbi.hu/termek/berszamfejto-2026" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
                  "@context": "https://schema.org",
                  "@type": "SoftwareApplication",
                  "name": "Bérszámfejtő 2026",
                  "description": "Excel alapú bérszámfejtő program a 2026-os szabályok szerint, gyors és pontos bérszámfejtéshez kis és közepes cégeknek.",
                  "applicationCategory": "BusinessApplication",
                  "operatingSystem": "Windows",
                  "url": "https://xlntbi.hu/termek/berszamfejto-2026",
                  "image": "https://xlntbi.hu/og/konyveloiroda-audit.jpg",
                  "inLanguage": "hu",
                  "brand": {
                            "@type": "Brand",
                            "name": "EXCELlent Business Intelligence"
                  },
                  "offers": {
                            "@type": "Offer",
                            "price": "24900",
                            "priceCurrency": "HUF",
                            "availability": "https://schema.org/InStock",
                            "url": "https://xlntbi.hu/termek/berszamfejto-2026"
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
                                      "name": "Bérszámfejtő 2026",
                                      "item": "https://xlntbi.hu/termek/berszamfejto-2026"
                            }
                  ]
        }),
      },
    ],
  }),
  component: ProductRoute,
});

function ProductRoute() {
  return <ProductDetail slug="berszamfejto-2026" h1={H1} />;
}
