import { createFileRoute, Link } from "@tanstack/react-router";
import invoiceDatesImg from "@/assets/kalkulator-invoice-dates.jpg";
import salaryTestImg from "@/assets/kalkulator-salary-test.jpg";
import incomeTaxImg from "@/assets/kalkulator-income-tax.jpg";
import flatRateTaxImg from "@/assets/kalkulator-flat-rate-tax.jpg";
import fallbackImg from "@/assets/kalkulator-invoice-dates.jpg";
import { PageHero } from "@/components/PageHero";
import { buildHead } from "@/lib/i18n/head";

const TITLE = "Calculators: invoice dates, salary, tax | EXCELlent Business Intelligence";
const DESCRIPTION =
  "Free online calculators for invoice dates, salary, personal income tax and flat-rate taxation, based on the rules in force in Hungary.";

export const Route = createFileRoute("/en/calculators/")({
  head: () =>
    buildHead({ huPath: "/kalkulatorok", lang: "en", title: TITLE, description: DESCRIPTION }),
  component: EnglishCalculators,
});

const items = [
  {
    to: "/en/calculators/invoice-dates",
    label: "Invoice dates",
    image: invoiceDatesImg,
    alt: "Invoice dates calculator",
  },
  {
    to: "/en/calculators/salary-test",
    label: "Salary test",
    image: salaryTestImg,
    alt: "Salary test calculator",
  },
  {
    to: "/en/calculators/flat-rate-tax",
    label: "Flat-rate tax",
    image: flatRateTaxImg,
    alt: "Flat-rate tax calculator",
  },
  {
    to: "/en/calculators/income-tax",
    label: "Personal income tax",
    image: incomeTaxImg,
    alt: "Personal income tax calculator",
  },
] as const;

function EnglishCalculators() {
  return (
    <>
      <PageHero>
        <h1 className="text-3xl font-bold text-primary-foreground md:text-4xl">Calculators</h1>
      </PageHero>

      <div className="mx-auto max-w-6xl px-4 py-14 md:py-16">
        <div className="mt-2 grid gap-6 sm:grid-cols-2">
          {items.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="group overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-primary"
            >
              <img
                src={item.image}
                alt={item.alt}
                loading="lazy"
                onError={(e) => {
                  // Missing asset: fall back to a neutral placeholder instead of a broken image.
                  const img = e.currentTarget;
                  if (img.dataset['fallback']) return;
                  img.dataset['fallback'] = "1";
                  img.src = fallbackImg;
                }}
                className="h-56 w-full object-cover"
              />
              <h2 className="p-6 text-xl font-semibold text-card-foreground">{item.label}</h2>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
