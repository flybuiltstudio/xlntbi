import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import kalkulatorImg from "@/assets/online-kalkulator.jpg";
import { aamText } from "@/lib/aam";
import { priceFrom, formatPrice } from "@/lib/products";
import { productSummaryEn } from "@/lib/products-en";
import { applyPlacements, categoryProducts, getCategory } from "@/lib/product-categories";
import { getProductPlacements } from "@/lib/product-placements.functions";
import heroVideo from "@/assets/termekek-hero.mp4.asset.json";
import { PageHero } from "@/components/PageHero";
import { buildHead } from "@/lib/i18n/head";

const TITLE = "Products: bookkeeping and NAV helper tools | EXCELlent Business Intelligence";
const DESCRIPTION =
  "Excel and XML based helper tools for accountants and entrepreneurs: NAV data reporting, payroll, bank conversion and other automated tools.";
const OG_IMAGE = "https://xlntbi.hu/og/termekek.jpg";

export const Route = createFileRoute("/en/products")({
  validateSearch: (search: Record<string, unknown>): { category?: string | undefined } => {
    const raw = search["category"];
    return { category: typeof raw === "string" && getCategory(raw) ? raw : undefined };
  },
  loader: () => getProductPlacements(),
  head: () =>
    buildHead({
      huPath: "/termekeim",
      lang: "en",
      title: TITLE,
      description: DESCRIPTION,
      ogImage: OG_IMAGE,
    }),
  component: EnglishProducts,
});

const features = [
  "Bookkeeping helper tools",
  "Digital solutions for preparing financial statements, including complex macros",
  "Tax calculation helper programs",
  "Tools related to local business tax",
  "Helper tools for bank transfers",
  "Reporting helper tools",
];

function EnglishProducts() {
  const { category: openKey } = Route.useSearch();
  const { placements, categoryOrder } = Route.useLoaderData();
  const categories = applyPlacements(placements, categoryOrder);
  const open = getCategory(openKey, categories);
  return (
    <div>
      <PageHero>
        <h1 className="text-3xl font-bold leading-tight text-primary-foreground md:text-4xl">
          Products
        </h1>
      </PageHero>

      <section className="mx-auto max-w-6xl px-4 py-10 md:py-12">
        <div className="grid items-start gap-10 md:grid-cols-2">
          <div>
            <p className="text-base leading-relaxed text-muted-foreground">
              On this page you will find my own products, developed for real-life use. They are made
              for accountants, accounting firms, tax professionals and finance teams.
            </p>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              Some of the products are modern digitalisation and automation solutions, others are
              online calculators or digital helper programs, in some cases with complex macros. What
              they have in common is that they give a fast, usable answer to a real professional
              problem.
            </p>

            <div className="mt-8">
              <h2 className="text-xl font-bold text-foreground">What will you find here?</h2>
              <ul className="mt-4 space-y-3">
                {features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm font-medium text-foreground">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            <Link
              to="/en/products"
              hash="products"
              className="mt-6 inline-flex items-center rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-brand-dark"
            >
              View the products
            </Link>
            <p className="mt-6 text-sm font-semibold leading-relaxed text-orange-600 dark:text-orange-500">
              A DEMO can be requested for any product. Use the program below to find your machine's
              identifier. Then send me{' '}
              <a
                href="/api/public/hwid-download"
                className="font-bold text-red-600 underline italic hover:text-red-600 focus:text-red-600 dark:text-red-500 dark:hover:text-red-500"
              >
                this identifier
              </a>
              , the name of the product you would like to try,
              and how many days you need for testing via the Request a consultation page. DEMOs are
              full versions; only the usage period is limited.
            </p>
            <a
              href="/api/public/hwid-download"
              className="mt-4 inline-flex items-center rounded-md border border-input px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-accent"
            >
              Download HWID
            </a>
            <p className="mt-6 text-sm font-semibold text-red-600 dark:text-red-500">
              I also develop custom products. Get in touch with me through the consultation page.
            </p>
            <Link
              to="/en/consultation"
              className="mt-4 inline-flex items-center rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-brand-dark"
            >
              Request a consultation
            </Link>
          </div>
          <div>
            <video
              src={heroVideo.url}
              poster={kalkulatorImg}
              autoPlay
              muted
              loop
              playsInline
              aria-label="Digital products – atmosphere video"
              className="w-full rounded-xl border border-border object-cover shadow-sm"
            />
            <div className="mt-8">
              <h2 className="text-xl font-bold text-foreground">Why are they good?</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Because they save time, reduce errors and get you to the final result faster.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="products" className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-2xl font-bold text-foreground">Products available to order</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Choose a category to open the products it contains. Product names and the order process
          are in Hungarian.
        </p>

        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {categories.map((category) => {
            const isOpen = category.key === openKey;
            const count = categoryProducts(category).length;
            return (
              <Link
                key={category.key}
                to="/en/products"
                search={isOpen ? {} : { category: category.key }}
                hash="products"
                aria-current={isOpen ? "true" : undefined}
                className={`group flex flex-col overflow-hidden rounded-lg border bg-card transition-colors ${
                  isOpen ? "border-primary ring-2 ring-primary" : "border-border hover:border-primary"
                }`}
              >
                <img
                  src={category.image}
                  alt={`${category.titleEn} – category`}
                  loading="lazy"
                  width={512}
                  height={512}
                  className="aspect-square w-full object-cover"
                />
                <span className="px-2 py-2 text-center text-xs font-semibold leading-tight text-foreground">
                  {category.titleEn}
                  <span className="block text-[11px] font-normal text-muted-foreground">
                    {count} products
                  </span>
                </span>
              </Link>
            );
          })}
        </div>

        {open ? (
          <div className="mt-10">
            <h3 className="text-xl font-bold text-foreground">{open.titleEn}</h3>
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              {categoryProducts(open).map((product) => (
                <article
                  key={product.slug}
                  className="flex flex-col overflow-hidden rounded-xl border border-border bg-card"
                >
                  <img
                    src={product.image}
                    alt={`${product.name} – illustration`}
                    loading="lazy"
                    className="h-48 w-full object-cover"
                  />
                  <div className="flex flex-1 flex-col p-6">
                    <h4 className="text-lg font-semibold text-foreground">{product.name}</h4>
                    <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                      {aamText(productSummaryEn(product.slug, product.intro[0] ?? ""))}
                    </p>
                    <p className="mt-4 text-xl font-bold text-foreground">
                      {product.tiers.length > 1
                        ? `from ${formatPrice(priceFrom(product))}`
                        : formatPrice(product.price)}
                    </p>
                    {product.status === "coming_soon" ? (
                      <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Coming soon
                      </p>
                    ) : null}
                    <div className="mt-5 flex flex-wrap gap-3">
                      <Link
                        to="/en/product/$slug"
                        params={{ slug: product.slug }}

                        className="inline-flex items-center rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-brand-dark"
                      >
                        Details
                      </Link>
                      {product.status === "available" ? (
                        <Link
                          to="/megrendeles"
                          search={{ termek: product.slug }}
                          className="inline-flex items-center rounded-md border border-input px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-accent"
                        >
                          Order
                        </Link>
                      ) : null}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}
