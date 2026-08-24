import { createFileRoute } from "@tanstack/react-router";

import { PageHero } from "@/components/PageHero";
import { OrdersPanel, useAdminSession } from "@/components/admin-panels";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Admin – megrendelések | EXCELlent Business Intelligence" },
      {
        name: "description",
        content: "Belső felület a megrendelések és az átutalásos fizetések kezelésére.",
      },
      { property: "og:title", content: "Admin – megrendelések" },
      { property: "og:description", content: "Belső adminisztrációs felület." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminIndexPage,
});

function AdminIndexPage() {
  const { email } = useAdminSession();
  return (
    <>
      <PageHero>
        <h1 className="text-3xl font-bold leading-tight text-primary-foreground md:text-4xl">
          Megrendelések
        </h1>
      </PageHero>
      <div className="mx-auto max-w-6xl px-4 py-14">
        <p className="text-sm text-muted-foreground">
          Belső felület: megrendelések szűrése fizetési állapot, év és hónap szerint, átutalások
          jóváhagyása és a letöltési linkek kiküldése.
        </p>
        <OrdersPanel email={email} />
      </div>
    </>
  );
}
