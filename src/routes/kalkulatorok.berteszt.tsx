import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { EmbeddedCalculator } from "@/components/EmbeddedCalculator";
import { PageHero } from "@/components/PageHero";
import { html, script } from "@/lib/calculators/berteszt";
import { getCalculatorOverride } from "@/lib/calculator.functions";

const overrideQueryOptions = queryOptions({
  queryKey: ["calculator-override", "berteszt"],
  queryFn: () => getCalculatorOverride({ data: { key: "berteszt" } }),
  staleTime: 60_000,
});

const TITLE = "Bérteszt 2026 – bérszámfejtés kalkulátor | EXCELlent";
const DESC =
  "Havi bérszámfejtés 30 jogviszonytípusra: SZJA, TB-járulék, szocho, adóalap-kedvezmények, cafeteria, EKHO. Tájékoztató jellegű kalkulátor.";

export const Route = createFileRoute("/kalkulatorok/berteszt")({
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
  component: BertesztPage,
});

function BertesztPage() {
  return (
    <>
      <PageHero>
        <h1 className="text-3xl font-bold text-primary-foreground md:text-4xl">Bérteszt</h1>
      </PageHero>
      <div className="mx-auto max-w-6xl px-4 py-14 md:py-16">
        <p className="max-w-3xl text-base text-muted-foreground">
          Havi bérszámfejtő kalkulátor a 2026-os szabályok szerint, 30 jogviszonytípusra, a fő
          adóalap- és szocho-kedvezményekkel. A kalkuláció tájékoztató jellegű.
        </p>
        <div className="mt-8">
          <EmbeddedCalculator html={html} script={script} />
        </div>
      </div>
    </>
  );
}
