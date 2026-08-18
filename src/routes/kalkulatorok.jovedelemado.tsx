import { createFileRoute } from "@tanstack/react-router";
import { EmbeddedCalculator } from "@/components/EmbeddedCalculator";
import { html, script } from "@/lib/calculators/jovedelemado";

const TITLE = "Jövedelemadó kalkulátor – adózási formák összehasonlítása | EXCELlent";
const DESC =
  "Adózási forma összehasonlító kalkulátor a 2026-ban hatályos szabályok szerint. Tájékoztató jellegű kalkuláció.";

export const Route = createFileRoute("/kalkulatorok/jovedelemado")({
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
    <div className="mx-auto max-w-6xl px-4 py-14">
      <h1 className="text-3xl font-bold text-foreground md:text-4xl">Jövedelemadó</h1>
      <p className="mt-4 max-w-3xl text-base text-muted-foreground">
        Adózási forma összehasonlító kalkulátor a 2026-ban hatályos szabályok alapján. A kalkuláció
        tájékoztató jellegű.
      </p>
      <div className="mt-10">
        <EmbeddedCalculator html={html} script={script} />
      </div>
    </div>
  );
}
