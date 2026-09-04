import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { HeroPlanks } from "@/components/HeroPlanks";
import { buildHead } from "@/lib/i18n/head";
import aboutImgAsset from "@/assets/En-modern-konyveloirodaban.jpg.asset.json";
import icHatekonysag from "@/assets/icons/hatekonysag.png.asset.json";
import icInnovacio from "@/assets/icons/innovacio.png.asset.json";
import icKomplexitas from "@/assets/icons/komplexitas.png.asset.json";
import icPontossag from "@/assets/icons/pontossag.png.asset.json";
import icAi from "@/assets/icons/ai.png.asset.json";
import aiIllustration from "@/assets/icons/ai-illustration.jpg.asset.json";

const aboutImg = aboutImgAsset.url;

const TITLE = "Bookkeeping, controlling and financial BI consulting | EXCELlent Business Intelligence";
const DESCRIPTION =
  "Bookkeeping, tax advisory, controlling and fintech BI solutions in one place. Digital tools and expert consulting for businesses.";
const OG_IMAGE = "https://xlntbi.hu/og/En-modern-konyveloirodaban.jpg";

export const Route = createFileRoute("/en/")({
  head: () =>
    buildHead({
      huPath: "/",
      lang: "en",
      title: TITLE,
      description: DESCRIPTION,
      ogImage: OG_IMAGE,
      jsonLd: [
        {
          "@context": "https://schema.org",
          "@type": "ProfessionalService",
          name: "EXCELlent Business Intelligence",
          legalName: "Sarinay Dávid",
          description:
            "Bookkeeping, tax advisory, controlling, statutory audit and financial BI consulting for businesses.",
          url: "https://xlntbi.hu/en",
          telephone: "+36209622176",
          email: "info@xlntbi.hu",
          image: OG_IMAGE,
          areaServed: "HU",
          priceRange: "$$",
          address: {
            "@type": "PostalAddress",
            streetAddress: "Péterfy Sándor u. 9.",
            postalCode: "1076",
            addressLocality: "Budapest",
            addressCountry: "HU",
          },
        },
      ],
    }),
  component: EnglishHome,
});

const pillars = [
  {
    title: "Efficiency",
    icon: icHatekonysag.url,
    text: "Modern digitalisation and automation solutions combined with bookkeeping and controlling expertise, including complex macros.",
  },
  {
    title: "Innovation",
    icon: icInnovacio.url,
    text: "I help entrepreneurs, accountants and companies who want faster, more transparent and more reliable operations with modern digitalisation and automation – using Excel, Power BI, AI and other up-to-date technologies.",
  },
  {
    title: "Complexity",
    icon: icKomplexitas.url,
    text: "Bookkeeping, tax advisory, statutory audit, BI, controlling, calculators and my own digital solutions in one place.",
  },
  {
    title: "Accuracy",
    icon: icPontossag.url,
    text: "If professional accuracy, digital operations and genuinely usable solutions matter to you, you are in the right place.",
  },
];

const aiPoints = [
  {
    title: "Faster development",
    text: "I also use AI-based developer tools when building my own tools and downloaders, so new versions are ready in less time.",
  },
  {
    title: "Continuous updates",
    text: "This way I can implement changes in legislation and in the NAV (Hungarian tax authority) systems sooner, and existing users also receive the newer version.",
  },
  {
    title: "Professional control stays",
    text: "AI is a tool, not a decision-maker: I review every calculation and report with an accountant's and controller's eye before release.",
  },
];

function EnglishHome() {
  return (
    <div>
      <section className="relative isolate overflow-hidden bg-brand-dark">
        <HeroPlanks />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-dark/90 via-brand-dark/75 to-brand-dark/40" />
        <div className="relative mx-auto max-w-6xl px-4 py-6 md:py-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-foreground/80">
            EXCELLENT BUSINESS INTELLIGENCE
          </p>
          <h1 className="mt-4 text-[clamp(1.5rem,3.6vw,2.6rem)] font-bold leading-tight text-primary-foreground">
            <span>
              Bookkeeping, tax advisory, controlling
              <br />
              Audits &amp; fintech and BI consulting
            </span>
          </h1>
          <p className="mt-3 font-serif text-xl italic text-primary-foreground/85 md:text-2xl">
            Perfect Solutions. Automated FUTURE.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              to="/en/services"
              className="inline-flex items-center rounded-md bg-primary-foreground px-6 py-3 text-sm font-semibold text-brand-dark transition-opacity hover:opacity-90"
            >
              Services
            </Link>
            <Link
              to="/en/products"
              className="inline-flex items-center rounded-md bg-primary-foreground px-6 py-3 text-sm font-semibold text-brand-dark transition-opacity hover:opacity-90"
            >
              Products
            </Link>
            <Link
              to="/en/contact"
              className="inline-flex items-center rounded-md border border-primary-foreground/60 px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-foreground/10"
            >
              Contact
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8 md:py-10">
        <div className="grid items-start gap-10 md:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold leading-snug text-foreground md:text-3xl">
              Order in your processes,
              <br className="hidden sm:block" /> growth in your business
            </h2>
            <Link
              to="/en/about"
              className="mt-7 inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-brand-dark"
            >
              About me
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          <img
            src={aboutImg}
            alt="Dávid Sarinay in a modern accounting office"
            loading="lazy"
            className="w-full rounded-xl border border-border object-cover shadow-sm"
          />
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2">
          {pillars.map((p) => (
            <div key={p.title} className="rounded-xl border border-border bg-card p-6">
              <img
                src={p.icon}
                alt=""
                aria-hidden="true"
                loading="lazy"
                width={512}
                height={512}
                className="h-12 w-12"
              />
              <h3 className="mt-4 text-lg font-semibold text-card-foreground">{p.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{p.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-border bg-brand-dark">
        <div className="mx-auto max-w-6xl px-4 py-16 md:py-20">
          <div className="grid items-center gap-10 lg:grid-cols-[1fr_1fr]">
            <div>
              <img
                src={icAi.url}
                alt=""
                aria-hidden="true"
                loading="lazy"
                width={512}
                height={512}
                className="h-14 w-14 brightness-0 invert"
              />
              <h2 className="mt-5 text-2xl font-bold text-primary-foreground md:text-3xl">
                AI-accelerated development, with an accountant's control
              </h2>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-primary-foreground/85">
                I also use AI tools to develop my software and processes. This means new versions
                appear faster and changes are implemented sooner – but professional review always
                stays in human hands.
              </p>
              <Link
                to="/en/products"
                className="mt-8 inline-flex items-center gap-2 rounded-md bg-primary-foreground px-6 py-3 text-sm font-semibold text-brand-dark transition-opacity hover:opacity-90"
              >
                View the products
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
            <img
              src={aiIllustration.url}
              alt="Abstract illustration of the AI-based development process"
              loading="lazy"
              width={1536}
              height={1024}
              className="w-full rounded-xl border border-primary-foreground/15 object-cover"
            />
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {aiPoints.map((point) => (
              <div
                key={point.title}
                className="rounded-xl border border-primary-foreground/15 bg-primary-foreground/5 p-6"
              >
                <h3 className="text-base font-semibold text-primary-foreground">{point.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-primary-foreground/80">
                  {point.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
