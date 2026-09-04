import { createFileRoute } from "@tanstack/react-router";
import { ServicePage } from "@/components/ServicePage";
import { buildHead } from "@/lib/i18n/head";
import heroImage from "@/assets/bi.jpg";

const TITLE = "Fintech and BI consulting | EXCELlent Business Intelligence";
const DESCRIPTION = "Fintech and business intelligence consulting: Power BI dashboards, report automation, data integration and AI-supported financial workflows.";
const OG_IMAGE = "https://xlntbi.hu/og/bi.jpg";

export const Route = createFileRoute("/en/fintech-and-bi")({
  head: () =>
    buildHead({
      huPath: "/fintech-es-bi",
      lang: "en",
      title: TITLE,
      description: DESCRIPTION,
      ogImage: OG_IMAGE,
      jsonLd: [
        {
          "@context": "https://schema.org",
          "@type": "Service",
          name: "Fintech and BI consulting",
          description: DESCRIPTION,
          serviceType: "Fintech and BI consulting",
          url: "https://xlntbi.hu/en/fintech-and-bi",
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
            { "@type": "ListItem", position: 3, name: "Fintech and BI consulting", item: "https://xlntbi.hu/en/fintech-and-bi" },
          ],
        },
      ],
    }),
  component: Page,
});

function Page() {
  return (
    <ServicePage
      title={"Fintech and BI consulting"}
      lead={"Fintech and BI consulting for accounting firms, companies and private individuals"}
      intro={["Financial data in itself is not yet valuable. It becomes useful when it is properly connected, transparent and supports decisions. That is what fintech and BI consulting is for.", "I connect classic accounting with modern automation, reporting, data modelling, complex macros and AI-supported workflows. The goal is faster, cleaner and better controlled financial operations."]}
      ctaLabel={"Request a BI consultation"}
      ctaTo={"/en/contact"}
      image={heroImage}
      imageAlt={"Fintech and BI – data-driven financial operations"}
      listTitle={"Digital and financial operations, simpler and more transparent"}
      listItems={["Power BI dashboards", "Report automation", "Data integration", "Automated control logic", "Digital solutions for accounting firms", "Simplifying financial processes", "AI-supported workflows"]}
      closing={{"heading": "Who is it for?", "items": ["Accounting firms", "Companies", "Private individuals", "Professionals who want to be more efficient with technology"], "ctaLabel": "Request a BI consultation", "ctaTo": "/en/contact"}}
    />
  );
}
