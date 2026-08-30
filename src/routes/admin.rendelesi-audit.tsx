import { createFileRoute } from "@tanstack/react-router";

import { PageHero } from "@/components/PageHero";
import { OrderAuditPanel } from "@/components/OrderAuditPanel";

export const Route = createFileRoute("/admin/rendelesi-audit")({
  head: () => ({
    meta: [
      { title: "Admin – Rendelési audit | EXCELlent Business Intelligence" },
      {
        name: "description",
        content:
          "Belső felület: minden rendelés Billingo számlája és sztornója egy helyen, eltérések kiemelésével.",
      },
      { property: "og:title", content: "Admin – Rendelési audit" },
      { property: "og:description", content: "Belső adminisztrációs felület." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminOrderAuditPage,
});

function AdminOrderAuditPage() {
  return (
    <>
      <PageHero>
        <h1 className="text-3xl font-bold leading-tight text-primary-foreground md:text-4xl">
          Rendelési audit
        </h1>
      </PageHero>
      <div className="mx-auto max-w-6xl px-4 py-14">
        <p className="text-sm text-muted-foreground">
          Rendelésenként összepárosítja a kiállított Billingo számlákat a hozzájuk tartozó
          sztornókkal, és kiemeli az eltéréseket: kifizetett rendelés számla nélkül, több élő
          számla ugyanahhoz a rendeléshez, sikertelen sztornó, visszatérített fizetés élő
          számlával, illetve összeg- vagy számlaszám-eltérés. Az audit csak olvas, semmit nem
          módosít.
        </p>
        <OrderAuditPanel />
      </div>
    </>
  );
}
