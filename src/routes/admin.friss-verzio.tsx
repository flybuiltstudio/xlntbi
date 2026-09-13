import { createFileRoute } from "@tanstack/react-router";

import { PageHero } from "@/components/PageHero";
import { AdminToc } from "@/components/admin-toc";
import { CalculatorOrderPanel, CalculatorUploadPanel } from "@/components/admin-calculator-panels";
import {
  ProductDescriptionPanel,
  ProductPricePanel,
} from "@/components/admin-product-panels";
import { CategoryPanel, NewProductPanel } from "@/components/admin-new-product-panels";
import {
  CalculatorVersionPanel,
  ProductOrderPanel,
  ProductVersionPanel,
} from "@/components/admin-panels";

export const Route = createFileRoute("/admin/friss-verzio")({
  head: () => ({
    meta: [
      { title: "Admin – Termékek és Kalkulátorok | EXCELlent Business Intelligence" },
      {
        name: "description",
        content:
          "Belső felület a termékek és kalkulátorok feltöltéséhez, frissítéséhez és rendezéséhez.",
      },
      { property: "og:title", content: "Admin – Termékek és Kalkulátorok" },
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
          Termékek és Kalkulátorok
        </h1>
      </PageHero>
      <div className="mx-auto max-w-6xl px-4 py-14">
        <p className="text-sm text-muted-foreground">
          Termékek és kalkulátorok feltöltése, frissítése és rendezése. A
          termékfájloknál a korábbi letöltő linkek érvényesek maradnak, és
          mostantól az új verziót szolgálják ki.
        </p>
        <AdminToc />
        <NewProductPanel />
        <CategoryPanel />
        <ProductVersionPanel />
        <ProductDescriptionPanel />
        <ProductPricePanel />
        <ProductOrderPanel />
        <CalculatorUploadPanel />
        <CalculatorVersionPanel />
        <CalculatorOrderPanel />
      </div>
    </>
  );
}
