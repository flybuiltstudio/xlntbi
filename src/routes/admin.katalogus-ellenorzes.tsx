import { createFileRoute } from "@tanstack/react-router";
import { PackageSearch } from "lucide-react";

import { AdminBlock } from "@/components/AdminBlock";
import { PageHero } from "@/components/PageHero";
import { CatalogAuditPanel } from "@/components/CatalogAuditPanel";
import { StripeProductNamePanel } from "@/components/StripeProductNamePanel";

export const Route = createFileRoute("/admin/katalogus-ellenorzes")({
  head: () => ({
    meta: [
      { title: "Admin – Katalógus ellenőrzés | EXCELlent Business Intelligence" },
      {
        name: "description",
        content:
          "Belső felület a Stripe lookup key-ek, aktív árak, terméknevek és a letöltési fájlok automatikus ellenőrzésére.",
      },
      { property: "og:title", content: "Admin – Katalógus ellenőrzés" },
      { property: "og:description", content: "Belső adminisztrációs felület." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminCatalogAuditPage,
});

function AdminCatalogAuditPage() {
  return (
    <>
      <PageHero>
        <h1 className="text-3xl font-bold leading-tight text-primary-foreground md:text-4xl">
          Katalógus ellenőrzés
        </h1>
      </PageHero>
      <div className="mx-auto max-w-6xl space-y-14 px-4 py-14">
        <AdminBlock
          icon={PackageSearch}
          title="Árak, lookup key-ek és letöltések"
          description="Egy kattintással végigfut minden terméken és minden licenszverzión: megvan-e a Stripe lookup key a választott környezetben, aktív-e az ár, egyezik-e a forint összeg a katalógussal, és a tárolóban ott van-e a letölthető fájl. Ellenőrzi a már kiadott letöltési tokeneket is, hogy átnevezés után se törjön el egyetlen link sem. Az ellenőrzés csak olvas, semmit nem módosít."
        >
          <CatalogAuditPanel />
        </AdminBlock>

        <StripeProductNamePanel />
      </div>
    </>
  );
}
