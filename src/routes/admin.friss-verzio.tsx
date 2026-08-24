import { createFileRoute } from "@tanstack/react-router";

import { PageHero } from "@/components/PageHero";
import { CalculatorVersionPanel, ProductVersionPanel } from "@/components/admin-panels";

export const Route = createFileRoute("/admin/friss-verzio")({
  head: () => ({
    meta: [
      { title: "Admin – friss verzió feltöltés | EXCELlent Business Intelligence" },
      {
        name: "description",
        content:
          "Belső felület a termékfájlok új verzióra cseréléséhez és a kalkulátorok frissítéséhez.",
      },
      { property: "og:title", content: "Admin – friss verzió feltöltés" },
      { property: "og:description", content: "Belső adminisztrációs felület." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminNewVersionPage,
});

function AdminNewVersionPage() {
  return (
    <>
      <PageHero>
        <h1 className="text-3xl font-bold leading-tight text-primary-foreground md:text-4xl">
          Friss verzió feltöltés
        </h1>
      </PageHero>
      <div className="mx-auto max-w-6xl px-4 py-14">
        <p className="text-sm text-muted-foreground">
          Termékfájlok cseréje új verzióra és a kalkulátorok frissítése. A
          kiválasztott tétel határozza meg a célt, a feltöltött fájl neve nem
          számít. A termékfájloknál a korábbi letöltő linkek érvényesek maradnak,
          és mostantól az új verziót szolgálják ki.
        </p>
        <ProductVersionPanel />
        <CalculatorVersionPanel />
      </div>
    </>
  );
}
