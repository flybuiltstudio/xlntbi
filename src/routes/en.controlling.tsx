import { createFileRoute } from "@tanstack/react-router";
import { ServicePage } from "@/components/ServicePage";
import { buildHead } from "@/lib/i18n/head";
import heroImage from "@/assets/controlling.jpg";

const TITLE = "Controlling, Excel and Power BI reports | EXCELlent Business Intelligence";
const DESCRIPTION = "Controlling with modern reporting and automation tools: management reports, profitability analysis, project controlling and Power BI dashboards.";
const OG_IMAGE = "https://xlntbi.hu/og/controlling.jpg";

export const Route = createFileRoute("/en/controlling")({
  head: () =>
    buildHead({
      huPath: "/kontrolling",
      lang: "en",
      title: TITLE,
      description: DESCRIPTION,
      ogImage: OG_IMAGE,
      jsonLd: [
        {
          "@context": "https://schema.org",
          "@type": "Service",
          name: "Controlling",
          description: DESCRIPTION,
          serviceType: "Controlling",
          url: "https://xlntbi.hu/en/controlling",
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
            { "@type": "ListItem", position: 3, name: "Controlling", item: "https://xlntbi.hu/en/controlling" },
          ],
        },
      ],
    }),
  component: Page,
});

function Page() {
  return (
    <ServicePage
      title={"Controlling"}
      lead={"Controlling, Excel and Power BI reports for companies"}
      intro={["For me the purpose of controlling is that management should not see the numbers afterwards but receive usable information in time. A well-built report is much more than a spreadsheet: it is a decision-support tool.", "I build modern reporting and automation solutions for companies that help financial and operational data to be visible in one coherent system rather than in isolation, supported by complex macros where needed."]}
      ctaLabel={"Controlling consultation"}
      ctaTo={"/en/consultation"}
      image={heroImage}
      imageAlt={"Controlling reports and analyses"}
      listTitle={"Typical solutions"}
      listItems={["Management reports", "Profitability analysis", "Project controlling", "Support with monthly closing", "Automated models", "Power BI dashboards"]}
      closing={{"heading": "Who is it for?", "items": ["SMEs", "Larger companies", "Finance managers", "Managing directors", "Teams that need fast decisions"], "ctaLabel": "Book a consultation", "ctaTo": "/en/contact"}}
    />
  );
}
