import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, FileText } from "lucide-react";
import portraitImgAsset from "@/assets/En-modern-konyveloirodaban.jpg.asset.json";
import { PageHero } from "@/components/PageHero";
import { buildHead } from "@/lib/i18n/head";

const portraitImg = portraitImgAsset.url;

const TITLE = "About me: finance and BI expert | EXCELlent Business Intelligence";
const DESCRIPTION =
  "Get to know my professional background: bookkeeping, controlling, tax advisory and fintech BI experience at the service of businesses.";
const OG_IMAGE = "https://xlntbi.hu/og/En-modern-konyveloirodaban.jpg";

export const Route = createFileRoute("/en/about")({
  head: () =>
    buildHead({
      huPath: "/rolam",
      lang: "en",
      title: TITLE,
      description: DESCRIPTION,
      ogImage: OG_IMAGE,
    }),
  component: EnglishAbout,
});

const values = [
  "Accuracy",
  "Premium professional quality",
  "Automation",
  "Practical thinking",
  "Transparent operations",
  "Measurable business results",
];

const certificates = [
  { href: "/dokumentumok/Power-BI.pdf", label: "Power BI" },
  { href: "/dokumentumok/SD-MINKE-tanusitvany.pdf", label: "MINKE" },
];

function EnglishAbout() {
  return (
    <div>
      <PageHero>
        <h1 className="text-3xl font-bold leading-tight text-primary-foreground md:text-4xl">
          About me
        </h1>
      </PageHero>

      <section className="mx-auto max-w-6xl px-4 py-14 md:py-16">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div>
            <p className="text-base leading-relaxed text-muted-foreground">
              My name is Dávid Sarinay, a finance, accounting, tax and controlling professional. My
              work centres on professional excellence, automation and genuinely usable solutions.
            </p>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              I have more than 20 years of professional experience, including more than 10 years in
              management and as head of an accounting firm. During my career I have worked in
              statutory audit, day-to-day bookkeeping, corporate finance, accounting firm
              management, fintech and automation consulting, as well as in controlling and ERP.
            </p>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              One of my strongest professional traits is that I combine classic financial and tax
              knowledge with modern technology. My key areas are Excel, VBA, complex macros, Power
              BI, data modelling, report automation, AI-based workflows and the development of
              decision-support systems.
            </p>
          </div>
          <img
            src={portraitImg}
            alt="Dávid Sarinay in a modern accounting office"
            loading="lazy"
            className="w-full rounded-xl border border-border object-cover shadow-sm"
          />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-2xl font-bold text-foreground">What is my goal?</h2>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
          To make financial processes smarter rather than more complicated. I believe that when the
          data is good, the decision will be better too.
        </p>
        <Link
          to="/en/services"
          className="mt-8 inline-flex items-center rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-brand-dark"
        >
          Services
        </Link>
      </section>

      <section className="border-t border-border bg-secondary/60">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="text-2xl font-bold text-foreground">What I stand for</h2>
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
            to="/en/contact"
            className="mt-8 inline-flex items-center rounded-md border border-input px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-accent"
          >
            Contact
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-2xl font-bold text-foreground">My certificates</h2>
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
