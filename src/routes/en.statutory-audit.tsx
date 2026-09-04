import { createFileRoute } from "@tanstack/react-router";
import { ServicePage } from "@/components/ServicePage";
import { buildHead } from "@/lib/i18n/head";
import heroImage from "@/assets/135731.jpg";

const TITLE = "Statutory audit and due diligence | EXCELlent Business Intelligence";
const DESCRIPTION = "Statutory audit, review and due diligence services: examining financial, accounting and operational reliability.";
const OG_IMAGE = "https://xlntbi.hu/og/135731.jpg";

export const Route = createFileRoute("/en/statutory-audit")({
  head: () =>
    buildHead({
      huPath: "/konyvvizsgalat",
      lang: "en",
      title: TITLE,
      description: DESCRIPTION,
      ogImage: OG_IMAGE,
      jsonLd: [
        {
          "@context": "https://schema.org",
          "@type": "Service",
          name: "Statutory audit",
          description: DESCRIPTION,
          serviceType: "Statutory audit",
          url: "https://xlntbi.hu/en/statutory-audit",
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
            { "@type": "ListItem", position: 3, name: "Statutory audit", item: "https://xlntbi.hu/en/statutory-audit" },
          ],
        },
      ],
    }),
  component: Page,
});

function Page() {
  return (
    <ServicePage
      title={"Statutory audit"}
      lead={"Statutory audit, review and due diligence services"}
      intro={["The purpose of a statutory audit and a review is not only verification but also giving you a true picture of your operations. A well-executed audit shows where the risks are and where processes can be improved.", "In my audit, due diligence and review services I examine financial, accounting and operational reliability."]}
      ctaLabel={"Request an audit consultation"}
      ctaTo={"/en/consultation"}
      image={heroImage}
      imageAlt={"Statutory audit – verifying financial data"}
      listTitle={"Services"}
      listItems={["Statutory audit", "Review", "Due diligence", "Audit preparation", "Review of internal controls", "Risk analysis"]}
      closing={{"heading": "Who benefits from it?", "items": ["Owners", "Managers", "Investors", "Buyers before an acquisition", "Organisations where transparency matters"], "ctaLabel": "Book a consultation", "ctaTo": "/en/consultation"}}
    />
  );
}
