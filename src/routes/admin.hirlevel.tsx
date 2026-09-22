import { createFileRoute } from "@tanstack/react-router";

import { NewsletterAdminPanel } from "@/components/NewsletterAdminPanel";
import { PageHero } from "@/components/PageHero";
import { AdminSectionNav } from "@/components/admin-toc";

const NEWSLETTER_NAV = [
  ["hirlevel-kezelese", "Hírlevél kezelése"],
  ["levelkuldo", "Levélküldő"],
  ["feliratkozok", "Feliratkozók"],
  ["feketelista", "Feketelista"],
  ["elkuldott-hirlevelek", "Elküldött hírlevelek"],
] as const;

export const Route = createFileRoute("/admin/hirlevel")({
  head: () => ({
    meta: [
      { title: "Admin – Hírlevél | EXCELlent Business Intelligence" },
      {
        name: "description",
        content:
          "Belső felület a hírlevél kezelésére: feliratkozók listája és exportja, külső levelezőrendszer összekapcsolása, valamint a beépített levélküldő.",
      },
      { property: "og:title", content: "Admin – Hírlevél" },
      { property: "og:description", content: "Belső adminisztrációs felület." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminNewsletterPage,
});

function AdminNewsletterPage() {
  return (
    <>
      <PageHero>
        <h1 className="text-3xl font-bold leading-tight text-primary-foreground md:text-4xl">
          Hírlevél
        </h1>
      </PageHero>
      <div className="mx-auto max-w-6xl px-4 py-14">
        <AdminSectionNav links={NEWSLETTER_NAV} />
        <div className="mt-10">
          <NewsletterAdminPanel />
        </div>
      </div>
    </>
  );
}
