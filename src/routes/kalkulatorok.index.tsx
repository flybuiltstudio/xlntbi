import { createFileRoute, Link } from "@tanstack/react-router";
import bertesztImg from "@/assets/berteszt.jpg";
import kalkulatorImg from "@/assets/online-kalkulator.jpg";

const TITLE = "Kalkulátorok – bérteszt és adózási forma kalkulátor | EXCELlent";
const DESC =
  "Ingyenes online kalkulátorok: 2026-os bérteszt (bérszámfejtés) és adózási forma összehasonlító jövedelemadó kalkulátor.";

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
    to: "/kalkulatorok/berteszt",
    label: "Bérteszt",
    image: bertesztImg,
    alt: "Bérteszt kalkulátor",
  },
  {
    to: "/kalkulatorok/jovedelemado",
    label: "Jövedelemadó",
    image: kalkulatorImg,
    alt: "Jövedelemadó kalkulátor",
  },
] as const;

function KalkulatorokPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <h1 className="text-3xl font-bold text-foreground md:text-4xl">Elérhető kalkulátorok</h1>
      <div className="mt-10 grid gap-6 sm:grid-cols-2">
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
