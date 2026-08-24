import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { EmbeddedCalculator } from "@/components/EmbeddedCalculator";
import { PageHero } from "@/components/PageHero";
import { html, script } from "@/lib/calculators/atalanyado";
import { getCalculatorOverride } from "@/lib/calculator.functions";

const overrideQueryOptions = queryOptions({
  queryKey: ["calculator-override", "atalanyado"],
  queryFn: () => getCalculatorOverride({ data: { key: "atalanyado" } }),
  staleTime: 60_000,
});

const TITLE = "Átalányadó kalkulátor 2026 – egyéni vállalkozók | EXCELlent";
const DESC =
  "Átalányadózó egyéni vállalkozó kalkulátor: költséghányad szerinti adóköteles jövedelem, SZJA, TB, szocho és HIPA számítás a 2026-os szabályok szerint. Tájékoztató jellegű kalkulátor.";

export const Route = createFileRoute("/kalkulatorok/atalanyado")({
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
  component: AtalanyadoPage,
});

function AtalanyadoPage() {
  return (
    <>
      <PageHero>
        <h1 className="text-3xl font-bold text-primary-foreground md:text-4xl">Átalányadó</h1>
      </PageHero>
      <div className="mx-auto max-w-6xl px-4 py-14 md:py-16">
        <p className="max-w-3xl text-base text-muted-foreground">
          Átalányadózó egyéni vállalkozók kalkulátora a 2026-os szabályok szerint: költséghányad
          szerinti adóköteles jövedelem, SZJA, TB, szocho és HIPA. A kalkuláció tájékoztató jellegű.
        </p>
        <div className="mt-8">
          <EmbeddedCalculator html={html} script={script} />
        </div>
      </div>
    </>
  );
}
