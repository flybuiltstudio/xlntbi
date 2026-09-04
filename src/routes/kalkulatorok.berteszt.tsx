import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { EmbeddedCalculator } from "@/components/EmbeddedCalculator";
import { PageHero } from "@/components/PageHero";
import { html, script } from "@/lib/calculators/berteszt";
import { getCalculatorOverride } from "@/lib/calculator.functions";

const overrideQueryOptions = queryOptions({
  queryKey: ["calculator-override", "berteszt"],
  queryFn: () => getCalculatorOverride({ data: { key: "berteszt" } }),
  staleTime: 60_000,
});


const TITLE = "Bérkalkulátor, béreszt vállalkozóknak | EXCELlent Business Intelligence";
const DESCRIPTION = "Számold ki gyorsan a bruttó bérből a nettó bért, és fordítva, a 2026-os adó- és járulékszabályok szerint.";
const CANONICAL = "https://xlntbi.hu/kalkulatorok/berteszt";
const OG_IMAGE = "https://xlntbi.hu/og/berteszt.jpg";

export const Route = createFileRoute("/kalkulatorok/berteszt")({
  loader: ({ context }) => context.queryClient.ensureQueryData(overrideQueryOptions),
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: CANONICAL },
      { property: "og:locale", content: "hu_HU" },
      { property: "og:image", content: OG_IMAGE },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
      { name: "twitter:image", content: OG_IMAGE },
    ],
    links: [
      { rel: "canonical", href: CANONICAL },
      { rel: "alternate", hrefLang: "hu", href: "https://xlntbi.hu/kalkulatorok/berteszt" },
      { rel: "alternate", hrefLang: "en", href: "https://xlntbi.hu/en/calculators/salary-test" },
      { rel: "alternate", hrefLang: "x-default", href: "https://xlntbi.hu/kalkulatorok/berteszt" },
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
                              "name": "Bérkalkulátor",
                              "item": "https://xlntbi.hu/kalkulatorok/berteszt"
                      }
              ]
      }),
      },
    ],
  }),
  component: BertesztPage,
});

function BertesztPage() {
  const { data: override } = useSuspenseQuery(overrideQueryOptions);
  return (
    <>
      <PageHero>
        <h1 className="text-3xl font-bold text-primary-foreground md:text-4xl">Bérkalkulátor</h1>
      </PageHero>
      <div className="mx-auto max-w-6xl px-4 py-14 md:py-16">
        <p className="max-w-3xl text-base text-muted-foreground">
          Havi bérszámfejtő kalkulátor a 2026-os szabályok szerint, 30 jogviszonytípusra, a fő
          adóalap- és szocho-kedvezményekkel. A kalkuláció tájékoztató jellegű.
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
