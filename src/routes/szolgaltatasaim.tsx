import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { PageHero } from "@/components/PageHero";

const TITLE = "Szolgáltatásaim – könyvelés, adózás, audit, BI | EXCELlent";
const DESC =
  "Könyvelés, adótanácsadás, könyvvizsgálat, Fintech és BI, kontrolling és digitális auditok egy helyen.";

export const Route = createFileRoute("/szolgaltatasaim")({
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
  component: SzolgaltatasaimPage,
});

const items = [
  { to: "/konyveles", label: "Könyvelési szolgáltatások" },
  { to: "/adotanacsadas", label: "Adózási és ügyviteli tanácsadás" },
  { to: "/fintech-es-bi", label: "Fintech és BI tanácsadás" },
  { to: "/kontrolling", label: "Kontrolling modern riport- és automatizációs eszközökkel" },
  { to: "/cegaudit", label: "Cégaudit" },
  { to: "/konyvvizsgalat", label: "Könyvvizsgálat" },
  { to: "/konyveloiroda-audit", label: "Könyvelőiroda audit" },
  { to: "/digitalis-idomegtakaritasi-audit", label: "Digitális időmegtakarítási audit" },
] as const;

function SzolgaltatasaimPage() {
  return (
    <>
      <PageHero>
        <h1 className="text-3xl font-bold text-primary-foreground md:text-4xl">
          Szolgáltatásaim
        </h1>
      </PageHero>

      <div className="mx-auto max-w-6xl px-4 py-14 md:py-16">
        <div className="mt-2 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="group flex flex-col justify-between rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary"
          >
            <h2 className="text-lg font-semibold text-card-foreground">{item.label}</h2>
            <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary">
              Tovább
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
