import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";

import { AdminBlock } from "@/components/AdminBlock";
import { PageHero } from "@/components/PageHero";
import { SecurityCheckPanel } from "@/components/SecurityCheckPanel";

export const Route = createFileRoute("/admin/biztonsagi-ellenorzes")({
  head: () => ({
    meta: [
      { title: "Admin – Biztonsági ellenőrzés | EXCELlent Business Intelligence" },
      {
        name: "description",
        content:
          "Belső felület a napi biztonsági önellenőrzés kijavítatlan találatainak áttekintésére és javítására.",
      },
      { property: "og:title", content: "Admin – Biztonsági ellenőrzés" },
      { property: "og:description", content: "Belső adminisztrációs felület." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminSecurityCheckPage,
});

function AdminSecurityCheckPage() {
  return (
    <>
      <PageHero>
        <h1 className="text-3xl font-bold leading-tight text-primary-foreground md:text-4xl">
          Biztonsági ellenőrzés
        </h1>
      </PageHero>
      <div className="mx-auto max-w-6xl space-y-14 px-4 py-14">
        <AdminBlock
          icon={ShieldCheck}
          title="Kijavítatlan találatok"
          description="Ugyanaz az ellenőrzés, ami minden hajnalban lefut: védelmi szabályok, bejelentkezés nélkül olvasható vagy írható táblák, nyilvános tárolók, kiemelt jogú függvények és az időzített feladatok hitelesítése. Csak azokat a találatokat listázza, amik még nincsenek kijavítva vagy eldöntve. Az automatikusan javíthatókat egy kattintással elvégzi; ahol döntés kell, ott te választasz, és a választásod megjegyzi."
        >
          <SecurityCheckPanel />
        </AdminBlock>
      </div>
    </>
  );
}
