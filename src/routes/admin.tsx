import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { PageHero } from "@/components/PageHero";
import { AdminSessionContext, LoginPanel, type AdminRole } from "@/components/admin-panels";
import { adminMyRole } from "@/lib/admin.functions";

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
  const [role, setRole] = useState<AdminRole | null>(null);
  const [roleReady, setRoleReady] = useState(false);
  const fetchRole = useServerFn(adminMyRole);
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

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

  useEffect(() => {
    if (!session) {
      setRole(null);
      setRoleReady(false);
      return;
    }
    let cancelled = false;
    setRoleReady(false);
    fetchRole()
      .then((r) => {
        if (!cancelled) setRole(r.role);
      })
      .catch(() => {
        if (!cancelled) setRole(null);
      })
      .finally(() => {
        if (!cancelled) setRoleReady(true);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.id]);

  useEffect(() => {
    // A "user" szerepkör csak a Statisztika és a Kuponok oldalt érheti el;
    // minden más admin útvonalról (beleértve az Ellenőrzések aloldalait is,
    // akár közvetlen URL-megadással) visszairányítjuk.
    const userAllowed = ["/admin/statisztika", "/admin/kuponok"];
    if (role === "user" && !userAllowed.some((p) => pathname.startsWith(p))) {
      void navigate({ to: "/admin/statisztika", replace: true });
    }
  }, [role, pathname, navigate]);

  if (!ready || (session && !roleReady)) {
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

  if (!role) {
    return (
      <>
        <PageHero>
          <h1 className="text-3xl font-bold leading-tight text-primary-foreground md:text-4xl">
            Admin
          </h1>
        </PageHero>
        <div className="mx-auto max-w-6xl px-4 py-14">
          <p className="text-sm text-muted-foreground">
            Ehhez a felülethez nincs jogosultságod. Ha hibát gyanítasz, jelentkezz ki, majd
            jelentkezz be újra.
          </p>
          <button
            type="button"
            onClick={() => void supabase.auth.signOut()}
            className="mt-4 inline-flex items-center rounded-md border border-input px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Kilépés
          </button>
        </div>
      </>
    );
  }

  const tabBase =
    "rounded-md px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground";
  const tabActive = "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground";

  const [checksOpen, setChecksOpen] = useState(false);
  const checksLinks = [
    { to: "/admin/szamlazas", label: "Számlázás" },
    { to: "/admin/billingo-ellenorzes", label: "Billingo ellenőrzés" },
    { to: "/admin/fizetes-teszt", label: "Fizetés teszt" },
  ] as const;

  return (
    <>
      <nav
        aria-label="Admin szekciók"
        className="sticky top-16 z-30 border-b border-border bg-background/95 backdrop-blur"
      >
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-1 px-4 py-2">
          {role === "admin" ? (
            <>
              <Link
                to="/admin"
                activeOptions={{ exact: true }}
                className={tabBase}
                activeProps={{ className: `${tabBase} ${tabActive}` }}
              >
                Megrendelések
              </Link>
              <Link
                to="/admin/kuponok"
                className={tabBase}
                activeProps={{ className: `${tabBase} ${tabActive}` }}
              >
                Kuponok
              </Link>
            </>
          ) : null}
          <Link
            to="/admin/statisztika"
            className={tabBase}
            activeProps={{ className: `${tabBase} ${tabActive}` }}
          >
            Statisztika
          </Link>
          {role === "admin" ? (
            <>
              <Link
                to="/admin/friss-verzio"
                className={tabBase}
                activeProps={{ className: `${tabBase} ${tabActive}` }}
              >
                Friss verzió
              </Link>
              <div
                className="relative"
                onMouseEnter={() => setChecksOpen(true)}
                onMouseLeave={() => setChecksOpen(false)}
              >
                <button
                  type="button"
                  onClick={() => setChecksOpen((v) => !v)}
                  className={`${tabBase} inline-flex items-center gap-1 ${
                    checksLinks.some((l) => pathname.startsWith(l.to)) ? `${tabBase} ${tabActive}` : ""
                  }`}
                  aria-expanded={checksOpen}
                >
                  Ellenőrzések
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
                {checksOpen ? (
                  <div className="absolute left-0 top-full z-40 mt-1 min-w-44 overflow-hidden rounded-md border border-border bg-popover py-1 shadow-md">
                    {checksLinks.map((l) => (
                      <Link
                        key={l.to}
                        to={l.to}
                        className="block px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                        activeProps={{ className: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground" }}
                      >
                        {l.label}
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>
              <Link
                to="/admin/felhasznalok"
                className={tabBase}
                activeProps={{ className: `${tabBase} ${tabActive}` }}
              >
                Felhasználók
              </Link>
            </>
          ) : null}
          {role === "user" ? (
            <Link
              to="/admin/kuponok"
              className={tabBase}
              activeProps={{ className: `${tabBase} ${tabActive}` }}
            >
              Kuponok
            </Link>
          ) : null}
          <button
            type="button"
            onClick={() => void supabase.auth.signOut()}
            className={`${tabBase} ml-auto border border-input`}
          >
            Kilépés
          </button>
        </div>
      </nav>
      <AdminSessionContext.Provider value={{ email: session.email, userId: session.id, role }}>
        <Outlet />
      </AdminSessionContext.Provider>
    </>
  );
}
