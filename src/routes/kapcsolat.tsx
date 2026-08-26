import { createFileRoute } from "@tanstack/react-router";
import { Mail, Phone } from "lucide-react";
import { ContactForm } from "@/components/ContactForm";
import kapcsolatBusiness from "@/assets/kapcsolat-business.jpg";
import { PageHero } from "@/components/PageHero";


const TITLE = "Kapcsolat | EXCELlent Business Intelligence";
const DESCRIPTION = "Írj vagy hívj, ha kérdésed van a könyvelési, kontrolling vagy BI szolgáltatásaimról. Válaszolok, amint tudok.";
const CANONICAL = "https://xlntbi.hu/kapcsolat";
const OG_IMAGE = "https://xlntbi.hu/og/kapcsolat-business.jpg";

export const Route = createFileRoute("/kapcsolat")({
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
              "url": "https://xlntbi.hu/kapcsolat",
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
                              "name": "Kapcsolat",
                              "item": "https://xlntbi.hu/kapcsolat"
                      }
              ]
      }),
      },
    ],
  }),
  component: KapcsolatPage,
});

const SERVICES = [
  "Könyvelés",
  "Adótanács",
  "Fintech és BI",
  "Kontrolling",
  "Cégaudit",
  "Könyvvizsgálat",
  "Könyvelőiroda audit",
  "Digitális időmegtakarítási audit",
];

function KapcsolatPage() {
  return (
    <>
      <PageHero>
        <h1 className="text-3xl font-bold text-primary-foreground md:text-4xl">Kapcsolat</h1>
      </PageHero>

      <div className="mx-auto max-w-6xl px-4 py-14 md:py-16">

      <p className="max-w-2xl text-base leading-relaxed text-muted-foreground">
        Írj bátran, ha kérdésed van a szolgáltatásaimmal kapcsolatban.
        <br />
        Töltsd ki az űrlapot, és rövid időn belül válaszolok.
      </p>

      <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_1.4fr]">
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-foreground">Elérhetőségeim</h2>
          <ul className="space-y-4 text-sm text-muted-foreground">
            <li className="flex items-start gap-3">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
              <a href="tel:+36209622176" className="hover:text-foreground">
                20/962-2176
              </a>
            </li>
            <li className="flex items-start gap-3">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
              <a href="mailto:info@xlntbi.hu" className="hover:text-foreground">
                info@xlntbi.hu
              </a>
            </li>
          </ul>
          <figure className="mt-2 overflow-hidden rounded-2xl border border-border/60 shadow-lg">
            <img
              src={kapcsolatBusiness}
              alt="Üzleti kapcsolatfelvételt szimbolizáló elegáns, modern képi ábrázolás"
              width={1200}
              height={912}
              loading="lazy"
              className="h-auto w-full object-cover"
            />
          </figure>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-foreground">Írj nekem</h2>
          <div className="mt-5">
            <ContactForm
              formType="kapcsolat"
              serviceOptions={SERVICES}
              messageLabel="Üzenet"
              defaultMessage={`Kedves Dávid!

A fenti témában mikor tudunk beszélni?

Köszönöm!`}
              submitLabel="Üzenet elküldése"
            />
          </div>
        </div>
      </div>
      </div>
    </>
  );
}
