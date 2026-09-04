import { createFileRoute } from "@tanstack/react-router";
import { ServicePage } from "@/components/ServicePage";
import { buildHead } from "@/lib/i18n/head";
import heroImage from "@/assets/konyveloiroda-audit.jpg";

const TITLE = "Accounting firm audit | EXCELlent Business Intelligence";
const DESCRIPTION = "An audit for accounting firms: how organised, efficient and scalable are your processes, quality assurance and deadline management?";
const OG_IMAGE = "https://xlntbi.hu/og/konyveloiroda-audit.jpg";

export const Route = createFileRoute("/en/accounting-firm-audit")({
  head: () =>
    buildHead({
      huPath: "/konyveloiroda-audit",
      lang: "en",
      title: TITLE,
      description: DESCRIPTION,
      ogImage: OG_IMAGE,
      jsonLd: [
        {
          "@context": "https://schema.org",
          "@type": "Service",
          name: "Accounting firm audit",
          description: DESCRIPTION,
          serviceType: "Accounting firm audit",
          url: "https://xlntbi.hu/en/accounting-firm-audit",
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
            { "@type": "ListItem", position: 3, name: "Accounting firm audit", item: "https://xlntbi.hu/en/accounting-firm-audit" },
          ],
        },
      ],
    }),
  component: Page,
});

function Page() {
  return (
    <ServicePage
      title={"Accounting firm audit"}
      
      intro={["The accounting firm audit is for those who want their own firm's operations reviewed with a professional eye. The aim is to see how organised, efficient and scalable the processes are.", "In an accounting firm quality, deadline management and a consistent working method are crucial. During the audit I review these and give practical development proposals."]}
      ctaLabel={"Request an audit"}
      ctaTo={"/en/contact"}
      image={heroImage}
      imageAlt={"Accounting firm audit – office processes"}
      listTitle={"What do I examine?"}
      listItems={["How organised the processes are", "Teamwork and task allocation", "Quality assurance", "Deadline management", "Automation", "Client communication"]}
      closing={{"eyebrow": "Result", "heading": "An operating map for your firm", "text": "It shows where the operations of your accounting firm can be sped up, simplified and stabilised.", "ctaLabel": "Request an audit", "ctaTo": "/en/contact"}}
    />
  );
}
