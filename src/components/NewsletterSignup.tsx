import { useServerFn } from "@tanstack/react-start";
import { Loader2, MailPlus, X } from "lucide-react";
import { useState } from "react";

const inputClass =
  "mt-1.5 w-full rounded-md border border-input bg-background px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/30";

import { newsletterSubscribe } from "@/lib/newsletter.functions";
import { subscribeSchema } from "@/lib/newsletter-schema";

/**
 * Newsletter sign-up with double opt-in: the form only stores a pending
 * subscriber, the confirmation email finishes the process.
 */
export function NewsletterSignup() {
  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<"pending" | "already" | null>(null);
  const subscribe = useServerFn(newsletterSubscribe);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    const parsed = subscribeSchema.safeParse({
      lastName: String(form.get("lastName") ?? ""),
      firstName: String(form.get("firstName") ?? ""),
      email: String(form.get("email") ?? ""),
      phone: String(form.get("phone") ?? ""),
      company: String(form.get("company") ?? ""),
      privacyConsent: form.get("privacyConsent") === "on",
      website: String(form.get("website") ?? ""),
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Kérlek, ellenőrizd a megadott adatokat.");
      return;
    }
    setSending(true);
    try {
      const result = await subscribe({ data: parsed.data });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setDone(result.pending ? "pending" : "already");
    } catch {
      setError("A feliratkozás most nem sikerült. Kérlek, próbáld újra kicsit később.");
    } finally {
      setSending(false);
    }
  }

  function close() {
    setOpen(false);
    setDone(null);
    setError("");
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
      >
        <MailPlus className="h-4 w-4" aria-hidden="true" />
        Hírlevél feliratkozás
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-foreground/60 p-4 py-10"
          role="dialog"
          aria-modal="true"
          aria-label="Hírlevél feliratkozás"
        >
          <div className="relative w-full max-w-lg rounded-2xl border border-border bg-background p-6 shadow-xl">
            <button
              type="button"
              onClick={close}
              className="absolute right-4 top-4 rounded-md p-1 text-muted-foreground transition hover:bg-muted"
              aria-label="Bezárás"
            >
              <X className="h-5 w-5" />
            </button>

            {done ? (
              <div className="pt-4">
                <h2 className="text-xl font-semibold text-foreground">
                  {done === "pending" ? "Már csak egy kattintás" : "Már fel vagy iratkozva"}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {done === "pending" ?
                    "Küldtem egy megerősítő levelet a megadott e-mail címre. Kattints benne a megerősítő linkre, és onnantól megkapod a hírlevelet."
                  : "Ez az e-mail cím már megerősített feliratkozó, így nincs több teendőd."}
                </p>
                <button
                  type="button"
                  onClick={close}
                  className="mt-6 inline-flex items-center rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
                >
                  Rendben
                </button>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="space-y-4">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">Hírlevél feliratkozás</h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Havonta legfeljebb néhány levél: jogszabályi változások, új Excel-eszközök,
                    határidők. Bármikor leiratkozhatsz egy kattintással.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block text-sm">
                    <span className="font-medium text-foreground">Vezetéknév *</span>
                    <input name="lastName" required maxLength={80} className={inputClass} />
                  </label>
                  <label className="block text-sm">
                    <span className="font-medium text-foreground">Keresztnév *</span>
                    <input name="firstName" required maxLength={80} className={inputClass} />
                  </label>
                </div>

                <label className="block text-sm">
                  <span className="font-medium text-foreground">E-mail cím *</span>
                  <input
                    name="email"
                    type="email"
                    required
                    maxLength={160}
                    className={inputClass}
                  />
                </label>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block text-sm">
                    <span className="font-medium text-foreground">Telefonszám</span>
                    <input name="phone" maxLength={30} className={inputClass} />
                  </label>
                  <label className="block text-sm">
                    <span className="font-medium text-foreground">Cégnév</span>
                    <input name="company" maxLength={160} className={inputClass} />
                  </label>
                </div>

                {/* Honeypot – hidden from humans. */}
                <input
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  className="hidden"
                />

                <label className="flex items-start gap-3 text-sm text-muted-foreground">
                  <input name="privacyConsent" type="checkbox" required className="mt-1" />
                  <span>
                    Hozzájárulok, hogy a megadott adataimat hírlevél küldése céljából kezeljék. Az{" "}
                    <a href="/adatvedelmi-tajekoztato" className="text-primary underline">
                      adatvédelmi tájékoztatót
                    </a>{" "}
                    elolvastam. *
                  </span>
                </label>

                {error ? <p className="text-sm text-destructive">{error}</p> : null}

                <button
                  type="submit"
                  disabled={sending}
                  className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
                >
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Feliratkozom
                </button>
              </form>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
