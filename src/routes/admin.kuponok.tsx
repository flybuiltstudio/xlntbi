import { createFileRoute } from "@tanstack/react-router";

import { CouponUsagePanel } from "@/components/CouponUsagePanel";
import { PageHero } from "@/components/PageHero";

export const Route = createFileRoute("/admin/kuponok")({
  head: () => ({
    meta: [
      { title: "Admin – Kupon előzmények | EXCELlent Business Intelligence" },
      {
        name: "description",
        content:
          "Belső felület a kuponkódok beváltásainak ellenőrzésére: mikor, mennyi kedvezmény, melyik rendeléshez.",
      },
      { property: "og:title", content: "Admin – Kupon előzmények" },
      { property: "og:description", content: "Belső adminisztrációs felület." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminCouponsPage,
});

function AdminCouponsPage() {
  return (
    <>
      <PageHero>
        <h1 className="text-3xl font-bold leading-tight text-primary-foreground md:text-4xl">
          Kupon előzmények
        </h1>
      </PageHero>
      <div className="mx-auto max-w-6xl px-4 py-14">
        <p className="text-sm text-muted-foreground">
          Itt látod, melyik kuponkódot mikor váltották be, mennyi kedvezményt adott, és melyik
          rendeléshez tartozik. Így egy hibás vagy lejárt kupon miatti ügyféligényt azonnal
          ellenőrizhetsz.
        </p>
        <CouponUsagePanel />
      </div>
    </>
  );
}
