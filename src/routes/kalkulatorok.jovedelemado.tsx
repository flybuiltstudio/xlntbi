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
  const { data: override } = useSuspenseQuery(overrideQueryOptions);
  return (
...
          <EmbeddedCalculator
            key={override ? override.updatedAt : "beepitett"}
            html={override?.html ?? html}
            script={override?.script ?? script}
          />
        </div>
      </div>
    </>
  );
}
