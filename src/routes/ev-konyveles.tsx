import { createFileRoute, Link } from "@tanstack/react-router";
import { useLocation } from "@tanstack/react-router";
import { Check, ChevronDown } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { usePageView } from "@/lib/use-page-view";
import heroImage from "@/assets/ev-konyveles-poster.jpg";

const TITLE = "EV Könyvelés – KATA és átalányadózó vállalkozóknak | EXCELlent Business Intelligence";
const DESCRIPTION = "KATA és átalányadózó egyéni vállalkozók könyvelése kedvező díjazással, automatizált folyamatokkal és 20 év szakmai tapasztalattal.";
const CANONICAL = "https://xlntbi.hu/ev-konyveles";
const OG_IMAGE = "https://xlntbi.hu/og/ev-konyveles-poster.jpg";
const EN_URL = "https://xlntbi.hu/se-bookkeeping";

const faqItems = [
  {
    q: "Év közben is válthatok könyvelőt?",
    a: "Igen. Már működő egyéni vállalkozással is lehet csatlakozni. Az átvétel pontos menetét az adott vállalkozás helyzete alapján egyeztetjük. Nem kell izgulnod, hogy mit szól az előző könyvelőd: semmire nincs tőle szükség év közbeni könyvelőváltás esetén sem.",
  },
  {
    q: "Miért ilyen kedvező a könyvelési díj?",
    a: "A rutinszerű adminisztráció jelentős részét automatizált folyamatok támogatják. Ez hatékonyabb munkavégzést tesz lehetővé, miközben a szakmai ellenőrzés és döntéshozatal könyvelői kézben marad.",
  },
  {
    q: "Összetettebb vállalkozást is vállalsz?",
    a: "Igen, egyszerű és összetettebb esetekkel is foglalkozom. Áfakörösség, külföldi kapcsolatok vagy külföldi szolgáltatások – például Google- vagy Facebook-hirdetések – esetén előzetes egyeztetés alapján tudom meghatározni a szükséges feladatokat és a díjazást.",
  },
  {
    q: "Ha még nincs vállalkozásom, tudsz segíteni?",
    a: "Igen, a vállalkozás indításához kapcsolódó főbb lépések és az adózási lehetőségek áttekintésében is tudok segítséget nyújtani.",
  },
] as const;

const scopeItems = [
  "KATA-s egyéni vállalkozók könyvelése",
  "Átalányadózó egyéni vállalkozók könyvelése",
  "Bevallási és kapcsolódó adminisztrációs feladatok",
  "Fontos határidők és kötelezettségek követése",
  "Már működő vállalkozás év közbeni átvétele",
  "Induló egyéni vállalkozások támogatása",
  "Összetettebb helyzetek kezelése – például áfakörösség, külföldi kapcsolatok (pl. Google- vagy Facebook-hirdetések)",
  "Szakmai segítség egyedi kérdések esetén",
];

export const Route = createFileRoute("/ev-konyveles")({
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
    links: [{ rel: "canonical", href: CANONICAL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Service",
          name: "EV Könyvelés – KATA és átalányadózó egyéni vállalkozók könyvelése",
          description: DESCRIPTION,
          serviceType: "Egyéni vállalkozó könyvelés",
          url: CANONICAL,
          areaServed: "HU",
          provider: {
            "@type": "ProfessionalService",
            name: "EXCELlent Business Intelligence",
            url: "https://xlntbi.hu/",
          },
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Főoldal", item: "https://xlntbi.hu/" },
            { "@type": "ListItem", position: 2, name: "Szolgáltatásaim", item: "https://xlntbi.hu/szolgaltatasaim" },
            { "@type": "ListItem", position: 3, name: "EV Könyvelés", item: CANONICAL },
          ],
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqItems.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }),
      },
    ],
  }),
  component: EvKonyvelesPage,
});

function EvKonyvelesPage() {
  const pathname = useLocation({ select: (l) => l.pathname });
  usePageView("service", pathname);
  return (
    <div>
      <PageHero>
        <h1 className="text-3xl font-bold leading-tight text-primary-foreground md:text-4xl">
          KATA és átalányadózó egyéni vállalkozók könyvelése
        </h1>
      </PageHero>

      {/* Intro + image */}
      <section className="mx-auto max-w-6xl px-4 py-14 md:py-16">
        <div className="grid items-start gap-10 md:grid-cols-2">
          <div>
            <p className="text-base leading-relaxed text-muted-foreground">
              20 év szakmai tapasztalat, korszerű automatizálás és személyes szakértelem. Egyszerűbb és
              összetettebb egyéni vállalkozói helyzetekhez is.
            </p>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              Az egyéni vállalkozó könyvelése valójában nem könyvelés, hanem bérszámfejtés. Ezért sok, csak
              cégeket könyvelő szakember nem is ért hozzá.
            </p>
          </div>
          <img
            src={heroImage}
            alt="Egyéni vállalkozó könyvelése – otthoni iroda laptopon, számológéppel"
            loading="lazy"
            className="w-full rounded-xl border border-border object-cover shadow-sm"
          />
        </div>
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-foreground">
            Könyvelés, ami alkalmazkodik a vállalkozásodhoz
          </h2>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground">
            Egy egyéni vállalkozás könyvelése lehet egyszerű, de egy külföldi partner, egy külföldi
            szolgáltatótól – például a Google-től vagy a Facebooktól – igénybe vett hirdetés, az
            áfakörösség vagy más speciális ügylet gyorsan több szakértelmet igényelhet. A célom, hogy
            akkor is biztos szakmai hátteret kapj, ha a vállalkozásod túlmutat a legegyszerűbb eseteken.
          </p>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground">
            Több mint 20 év könyvelési tapasztalatomat ötvözöm olyan automatizált megoldásokkal, amelyek
            jelentősen csökkentik a rutinszerű adminisztrációt. Így több szakmai figyelmet fordíthatok
            arra, ahol valóban szükség van rá, miközben a szolgáltatás díja kedvező marad.
          </p>
          <Link
            to="/konzultacio"
            className="mt-8 inline-flex items-center rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-brand-dark"
          >
            Konzultációt kérek
          </Link>
        </div>
      </section>

      {/* Árazás */}
      <section className="border-t border-border bg-secondary/60">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="text-2xl font-bold text-foreground">Kedvező ár – az automatizálás előnyével</h2>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground">
            Az alacsonyabb könyvelési díj mögött nem kevesebb szakmai munka áll. A rutinfeladatok jelentős
            részét automatizált folyamatok támogatják, ezért a könyvelés gyorsabban és hatékonyabban
            végezhető. A szakmai döntések, az ellenőrzés és az összetettebb kérdések kezelése továbbra is
            az én feladatom.
          </p>
          <div className="mt-8 overflow-hidden rounded-xl border border-border bg-card">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th scope="col" className="px-5 py-3 font-semibold text-foreground">Szolgáltatás</th>
                  <th scope="col" className="px-5 py-3 font-semibold text-foreground">Díj</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border">
                  <td className="px-5 py-4 font-medium text-card-foreground">KATA könyvelés</td>
                  <td className="px-5 py-4 text-card-foreground">10 ezer Ft / hó</td>
                </tr>
                <tr>
                  <td className="px-5 py-4 font-medium text-card-foreground">
                    Átalányadózó egyéni vállalkozó könyvelése
                  </td>
                  <td className="px-5 py-4 text-card-foreground">
                    50 ezer Ft / negyedévtől
                    <span className="block text-xs text-muted-foreground">(kevesebb mint havi 17 ezer Ft)</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
             Az átalányadós díj a vállalkozás összetettségétől függően változhat.
          </p>
        </div>
      </section>

      {/* Nem csak a legegyszerűbb esetekre */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-2xl font-bold text-foreground">Nem csak a legegyszerűbb esetekre</h2>
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground">
          A kedvező díjazás nem jelenti azt, hogy csak egyszerű vállalkozásokat tudok kezelni. A rutin
          KATA- és átalányadós könyvelés mellett összetettebb helyzetekben is tudok segítséget nyújtani,
          például áfakörös egyéni vállalkozásoknál, külföldi kapcsolatok vagy külföldi szolgáltatások
          igénybevétele esetén. Ilyen hétköznapi példa lehet akár egy Google- vagy Facebook-hirdetés is,
          amelynek könyvelése és adózási kezelése külön figyelmet igényelhet.
        </p>
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground">
          Ha nem vagy biztos abban, hogy a vállalkozásod belefér-e az alap könyvelési szolgáltatásba, egy
          rövid egyeztetés során áttekintem a helyzetedet.
        </p>
      </section>

      {/* Váltás + indulás + évzárás */}
      <section className="border-t border-border bg-secondary/60">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <div className="grid gap-10 md:grid-cols-3">
            <div>
              <h2 className="text-xl font-bold text-foreground">Év közben is válthatsz</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Nem szükséges megvárnod az év végét ahhoz, hogy könyvelőt válts. Már működő egyéni
                vállalkozással is csatlakozhatsz bármikor év közben, a szükséges átállási lépéseket pedig
                előzetesen egyeztetem veled. Korábbi könyvelődtől semmire nincs szükség, így nem kell
                félned attól, hogy valamit nem ad át. Biztos lehetsz benne, hogy problémamentes és
                gördülékeny lesz a váltás.
              </p>
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Most indítanád az egyéni vállalkozásodat?</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Ha még nincs vállalkozásod, az indulásban is tudok segíteni. Átbeszéljük a kiinduló
                helyzetedet, az adózási lehetőségeket és az induláshoz szükséges főbb lépéseket, hogy már
                az elején megfelelő alapokra építhess.
              </p>
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Évzárás</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Természetesen az évzárásodat is elkészítem. Ez egyéni vállalkozóként a HIPA (iparűzési
                adó) és az SZJA bevallásod elkészítését jelenti. Ennek díja a nálad érvényes +1 havi
                könyvelési díj.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Miben számíthatsz rám */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-2xl font-bold text-foreground">Miben számíthatsz rám?</h2>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {scopeItems.map((item) => (
            <li
              key={item}
              className="flex items-start gap-3 rounded-lg border border-border bg-card p-4 text-sm font-medium text-card-foreground"
            >
              <Check className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>
      </section>

      {/* Záró gondolat */}
      <section className="border-t border-border bg-secondary/60">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="text-2xl font-bold text-foreground">
            20 év tapasztalat. Kevesebb rutinmunka. Több szakmai figyelem.
          </h2>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground">
            Az automatizálás nálam nem a könyvelő helyettesítését jelenti. Arra használom, amire való: a
            repetitív feladatok gyorsítására és az adminisztráció csökkentésére. A tapasztalatot, az
            ellenőrzést és a szakmai döntést továbbra is ember adja hozzá.
          </p>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground">
            Ha KATA-s vagy átalányadózó egyéni vállalkozóként megbízható, korszerű és kedvező árú
            könyvelést keresel, vedd fel velem a kapcsolatot, és megnézzük, milyen megoldás illik a
            vállalkozásodhoz.
          </p>
          <Link
            to="/konzultacio"
            className="mt-8 inline-flex items-center rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-brand-dark"
          >
            Konzultációt kérek
          </Link>
        </div>
      </section>

      {/* GYIK */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-2xl font-bold text-foreground">Gyakori kérdések</h2>
        <div className="mt-8 space-y-3">
          {faqItems.map((f) => (
            <details
              key={f.q}
              className="group rounded-xl border border-border bg-card p-5 [&_summary]:list-none"
            >
              <summary className="flex cursor-pointer items-center justify-between gap-4 text-sm font-semibold text-card-foreground">
                {f.q}
                <ChevronDown
                  className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180"
                  aria-hidden="true"
                />
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
