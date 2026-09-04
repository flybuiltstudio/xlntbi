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

      <div className="mx-auto max-w-6xl px-4 py-14 md:py-16">
        <div className="mt-2 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="group flex flex-col justify-between rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary"
            >
              <h2 className="text-lg font-semibold text-card-foreground">{item.label}</h2>
              <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                More
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
