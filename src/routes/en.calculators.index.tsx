import { createFileRoute, Link } from "@tanstack/react-router";
import invoiceDatesImg from "@/assets/kalkulator-invoice-dates.jpg";
import salaryTestImg from "@/assets/kalkulator-salary-test.jpg";
import incomeTaxImg from "@/assets/kalkulator-income-tax.jpg";
import flatRateTaxImg from "@/assets/kalkulator-flat-rate-tax.jpg";
import fallbackImg from "@/assets/kalkulator-invoice-dates.jpg";
import { PageHero } from "@/components/PageHero";
import { buildHead } from "@/lib/i18n/head";
import { customCalculatorImageUrl } from "@/lib/custom-calculators";
import { getCustomCalculatorCards } from "@/lib/custom-calculators.functions";

const TITLE = "Calculators: invoice dates, salary, tax | EXCELlent Business Intelligence";
const DESCRIPTION =
  "Free online calculators for invoice dates, salary, personal income tax and flat-rate taxation, based on the rules in force in Hungary.";

export const Route = createFileRoute("/en/calculators/")({
  loader: () => getCalculatorCards({ data: { lang: "en" } }),
  head: () =>
    buildHead({ huPath: "/kalkulatorok", lang: "en", title: TITLE, description: DESCRIPTION }),
  component: EnglishCalculators,
});

const staticImages: Record<string, string> = {
  "szamla-datumok": invoiceDatesImg,
  berteszt: salaryTestImg,
  atalanyado: flatRateTaxImg,
  jovedelemado: incomeTaxImg,
};

function EnglishCalculators() {
  const { cards } = Route.useLoaderData();
  return (
    <>
      <PageHero>
        <h1 className="text-3xl font-bold text-primary-foreground md:text-4xl">Calculators</h1>
      </PageHero>

      <div className="mx-auto max-w-6xl px-4 py-14 md:py-16">
        <div className="mt-2 grid gap-6 sm:grid-cols-2">
          {cards.map((card) => (
            <Link
              key={card.id}
              to={card.path}
              className="group overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-primary"
            >
              <img
                src={
                  card.kind === "static"
                    ? staticImages[card.key]
                    : customCalculatorImageUrl(card.key, "en")
                }
                alt={`${card.name} calculator`}
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
              <h2 className="p-6 text-xl font-semibold text-card-foreground">{card.name}</h2>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
