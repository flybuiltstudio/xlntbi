import { Link, createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { company } from "@/lib/company";

const searchSchema = z.object({
  ok: z.enum(["not_found", "expired", "limit", "error"]).optional(),
});

export const Route = createFileRoute("/letoltes-hiba")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "A letöltés nem elérhető | EXCELlent Business Intelligence" },
      {
        name: "description",
        content:
          "A letöltési link lejárt, elfogyott vagy érvénytelen. Írj nekünk, és küldünk új linket a megvásárolt szoftverhez.",
      },
      { property: "og:title", content: "A letöltés nem elérhető" },
      {
        property: "og:description",
        content: "Lejárt vagy érvénytelen letöltési link – kérj újat e-mailben.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DownloadErrorPage,
});

const MESSAGES: Record<string, { title: string; text: string }> = {
  not_found: {
    title: "Ez a letöltési link érvénytelen",
    text: "Lehet, hogy a link hiányosan lett kimásolva az e-mailből. Nyisd meg újra a visszaigazoló levelet, vagy írj nekem, és küldök új linket.",
  },
  expired: {
    title: "A letöltési link lejárt",
    text: "A linkek 14 napig élnek. Írj nekem a rendelésszámmal, és azonnal küldök egy újat – a licencedet természetesen ez nem érinti.",
  },
  limit: {
    title: "Elérted a letöltések számát",
    text: "Ez a link elérte a megengedett letöltésszámot. Írj nekem a rendelésszámmal, és feloldom, illetve küldök új linket.",
  },
  error: {
    title: "Technikai hiba történt",
    text: "A fájl kiszolgálása most nem sikerült. Kérlek, próbáld újra pár perc múlva, vagy jelezd nekem e-mailben.",
  },
};

function DownloadErrorPage() {
  const { ok } = Route.useSearch();
  const message = MESSAGES[ok ?? "not_found"]!;

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 md:py-24">
      <h1 className="text-3xl font-bold text-foreground md:text-4xl">{message.title}</h1>
      <p className="mt-4 text-base leading-relaxed text-muted-foreground">{message.text}</p>
      <div className="mt-8 rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
        <p>
          E-mail:{" "}
          <a href={`mailto:${company.email}`} className="font-semibold text-foreground underline">
            {company.email}
          </a>
        </p>
        <p className="mt-2">
          Telefon:{" "}
          <a href={`tel:${company.phoneHref}`} className="font-semibold text-foreground underline">
            {company.phone}
          </a>
        </p>
      </div>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          to="/termekeim"
          className="inline-flex items-center rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-brand-dark"
        >
          Termékek
        </Link>
        <Link
          to="/kapcsolat"
          className="inline-flex items-center rounded-md border border-input px-6 py-3 text-sm font-semibold text-foreground hover:bg-accent"
        >
          Kapcsolat
        </Link>
      </div>
    </div>
  );
}
