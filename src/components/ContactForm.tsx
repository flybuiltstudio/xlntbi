import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { submitContactForm } from "@/lib/contact.functions";

type Props = {
  formType: "kapcsolat" | "konzultacio";
  serviceOptions?: string[];
  contactMethodOptions?: string[];
  contactTimeOptions?: string[];
  messageLabel?: string;
  submitLabel?: string;
};

const inputClass =
  "mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-ring/40";

export function ContactForm({
  formType,
  serviceOptions,
  contactMethodOptions,
  contactTimeOptions,
  messageLabel = "Miben segíthetek?",
  submitLabel = "Küldés",
}: Props) {
  const submit = useServerFn(submitContactForm);
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const fd = new FormData(form);
    setStatus("sending");
    setErrorMessage("");

    try {
      const result = await submit({
        data: {
          formType,
          lastName: String(fd.get("lastName") ?? ""),
          firstName: String(fd.get("firstName") ?? ""),
          email: String(fd.get("email") ?? ""),
          phone: String(fd.get("phone") ?? ""),
          company: String(fd.get("company") ?? ""),
          message: String(fd.get("message") ?? ""),
          services: fd.getAll("services").map(String),
          contactMethod: String(fd.get("contactMethod") ?? ""),
          contactTime: String(fd.get("contactTime") ?? ""),
          website: String(fd.get("website") ?? ""),
        },
      });

      if (result.ok) {
        setStatus("done");
        form.reset();
      } else {
        setStatus("error");
        setErrorMessage(result.error);
      }
    } catch {
      setStatus("error");
      setErrorMessage(
        "Az űrlap beküldése nem sikerült. Kérlek, ellenőrizd a megadott adatokat, vagy írj a info@xlntbi.hu címre.",
      );
    }
  }

  if (status === "done") {
    return (
      <div className="rounded-xl border border-primary/30 bg-primary/5 p-8">
        <h2 className="text-xl font-semibold text-foreground">Köszönöm a megkeresésedet!</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Az üzenetedet megkaptam, és visszaigazoló e-mailt küldtem a megadott címre. Rövid időn
          belül felveszem veled a kapcsolatot.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-6 inline-flex items-center rounded-md border border-input px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-accent"
        >
          Új üzenet írása
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="rounded-xl border border-border bg-card p-6 md:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block text-sm font-medium text-foreground">
          Vezetéknév *
          <input name="lastName" required minLength={2} maxLength={80} className={inputClass} />
        </label>
        <label className="block text-sm font-medium text-foreground">
          Keresztnév *
          <input name="firstName" required minLength={2} maxLength={80} className={inputClass} />
        </label>
        <label className="block text-sm font-medium text-foreground">
          E-mail *
          <input name="email" type="email" required maxLength={160} className={inputClass} />
        </label>
        <label className="block text-sm font-medium text-foreground">
          Telefonszám *
          <input
            name="phone"
            type="tel"
            required
            minLength={6}
            maxLength={30}
            className={inputClass}
          />
        </label>
        <label className="block text-sm font-medium text-foreground sm:col-span-2">
          Cégnév
          <input name="company" maxLength={160} className={inputClass} />
        </label>
      </div>

      {serviceOptions?.length ? (
        <fieldset className="mt-6">
          <legend className="text-sm font-medium text-foreground">
            Milyen szolgáltatás érdekel?
          </legend>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {serviceOptions.map((option) => (
              <label
                key={option}
                className="flex items-start gap-2.5 text-sm text-muted-foreground"
              >
                <input
                  type="checkbox"
                  name="services"
                  value={option}
                  className="mt-0.5 h-4 w-4 accent-[var(--color-primary)]"
                />
                {option}
              </label>
            ))}
          </div>
        </fieldset>
      ) : null}

      {contactMethodOptions?.length ? (
        <fieldset className="mt-6">
          <legend className="text-sm font-medium text-foreground">Hogyan kereshetem?</legend>
          <div className="mt-3 flex flex-wrap gap-4">
            {contactMethodOptions.map((option) => (
              <label key={option} className="flex items-center gap-2 text-sm text-muted-foreground">
                <input
                  type="radio"
                  name="contactMethod"
                  value={option}
                  className="h-4 w-4 accent-[var(--color-primary)]"
                />
                {option}
              </label>
            ))}
          </div>
        </fieldset>
      ) : null}

      {contactTimeOptions?.length ? (
        <label className="mt-6 block text-sm font-medium text-foreground">
          Mikor kereshetem?
          <select name="contactTime" defaultValue="" className={inputClass}>
            <option value="">Kérlek, válassz</option>
            {contactTimeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      ) : null}

      <label className="mt-6 block text-sm font-medium text-foreground">
        {messageLabel} *
        <textarea
          name="message"
          required
          minLength={5}
          maxLength={4000}
          rows={6}
          className={inputClass}
        />
      </label>

      {/* Honeypot – rejtett spamcsapda, ne töltsd ki */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <p className="mt-6 text-xs leading-relaxed text-muted-foreground">
        Az űrlap elküldésével elfogadod, hogy a megadott adatokat a megkeresés megválaszolása
        céljából kezelem. Részletek az{" "}
        <a href="/adatvedelmi-tajekoztato" className="underline hover:text-foreground">
          Adatvédelmi tájékoztatóban
        </a>
        .
      </p>

      {status === "error" ? (
        <p className="mt-4 rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {errorMessage}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={status === "sending"}
        className="mt-6 inline-flex items-center rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-brand-dark disabled:opacity-60"
      >
        {status === "sending" ? "Küldés…" : submitLabel}
      </button>
    </form>
  );
}
