import { createFileRoute } from "@tanstack/react-router";

import { PageHero } from "@/components/PageHero";
import { NavStatusPanel } from "@/components/NavStatusPanel";

export const Route = createFileRoute("/admin/nav-ellenorzes")({
  head: () => ({
    meta: [
      { title: "Admin – NAV ellenőrzés | EXCELlent Business Intelligence" },
      {
        name: "description",
        content:
          "Belső felület: a NAV Online Számla adatszolgáltatás elutasításainak azonnali kimutatása rendelés-hivatkozással.",
      },
      { property: "og:title", content: "Admin – NAV ellenőrzés" },
      { property: "og:description", content: "Belső adminisztrációs felület." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminNavCheckPage,
});

function AdminNavCheckPage() {
  return (
    <>
      <PageHero>
        <h1 className="text-3xl font-bold leading-tight text-primary-foreground md:text-4xl">
          NAV ellenőrzés
        </h1>
      </PageHero>
      <div className="mx-auto max-w-6xl px-4 py-14">
        <p className="text-sm text-muted-foreground">
          Végigolvassa a legutóbbi rendelések Billingo számláit, és megmutatja, melyiket fogadta be
          a NAV Online Számla rendszere és melyiket utasította el – az elutasítás okával és a
          rendelés hivatkozásával együtt. Új elutasításról belső e-mail értesítés is megy. Az
          ellenőrzés csak olvas, semmit nem módosít.
        </p>
        <NavStatusPanel />
      </div>
    </>
  );
}
