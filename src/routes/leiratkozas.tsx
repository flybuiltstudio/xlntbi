import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";

import { PageHero } from "@/components/PageHero";
import { newsletterUnsubscribe } from "@/lib/newsletter.functions";

const TITLE = "Leiratkozás a hírlevélről | EXCELlent Business Intelligence";
const DESCRIPTION =
  "Leiratkozás az xlntbi.hu hírlevélről egyetlen kattintással, azonnali hatállyal.";

export const Route = createFileRoute("/leiratkozas")({
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
  component: UnsubscribePage,
});

function UnsubscribePage() {
  const { token } = useSearch({ from: "/leiratkozas" });
  const unsubscribe = useServerFn(newsletterUnsubscribe);
  const [state, setState] = useState<"idle" | "sending" | "ok" | "error">("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setState("error");
      setError("Hiányzó azonosító. Kérlek, a hírlevélben lévő leiratkozó linkre kattints.");
    }
  }, [token]);

  async function onClick() {
    setState("sending");
    try {
      const result = await unsubscribe({ data: { token } });
      if (!result.ok) {
        setState("error");
        setError(result.error);
        return;
      }
      setState("ok");
    } catch {
      setState("error");
      setError("A leiratkozás most nem sikerült. Kérlek, próbáld újra kicsit később.");
    }
  }

  return (
    <>
      <PageHero>
        <h1 className="text-3xl font-bold text-primary-foreground md:text-4xl">Leiratkozás</h1>
      </PageHero>
      <div className="mx-auto max-w-2xl px-4 py-16">
        {state === "ok" ? (
          <>
            <h2 className="text-xl font-semibold text-foreground">Leiratkoztál</h2>
            <p className="mt-3 text-base leading-relaxed text-muted-foreground">
              Nem küldök több hírlevelet erre a címre. Ha később mégis szeretnéd, a Kapcsolat
              oldalon bármikor újra feliratkozhatsz.
            </p>
          </>
        ) : state === "error" ? (
          <>
            <h2 className="text-xl font-semibold text-foreground">Nem sikerült a leiratkozás</h2>
            <p className="mt-3 text-base leading-relaxed text-muted-foreground">{error}</p>
          </>
        ) : (
          <>
            <h2 className="text-xl font-semibold text-foreground">
              Biztosan leiratkozol a hírlevélről?
            </h2>
            <p className="mt-3 text-base leading-relaxed text-muted-foreground">
              A megerősítés után azonnal törlöm a címedet a hírlevél listáról.
            </p>
            <button
              type="button"
              onClick={() => void onClick()}
              disabled={state === "sending"}
              className="mt-6 inline-flex items-center rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
            >
              {state === "sending" ? "Leiratkozás…" : "Igen, leiratkozom"}
            </button>
          </>
        )}
        <div className="mt-8">
          <Link to="/" className="text-sm text-primary underline">
            Vissza a főoldalra
          </Link>
        </div>
      </div>
    </>
  );
}
