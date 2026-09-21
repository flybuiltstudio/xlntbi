import { createFileRoute } from "@tanstack/react-router";
import { HardDrive } from "lucide-react";

import { AdminBlock } from "@/components/AdminBlock";
import { PageHero } from "@/components/PageHero";
import { StorageCleanupPanel } from "@/components/StorageCleanupPanel";

export const Route = createFileRoute("/admin/tarolo-takaritas")({
  head: () => ({
    meta: [
      { title: "Admin – Tároló-takarítás | EXCELlent Business Intelligence" },
      {
        name: "description",
        content:
          "Belső felület a termékfájlok tárolójának ellenőrzésére: mely fájlokra nem mutat egyetlen hivatkozás sem.",
      },
      { property: "og:title", content: "Admin – Tároló-takarítás" },
      { property: "og:description", content: "Belső adminisztrációs felület." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminStorageCleanupPage,
});

function AdminStorageCleanupPage() {
  return (
    <>
      <PageHero>
        <h1 className="text-3xl font-bold leading-tight text-primary-foreground md:text-4xl">
          Tároló-takarítás
        </h1>
      </PageHero>
      <div className="mx-auto max-w-6xl space-y-14 px-4 py-14">
        <AdminBlock
          icon={HardDrive}
          title="Hivatkozás nélküli fájlok"
          description="Az ellenőrzés végigolvassa a termékfájlok tárolóját, és összeveti minden élő hivatkozással: termékek letölthető fájljai, képek, kalkulátor-képek, valamint minden kiadott letöltési link (vásárlás, ingyenes letöltés, DEMO). Ami egyikre sem hivatkozik, itt megjelenik. A heti karbantartás csak jelentést készít, törölni kizárólag innen, kézzel lehet. A 30 napnál frissebb feltöltéseket sosem ajánlja törlésre, és a lejárat nélküli ingyenes letöltések fájljai is védettek."
        >
          <StorageCleanupPanel />
        </AdminBlock>
      </div>
    </>
  );
}
