import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { PageHero } from "@/components/PageHero";


const TITLE = "Szolgáltatásaim: könyveléstől a BI tanácsadásig | EXCELlent Business Intelligence";
const DESCRIPTION = "Tekintsd át teljes szolgáltatási palettámat: könyvelés, adótanácsadás, kontrolling, cégaudit, könyvvizsgálat és fintech BI megoldások.";
const CANONICAL = "https://xlntbi.hu/szolgaltatasaim";
const OG_IMAGE = "https://xlntbi.hu/og/bi.jpg";

export const Route = createFileRoute("/szolgaltatasaim")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: CANONICAL },
      { property: "og:image", content: OG_IMAGE },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
      { name: "twitter:image", content: OG_IMAGE },
    ],
    links: [
      { rel: "canonical", href: CANONICAL },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              "itemListElement": [
                      {
                              "@type": "ListItem",
                              "position": 1,
                              "name": "Főoldal",
                              "item": "https://xlntbi.hu/"
                      },
                      {
                              "@type": "ListItem",
                              "position": 2,
                              "name": "Szolgáltatásaim",
                              "item": "https://xlntbi.hu/szolgaltatasaim"
                      }
              ]
      }),
      },
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
    </>
  );
}
