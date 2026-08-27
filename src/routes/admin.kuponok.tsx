import { createFileRoute } from "@tanstack/react-router";

import { CouponAdminPanel } from "@/components/CouponAdminPanel";
import { CouponAttemptsPanel } from "@/components/CouponAttemptsPanel";
import { CouponUsagePanel } from "@/components/CouponUsagePanel";
import { PageHero } from "@/components/PageHero";
import { useAdminSession } from "@/components/admin-panels";

export const Route = createFileRoute("/admin/kuponok")({
  head: () => ({
    meta: [
      { title: "Admin – Kuponok | EXCELlent Business Intelligence" },
      {
        name: "description",
        content:
          "Belső felület a kuponok kezelésére: új kupon létrehozása, meglévők listázása, szűrése és kikapcsolása, valamint a beváltási előzmények és a sikertelen kísérletek ellenőrzése.",
      },
      { property: "og:title", content: "Admin – Kuponok" },
      { property: "og:description", content: "Belső adminisztrációs felület." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminCouponsPage,
});

function AdminCouponsPage() {
  const { role } = useAdminSession();
  const isAdmin = role === "admin";

  return (
    <>
      <PageHero>
        <h1 className="text-3xl font-bold leading-tight text-primary-foreground md:text-4xl">
          Kuponok
        </h1>
      </PageHero>
      <div className="mx-auto max-w-6xl px-4 py-14">
        {isAdmin ? <CouponAdminPanel /> : null}

        <div className={isAdmin ? "mt-14" : undefined}>
          <h2 className="text-xl font-bold text-foreground">Kupon előzmények</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Itt látod, melyik kuponkódot mikor váltották be, mennyi kedvezményt adott, és melyik
            rendeléshez tartozik. Így egy hibás vagy lejárt kupon miatti ügyféligényt azonnal
            ellenőrizhetsz.
          </p>
          <CouponUsagePanel />
          <CouponAttemptsPanel />
        </div>
      </div>
    </>
  );
}
