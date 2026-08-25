import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Cookie, X } from "lucide-react";

const STORAGE_KEY = "xlntbi-cookie-consent-v1";

export type ConsentState = {
  necessary: true;
  statistics: boolean;
  marketing: boolean;
  /** ISO timestamp of the decision */
  date: string;
  version: 1;
};

export function readConsent(): ConsentState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ConsentState;
    if (parsed?.version !== 1) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeConsent(statistics: boolean, marketing: boolean) {
  const state: ConsentState = {
    necessary: true,
    statistics,
    marketing,
    date: new Date().toISOString(),
    version: 1,
  };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* storage blocked – consent stays session-only */
  }
  window.dispatchEvent(new CustomEvent<ConsentState>("xlntbi:cookie-consent", { detail: state }));
  return state;
}

/** Opens the consent panel again (e.g. from a footer link). */
export function openCookieSettings() {
  window.dispatchEvent(new Event("xlntbi:open-cookie-settings"));
}

export function CookieConsent() {
  const [open, setOpen] = useState(false);
  const [details, setDetails] = useState(false);
  const [statistics, setStatistics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    const existing = readConsent();
    if (!existing) {
      setOpen(true);
    } else {
      setStatistics(existing.statistics);
      setMarketing(existing.marketing);
    }
    const reopen = () => {
      const current = readConsent();
      setStatistics(current?.statistics ?? false);
      setMarketing(current?.marketing ?? false);
      setDetails(true);
      setOpen(true);
    };
    window.addEventListener("xlntbi:open-cookie-settings", reopen);
    return () => window.removeEventListener("xlntbi:open-cookie-settings", reopen);
  }, []);

  if (!open) return null;

  const decide = (stats: boolean, mark: boolean) => {
    writeConsent(stats, mark);
    setOpen(false);
    setDetails(false);
  };

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label="Cookie-hozzájárulás"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/98 shadow-[0_-8px_30px_rgba(0,0,0,0.18)] backdrop-blur"
    >
      <div className="mx-auto max-w-6xl px-4 py-3">
        <div className="flex items-start gap-2.5">
          <Cookie className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
          <div className="flex-1">
            <h2 className="text-sm font-semibold text-foreground">
              Cookie-k és adatkezelés
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              A működéshez szükséges cookie-kat mindig használjuk. Statisztikai és marketing
              célú cookie-kat csak a hozzájárulásoddal helyezünk el, és a hozzájárulás bármikor
              visszavonható. Részletek:{" "}
              <Link
                to="/cookie-tajekoztato"
                className="font-medium text-primary underline underline-offset-2"
              >
                Cookie-tájékoztató
              </Link>{" "}
              és{" "}
              <Link
                to="/adatvedelmi-tajekoztato"
                className="font-medium text-primary underline underline-offset-2"
              >
                Adatvédelmi tájékoztató
              </Link>
              .
            </p>

            {details && (
              <div className="mt-3 space-y-2 rounded-lg border border-border bg-muted/40 p-3">
                <label className="flex items-start gap-3 text-sm">
                  <input
                    type="checkbox"
                    checked
                    disabled
                    aria-label="Működéshez szükséges cookie-k (mindig aktív)"
                    className="mt-1 h-4 w-4 accent-primary"
                  />
                  <span>
                    <span className="font-medium text-foreground">
                      Működéshez szükséges
                    </span>{" "}
                    <span className="text-muted-foreground">
                      (mindig aktív) – bejelentkezés, kosár, fizetés, biztonság.
                    </span>
                  </span>
                </label>
                <label className="flex items-start gap-3 text-sm">
                  <input
                    type="checkbox"
                    checked={statistics}
                    onChange={(e) => setStatistics(e.target.checked)}
                    className="mt-1 h-4 w-4 accent-primary"
                  />
                  <span>
                    <span className="font-medium text-foreground">Statisztikai</span>{" "}
                    <span className="text-muted-foreground">
                      – névtelen látogatottsági mérés az oldal fejlesztéséhez.
                    </span>
                  </span>
                </label>
                <label className="flex items-start gap-3 text-sm">
                  <input
                    type="checkbox"
                    checked={marketing}
                    onChange={(e) => setMarketing(e.target.checked)}
                    className="mt-1 h-4 w-4 accent-primary"
                  />
                  <span>
                    <span className="font-medium text-foreground">Marketing</span>{" "}
                    <span className="text-muted-foreground">
                      – hirdetések mérése és személyre szabása.
                    </span>
                  </span>
                </label>
              </div>
            )}

            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => decide(true, true)}
                className="inline-flex items-center justify-center rounded-md bg-primary px-3.5 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Mindet elfogadom
              </button>
              <button
                type="button"
                onClick={() => decide(false, false)}
                className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
              >
                Csak a szükségeseket
              </button>
              {details ? (
                <button
                  type="button"
                  onClick={() => decide(statistics, marketing)}
                  className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
                >
                  Kiválasztottak mentése
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setDetails(true)}
                  className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-foreground underline underline-offset-4 transition-colors hover:text-primary"
                >
                  Beállítások
                </button>
              )}
            </div>
          </div>
          {readConsent() && (
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Panel bezárása"
              className="rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
