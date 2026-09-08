import { createFileRoute } from "@tanstack/react-router";
import { ClipboardList, FileSearch, Landmark, ScrollText } from "lucide-react";

import { AdminBlock } from "@/components/AdminBlock";
import { PageHero } from "@/components/PageHero";
import { InvoiceLogsPanel } from "@/components/admin-panels";
import { BillingoAuditPanel } from "@/components/BillingoAuditPanel";
import { OrderAuditPanel } from "@/components/OrderAuditPanel";
import { NavStatusPanel } from "@/components/NavStatusPanel";

export const Route = createFileRoute("/admin/szamlazas")({
  head: () => ({
    meta: [
      { title: "Admin – számlázás és számlaellenőrzés | EXCELlent Business Intelligence" },
      {
        name: "description",
        content:
          "Belső felület: számlázási napló, Billingo webhook, számla–rendelés egyezés, rendelési audit és NAV Online Számla állapot egy helyen.",
      },
      { property: "og:title", content: "Admin – számlázás és számlaellenőrzés" },
      { property: "og:description", content: "Belső adminisztrációs felület." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminInvoicesPage,
});

function AdminInvoicesPage() {
  return (
    <>
      <PageHero>
        <h1 className="text-3xl font-bold leading-tight text-primary-foreground md:text-4xl">
          Számlázás és számlaellenőrzés
        </h1>
      </PageHero>
      <div className="mx-auto max-w-6xl space-y-14 px-4 py-14">
        <AdminBlock
          icon={ScrollText}
          title="Számlázási napló"
          description="A Billingo számlakiállítási próbálkozások részletes naplója: rendelésazonosító, a próbálkozás forrása (Stripe webhook, átutalás-jóváhagyás, kézi újrapróbálás), állapot, számlaszám, hibakód és hibaüzenet."
        >
          <InvoiceLogsPanel />
        </AdminBlock>

        <BillingoAuditPanel />

        <AdminBlock
          icon={FileSearch}
          title="Rendelési audit"
          description="Rendelésenként összepárosítja a kiállított Billingo számlákat a sztornókkal, és kiemeli az eltéréseket: kifizetett rendelés számla nélkül, több élő számla ugyanahhoz a rendeléshez, sikertelen sztornó, visszatérített fizetés élő számlával, összeg- vagy számlaszám-eltérés. Csak olvas, semmit nem módosít."
        >
          <OrderAuditPanel />
        </AdminBlock>

        <AdminBlock
          icon={Landmark}
          title="NAV Online Számla állapot"
          description="Végigolvassa a legutóbbi rendelések Billingo számláit, és megmutatja, melyiket fogadta be a NAV és melyiket utasította el – az elutasítás okával és a rendelés hivatkozásával. Új elutasításról belső e-mail értesítés is megy. Csak olvas, semmit nem módosít."
        >
          <NavStatusPanel />
        </AdminBlock>

        <p className="text-xs text-muted-foreground">
          <ClipboardList className="mr-1 inline h-3.5 w-3.5" aria-hidden="true" />
          A Stripe terméknevek ellenőrzése a Katalógus ellenőrzés lapra került.
        </p>
      </div>
    </>
  );
}
