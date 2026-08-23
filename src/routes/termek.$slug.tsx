import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { priceFrom, formatPrice, getProduct, products } from "@/lib/products";
import icKulfoldi from "@/assets/icons/kulfoldi.png.asset.json";
import icIroda from "@/assets/icons/iroda.png.asset.json";
import icEgyeni from "@/assets/icons/egyeni.png.asset.json";
import icCsapat from "@/assets/icons/csapat.png.asset.json";
import icAi from "@/assets/icons/ai.png.asset.json";

const steps = [
  {
    title: "1. Megrendelés",
    text: "Kitöltöd a megrendelőlapot a számlázási adatokkal. Nincs szükség szállítási címre, ez digitális termék.",
  },
  {
    title: "2. Visszaigazolás és számla",
    text: "E-mailben azonnal visszaigazolást kapsz, ezt követően megkapod a számlát és a fizetési adatokat.",
  },
  {
    title: "3. Letöltés és beállítás",
    text: "A programot letöltheted, és megkapod a használathoz szükséges leírást a NAV-hozzáférés beállításához.",
  },
  {
    title: "4. Frissítések",
    text: "Ha a NAV-oldali vagy jogszabályi feltételek változnak, jelzem, és elérhetővé teszem a frissebb verziót.",
  },
];

const audience = [
  {
    title: "Könyvelőirodák",
    icon: icIroda.url,
    text: "Ahol sok ügyfél adatait kell rendszeresen letölteni és egységes formában feldolgozni.",
  },
  {
    title: "Egyéni könyvelők",
    icon: icEgyeni.url,
    text: "Akik a kézi másolgatás helyett néhány kattintással szeretnének rendezett Excel-fájlt kapni.",
  },
  {
    title: "Vállalati pénzügyi csapatok",
    icon: icCsapat.url,
    text: "Ahol az adatokat kontrollingra, ellenőrzésre vagy riportokhoz is fel kell használni.",
  },
  {
    title: "Külföldi rendszert használók",
    icon: icKulfoldi.url,
    text: "SAP, NAVISION, Business Central vagy Oracle mellett is jól használható, importálható kimenettel.",
  },
];

const faq = [
  {
    q: "Hogyan kapom meg a terméket?",
    a: "A megrendelés leadása után e-mailben visszaigazolást kapsz, majd a számlázás rendezését követően e-mailben megkapod a letöltési lehetőséget és a használati leírást.",
  },
  {
    q: "Lehet bankkártyával fizetni?",
    a: "Jelenleg a megrendelést követően kiállított számla alapján, banki átutalással történik a fizetés. A bankkártyás fizetés bevezetése folyamatban van.",
  },
  {
    q: "Kell hozzá speciális szoftver?",
    a: "A program Windows környezetben futó asztali segédprogram. Az eredmény Excelben nyitható meg és dolgozható tovább.",
  },
  {
    q: "Kapok frissítéseket?",
    a: "Igen. A fejlesztésnél AI-alapú eszközöket is használok, ezért a szükséges módosításokat rövidebb idő alatt tudom átvezetni, és a frissebb verziót elérhetővé teszem.",
  },
  {
    q: "Számlát kapok róla?",
    a: "Igen, a megadott számlázási adatok alapján szabályos számlát állítok ki. A díj bruttó ár.",
  },
];


export const Route = createFileRoute("/termek/$slug")({
  loader: ({ params }) => {
    const product = getProduct(params.slug);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => {
    const product = loaderData?.product;
    if (!product) return {};
    const pageUrl = `https://xlntbi.lovable.app/termek/${product.slug}`;
    const imageUrl = `https://xlntbi.lovable.app${product.image}`;
    return {
      meta: [
        { title: product.metaTitle },
        { name: "description", content: product.metaDescription },
        { property: "og:title", content: product.metaTitle },
        { property: "og:description", content: product.metaDescription },
        { property: "og:type", content: "product" },
        { property: "og:url", content: pageUrl },
        { property: "og:image", content: imageUrl },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:image", content: imageUrl },
      ],
      links: [{ rel: "canonical", href: pageUrl }],
    };
  },
  component: ProductPage,
});

function ProductPage() {
  const { product } = Route.useLoaderData();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.intro[0],
    image: `https://xlntbi.lovable.app${product.image}`,
    brand: { "@type": "Brand", name: "EXCELlent Business Intelligence" },
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: product.currency,
      availability: "https://schema.org/InStock",
      url: `https://xlntbi.lovable.app/termek/${product.slug}`,
    },
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />



      <section className="bg-brand-dark py-12 md:py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h1 className="text-3xl font-bold text-primary-foreground md:text-5xl">{product.name}</h1>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr]">
          <div>
            {product.intro.map((paragraph) => (
              <p key={paragraph} className="mb-4 text-base leading-relaxed text-muted-foreground">
                {paragraph}
              </p>
            ))}

            <h2 className="mt-10 text-2xl font-bold text-foreground">Fő funkciók</h2>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {product.features.map((feature) => (
                <li
                  key={feature}
                  className="flex items-start gap-3 rounded-md border-l-4 border-primary bg-secondary/60 p-4 text-sm leading-relaxed text-foreground"
                >
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  {feature}
                </li>
              ))}
            </ul>

            {product.why ? (
              <div className="mt-10 rounded-xl bg-brand-dark p-6 md:p-8">
                <h2 className="text-xl font-semibold text-primary-foreground">Miért jó</h2>
                <p className="mt-3 text-sm leading-relaxed text-primary-foreground/90">
                  {product.why}
                </p>
              </div>
            ) : null}
          </div>

          <aside>
            <img
              src={product.image}
              alt={`${product.name} – illusztráció`}
              loading="lazy"
              className="w-full rounded-xl border border-border object-cover shadow-sm"
            />
            <p className="mt-6 text-3xl font-bold text-foreground">
              {product.tiers.length > 1 ? `${formatPrice(priceFrom(product))}-tól` : formatPrice(product.price)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Az ár bruttó ár (alanyi adómentes). Digitális termék, letöltéssel teljesítjük.
            </p>

            {product.tiers.length > 1 ? (
              <div className="mt-6 rounded-xl border border-border p-5">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Licenc csomagok
                </h2>
                <ul className="mt-3 space-y-3 text-sm">
                  {product.tiers.map((tier) => (
                    <li key={tier.id} className="border-b border-border pb-3 last:border-0 last:pb-0">
                      <p className="font-semibold text-foreground">{tier.label}</p>
                      <p className="text-xs text-muted-foreground">{formatPrice(tier.price)}</p>
                      {tier.note ? (
                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                          {tier.note}
                        </p>
                      ) : null}
                      {product.status === "available" ? (
                        <Link
                          to="/megrendeles"
                          search={{ termek: product.slug, csomag: tier.id }}
                          className="mt-2 inline-flex text-xs font-semibold text-primary underline hover:no-underline"
                        >
                          Ezt választom
                        </Link>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {product.status === "available" ? (
              <Link
                to="/megrendeles"
                search={{ termek: product.slug }}
                className="mt-6 inline-flex w-full items-center justify-center rounded-md bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-brand-dark"
              >
                Megrendelem
              </Link>
            ) : (
              <p className="mt-6 rounded-md border border-border bg-secondary/60 px-4 py-3 text-sm font-semibold text-foreground">
                Hamarosan elérhető – írj, és jelzem, amikor megvásárolható.
              </p>
            )}
            <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
              A megrendelés leadása után e-mailben visszaigazolást kapsz, és felvesszük veled a
              kapcsolatot a számlázás és a letöltés részleteivel. Bankkártyás fizetés hamarosan.
            </p>

            <div className="mt-8 rounded-xl border border-border p-5">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                További termékek
              </h2>
              <ul className="mt-3 space-y-2 text-sm">
                {products
                  .filter((p) => p.slug !== product.slug)
                  .map((p) => (
                    <li key={p.slug}>
                      <Link
                        to="/termek/$slug"
                        params={{ slug: p.slug }}
                        className="text-primary underline hover:no-underline"
                      >
                        {p.name}
                      </Link>
                    </li>
                  ))}
                <li>
                  <Link to="/termekeim" className="text-primary underline hover:no-underline">
                    Összes termék
                  </Link>
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </section>

      {product.steps && product.steps.length > 0 ? (
        <section className="border-t border-border">
          <div className="mx-auto max-w-6xl px-4 py-14 md:py-16">
            <h2 className="text-2xl font-bold text-foreground md:text-3xl">A konszolidálás lépései</h2>
            <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {product.steps.map((step) => (
                <li key={step.title} className="rounded-xl border border-border bg-card p-5">
                  <h3 className="text-base font-semibold text-card-foreground">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      ) : null}

      <section className="border-t border-border bg-secondary/60">
        <div className="mx-auto max-w-6xl px-4 py-14 md:py-16">
          <h2 className="text-2xl font-bold text-foreground md:text-3xl">Hogyan működik?</h2>
          <ol className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => (
              <li key={step.title} className="rounded-xl border border-border bg-card p-5">
                <h3 className="text-base font-semibold text-card-foreground">{step.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 md:py-16">
        <h2 className="text-2xl font-bold text-foreground md:text-3xl">Kinek készült?</h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {audience.map((item) => (
            <div key={item.title} className="rounded-xl border border-border bg-card p-5">
              <img
                src={item.icon}
                alt=""
                aria-hidden="true"
                loading="lazy"
                width={512}
                height={512}
                className="h-11 w-11"
              />
              <h3 className="mt-4 text-base font-semibold text-card-foreground">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-border bg-brand-dark">
        <div className="mx-auto max-w-6xl px-4 py-12 md:py-14">
          <div className="flex items-start gap-5">
            <img
              src={icAi.url}
              alt=""
              aria-hidden="true"
              loading="lazy"
              width={512}
              height={512}
              className="h-12 w-12 shrink-0 brightness-0 invert"
            />
            <div>
              <h2 className="text-xl font-semibold text-primary-foreground md:text-2xl">
                Folyamatosan fejlesztett szoftver
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-primary-foreground/85">
                A fejlesztéshez AI-eszközöket is használok, így az új funkciók és a szükséges
                módosítások rövidebb idő alatt készülnek el. A számítási logikát és a kimenetet
                minden esetben könyvelői és kontrolling szemmel ellenőrzöm.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-14 md:py-16">
        <h2 className="text-2xl font-bold text-foreground md:text-3xl">
          Gyakran ismételt kérdések
        </h2>
        <dl className="mt-8 divide-y divide-border border-y border-border">
          {faq.map((item) => (
            <div key={item.q} className="py-5">
              <dt className="text-base font-semibold text-foreground">{item.q}</dt>
              <dd className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.a}</dd>
            </div>
          ))}
        </dl>
        <Link
          to="/megrendeles"
          search={{ termek: product.slug }}
          className="mt-10 inline-flex items-center rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-brand-dark"
        >
          Megrendelem
        </Link>
      </section>
    </div>

  );
}
