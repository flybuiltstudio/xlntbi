import { createFileRoute } from "@tanstack/react-router";
import { ServicePage } from "@/components/ServicePage";
import { buildHead } from "@/lib/i18n/head";
import heroImage from "@/assets/cegaudit.jpg";

const TITLE = "Company audit – operational review | EXCELlent Business Intelligence";
const DESCRIPTION = "A company audit looks at your operations with an outside eye: processes, controls, reporting, deadlines and digitalisation opportunities.";
const OG_IMAGE = "https://xlntbi.hu/og/cegaudit.jpg";

export const Route = createFileRoute("/en/company-audit")({
  head: () =>
    buildHead({
      huPath: "/cegaudit",
      lang: "en",
      title: TITLE,
      description: DESCRIPTION,
      ogImage: OG_IMAGE,
      jsonLd: [
        {
          "@context": "https://schema.org",
          "@type": "Service",
          name: "Company audit",
          description: DESCRIPTION,
          serviceType: "Company audit",
          url: "https://xlntbi.hu/en/company-audit",
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
            { "@type": "ListItem", position: 3, name: "Company audit", item: "https://xlntbi.hu/en/company-audit" },
          ],
        },
      ],
    }),
  component: Page,
});

function Page() {
  return (
    <ServicePage
      title={"Company audit"}
      
      intro={["The purpose of a company audit is to look at your operations with an outside eye and find where processes can be simplified, sped up or made safer.", "This is not a long theoretical document but practical discovery with development proposals. The emphasis is on usability."]}
      ctaLabel={"Request a company audit"}
      ctaTo={"/en/consultation"}
      image={heroImage}
      imageAlt={"Company audit – reviewing operational processes"}
      listTitle={"What do we examine?"}
      listItems={["Processes", "Controls", "Reporting", "Deadlines", "Error sources", "Digitalisation opportunities"]}
      closing={{"heading": "Who is it for?", "items": ["Owners", "Managing directors", "Finance managers", "Companies that want to improve their operations"], "ctaLabel": "Book a consultation", "ctaTo": "/en/consultation"}}
    />
  );
}
