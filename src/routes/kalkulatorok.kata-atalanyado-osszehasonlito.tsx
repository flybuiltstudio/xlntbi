import { createFileRoute } from "@tanstack/react-router";
import { EmbeddedCalculator } from "@/components/EmbeddedCalculator";
import { PageHero } from "@/components/PageHero";
import { htmlHu, scriptHu } from "@/lib/calculators/kata-atalanyado-osszehasonlito";

const TITLE = "KATA és Átalányadó összehasonlító | EXCELlent Business Intelligence";
const DESCRIPTION =
  "Hasonlítsd össze a 2027-es KATA és átalányadó várható adóterheit a vállalkozásod bevételei és jogállása alapján.";
const CANONICAL = "https://xlntbi.hu/kalkulatorok/kata-atalanyado-osszehasonlito";
const EN_URL = "https://xlntbi.hu/en/calculators/kata-flat-rate-tax-comparison";

export const Route = createFileRoute("/kalkulatorok/kata-atalanyado-osszehasonlito")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: CANONICAL },
      { property: "og:locale", content: "hu_HU" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
    ],
    links: [
      { rel: "canonical", href: CANONICAL },
      { rel: "alternate", hrefLang: "hu", href: CANONICAL },
      { rel: "alternate", hrefLang: "en", href: EN_URL },
      { rel: "alternate", hrefLang: "x-default", href: CANONICAL },
    ],
  }),
  component: KataComparisonPage,
});

function KataComparisonPage() {
  return (
    <>
      <PageHero>
        <h1 className="text-3xl font-bold text-primary-foreground md:text-4xl">
          KATA és Átalányadó összehasonlító
        </h1>
      </PageHero>
      <div className="mx-auto max-w-6xl px-4 pt-7 pb-14 md:pt-8 md:pb-16">
        <EmbeddedCalculator html={htmlHu} script={scriptHu} />
      </div>
    </>
  );
}