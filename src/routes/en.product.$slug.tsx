import { createFileRoute, Link, notFound, redirect } from "@tanstack/react-router";
import { Check } from "lucide-react";

import { AAM_PRICE_NOTE, aamText } from "@/lib/aam";
import { formatPrice, getProduct, priceFrom, resolveProductSlug } from "@/lib/products";
import { productSummaryEn } from "@/lib/products-en";
import { englishProductContent, englishProductMeta } from "@/lib/product-overrides";
import { SITE_ORIGIN } from "@/lib/i18n/routes";
import { usePageView } from "@/lib/use-page-view";

export const Route = createFileRoute("/en/product/$slug")({
  loader: ({ params }) => {
    const canonical = resolveProductSlug(params.slug);
    if (canonical !== params.slug) {
      throw redirect({
        to: "/en/product/$slug",
        params: { slug: canonical },
        statusCode: 301,
      });
    }
    const product = getProduct(params.slug);
    if (!product) throw notFound();

    const english = englishProductContent(product.slug);
    const meta = englishProductMeta(product.slug);
    return {
      slug: product.slug,
      name: product.name,
      tagline: product.tagline ?? null,
      image: product.image,
      status: product.status,
      price: product.price,
      priceFrom: priceFrom(product),
      tiers: product.tiers.map((tier) => ({
        id: tier.id,
        label: tier.label,
        price: tier.price,
        note: tier.note ?? null,
      })),
      intro: english?.intro.length
        ? english.intro
        : [productSummaryEn(product.slug, product.intro[0] ?? "")],
      features: english?.features.length ? english.features : product.features,
      why: english?.why ?? null,
      metaTitle: meta.title ?? `${product.name} | XLNTBI`,
      metaDescription:
        meta.description ?? productSummaryEn(product.slug, product.metaDescription).slice(0, 300),
      translated: Boolean(english?.features.length),
    };
  },

  head: ({ loaderData, params }) => {
    if (!loaderData) return {};
    const slug = params.slug;
    const enUrl = `${SITE_ORIGIN}/en/product/${slug}`;
    const huUrl = `${SITE_ORIGIN}/termek/${slug}`;
    return {
      meta: [
        { title: loaderData.metaTitle },
        { name: "description", content: loaderData.metaDescription },
        { property: "og:title", content: loaderData.metaTitle },
        { property: "og:description", content: loaderData.metaDescription },
        { property: "og:type", content: "product" },
        { property: "og:url", content: enUrl },
        { property: "og:locale", content: "en_US" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: loaderData.metaTitle },
        { name: "twitter:description", content: loaderData.metaDescription },
      ],
      links: [
        { rel: "canonical", href: enUrl },
        { rel: "alternate", hrefLang: "hu", href: huUrl },
        { rel: "alternate", hrefLang: "en", href: enUrl },
        { rel: "alternate", hrefLang: "x-default", href: huUrl },
      ],
    };
  },
  component: EnglishProductPage,
});

function EnglishProductPage() {
  const data = Route.useLoaderData();
  usePageView("product", data.slug);

  return (
    <div>
      <section className="bg-brand-dark py-12 md:py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h1 className="text-3xl font-bold text-primary-foreground md:text-5xl">
            {data.name}
          </h1>
          {data.tagline ? (
            <p className="mt-4 max-w-3xl text-base text-primary-foreground/85">
              {data.tagline}
            </p>
          ) : null}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr]">
          <div>
            {data.intro.map((paragraph) => (
              <p
                key={paragraph}
                className="mb-4 text-base leading-relaxed text-muted-foreground"
              >
                {aamText(paragraph)}
              </p>
            ))}

            <h2 className="mt-10 text-2xl font-bold text-foreground">Main features</h2>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {data.features.map((feature) => (
                <li
                  key={feature}
                  className="flex items-start gap-3 rounded-md border-l-4 border-primary bg-secondary/60 p-4 text-sm leading-relaxed text-foreground"
                >
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  {aamText(feature)}
                </li>
              ))}
            </ul>

            {data.why ? (
              <div className="mt-10 rounded-xl bg-brand-dark p-6 md:p-8">
                <h2 className="text-xl font-semibold text-primary-foreground">
                  Why it helps
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-primary-foreground/90">
                  {aamText(data.why)}
                </p>
              </div>
            ) : null}

            {!data.translated ? (
              <p className="mt-8 text-sm text-muted-foreground">
                Detailed documentation is available in Hungarian:{" "}
                <Link
                  to="/termek/$slug"
                  params={{ slug: data.slug }}
                  className="text-primary underline hover:no-underline"
                >
                  Hungarian product page
                </Link>
                .
              </p>
            ) : null}
          </div>

          <aside>
            <img
              src={data.image}
              alt={`${data.name} – illustration`}
              loading="lazy"
              className="w-full rounded-xl border border-border object-cover shadow-sm"
            />
            <p className="mt-6 text-3xl font-bold text-foreground">
              {data.tiers.length > 1
                ? `from ${formatPrice(data.priceFrom)}`
                : formatPrice(data.price)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {AAM_PRICE_NOTE} Digital product, delivered by download.
            </p>

            {data.tiers.length > 1 ? (
              <div className="mt-6 rounded-xl border border-border p-5">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Licence packages
                </h2>
                <ul className="mt-3 space-y-3 text-sm">
                  {data.tiers.map((tier) => (
                    <li
                      key={tier.id}
                      className="border-b border-border pb-3 last:border-0 last:pb-0"
                    >
                      <p className="font-semibold text-foreground">{aamText(tier.label)}</p>
                      <p className="text-xs text-muted-foreground">{formatPrice(tier.price)}</p>
                      {tier.note ? (
                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                          {aamText(tier.note)}
                        </p>
                      ) : null}
                      {data.status === "available" ? (
                        <Link
                          to="/megrendeles"
                          search={{ termek: data.slug, csomag: tier.id }}
                          className="mt-2 inline-flex text-xs font-semibold text-primary underline hover:no-underline"
                        >
                          Choose this
                        </Link>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {data.status === "available" ? (
              <Link
                to="/megrendeles"
                search={{ termek: data.slug }}
                className="mt-6 inline-flex w-full items-center justify-center rounded-md bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-brand-dark"
              >
                Order
              </Link>
            ) : (
              <p className="mt-6 rounded-md border border-border bg-secondary/60 px-4 py-3 text-sm font-semibold text-foreground">
                Coming soon – get in touch and I will let you know when it is available.
              </p>
            )}

            <div className="mt-8 rounded-xl border border-border p-5">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                More products
              </h2>
              <Link
                to="/en/products"
                className="mt-3 inline-flex text-sm text-primary underline hover:no-underline"
              >
                All products
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
