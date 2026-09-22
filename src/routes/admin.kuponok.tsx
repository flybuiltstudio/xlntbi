import { createFileRoute } from "@tanstack/react-router";

import { History } from "lucide-react";

import { AdminBlock } from "@/components/AdminBlock";
import { CouponAdminPanel } from "@/components/CouponAdminPanel";
import { LiveCouponGuardPanel } from "@/components/LiveCouponGuardPanel";
import { CouponAttemptsPanel } from "@/components/CouponAttemptsPanel";
import { CouponUsagePanel } from "@/components/CouponUsagePanel";
import { PageHero } from "@/components/PageHero";
import { useAdminSession } from "@/components/admin-panels";
import { AdminSectionNav, BackToTop, type AdminNavLink } from "@/components/admin-toc";

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

  const navLinks: AdminNavLink[] = [
    ...(isAdmin ? ([["kuponok-listaja", "Kuponok és új kupon"]] as AdminNavLink[]) : []),
    ["kupon-elozmenyek", "Kupon előzmények"],
    ["sikertelen-kuponkiserletek", "Sikertelen kuponkísérletek"],
    ...(isAdmin ? ([["kuponvedelem", "Kuponvédelem éles környezetben"]] as AdminNavLink[]) : []),
  ];

  return (
    <>
      <PageHero>
        <h1 className="text-3xl font-bold leading-tight text-primary-foreground md:text-4xl">
          Kuponok
        </h1>
      </PageHero>
      <div className="mx-auto max-w-6xl px-4 py-14">
        <AdminSectionNav links={navLinks} />

        <div className="mt-10 space-y-14">
          {isAdmin ? (
            <div>
              <CouponAdminPanel />
              <BackToTop />
            </div>
          ) : null}

          <div id="kupon-elozmenyek" className="scroll-mt-24">
            <AdminBlock
              icon={History}
              title="Kupon előzmények"
              description="Itt látod, melyik kuponkódot mikor váltották be, mennyi kedvezményt adott, és melyik rendeléshez tartozik. Így egy hibás vagy lejárt kupon miatti ügyféligényt azonnal ellenőrizhetsz."
            >
              <CouponUsagePanel />
            </AdminBlock>
            <BackToTop />
          </div>

          <div>
            <CouponAttemptsPanel />
            <BackToTop />
          </div>

          {isAdmin ? (
            <div>
              <LiveCouponGuardPanel />
              <BackToTop />
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}
