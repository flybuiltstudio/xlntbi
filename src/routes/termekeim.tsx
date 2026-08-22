import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import kalkulatorImg from "@/assets/online-kalkulator.jpg";
import termekekImg from "@/assets/termekek.jpg";
import { priceFrom, formatPrice, products } from "@/lib/products";
import heroVideo from "@/assets/termekek-hero.mp4.asset.json";



const TITLE = "Termékeim könyvelőirodáknak és könyvelőknek | EXCELlent";
const DESC =
  "Saját fejlesztésű digitális termékek: átalányadó kalkulátorok, beszámolókészítő megoldások, Excel és Google Sheets eszközök.";

export const Route = createFileRoute("/termekeim")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TermekeimPage,
});

const features = [
  "Átalányadó kalkulátorokat",
  "Beszámolókészítő digitális megoldásokat, akár komplex makrókkal is",
  "Adókalkulációs segédprogramokat",
  "Iparűzési adóhoz kapcsolódó eszközöket",
  "Google Sheets és Excel verziókat",
  "Letölthető, azonnal használható termékeket",
];

function TermekeimPage() {
  return (
    <div>
      <section className="border-b border-border bg-secondary/60">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-2 md:py-20">
          <div>
            <h1 className="text-3xl font-bold leading-tight text-foreground md:text-4xl">
              Termékeim könyvelőirodáknak és könyvelőknek
            </h1>
            <p className="mt-5 text-base leading-relaxed text-muted-foreground">
              Ezen az oldalon saját fejlesztésű, gyakorlatban is használható termékeimet találod.
              Ezek könyvelőknek, könyvelőirodáknak, adózási szakembereknek és pénzügyi csapatoknak
              készültek.
            </p>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              A termékek egy része modern digitalizációs és automatizációs megoldás, más részük
              online kalkulátor vagy digitális segédprogram, akár komplex makrókkal is. Közös bennük,
              hogy valós szakmai problémára adnak gyors, használható megoldást.
            </p>

            <div className="mt-8">
              <h2 className="text-xl font-bold text-foreground">Mit találsz itt?</h2>
              <ul className="mt-4 space-y-3">
                {features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm font-medium text-foreground">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8">
              <h2 className="text-xl font-bold text-foreground">Miért jók ezek?</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Mert időt spórolnak, csökkentik a hibákat, és gyorsabban juttatnak el a végső
                eredményhez.
              </p>
            </div>

            <Link
              to="/termekeim"
              hash="megrendelheto-termekek"
              className="mt-8 inline-flex items-center rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-brand-dark"
            >
              Termékek megtekintése
            </Link>
          </div>
          <video
            src={heroVideo.url}
            poster={kalkulatorImg}
            autoPlay
            muted
            loop
            playsInline
            aria-label="Digitális termékek – hangulatvideó"
            className="w-full rounded-xl border border-border object-cover shadow-sm"
          />

        </div>
      </section>

      <section id="megrendelheto-termekek" className="mx-auto max-w-6xl px-4 py-16">

        <h2 className="text-2xl font-bold text-foreground">Megrendelhető termékek</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {products.map((product) => (
            <article
              key={product.slug}
              className="flex flex-col overflow-hidden rounded-xl border border-border bg-card"
            >
              <img
                src={product.image}
                alt={`${product.name} – illusztráció`}
                loading="lazy"
                className="h-48 w-full object-cover"
              />
              <div className="flex flex-1 flex-col p-6">
                <h3 className="text-lg font-semibold text-foreground">{product.name}</h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {product.intro[0]}
                </p>
                <p className="mt-4 text-xl font-bold text-foreground">
                  {product.tiers.length > 1
                    ? `${formatPrice(priceFrom(product))}-tól`
                    : formatPrice(product.price)}
                </p>
                {product.status === "coming_soon" ? (
                  <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Hamarosan
                  </p>
                ) : null}
                <div className="mt-5 flex flex-wrap gap-3">
                  <Link
                    to="/termek/$slug"
                    params={{ slug: product.slug }}
                    className="inline-flex items-center rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-brand-dark"
                  >
                    Részletek
                  </Link>
                  {product.status === "available" ? (
                    <Link
                      to="/megrendeles"
                      search={{ termek: product.slug }}
                      className="inline-flex items-center rounded-md border border-input px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-accent"
                    >
                      Megrendelem
                    </Link>
                  ) : null}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>



      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Mit találsz itt?</h2>
            <ul className="mt-8 space-y-3">
              {features.map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm font-medium text-foreground">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  {f}
                </li>
              ))}
            </ul>
            <Link
              to="/kapcsolat"
              className="mt-8 inline-flex items-center rounded-md border border-input px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-accent"
            >
              Termékek megtekintése
            </Link>
          </div>
          <img
            src={termekekImg}
            alt="Digitális termékek könyvelőknek"
            loading="lazy"
            className="w-full rounded-xl border border-border object-cover shadow-sm"
          />
        </div>
      </section>

      <section className="border-t border-border bg-secondary/60">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="text-2xl font-bold text-foreground">Miért jók ezek?</h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
            Mert időt spórolnak, csökkentik a hibákat, és gyorsabban juttatnak el a végső
            eredményhez.
          </p>
          <Link
            to="/kapcsolat"
            className="mt-8 inline-flex items-center rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-brand-dark"
          >
            Kapcsolat
          </Link>
        </div>
      </section>
    </div>
  );
}
