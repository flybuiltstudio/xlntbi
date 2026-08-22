import { createFileRoute } from "@tanstack/react-router";
import { EmbeddedCalculator } from "@/components/EmbeddedCalculator";
import { html, script } from "@/lib/calculators/szamla-datumok";

const TITLE = "Számla dátumok kalkulátor – teljesítés, határidő, árfolyam | EXCELlent";
const DESC =
  "Számlázási dátumok kalkulátora az ÁFA tv. szerint: teljesítési időpont, fizetési határidő és árfolyam-dátum élő MNB-árfolyammal (EUR/GBP/USD). Tájékoztató jellegű kalkulátor.";

export const Route = createFileRoute("/kalkulatorok/szamla-datumok")({
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
  component: SzamlaDatumokPage,
});

function SzamlaDatumokPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <h1 className="text-3xl font-bold text-foreground md:text-4xl">Számla dátumok</h1>
      <p className="mt-4 max-w-3xl text-base text-muted-foreground">
        Számlázási dátumok kalkulátora az ÁFA törvény (58. §, 60. §, 80. §, 163. §) alapján:
        teljesítési időpont, fizetési határidő és árfolyam-dátum, élő MNB-árfolyammal. A kalkuláció
        tájékoztató jellegű.
      </p>
      <div className="mt-10">
        <EmbeddedCalculator html={html} script={script} />
      </div>
    </div>
  );
}
