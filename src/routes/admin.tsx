import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { supabase } from "@/integrations/supabase/client";
import { PageHero } from "@/components/PageHero";
import { AdminSessionContext, LoginPanel } from "@/components/admin-panels";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin | EXCELlent Business Intelligence" },
      {
        name: "description",
        content: "Belső adminisztrációs felület.",
      },
      { property: "og:title", content: "Admin" },
      { property: "og:description", content: "Belső adminisztrációs felület." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminLayout,
});

function AdminLayout() {
  const [session, setSession] = useState<{ id: string; email: string | null } | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(
        data.session ?
          { id: data.session.user.id, email: data.session.user.email ?? null }
        : null,
      );
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s ? { id: s.user.id, email: s.user.email ?? null } : null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  if (!ready) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-14 text-sm text-muted-foreground">
        Betöltés…
      </div>
    );
  }

  if (!session) {
    return (
      <>
        <PageHero>
          <h1 className="text-3xl font-bold leading-tight text-primary-foreground md:text-4xl">
            Admin
          </h1>
        </PageHero>
        <div className="mx-auto max-w-6xl px-4 py-14">
          <p className="text-sm text-muted-foreground">
            A belső felülethez jelentkezz be az admin e-mail címeddel.
          </p>
          <LoginPanel />
        </div>
      </>
    );
  }

  const tabBase =
    "rounded-md px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground";
  const tabActive = "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground";

  return (
    <>
      <nav
        aria-label="Admin szekciók"
        className="sticky top-16 z-30 border-b border-border bg-background/95 backdrop-blur"
      >
        <div className="mx-auto flex max-w-6xl flex-wrap gap-1 px-4 py-2">
          <Link
            to="/admin"
            activeOptions={{ exact: true }}
            className={tabBase}
            activeProps={{ className: `${tabBase} ${tabActive}` }}
          >
            Megrendelések
          </Link>
          <Link
            to="/admin/statisztika"
            className={tabBase}
            activeProps={{ className: `${tabBase} ${tabActive}` }}
          >
            Statisztika
          </Link>
        </div>
      </nav>
      <AdminSessionContext.Provider value={{ email: session.email, userId: session.id }}>
        <Outlet />
      </AdminSessionContext.Provider>
    </>
  );
}
