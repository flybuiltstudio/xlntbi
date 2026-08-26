import { createFileRoute } from "@tanstack/react-router";
import { ProductDetail } from "@/components/ProductDetail";

const TITLE = "AuditXML ellenőrző és javító program | EXCELlent Business Intelligence";
const DESCRIPTION = "Ellenőrizd és javítsd gyorsan a NAV AuditXML (SAF-T) exportfájlokat, mielőtt beküldenéd vagy továbbadnád azokat.";
const H1 = "AuditXML ellenőrző, javító";
const CANONICAL = "https://xlntbi.hu/termek/auditxml-ellenorzo-javito";
const OG_IMAGE = "https://xlntbi.hu/og/auditxml-ellenorzo-javito.jpg";

export const Route = createFileRoute("/termek/auditxml-ellenorzo-javito")({
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
      { rel: "canonical", href: "https://xlntbi.hu/termek/auditxml-ellenorzo-javito" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
                  "@context": "https://schema.org",
                  "@type": "SoftwareApplication",
                  "name": "AuditXML ellenőrző, javító",
                  "description": "Ellenőrizd és javítsd gyorsan a NAV AuditXML (SAF-T) exportfájlokat, mielőtt beküldenéd vagy továbbadnád azokat.",
                  "applicationCategory": "BusinessApplication",
                  "operatingSystem": "Windows",
                  "url": "https://xlntbi.hu/termek/auditxml-ellenorzo-javito",
                  "image": "https://xlntbi.hu/og/auditxml-ellenorzo-javito.jpg",
                  "inLanguage": "hu",
                  "brand": {
                            "@type": "Brand",
                            "name": "EXCELlent Business Intelligence"
                  },
                  "offers": {
                            "@type": "Offer",
                            "price": "4990",
                            "priceCurrency": "HUF",
                            "availability": "https://schema.org/InStock",
                            "url": "https://xlntbi.hu/termek/auditxml-ellenorzo-javito"
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
                                      "name": "AuditXML ellenőrző, javító",
                                      "item": "https://xlntbi.hu/termek/auditxml-ellenorzo-javito"
                            }
                  ]
        }),
      },
    ],
  }),
  component: ProductRoute,
});

function ProductRoute() {
  return <ProductDetail slug="auditxml-ellenorzo-javito" h1={H1} />;
}
