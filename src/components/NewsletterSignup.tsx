import { useServerFn } from "@tanstack/react-start";
import { Loader2, MailPlus, X } from "lucide-react";
import { useState } from "react";

const inputClass =
  "mt-1.5 w-full rounded-md border border-input bg-background px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/30";

import { newsletterSubscribe } from "@/lib/newsletter.functions";
import { subscribeSchema } from "@/lib/newsletter-schema";

type Lang = "hu" | "en";

type Dict = {
  triggerButton: string;
  dialogLabel: string;
  closeLabel: string;
  pendingTitle: string;
  alreadyTitle: string;
  pendingBody: string;
  alreadyBody: string;
  noLetter: string;
  checkSpam: string;
  spamFrom: string;
  gmailHeader: string;
  gmailPromo: string;
  gmailSpam: string;
  gmailContacts: string;
  outlookHeader: string;
  outlookBody: string;
  okButton: string;
  formTitle: string;
  formIntro: string;
  lastName: string;
  firstName: string;
  email: string;
  phone: string;
  company: string;
  privacy: string;
  privacyPolicy: string;
  readIt: string;
  subscribeButton: string;
  parseError: string;
  sendError: string;
};

const HU: Dict = {
  triggerButton: "Hírlevél feliratkozás",
  dialogLabel: "Hírlevél feliratkozás",
  closeLabel: "Bezárás",
  pendingTitle: "Már csak egy kattintás",
  alreadyTitle: "Már fel vagy iratkozva",
  pendingBody:
    "Küldtem egy megerősítő levelet a megadott e-mail címre. Kattints benne a megerősítő linkre, és onnantól megkapod a hírlevelet.",
  alreadyBody:
    "Ez az e-mail cím már megerősített feliratkozó, így nincs több teendőd.",
  noLetter: "Nem kaptál levelet 1–2 percen belül?",
  checkSpam:
    "Ellenőrizd a Levélszemét (Spam) mappában is. A levelek a noreply@notify.xlntbi.hu címről érkeznek.",
  spamFrom: "noreply@notify.xlntbi.hu",
  gmailHeader: "Gmail esetén",
  gmailPromo:
    "Ha a Promóciók vagy Köösségi fülön van, húzd át a levelet az Elsődleges fülre, és a felugró kérdésnél válaszd az „Igen”-t, hogy a további levelek is ide kerüljenek.",
  gmailSpam:
    "Ha a Spamben landolt, nyisd meg és kattints a „Nem spam” gombra.",
  gmailContacts:
    "Nyisd meg a levelet, a feladó neve melletti három pontnál válaszd a „Feladó hozzáadása a névjegyekhez” lehetőséget – így a Gmail megbízható feladóként kezeli.",
  outlookHeader: "Outlook / más levelező esetén",
  outlookBody:
    "Vedd fel a noreply@notify.xlntbi.hu címet a Megbízható feladók (Biztonságos feladók) listájára, hogy a későbbi hírlevelek biztosan megérkezzenek.",
  okButton: "Rendben",
  formTitle: "Hírlevél feliratkozás",
  formIntro:
    "Havonta legfeljebb néhány levél: jogszabályi változások, új Excel-eszközök, határidők. Bármikor leiratkozhatsz egy kattintással.",
  lastName: "Vezetéknév *",
  firstName: "Keresztnév *",
  email: "E-mail cím *",
  phone: "Telefonszám",
  company: "Cégnév",
  privacy:
    "Hozzájárulok, hogy a megadott adataimat hírlevél küldése céljából kezeljék. Az",
  privacyPolicy: "adatvédelmi tájékoztatót",
  readIt: "elolvastam. *",
  subscribeButton: "Feliratkozom",
  parseError: "Kérlek, ellenőrizd a megadott adatokat.",
  sendError: "A feliratkozás most nem sikerült. Kérlek, próbáld újra kicsit később.",
};

const EN: Dict = {
  triggerButton: "Newsletter signup",
  dialogLabel: "Newsletter signup",
  closeLabel: "Close",
  pendingTitle: "Just one more click",
  alreadyTitle: "You're already subscribed",
  pendingBody:
    "I've sent a confirmation email to the address you provided. Click the confirmation link inside it and you'll start receiving the newsletter.",
  alreadyBody:
    "This email address is already a confirmed subscriber, so there's nothing else to do.",
  noLetter: "Didn't get the email within 1–2 minutes?",
  checkSpam:
    "Check your Spam (Junk) folder too. The emails arrive from noreply@notify.xlntbi.hu.",
  spamFrom: "noreply@notify.xlntbi.hu",
  gmailHeader: "If you use Gmail",
  gmailPromo:
    "If it lands under the Promotions or Social tab, drag it to the Primary tab and choose “Yes” in the popup so future emails arrive there too.",
  gmailSpam:
    "If it ended up in Spam, open it and click the “Not spam” button.",
  gmailContacts:
    "Open the email, click the three dots next to the sender's name and choose “Add sender to contacts” so Gmail treats it as a trusted sender.",
  outlookHeader: "If you use Outlook / other clients",
  outlookBody:
    "Add noreply@notify.xlntbi.hu to your Safe senders list so future newsletters are delivered reliably.",
  okButton: "OK",
  formTitle: "Newsletter signup",
  formIntro:
    "At most a few emails per month: regulatory changes, new Excel tools, deadlines. You can unsubscribe anytime with one click.",
  lastName: "Last name *",
  firstName: "First name *",
  email: "Email address *",
  phone: "Phone number",
  company: "Company name",
  privacy:
    "I consent to my data being processed for the purpose of sending the newsletter. I have read the",
  privacyPolicy: "privacy policy",
  readIt: ". *",
  subscribeButton: "Subscribe",
  parseError: "Please check the details you entered.",
  sendError: "Subscription failed right now. Please try again a little later.",
};

/**
 * Newsletter sign-up with double opt-in: the form only stores a pending
 * subscriber, the confirmation email finishes the process.
 */
export function NewsletterSignup({ lang = "hu" }: { lang?: Lang }) {
  const t = lang === "en" ? EN : HU;
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
      setError(parsed.error.issues[0]?.message ?? t.parseError);
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
      setError(t.sendError);
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
        {t.triggerButton}
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-foreground/60 p-4 py-10"
          role="dialog"
          aria-modal="true"
          aria-label={t.dialogLabel}
        >
          <div className="relative w-full max-w-lg rounded-2xl border border-border bg-background p-6 shadow-xl">
            <button
              type="button"
              onClick={close}
              className="absolute right-4 top-4 rounded-md p-1 text-muted-foreground transition hover:bg-muted"
              aria-label={t.closeLabel}
            >
              <X className="h-5 w-5" />
            </button>

            {done ? (
              <div className="pt-4">
                <h2 className="text-xl font-semibold text-foreground">
                  {done === "pending" ? t.pendingTitle : t.alreadyTitle}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {done === "pending" ? t.pendingBody : t.alreadyBody}
                </p>
                {done === "pending" ? (
                  <div className="mt-4 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3.5 text-sm leading-relaxed text-amber-200">
                    <p className="font-semibold text-amber-100">
                      {t.noLetter}
                    </p>
                    <p className="mt-1.5">
                      {t.checkSpam}
                    </p>
                    <p className="mt-2 font-semibold text-amber-100">{t.gmailHeader}</p>
                    <ul className="mt-1 list-disc space-y-1 pl-5">
                      <li>{t.gmailPromo}</li>
                      <li>{t.gmailSpam}</li>
                      <li>{t.gmailContacts}</li>
                    </ul>
                    <p className="mt-2 font-semibold text-amber-100">
                      {t.outlookHeader}
                    </p>
                    <p className="mt-1">
                      {t.outlookBody}
                    </p>

                  </div>
                ) : null}
                <button
                  type="button"
                  onClick={close}
                  className="mt-6 inline-flex items-center rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
                >
                  {t.okButton}
                </button>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="space-y-4">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">{t.formTitle}</h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {t.formIntro}
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block text-sm">
                    <span className="font-medium text-foreground">{t.lastName}</span>
                    <input name="lastName" required maxLength={80} className={inputClass} />
                  </label>
                  <label className="block text-sm">
                    <span className="font-medium text-foreground">{t.firstName}</span>
                    <input name="firstName" required maxLength={80} className={inputClass} />
                  </label>
                </div>

                <label className="block text-sm">
                  <span className="font-medium text-foreground">{t.email}</span>
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
                    <span className="font-medium text-foreground">{t.phone}</span>
                    <input name="phone" maxLength={30} className={inputClass} />
                  </label>
                  <label className="block text-sm">
                    <span className="font-medium text-foreground">{t.company}</span>
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
                    {t.privacy}{" "}
                    <a href={lang === "en" ? "/en/privacy-policy" : "/adatvedelmi-tajekoztato"} className="text-primary underline">
                      {t.privacyPolicy}
                    </a>{" "}
                    {t.readIt}
                  </span>
                </label>

                {error ? <p className="text-sm text-destructive">{error}</p> : null}

                <button
                  type="submit"
                  disabled={sending}
                  className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
                >
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {t.subscribeButton}
                </button>
              </form>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
