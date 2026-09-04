import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { EmbeddedCalculator } from "@/components/EmbeddedCalculator";
import { PageHero } from "@/components/PageHero";
import { html, script } from "@/lib/calculators/berteszt-en";
import { getCalculatorOverride } from "@/lib/calculator.functions";
import { buildHead } from "@/lib/i18n/head";

const overrideQueryOptions = queryOptions({
  queryKey: ["calculator-override", "berteszt"],
  queryFn: () => getCalculatorOverride({ data: { key: "berteszt" } }),
  staleTime: 60_000,
});

const TITLE = "Salary calculator 2026 (gross-net, employer cost) | EXCELlent Business Intelligence";
const DESCRIPTION = "Calculate the monthly net salary, the contributions and the total employer cost for 30 types of employment relationship.";

export const Route = createFileRoute("/en/calculators/salary-test")({
  loader: ({ context }) => context.queryClient.ensureQueryData(overrideQueryOptions),
  head: () =>
    buildHead({ huPath: "/kalkulatorok/berteszt", lang: "en", title: TITLE, description: DESCRIPTION }),
  component: CalculatorPage,
});

function CalculatorPage() {
  const { data: override } = useSuspenseQuery(overrideQueryOptions);
  return (
    <>
      <PageHero>
        <h1 className="text-3xl font-bold text-primary-foreground md:text-4xl">Salary test</h1>
      </PageHero>
      <div className="mx-auto max-w-6xl px-4 py-14 md:py-16">
        <p className="max-w-3xl text-base text-muted-foreground">Monthly payroll calculator for 30 types of employment relationship, with the main tax base allowances. The calculation is for information purposes only.</p>
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
