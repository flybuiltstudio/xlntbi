import { createFileRoute } from "@tanstack/react-router";

import { PageHero } from "@/components/PageHero";
import { InvoiceLogsPanel } from "@/components/admin-panels";

export const Route = createFileRoute("/admin/szamlazas")({
  head: () => ({
    meta: [
      { title: "Admin – számlázási napló | EXCELlent Business Intelligence" },
      {
        name: "description",
        content:
          "Belső felület a Billingo számlázási próbálkozások és hibák nyomon követésére.",
      },
      { property: "og:title", content: "Admin – számlázási napló" },
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
          Számlázási napló
        </h1>
      </PageHero>
      <div className="mx-auto max-w-6xl px-4 py-14">
        <p className="text-sm text-muted-foreground">
          A Billingo számlakiállítási próbálkozások részletes naplója: rendelésazonosító,
          a próbálkozás forrása (Stripe webhook, átutalás-jóváhagyás, kézi újrapróbálás),
          állapot, számlaszám, hibakód és hibaüzenet.
        </p>
        <InvoiceLogsPanel />
      </div>
    </>
  );
}
