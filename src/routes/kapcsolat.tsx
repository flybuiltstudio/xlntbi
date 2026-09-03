import { createFileRoute } from "@tanstack/react-router";
import { Facebook, Instagram, Linkedin, Mail, Phone } from "lucide-react";
import { ContactForm } from "@/components/ContactForm";
import kapcsolatBusiness from "@/assets/kapcsolat-business.jpg";
import { NewsletterSignup } from "@/components/NewsletterSignup";
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

      <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr]">
        <div className="space-y-6">
          <div className="rounded-2xl border border-border/60 bg-muted/40 p-5">
            <h2 className="text-base font-semibold text-foreground">Hírlevél</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              Jogszabályi változások, határidők és új Excel-eszközök – havonta néhány levélben.
            </p>
            <div className="mt-4">
              <NewsletterSignup />
            </div>
          </div>

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
            <li className="flex items-start gap-3">
              <Facebook className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
              <a
                href="https://www.facebook.com/xlntbi"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground"
              >
                Facebook
              </a>
            </li>
            <li className="flex items-start gap-3">
              <Instagram className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
              <a
                href="https://www.instagram.com/xlntbi/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground"
              >
                Instagram
              </a>
            </li>
            <li className="flex items-start gap-3">
              <Linkedin className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
              <a
                href="https://www.linkedin.com/company/xlntbi/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground"
              >
                LinkedIn
              </a>
            </li>
            <li className="flex items-start gap-3">
              <svg className="mt-0.5 h-4 w-4 shrink-0 text-primary" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .57.04.84.13V9.4a6.34 6.34 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43V8.69a8.16 8.16 0 0 0 4.77 1.52V6.76a4.83 4.83 0 0 1-.04-.07z" />
              </svg>
              <a
                href="https://www.tiktok.com/@xlntbi"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground"
              >
                TikTok
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
          <p className="max-w-2xl text-base leading-relaxed text-muted-foreground">
            Írj bátran, ha kérdésed van a szolgáltatásaimmal vagy termékeimmel kapcsolatban.
            <br />
            Töltsd ki az űrlapot, és rövid időn belül válaszolok.
          </p>
          <h2 className="mt-8 text-xl font-semibold text-foreground">Írj nekem</h2>
          <div className="mt-5">
            <ContactForm
              formType="kapcsolat"
              serviceOptions={SERVICES}
              messageLabel="Üzenet"
              defaultMessage={`Kedves Dávid!

A megjelölt témá(k)ról mikor tudunk beszélni?

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
