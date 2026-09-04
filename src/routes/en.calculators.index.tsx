import { createFileRoute, Link } from "@tanstack/react-router";
import invoiceDatesImg from "@/assets/kalkulator-invoice-dates.jpg";
import bertesztImg from "@/assets/berteszt.jpg";
import jovedelemadoImg from "@/assets/kalkulator-jovedelemado.jpg";
import atalanyadoImg from "@/assets/kalkulator-atalanyado.jpg";
import fallbackImg from "@/assets/berteszt.jpg";
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
    image: bertesztImg,
    alt: "Salary test calculator",
  },
  {
    to: "/en/calculators/income-tax",
    label: "Personal income tax",
    image: jovedelemadoImg,
    alt: "Personal income tax calculator",
  },
  {
    to: "/en/calculators/flat-rate-tax",
    label: "Flat-rate tax",
    image: atalanyadoImg,
    alt: "Flat-rate tax calculator",
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
                  if (img.dataset.fallback) return;
                  img.dataset.fallback = "1";
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
