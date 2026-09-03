import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";

import { PageHero } from "@/components/PageHero";
import { newsletterConfirm } from "@/lib/newsletter.functions";

const TITLE = "Hírlevél megerősítése | EXCELlent Business Intelligence";
const DESCRIPTION =
  "A hírlevél-feliratkozás megerősítése. Egy kattintás után megkapod a jogszabályi változásokról és új Excel-eszközökről szóló leveleket.";

export const Route = createFileRoute("/hirlevel-megerosites")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, follow" },
    ],
  }),
  validateSearch: (search: Record<string, unknown>) => ({
    token: typeof search["token"] === "string" ? search["token"] : "",
  }),
  component: ConfirmPage,
});

function ConfirmPage() {
  const { token } = useSearch({ from: "/hirlevel-megerosites" });
  const confirm = useServerFn(newsletterConfirm);
  const [state, setState] = useState<"loading" | "ok" | "already" | "error">("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setState("error");
      setError("Hiányzó megerősítő azonosító. Kérlek, a levélben lévő linkre kattints.");
      return;
    }
    let active = true;
    void (async () => {
      try {
        const result = await confirm({ data: { token } });
        if (!active) return;
        if (!result.ok) {
          setState("error");
          setError(result.error);
          return;
        }
        setState(result.already ? "already" : "ok");
      } catch {
        if (active) {
          setState("error");
          setError("A megerősítés most nem sikerült. Kérlek, próbáld újra kicsit később.");
        }
      }
    })();
    return () => {
      active = false;
    };
  }, [confirm, token]);

  return (
    <>
      <PageHero>
        <h1 className="text-3xl font-bold text-primary-foreground md:text-4xl">
          Hírlevél megerősítése
        </h1>
      </PageHero>
      <div className="mx-auto max-w-2xl px-4 py-16">
        {state === "loading" ? (
          <p className="text-base text-muted-foreground">Egy pillanat, ellenőrzöm a linket…</p>
        ) : state === "error" ? (
          <>
            <h2 className="text-xl font-semibold text-foreground">Nem sikerült a megerősítés</h2>
            <p className="mt-3 text-base leading-relaxed text-muted-foreground">{error}</p>
          </>
        ) : (
          <>
            <h2 className="text-xl font-semibold text-foreground">
              {state === "ok" ? "Kész, sikeres feliratkozás!" : "Ez a feliratkozás már aktív"}
            </h2>
            <p className="mt-3 text-base leading-relaxed text-muted-foreground">
              {state === "ok" ?
                "Mostantól megkapod a hírlevelet. Minden levél alján találsz egy leiratkozó linket, amivel bármikor kiléphetsz."
              : "Nincs több teendőd, a címed már szerepel a hírlevél listán."}
            </p>
          </>
        )}
        <Link
          to="/"
          className="mt-8 inline-flex items-center rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
        >
          Vissza a főoldalra
        </Link>
      </div>
    </>
  );
}
