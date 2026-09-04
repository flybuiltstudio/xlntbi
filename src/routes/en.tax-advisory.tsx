import { createFileRoute } from "@tanstack/react-router";
import { ServicePage } from "@/components/ServicePage";
import { buildHead } from "@/lib/i18n/head";
import heroImage from "@/assets/account-assets-audit-bank-bookkeeping-finance-concept.jpg";

const TITLE = "Tax advisory for businesses | EXCELlent Business Intelligence";
const DESCRIPTION = "Expert tax advisory for companies and entrepreneurs: tax optimisation, taxation questions and support with NAV (Hungarian tax authority) matters.";
const OG_IMAGE = "https://xlntbi.hu/og/account-assets-audit-bank-bookkeeping-finance-concept.jpg";

export const Route = createFileRoute("/en/tax-advisory")({
  head: () =>
    buildHead({
      huPath: "/adotanacsadas",
      lang: "en",
      title: TITLE,
      description: DESCRIPTION,
      ogImage: OG_IMAGE,
      jsonLd: [
        {
          "@context": "https://schema.org",
          "@type": "Service",
          name: "Tax advisory",
          description: DESCRIPTION,
          serviceType: "Tax advisory",
          url: "https://xlntbi.hu/en/tax-advisory",
          areaServed: "HU",
          provider: {
            "@type": "ProfessionalService",
            name: "EXCELlent Business Intelligence",
            url: "https://xlntbi.hu/en",
          },
        },
        {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "https://xlntbi.hu/en" },
            { "@type": "ListItem", position: 2, name: "Services", item: "https://xlntbi.hu/en/services" },
            { "@type": "ListItem", position: 3, name: "Tax advisory", item: "https://xlntbi.hu/en/tax-advisory" },
          ],
        },
      ],
    }),
  component: Page,
});

function Page() {
  return (
    <ServicePage
      title={"Tax advisory"}
      lead={"Tax advisory and business administration consulting"}
      intro={["In taxation a single good decision often shapes your operations for years. That is why I do not give template answers but look for a professional solution built on your specific situation.", "The purpose of my tax advisory and administration consulting is to make the taxation and operating questions of your business clear, predictable and controllable."]}
      ctaLabel={"Book a consultation"}
      ctaTo={"/en/contact"}
      image={heroImage}
      imageAlt={"Tax advisory – analysing financial documents"}
      listTitle={"Services"}
      listItems={["Tax advisory", "Tax optimisation", "Support with NAV (Hungarian tax authority) matters", "Choosing the right form of taxation", "Reviewing contracts from a tax perspective", "Business administration consulting"]}
      closing={{"heading": "Who is it for?", "items": ["Companies", "Sole traders", "Private individuals", "Anyone facing a taxation decision"], "ctaLabel": "Book a consultation", "ctaTo": "/en/contact"}}
    />
  );
}
