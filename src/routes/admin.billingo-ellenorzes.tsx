import { createFileRoute } from "@tanstack/react-router";

import { PageHero } from "@/components/PageHero";
import { BillingoAuditPanel } from "@/components/BillingoAuditPanel";

export const Route = createFileRoute("/admin/billingo-ellenorzes")({
  head: () => ({
    meta: [
      { title: "Admin – Billingo ellenőrzés | EXCELlent Business Intelligence" },
      {
        name: "description",
        content:
          "Belső felület a Stripe fizetési azonosítók és a Billingo számla-megjegyzések egyezésének ellenőrzésére.",
      },
      { property: "og:title", content: "Admin – Billingo ellenőrzés" },
      { property: "og:description", content: "Belső adminisztrációs felület." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminBillingoAuditPage,
});

function AdminBillingoAuditPage() {
  return (
    <>
      <PageHero>
        <h1 className="text-3xl font-bold leading-tight text-primary-foreground md:text-4xl">
          Billingo ellenőrzés
        </h1>
      </PageHero>
      <div className="mx-auto max-w-6xl px-4 py-14">
        <p className="text-sm text-muted-foreground">
          Itt kapcsolod ki és be egy kattintással a Billingo webhook végpontot, és itt látod
          rendelésenként, hogy a Stripe fizetési azonosító és a Billingo számla
          megjegyzésmezőjében szereplő rendelésszám pontosan egyezik-e.
        </p>
        <BillingoAuditPanel />
      </div>
    </>
  );
}
