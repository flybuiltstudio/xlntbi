import { createFileRoute } from "@tanstack/react-router";
import { ProductDetail } from "@/components/ProductDetail";

const TITLE = "Útnyilvántartás és kiküldetési rendelvény sablon | EXCELlent Business Intelligence";
const DESCRIPTION = "Vezess szabályos útnyilvántartást és készíts kiküldetési rendelvényt könnyen, a NAV elvárásainak megfelelően.";
const H1 = "Útnyilvántartás, kiküldetési rendelvény";
const CANONICAL = "https://xlntbi.hu/termek/utnyilvantartas-kikuldetesi-rendelveny";
const OG_IMAGE = "https://xlntbi.hu/og/135731.jpg";

export const Route = createFileRoute("/termek/utnyilvantartas-kikuldetesi-rendelveny")({
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
      { rel: "canonical", href: "https://xlntbi.hu/termek/utnyilvantartas-kikuldetesi-rendelveny" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
                  "@context": "https://schema.org",
                  "@type": "SoftwareApplication",
                  "name": "Útnyilvántartás, kiküldetési rendelvény",
                  "description": "Vezess szabályos útnyilvántartást és készíts kiküldetési rendelvényt könnyen, a NAV elvárásainak megfelelően.",
                  "applicationCategory": "BusinessApplication",
                  "operatingSystem": "Windows",
                  "url": "https://xlntbi.hu/termek/utnyilvantartas-kikuldetesi-rendelveny",
                  "image": "https://xlntbi.hu/og/135731.jpg",
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
                            "url": "https://xlntbi.hu/termek/utnyilvantartas-kikuldetesi-rendelveny"
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
                                      "name": "Útnyilvántartás, kiküldetési rendelvény",
                                      "item": "https://xlntbi.hu/termek/utnyilvantartas-kikuldetesi-rendelveny"
                            }
                  ]
        }),
      },
    ],
  }),
  component: ProductRoute,
});

function ProductRoute() {
  return <ProductDetail slug="utnyilvantartas-kikuldetesi-rendelveny" h1={H1} />;
}
