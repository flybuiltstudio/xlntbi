import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { PageHero } from "@/components/PageHero";
import { inputClass } from "@/components/admin-panels";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/jelszo")({
  head: () => ({
    meta: [
      { title: "Új jelszó beállítása | EXCELlent Business Intelligence" },
      {
        name: "description",
        content: "Admin jelszó visszaállítása.",
      },
      { property: "og:title", content: "Új jelszó beállítása" },
      { property: "og:description", content: "Admin jelszó visszaállítása." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminPasswordResetPage,
});

function AdminPasswordResetPage() {
  const [ready, setReady] = useState(false);
  const [status, setStatus] = useState<"idle" | "saving" | "done">("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    // The recovery link carries its token in the URL hash; the client picks
    // it up on init and opens a recovery session.
    supabase.auth.getSession().then(({ data }) => {
      setReady(Boolean(data.session));
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") ?? "");
    const confirm = String(form.get("password-confirm") ?? "");
    if (password !== confirm) {
      setError("A két jelszó nem egyezik.");
      return;
    }
    setStatus("saving");
    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      setStatus("idle");
      setError("Az új jelszó mentése nem sikerült. Kérj új visszaállító e-mailt.");
      return;
    }
    setStatus("done");
  }

  return (
    <>
      <PageHero>
        <h1 className="text-3xl font-bold leading-tight text-primary-foreground md:text-4xl">
          Új jelszó beállítása
        </h1>
      </PageHero>
      <div className="mx-auto max-w-6xl px-4 py-14">
        {status === "done" ? (
          <div className="max-w-md rounded-xl border border-border bg-card p-6">
            <p className="text-sm text-foreground">
              Az új jelszavad elmentettük. Most már beléphetsz vele az admin
              felületre.
            </p>
            <Link
              to="/admin"
              className="mt-6 inline-flex items-center rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-brand-dark"
            >
              Tovább az admin felületre
            </Link>
          </div>
        ) : ready ? (
          <form
            onSubmit={onSubmit}
            className="max-w-md rounded-xl border border-border bg-card p-6"
          >
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Új jelszó
            </h2>
            <label className="mt-4 block text-sm font-medium text-foreground">
              Új jelszó (min. 8 karakter)
              <input
                name="password"
                type="password"
                required
                minLength={8}
                className={inputClass}
              />
            </label>
            <label className="mt-4 block text-sm font-medium text-foreground">
              Új jelszó mégegyszer
              <input
                name="password-confirm"
                type="password"
                required
                minLength={8}
                className={inputClass}
              />
            </label>
            {error ? <p className="mt-4 text-sm text-destructive">{error}</p> : null}
            <button
              type="submit"
              disabled={status === "saving"}
              className="mt-6 inline-flex items-center rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-brand-dark disabled:opacity-60"
            >
              {status === "saving" ? "Mentés…" : "Jelszó mentése"}
            </button>
          </form>
        ) : (
          <div className="max-w-md rounded-xl border border-border bg-card p-6">
            <p className="text-sm text-muted-foreground">
              Ez az oldal a jelszó-visszaállító e-mailben kapott linkről
              érhető el. Ha a link lejárt, kérj újat a{" "}
              <Link to="/admin" className="font-medium text-primary underline-offset-4 hover:underline">
                belépő oldalon
              </Link>{" "}
              az „Elfelejtetted a jelszavad?" opcióval.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
