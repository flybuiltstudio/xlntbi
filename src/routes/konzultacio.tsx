import { createFileRoute } from "@tanstack/react-router";
import { ContactForm } from "@/components/ContactForm";
import { PageHero } from "@/components/PageHero";


const TITLE = "Ingyenes konzultáció foglalása | EXCELlent Business Intelligence";
const DESCRIPTION = "Foglalj időpontot egy díjmentes konzultációra, és beszéljük át, hogyan segíthetek könyvelésben, kontrollingban vagy adózásban.";
const CANONICAL = "https://xlntbi.hu/konzultacio";
const OG_IMAGE = "https://xlntbi.hu/og/kapcsolat-business.jpg";

export const Route = createFileRoute("/konzultacio")({
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
      { rel: "alternate", hrefLang: "hu", href: "https://xlntbi.hu/konzultacio" },
      { rel: "alternate", hrefLang: "en", href: "https://xlntbi.hu/en/consultation" },
      { rel: "alternate", hrefLang: "x-default", href: "https://xlntbi.hu/konzultacio" },
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
                              "name": "Konzultáció",
                              "item": "https://xlntbi.hu/konzultacio"
                      }
              ]
      }),
      },
    ],
  }),
  component: KonzultacioPage,
});

const SERVICES = [
  "Könyvelés",
  "EV Könyvelés",
  "Adótanács",
  "Fintech és BI",
  "Kontrolling",
  "Cégaudit",
  "Könyvvizsgálat",
  "Könyvelőiroda audit",
  "Digitális időmegtakarítási audit",
  "Egyedi fejlesztés",
  "Oktatás",
  "Egyéb",
];

const CONTACT_METHODS = ["E-mailben", "Telefonon", "Mindegy"];

const CONTACT_TIMES = [
  "Hétköznap délelőtt (8:00–12:00)",
  "Hétköznap délután (12:00–17:00)",
  "Este 17:00 után",
  "Hétvégén",
  "Bármikor",
];

function KonzultacioPage() {
  return (
    <>
      <PageHero>
        <h1 className="text-3xl font-bold text-primary-foreground md:text-4xl">Konzultáció</h1>
      </PageHero>

      <div className="mx-auto max-w-4xl px-4 py-14 md:py-16">
        <p className="text-base leading-relaxed text-muted-foreground">
          Töltsd ki az alábbi űrlapot, és jelezd, milyen témában szeretnél konzultálni.
          <br />
          Megírom, hogyan tudunk a leggyorsabban előrelépni, és egyeztetjük az időpontot.
        </p>
        <div className="mt-8">
        <ContactForm
          formType="konzultacio"
          serviceOptions={SERVICES}
          serviceLabel="Milyen témában kérsz konzultációt?"
          showCompany
          contactMethodOptions={CONTACT_METHODS}
          contactTimeOptions={CONTACT_TIMES}
          messageLabel="Üzenet"
          defaultMessage={`Kedves Dávid!

A megjelölt témá(k)ról szeretnék konzultálni Önnel!

Köszönöm!`}
          submitLabel="Konzultáció kérése"
        />
        </div>
      </div>
    </>
  );
}
