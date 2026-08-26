import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { EmbeddedCalculator } from "@/components/EmbeddedCalculator";
import { PageHero } from "@/components/PageHero";
import { html, script } from "@/lib/calculators/szamla-datumok";
import { getCalculatorOverride } from "@/lib/calculator.functions";

const overrideQueryOptions = queryOptions({
  queryKey: ["calculator-override", "szamla-datumok"],
  queryFn: () => getCalculatorOverride({ data: { key: "szamla-datumok" } }),
  staleTime: 60_000,
});


const TITLE = "Számla dátumok kalkulátor (teljesítés, fizetési határidő) | EXCELlent Business Intelligence";
const DESCRIPTION = "Számold ki gyorsan a számla teljesítési dátumát és fizetési határidejét a hatályos szabályok alapján.";
const CANONICAL = "https://xlntbi.hu/kalkulatorok/szamla-datumok";
const OG_IMAGE = "https://xlntbi.hu/og/account-assets-audit-bank-bookkeeping-finance-concept.jpg";

export const Route = createFileRoute("/kalkulatorok/szamla-datumok")({
  loader: ({ context }) => context.queryClient.ensureQueryData(overrideQueryOptions),
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
      { rel: "alternate", hrefLang: "hu", href: "https://xlntbi.hu/kalkulatorok/szamla-datumok" },
      { rel: "alternate", hrefLang: "en", href: "https://xlntbi.hu/kalkulatorok/invoice-dates" },
      { rel: "alternate", hrefLang: "x-default", href: "https://xlntbi.hu/kalkulatorok/szamla-datumok" },
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
                              "name": "Kalkulátorok",
                              "item": "https://xlntbi.hu/kalkulatorok"
                      },
                      {
                              "@type": "ListItem",
                              "position": 3,
                              "name": "Számla dátumok kalkulátor",
                              "item": "https://xlntbi.hu/kalkulatorok/szamla-datumok"
                      }
              ]
      }),
      },
    ],
  }),
  component: SzamlaDatumokPage,
});

function SzamlaDatumokPage() {
  const { data: override } = useSuspenseQuery(overrideQueryOptions);
  return (
    <>
      <PageHero>
        <h1 className="text-3xl font-bold text-primary-foreground md:text-4xl">Számla dátumok kalkulátor</h1>
      </PageHero>
      <div className="mx-auto max-w-6xl px-4 py-14 md:py-16">
        <p className="max-w-3xl text-base text-muted-foreground">
          Számlázási dátumok kalkulátora az ÁFA törvény (58. §, 60. §, 80. §, 163. §) alapján:
          teljesítési időpont, fizetési határidő és árfolyam-dátum, élő MNB-árfolyammal. A kalkuláció
          tájékoztató jellegű.
        </p>
        <div className="mt-8">
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
