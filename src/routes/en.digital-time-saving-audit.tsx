import { createFileRoute } from "@tanstack/react-router";
import { ServicePage } from "@/components/ServicePage";
import { buildHead } from "@/lib/i18n/head";
import heroImage from "@/assets/account-assets-audit-bank-bookkeeping-finance-concept.jpg";

const TITLE = "Digital time-saving audit | EXCELlent Business Intelligence";
const DESCRIPTION = "Find and eliminate the wasted steps in your Excel, Power BI, macro and AI workflows – less work for the same or better result.";
const OG_IMAGE = "https://xlntbi.hu/og/account-assets-audit-bank-bookkeeping-finance-concept.jpg";

export const Route = createFileRoute("/en/digital-time-saving-audit")({
  head: () =>
    buildHead({
      huPath: "/digitalis-idomegtakaritasi-audit",
      lang: "en",
      title: TITLE,
      description: DESCRIPTION,
      ogImage: OG_IMAGE,
      jsonLd: [
        {
          "@context": "https://schema.org",
          "@type": "Service",
          name: "Digital time-saving audit",
          description: DESCRIPTION,
          serviceType: "Digital time-saving audit",
          url: "https://xlntbi.hu/en/digital-time-saving-audit",
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
            { "@type": "ListItem", position: 3, name: "Digital time-saving audit", item: "https://xlntbi.hu/en/digital-time-saving-audit" },
          ],
        },
      ],
    }),
  component: Page,
});

function Page() {
  return (
    <ServicePage
      title={"Digital time-saving audit"}
      
      intro={["If Excel, Power BI, AI tools or other digital systems – often together with complex macros – are part of your daily work, a lot of time can be lost on unnecessary steps, manual corrections and badly built processes. The time-saving audit is there to find and eliminate them.", "During the audit I review the files, processes and systems you use, then show where time can be gained. The goal is not more tools but less work for the same or a better result."]}
      ctaLabel={"Request an audit appointment"}
      ctaTo={"/en/consultation"}
      image={heroImage}
      imageAlt={"Digital time-saving audit – analysing processes"}
      listTitle={"What I examine"}
      listItems={["Formulas and dependencies", "Macros and automations", "Data entry points", "Report preparation", "Unnecessary manual steps", "Error sources", "AI-based acceleration opportunities"]}
      closing={{"heading": "Who is it for?", "items": ["Accountants", "Finance professionals", "Controllers", "Office teams", "Companies that work a lot with digital tools"], "ctaLabel": "Book a consultation", "ctaTo": "/en/consultation"}}
    />
  );
}
