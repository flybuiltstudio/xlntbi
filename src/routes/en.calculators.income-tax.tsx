import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { EmbeddedCalculator } from "@/components/EmbeddedCalculator";
import { PageHero } from "@/components/PageHero";
import { html, script } from "@/lib/calculators/jovedelemado";
import { getCalculatorOverride } from "@/lib/calculator.functions";
import { buildHead } from "@/lib/i18n/head";

const overrideQueryOptions = queryOptions({
  queryKey: ["calculator-override", "jovedelemado"],
  queryFn: () => getCalculatorOverride({ data: { key: "jovedelemado" } }),
  staleTime: 60_000,
});

const TITLE = "Personal income tax calculator | EXCELlent Business Intelligence";
const DESCRIPTION = "Calculate the personal income tax payable on your income based on the Hungarian rules in force.";

export const Route = createFileRoute("/en/calculators/income-tax")({
  loader: ({ context }) => context.queryClient.ensureQueryData(overrideQueryOptions),
  head: () =>
    buildHead({ huPath: "/kalkulatorok/jovedelemado", lang: "en", title: TITLE, description: DESCRIPTION }),
  component: CalculatorPage,
});

function CalculatorPage() {
  const { data: override } = useSuspenseQuery(overrideQueryOptions);
  return (
    <>
      <PageHero>
        <h1 className="text-3xl font-bold text-primary-foreground md:text-4xl">Personal income tax</h1>
      </PageHero>
      <div className="mx-auto max-w-6xl px-4 py-14 md:py-16">
        <p className="max-w-3xl text-base text-muted-foreground">Personal income tax calculator. The interface of the calculator is in Hungarian; the calculation is for information purposes only.</p>
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
