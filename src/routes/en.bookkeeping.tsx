import { createFileRoute } from "@tanstack/react-router";
import { ServicePage } from "@/components/ServicePage";
import { buildHead } from "@/lib/i18n/head";
import heroImage from "@/assets/close-up-busy-businesswoman.jpg";

const TITLE = "Bookkeeping services for businesses | EXCELlent Business Intelligence";
const DESCRIPTION = "Accurate, up-to-date bookkeeping for sole traders and companies. Digital processes, transparent fees, expert background.";
const OG_IMAGE = "https://xlntbi.hu/og/close-up-busy-businesswoman.jpg";

export const Route = createFileRoute("/en/bookkeeping")({
  head: () =>
    buildHead({
      huPath: "/konyveles",
      lang: "en",
      title: TITLE,
      description: DESCRIPTION,
      ogImage: OG_IMAGE,
      jsonLd: [
        {
          "@context": "https://schema.org",
          "@type": "Service",
          name: "Bookkeeping",
          description: DESCRIPTION,
          serviceType: "Bookkeeping",
          url: "https://xlntbi.hu/en/bookkeeping",
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
            { "@type": "ListItem", position: 3, name: "Bookkeeping", item: "https://xlntbi.hu/en/bookkeeping" },
          ],
        },
      ],
    }),
  component: Page,
});

function Page() {
  return (
    <ServicePage
      title={"Bookkeeping"}
      lead={"Bookkeeping for companies, sole traders and private individuals"}
      intro={["For me, bookkeeping is not mere administration but one of the foundations of stable, predictable operations. My aim is that your data should produce not only mandatory returns but genuine business information.", "I provide full-scope bookkeeping for companies, sole traders and private individuals. The work is always tailored to the client's activity, needs and operating characteristics."]}
      ctaLabel={"Book a consultation"}
      ctaTo={"/en/contact"}
      image={heroImage}
      imageAlt={"Bookkeeping – office work in progress"}
      listTitle={"Services"}
      listItems={["Full-scope bookkeeping", "Preparing and filing tax returns", "Year-end closing and financial statements", "Continuous professional consultation", "Online administration", "Support for digital, paperless operations"]}
      closing={{"eyebrow": "Who is it for?", "heading": "Orderly bookkeeping for those who want a clear view", "items": ["Companies", "Sole traders", "Private individuals", "Clients who want orderly and transparent bookkeeping"]}}
    />
  );
}
