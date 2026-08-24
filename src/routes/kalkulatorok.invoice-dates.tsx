import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { EmbeddedCalculator } from "@/components/EmbeddedCalculator";
import { PageHero } from "@/components/PageHero";
import { html, script } from "@/lib/calculators/invoice-dates-en";
import { getCalculatorOverride } from "@/lib/calculator.functions";

const overrideQueryOptions = queryOptions({
  queryKey: ["calculator-override", "invoice-dates"],
  queryFn: () => getCalculatorOverride({ data: { key: "invoice-dates" } }),
  staleTime: 60_000,
});

const TITLE = "Invoice Dates Calculator – Hungarian VAT dates with live MNB rates | EXCELlent";
const DESC =
  "Invoice dates calculator under the Hungarian VAT Act: date of supply, payment deadline and FX date with live NBH (MNB) exchange rates for EUR/GBP/USD. For information only.";

export const Route = createFileRoute("/kalkulatorok/invoice-dates")({
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
  component: InvoiceDatesPage,
});

function InvoiceDatesPage() {
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
