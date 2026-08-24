import { createFileRoute } from "@tanstack/react-router";

import { PageHero } from "@/components/PageHero";
import { UsersPanel, useAdminSession } from "@/components/admin-panels";

export const Route = createFileRoute("/admin/felhasznalok")({
  head: () => ({
    meta: [
      { title: "Admin – felhasználók | EXCELlent Business Intelligence" },
      {
        name: "description",
        content: "Admin felhasználók kezelése: új létrehozása vagy meglévő törlése.",
      },
      { property: "og:title", content: "Admin – felhasználók" },
      { property: "og:description", content: "Belső adminisztrációs felület." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminUsersPage,
});

function AdminUsersPage() {
  const { userId } = useAdminSession();
  return (
    <>
      <PageHero>
        <h1 className="text-3xl font-bold leading-tight text-primary-foreground md:text-4xl">
          Felhasználók
        </h1>
      </PageHero>
      <div className="mx-auto max-w-6xl px-4 py-14">
        <UsersPanel currentUserId={userId} />
      </div>
    </>
  );
}
