import { createFileRoute } from "@tanstack/react-router";
import { EmbeddedCalculator } from "@/components/EmbeddedCalculator";
import { PageHero } from "@/components/PageHero";
import { htmlEn, scriptEn } from "@/lib/calculators/kata-atalanyado-osszehasonlito";

const TITLE = "KATA and Flat-Rate Tax Comparison | EXCELlent Business Intelligence";
const DESCRIPTION =
  "Compare the expected 2027 tax burden under KATA and Hungarian flat-rate taxation based on your business revenue and status.";
const CANONICAL = "https://xlntbi.hu/en/calculators/kata-flat-rate-tax-comparison";
const HU_URL = "https://xlntbi.hu/kalkulatorok/kata-atalanyado-osszehasonlito";

export const Route = createFileRoute("/en/calculators/kata-flat-rate-tax-comparison")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: CANONICAL },
      { property: "og:locale", content: "en_US" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
    ],
    links: [
      { rel: "canonical", href: CANONICAL },
      { rel: "alternate", hrefLang: "en", href: CANONICAL },
      { rel: "alternate", hrefLang: "hu", href: HU_URL },
      { rel: "alternate", hrefLang: "x-default", href: HU_URL },
    ],
  }),
  component: KataComparisonPage,
});

function KataComparisonPage() {
  return (
    <>
      <PageHero>
        <h1 className="text-3xl font-bold text-primary-foreground md:text-4xl">
          KATA and Flat-Rate Tax Comparison
        </h1>
      </PageHero>
      <div className="mx-auto max-w-6xl px-4 pt-7 pb-14 md:pt-8 md:pb-16">
        <p className="max-w-3xl text-base text-muted-foreground">
          Compare the expected 2027 tax burden under KATA and Hungarian flat-rate taxation
          based on your business revenue and status. The calculation is for information only.
        </p>
        <div className="mt-8">
          <EmbeddedCalculator html={htmlEn} script={scriptEn} />
        </div>
      </div>
    </>
  );
}