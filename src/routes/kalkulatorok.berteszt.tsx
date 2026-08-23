import { createFileRoute } from "@tanstack/react-router";
import { EmbeddedCalculator } from "@/components/EmbeddedCalculator";
import { PageHero } from "@/components/PageHero";
import { html, script } from "@/lib/calculators/berteszt";

const TITLE = "Bérteszt 2026 – bérszámfejtés kalkulátor | EXCELlent";
const DESC =
  "Havi bérszámfejtés 30 jogviszonytípusra: SZJA, TB-járulék, szocho, adóalap-kedvezmények, cafeteria, EKHO. Tájékoztató jellegű kalkulátor.";

export const Route = createFileRoute("/kalkulatorok/berteszt")({
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
        <p className="mt-4 max-w-3xl text-base text-primary-foreground/80">
          Havi bérszámfejtő kalkulátor a 2026-os szabályok szerint, 30 jogviszonytípusra, a fő
          adóalap- és szocho-kedvezményekkel. A kalkuláció tájékoztató jellegű.
        </p>
      </PageHero>
      <div className="mx-auto max-w-6xl px-4 py-14 md:py-16">
        <div className="mt-2">
          <EmbeddedCalculator html={html} script={script} />
        </div>
      </div>
    </>
  );
}
