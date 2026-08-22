import { createFileRoute } from "@tanstack/react-router";
import { ContactForm } from "@/components/ContactForm";

const TITLE = "Konzultáció kérése – EXCELlent Business Intelligence";
const DESC =
  "Kérj konzultációt könyvelés, adótanácsadás, kontrolling, cégaudit vagy Fintech és BI témában. Töltsd ki az űrlapot, és felveszem veled a kapcsolatot.";

export const Route = createFileRoute("/konzultacio")({
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
  component: KonzultacioPage,
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
    <div className="mx-auto max-w-4xl px-4 py-14 md:py-20">
      <h1 className="text-3xl font-bold text-foreground md:text-4xl">Konzultáció</h1>
      <p className="mt-4 text-base leading-relaxed text-muted-foreground">
        Töltsd ki az alábbi űrlapot, és jelezd, milyen témában szeretnél konzultálni. Megírom, hogyan
        tudunk a leggyorsabban előrelépni, és egyeztetjük az időpontot.
      </p>

      <div className="mt-10">
        <ContactForm
          formType="konzultacio"
          serviceOptions={SERVICES}
          serviceLabel="Milyen témában kérsz konzultációt?"
          showCompany
          contactMethodOptions={CONTACT_METHODS}
          contactTimeOptions={CONTACT_TIMES}
          messageLabel="Üzenet"
          submitLabel="Konzultáció kérése"
        />
      </div>
    </div>
  );
}
