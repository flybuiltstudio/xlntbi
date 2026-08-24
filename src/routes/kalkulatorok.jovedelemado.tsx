import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { EmbeddedCalculator } from "@/components/EmbeddedCalculator";
import { PageHero } from "@/components/PageHero";
import { html, script } from "@/lib/calculators/jovedelemado";
import { getCalculatorOverride } from "@/lib/calculator.functions";

const overrideQueryOptions = queryOptions({
  queryKey: ["calculator-override", "jovedelemado"],
  queryFn: () => getCalculatorOverride({ data: { key: "jovedelemado" } }),
  staleTime: 60_000,
});

const TITLE = "Jövedelemadó kalkulátor – adózási formák összehasonlítása | EXCELlent";
const DESC =
  "Adózási forma összehasonlító kalkulátor a 2026-ban hatályos szabályok szerint. Tájékoztató jellegű kalkuláció.";

export const Route = createFileRoute("/kalkulatorok/jovedelemado")({
  loader: ({ context }) => context.queryClient.ensureQueryData(overrideQueryOptions),
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: JovedelemadoPage,
});

function JovedelemadoPage() {
  return (
    <>
      <PageHero>
        <h1 className="text-3xl font-bold text-primary-foreground md:text-4xl">Jövedelemadó</h1>
      </PageHero>
      <div className="mx-auto max-w-6xl px-4 py-14 md:py-16">
        <p className="max-w-3xl text-base text-muted-foreground">
          Adózási forma összehasonlító kalkulátor a 2026-ban hatályos szabályok alapján. A kalkuláció
          tájékoztató jellegű.
        </p>
        <div className="mt-8">
          <EmbeddedCalculator html={html} script={script} />
        </div>
      </div>
    </>
  );
}
