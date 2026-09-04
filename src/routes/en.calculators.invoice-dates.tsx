import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { EmbeddedCalculator } from "@/components/EmbeddedCalculator";
import { PageHero } from "@/components/PageHero";
import { html, script } from "@/lib/calculators/invoice-dates-en";
import { getCalculatorOverride } from "@/lib/calculator.functions";
import { buildHead } from "@/lib/i18n/head";

const overrideQueryOptions = queryOptions({
  queryKey: ["calculator-override", "invoice-dates-en"],
  queryFn: () => getCalculatorOverride({ data: { key: "invoice-dates-en" } }),
  staleTime: 60_000,
});

const TITLE = "Invoice dates calculator (delivery date, payment deadline) | EXCELlent Business Intelligence";
const DESCRIPTION = "Quickly calculate the delivery date and the payment deadline of an invoice based on the Hungarian VAT rules in force.";

export const Route = createFileRoute("/en/calculators/invoice-dates")({
  loader: ({ context }) => context.queryClient.ensureQueryData(overrideQueryOptions),
  head: () =>
    buildHead({ huPath: "/kalkulatorok/szamla-datumok", lang: "en", title: TITLE, description: DESCRIPTION }),
  component: CalculatorPage,
});

function CalculatorPage() {
  const { data: override } = useSuspenseQuery(overrideQueryOptions);
  return (
    <>
      <PageHero>
        <h1 className="text-3xl font-bold text-primary-foreground md:text-4xl">Invoice dates</h1>
      </PageHero>
      <div className="mx-auto max-w-6xl px-4 py-14 md:py-16">
        <p className="max-w-3xl text-base text-muted-foreground">Invoice date calculator based on the Hungarian VAT Act (Sections 58, 60, 80, 163): delivery date, payment deadline and exchange-rate date with live MNB rates. The calculation is for information purposes only.</p>
        <div className="mt-8">
          <EmbeddedCalculator
            key={override ? override.updatedAt : "builtin"}
            html={override?.html ?? html}
            script={override?.script ?? script}
          />
        </div>
      </div>
    </>
  );
}
