import { createFileRoute } from "@tanstack/react-router";
import { Mail, Phone } from "lucide-react";
import { ContactForm } from "@/components/ContactForm";
import kapcsolatBusiness from "@/assets/kapcsolat-business.jpg";
import { PageHero } from "@/components/PageHero";

const TITLE = "Kapcsolat – EXCELlent Business Intelligence";
const DESC =
  "Vedd fel velem a kapcsolatot: könyvelés, adótanácsadás, kontrolling, Fintech és BI kérdésekben. Telefon: 20/962-2176.";

export const Route = createFileRoute("/kapcsolat")({
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
