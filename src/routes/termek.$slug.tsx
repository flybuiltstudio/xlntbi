import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { formatPrice, getProduct, products } from "@/lib/products";
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
    return {
      meta: [
        { title: product.metaTitle },
        { name: "description", content: product.metaDescription },
        { property: "og:title", content: product.metaTitle },
        { property: "og:description", content: product.metaDescription },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
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
    brand: { "@type": "Brand", name: "EXCELlent Accounting & Consulting" },
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: product.currency,
      availability: "https://schema.org/InStock",
      url: `https://xlntbi.hu/termek/${product.slug}`,
    },
  };

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

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
            <p className="mt-6 text-3xl font-bold text-foreground">{formatPrice(product.price)}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Az ár bruttó ár. Digitális termék, letöltéssel teljesítjük.
            </p>
            <Link
              to="/megrendeles"
              search={{ termek: product.slug }}
              className="mt-6 inline-flex w-full items-center justify-center rounded-md bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-brand-dark"
            >
              Megrendelem
            </Link>
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
    </div>
  );
}
