import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero } from "@/components/PageHero";
import bertesztImg from "@/assets/berteszt.jpg";
import jovedelemadoImg from "@/assets/kalkulator-jovedelemado.jpg";
import szamlaDatumokImg from "@/assets/kalkulator-szamla-datumok.jpg";
import invoiceDatesImg from "@/assets/kalkulator-invoice-dates.jpg";
import atalanyadoImg from "@/assets/kalkulator-atalanyado.jpg";

const TITLE = "Kalkulátorok – bérteszt és adózási forma kalkulátor | EXCELlent";
const DESC =
  "Ingyenes online kalkulátorok: 2026-os bérteszt (bérszámfejtés), adózási forma összehasonlító jövedelemadó kalkulátor, számla dátumok és átalányadó kalkulátor.";

export const Route = createFileRoute("/kalkulatorok/")({
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
    to: "/kalkulatorok/invoice-dates",
    label: "Invoice Dates (EN)",
    image: invoiceDatesImg,
    alt: "Invoice Dates calculator",
  },
  {
    to: "/kalkulatorok/berteszt",
    label: "Bérteszt",
    image: bertesztImg,
    alt: "Bérteszt kalkulátor",
  },
  {
    to: "/kalkulatorok/jovedelemado",
    label: "Jövedelemadó",
    image: jovedelemadoImg,
    alt: "Jövedelemadó kalkulátor",
  },
  {
    to: "/kalkulatorok/atalanyado",
    label: "Átalányadó",
    image: atalanyadoImg,
    alt: "Átalányadó kalkulátor",
  },
] as const;

function KalkulatorokPage() {
  return (
    <>
      <PageHero>
        <h1 className="text-3xl font-bold text-primary-foreground md:text-4xl">
          Elérhető kalkulátorok
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
  );
}
