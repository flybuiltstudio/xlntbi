import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero } from "@/components/PageHero";
import bertesztImg from "@/assets/berteszt.jpg";
import jovedelemadoImg from "@/assets/kalkulator-jovedelemado.jpg";
import szamlaDatumokImg from "@/assets/kalkulator-szamla-datumok.jpg";
import invoiceDatesImg from "@/assets/kalkulator-invoice-dates.jpg";
import atalanyadoImg from "@/assets/kalkulator-atalanyado.jpg";


const TITLE = "Kalkulátorok: adó, bér és számla dátum számítás | EXCELlent Business Intelligence";
const DESCRIPTION = "Ingyenes online kalkulátorok vállalkozóknak: jövedelemadó, átalányadó, béradók és számla határidők gyors kiszámítása.";
const CANONICAL = "https://xlntbi.hu/kalkulatorok";
const OG_IMAGE = "https://xlntbi.hu/og/online-kalkulator.jpg";

export const Route = createFileRoute("/kalkulatorok/")({
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
      { rel: "alternate", hrefLang: "hu", href: "https://xlntbi.hu/kalkulatorok" },
      { rel: "alternate", hrefLang: "en", href: "https://xlntbi.hu/en/calculators" },
      { rel: "alternate", hrefLang: "x-default", href: "https://xlntbi.hu/kalkulatorok" },
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
                      }
              ]
      }),
      },
    ],
  }),
  component: KalkulatorokPage,
});

const items = [
  {
    to: "/kalkulatorok/szamla-datumok",
    label: "Számla dátumok",
    image: szamlaDatumokImg,
    alt: "Számla dátumok kalkulátor",
  },
  {
    to: "/kalkulatorok/berteszt",
    label: "Bérteszt",
    image: bertesztImg,
    alt: "Bérteszt kalkulátor",
  },
  {
    to: "/kalkulatorok/atalanyado",
    label: "Átalányadó",
    image: atalanyadoImg,
    alt: "Átalányadó kalkulátor",
  },
  {
    to: "/kalkulatorok/jovedelemado",
    label: "Jövedelemadó",
    image: jovedelemadoImg,
    alt: "Jövedelemadó kalkulátor",
  },
] as const;

function KalkulatorokPage() {
  return (
    <>
      <PageHero>
        <h1 className="text-3xl font-bold text-primary-foreground md:text-4xl">
          Kalkulátorok
        </h1>
      </PageHero>

      <div className="mx-auto max-w-6xl px-4 py-14 md:py-16">
        <div className="mt-2 grid gap-6 sm:grid-cols-2">
        {items.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="group overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-primary"
          >
            <img
              src={item.image}
              alt={item.alt}
              loading="lazy"
              className="h-56 w-full object-cover"
            />
            <h2 className="p-6 text-xl font-semibold text-card-foreground">{item.label}</h2>
          </Link>
        ))}
        </div>
      </div>
    </>
  );
}
