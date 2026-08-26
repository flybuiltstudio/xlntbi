import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { HeroPlanks } from "@/components/HeroPlanks";
import aboutImg from "@/assets/En-modern-konyveloirodaban.jpg";
import icHatekonysag from "@/assets/icons/hatekonysag.png.asset.json";
import icInnovacio from "@/assets/icons/innovacio.png.asset.json";
import icKomplexitas from "@/assets/icons/komplexitas.png.asset.json";
import icPontossag from "@/assets/icons/pontossag.png.asset.json";
import icAi from "@/assets/icons/ai.png.asset.json";
import aiIllustration from "@/assets/icons/ai-illustration.jpg.asset.json";


const TITLE = "Könyvelés, kontrolling és pénzügyi BI tanácsadás | EXCELlent Business Intelligence";
const DESCRIPTION = "Könyvelés, adótanácsadás, kontrolling és fintech BI megoldások egy helyen. Digitális eszközök és szakértői tanácsadás vállalkozásoknak.";
const CANONICAL = "https://xlntbi.hu/";
const OG_IMAGE = "https://xlntbi.hu/og/En-modern-konyveloirodaban.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: CANONICAL },
      { property: "og:image", content: OG_IMAGE },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
      { name: "twitter:image", content: OG_IMAGE },
    ],
    links: [
      { rel: "canonical", href: CANONICAL },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ProfessionalService",
              "name": "EXCELlent Business Intelligence",
              "legalName": "Sarinay Dávid",
              "description": "Könyvelés, adótanácsadás, kontrolling, könyvvizsgálat és pénzügyi BI tanácsadás vállalkozásoknak.",
              "url": "https://xlntbi.hu/",
              "telephone": "+36209622176",
              "email": "info@xlntbi.hu",
              "image": "https://xlntbi.hu/og/En-modern-konyveloirodaban.jpg",
              "areaServed": "HU",
              "priceRange": "$$",
              "address": {
                      "@type": "PostalAddress",
                      "streetAddress": "Péterfy Sándor u. 9.",
                      "postalCode": "1076",
                      "addressLocality": "Budapest",
                      "addressCountry": "HU"
              }
      }),
      },
    ],
  }),
  component: Index,
});

const pillars = [
  {
    title: "Hatékonyság",
    icon: icHatekonysag.url,
    text: "Modern digitalizációs és automatizációs megoldások könyvelési és kontrolling szakértelemmel, akár komplex makrókkal is.",
  },
  {
    title: "Innováció",
    icon: icInnovacio.url,
    text: "Olyan vállalkozásoknak, könyvelőknek és cégeknek segítek, akik gyorsabb, átláthatóbb és megbízhatóbb működést akarnak modern digitalizációs és automatizációs megoldásokkal, Excel, Power BI, AI és más korszerű technológiák használatával.",
  },
  {
    title: "Komplexitás",
    icon: icKomplexitas.url,
    text: "Könyvelés, adótanácsadás, könyvvizsgálat, BI, kontrolling, kalkulátorok és saját fejlesztésű digitális megoldások egy helyen.",
  },
  {
    title: "Pontosság",
    icon: icPontossag.url,
    text: "Ha fontos neked a szakmai pontosság, a digitális működés és a valóban használható megoldás, jó helyen jársz.",
  },
];

const aiPoints = [
  {
    title: "Gyorsabb fejlesztés",
    text: "A saját eszközeim és letöltőim fejlesztésénél AI-alapú fejlesztői eszközöket is használok, így rövidebb idő alatt készülnek el az új verziók.",
  },
  {
    title: "Folyamatos frissítés",
    text: "A jogszabályi és NAV-oldali változásokat így hamarabb tudom átvezetni a termékeken, és a meglévő felhasználók is megkapják a frissebb verziót.",
  },
  {
    title: "Szakmai kontroll marad",
    text: "Az AI eszköz, nem döntéshozó: minden számítást és riportot könyvelői és kontrolling szemmel ellenőrzök, mielőtt kiadásra kerül.",
  },
];


function Index() {
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
            <span className="sm:whitespace-nowrap">Könyvelés, adótanácsadás, auditok & BI automatizáció</span>
          </h1>
          <p className="mt-3 font-serif text-xl italic text-primary-foreground/85 md:text-2xl">
            Perfect Solutions. Automated FUTURE.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              to="/szolgaltatasaim"
              className="inline-flex items-center rounded-md bg-primary-foreground px-6 py-3 text-sm font-semibold text-brand-dark transition-opacity hover:opacity-90"
            >
              Szolgáltatásaim
            </Link>
            <Link
              to="/termekeim"
              className="inline-flex items-center rounded-md bg-primary-foreground px-6 py-3 text-sm font-semibold text-brand-dark transition-opacity hover:opacity-90"
            >
              Termékeim
            </Link>
            <Link
              to="/kapcsolat"
              className="inline-flex items-center rounded-md border border-primary-foreground/60 px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-foreground/10"
            >
              Kapcsolat
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8 md:py-10">
        <div className="grid items-start gap-10 md:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold leading-snug text-foreground md:text-3xl">
              Rend a folyamataidban,
              <br className="hidden sm:block" /> növekedés a vállalkozásodban
            </h2>
            <Link
              to="/rolam"
              className="mt-7 inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-brand-dark"
            >
              Rólam
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          <img
            src={aboutImg}
            alt="Sarinay Dávid modern könyvelőirodában"
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
                AI-val gyorsított fejlesztés, könyvelői kontrollal
              </h2>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-primary-foreground/85">
                A szoftvereim és folyamataim fejlesztéséhez AI-eszközöket is használok. Ez azt
                jelenti, hogy gyorsabban jelennek meg az új verziók, és a változásokat hamarabb
                tudom átvezetni – a szakmai ellenőrzés viszont mindig emberi kézben marad.
              </p>
              <Link
                to="/termekeim"
                className="mt-8 inline-flex items-center gap-2 rounded-md bg-primary-foreground px-6 py-3 text-sm font-semibold text-brand-dark transition-opacity hover:opacity-90"
              >
                Termékek megtekintése
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
            <img
              src={aiIllustration.url}
              alt="Absztrakt ábra az AI-alapú fejlesztési folyamatról"
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
