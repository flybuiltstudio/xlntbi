import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, FileText } from "lucide-react";
import portraitImg from "@/assets/En-modern-konyveloirodaban.jpg";
import { PageHero } from "@/components/PageHero";

const TITLE = "Rólam – Sarinay Dávid, pénzügyi és kontroller szakember | EXCELlent";
const DESC =
  "Sarinay Dávid vagyok: pénzügyi, számviteli, adó- és kontroller szakember, több mint 20 év szakmai tapasztalattal.";

export const Route = createFileRoute("/rolam")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RolamPage,
});

const values = [
  "Pontosság",
  "Prémium szakmai minőség",
  "Automatizálás",
  "Gyakorlatias gondolkodás",
  "Átlátható működés",
  "Mérhető üzleti eredmények",
];

const certificates = [
  { href: "/dokumentumok/Power-BI.pdf", label: "Power BI" },
  { href: "/dokumentumok/SD-MINKE-tanusitvany.pdf", label: "MINKE" },
];

function RolamPage() {
  return (
    <div>
      <PageHero>
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div>
            <h1 className="text-3xl font-bold leading-tight text-primary-foreground md:text-4xl">
              Sarinay Dávid vagyok,
            </h1>
            <p className="mt-5 text-base leading-relaxed text-primary-foreground/80">
              pénzügyi, számviteli, adó- és kontroller szakember. A munkám középpontjában a szakmai
              kiválóság, az automatizálás és a valóban használható megoldások állnak.
            </p>
            <p className="mt-4 text-base leading-relaxed text-primary-foreground/80">
              Több mint 20 év szakmai tapasztalattal dolgozom, ebből több mint 10 év vezetői és
              könyvelőiroda-vezetői múlttal. Pályafutásom során dolgoztam könyvvizsgálatban,
              operatív könyvelésben, nagyvállalati pénzügyben, könyvelőirodai vezetésben, FinTech és
              automatizációs tanácsadásban, valamint kontrolling és ERP területen is.
            </p>
            <p className="mt-4 text-base leading-relaxed text-primary-foreground/80">
              Az egyik legerősebb szakmai sajátosságom, hogy a klasszikus pénzügyi és adózási tudást
              modern technológiákkal kapcsolom össze. Kiemelt területeim az Excel, a VBA, a komplex
              makrók, a Power BI, az adatmodellezés, a riportautomatizálás, az AI-alapú
              munkafolyamatok és a döntéstámogató rendszerek fejlesztése.
            </p>
          </div>
          <img
            src={portraitImg}
            alt="Sarinay Dávid modern könyvelőirodában"
            loading="lazy"
            className="w-full rounded-xl border border-primary-foreground/15 object-cover shadow-sm"
          />
        </div>
      </PageHero>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-2xl font-bold text-foreground">Mi a célom?</h2>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
          Az, hogy a pénzügyi folyamatok ne bonyolultabbak legyenek, hanem okosabbak. Hiszek abban,
          hogy ha az adat jó, a döntés is jobb lesz.
        </p>
        <Link
          to="/szolgaltatasaim"
          className="mt-8 inline-flex items-center rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-brand-dark"
        >
          Szolgáltatásaim
        </Link>
      </section>

      <section className="border-t border-border bg-secondary/60">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="text-2xl font-bold text-foreground">Amit képviselek</h2>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {values.map((v) => (
              <li
                key={v}
                className="flex items-start gap-3 rounded-lg border border-border bg-card p-4 text-sm font-medium text-card-foreground"
              >
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                {v}
              </li>
            ))}
          </ul>
          <Link
            to="/kapcsolat"
            className="mt-8 inline-flex items-center rounded-md border border-input px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-accent"
          >
            Kapcsolat
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-2xl font-bold text-foreground">Tanúsítványaim</h2>
        <ul className="mt-8 flex flex-wrap gap-4">
          {certificates.map((c) => (
            <li key={c.href}>
              <a
                href={c.href}
                target="_blank"
                rel="noopener"
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-5 py-3 text-sm font-semibold text-card-foreground transition-colors hover:border-primary"
              >
                <FileText className="h-4 w-4 text-primary" aria-hidden="true" />
                {c.label}
              </a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
