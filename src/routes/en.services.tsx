import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { buildHead } from "@/lib/i18n/head";

const TITLE = "Services: bookkeeping, tax advisory, controlling | EXCELlent Business Intelligence";
const DESCRIPTION =
  "Bookkeeping, sole trader bookkeeping, tax advisory, fintech and BI consulting, controlling and audits – expert services for Hungarian and international businesses.";

export const Route = createFileRoute("/en/services")({
  head: () =>
    buildHead({ huPath: "/szolgaltatasaim", lang: "en", title: TITLE, description: DESCRIPTION }),
  component: EnglishServices,
});

const items = [
  { to: "/en/bookkeeping", label: "Bookkeeping services" },
  { to: "/en/sole-trader-bookkeeping", label: "Sole trader bookkeeping – flat-rate tax and KATA" },
  { to: "/en/tax-advisory", label: "Tax and administration advisory" },
  { to: "/en/fintech-and-bi", label: "Fintech and BI consulting" },
  { to: "/en/controlling", label: "Controlling with modern reporting and automation tools" },
  { to: "/en/company-audit", label: "Company audit" },
  { to: "/en/statutory-audit", label: "Statutory audit" },
  { to: "/en/accounting-firm-audit", label: "Accounting firm audit" },
  { to: "/en/digital-time-saving-audit", label: "Digital time-saving audit" },
] as const;

function EnglishServices() {
  return (
    <>
      <PageHero>
        <h1 className="text-3xl font-bold text-primary-foreground md:text-4xl">Services</h1>
      </PageHero>

      <ServicesGrid items={items} more="More" videoLabel="Services – mood video" />
    </>
  );
}
