import { createFileRoute } from "@tanstack/react-router";
import { EmbeddedCalculator } from "@/components/EmbeddedCalculator";
import { PageHero } from "@/components/PageHero";
import { html, script } from "@/lib/calculators/invoice-dates-en";

const TITLE = "Invoice Dates Calculator – Hungarian VAT dates with live MNB rates | EXCELlent";
const DESC =
  "Invoice dates calculator under the Hungarian VAT Act: date of supply, payment deadline and FX date with live NBH (MNB) exchange rates for EUR/GBP/USD. For information only.";

export const Route = createFileRoute("/kalkulatorok/invoice-dates")({
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
  return (
    <>
      <PageHero>
        <h1 className="text-3xl font-bold text-primary-foreground md:text-4xl">Invoice Dates Calculator</h1>
      </PageHero>
      <div className="mx-auto max-w-6xl px-4 py-14 md:py-16">
        <p className="max-w-3xl text-base text-muted-foreground">
          Invoice dates under the Hungarian VAT Act (§58, §60, §80, §163): date of supply, payment
          deadline and FX date, with live NBH (MNB) exchange rates for EUR, GBP and USD. For
          information only.
        </p>
        <div className="mt-8">
          <EmbeddedCalculator html={html} script={script} />
        </div>
      </div>
    </>
  );
}
