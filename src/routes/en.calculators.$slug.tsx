import { createFileRoute, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { EmbeddedCalculator } from "@/components/EmbeddedCalculator";
import { PageHero } from "@/components/PageHero";
import { getCustomCalculator } from "@/lib/custom-calculators.functions";

const calcQueryOptions = (slug: string) =>
  queryOptions({
    queryKey: ["custom-calculator", "en", slug],
    queryFn: () => getCustomCalculator({ data: { slug, lang: "en" } }),
    staleTime: 60_000,
  });

export const Route = createFileRoute("/en/calculators/$slug")({
  loader: async ({ params, context }) => {
    const calc = await context.queryClient.ensureQueryData(calcQueryOptions(params.slug));
    if (!calc) throw notFound();
    return calc;
  },
  head: ({ loaderData }) => {
    const slug = loaderData?.slug ?? "";
    const title =
      loaderData?.metaTitle || `${loaderData?.name ?? "Calculator"} | EXCELlent Business Intelligence`;
    const description = loaderData?.metaDescription || loaderData?.intro || "";
    const canonical = `https://xlntbi.hu/en/calculators/${slug}`;
    const huUrl = `https://xlntbi.hu/kalkulatorok/${slug}`;
    const ogImage = `https://xlntbi.hu/api/public/kalkulator-kep/${slug}?lang=en`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { property: "og:url", content: canonical },
        { property: "og:locale", content: "en_US" },
        { property: "og:image", content: ogImage },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        { name: "twitter:image", content: ogImage },
      ],
      links: [
        { rel: "canonical", href: canonical },
        { rel: "alternate", hrefLang: "en", href: canonical },
        { rel: "alternate", hrefLang: "hu", href: huUrl },
        { rel: "alternate", hrefLang: "x-default", href: huUrl },
      ],
    };
  },
  component: CustomCalculatorEnPage,
});

function CustomCalculatorEnPage() {
  const { data: calc } = useSuspenseQuery(
    calcQueryOptions(Route.useParams().slug),
  );
  if (!calc) return null;
  return (
    <>
      <PageHero>
        <h1 className="text-3xl font-bold text-primary-foreground md:text-4xl">{calc.name}</h1>
      </PageHero>
      <div className="mx-auto max-w-6xl px-4 py-14 md:py-16">
        {calc.intro ? (
          <p className="max-w-3xl text-base text-muted-foreground">{calc.intro}</p>
        ) : null}
        <div className="mt-8">
          <EmbeddedCalculator key={calc.updatedAt} html={calc.html} script={calc.script} />
        </div>
      </div>
    </>
  );
}
