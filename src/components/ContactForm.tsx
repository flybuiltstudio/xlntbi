import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { submitContactForm } from "@/lib/contact.functions";
import { useLocalPath, useT } from "@/lib/i18n";

type Props = {
  formType: "kapcsolat" | "konzultacio";
  serviceOptions?: string[];
  serviceLabel?: string;
  showCompany?: boolean;
  contactMethodOptions?: string[];
  contactTimeOptions?: string[];
  messageLabel?: string;
  submitLabel?: string;
  defaultMessage?: string;
  allTimeLabel?: string;
  emailMethodLabel?: string;
};

const inputClass =
  "mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-ring/40";

export function ContactForm({
  formType,
  serviceOptions,
  serviceLabel,
  showCompany = false,
  contactMethodOptions,
  contactTimeOptions,
  messageLabel,
  submitLabel,
  defaultMessage = "",
  allTimeLabel = "Bármikor",
  emailMethodLabel = "E-mailben",
}: Props) {
  const t = useT();
  const localPath = useLocalPath();
  const ALL_MARKER = allTimeLabel;
  const resolvedServiceLabel = serviceLabel ?? t("form.serviceLabel");
  const resolvedMessageLabel = messageLabel ?? t("form.message");
  const resolvedSubmitLabel = submitLabel ?? t("form.submit");

  const submit = useServerFn(submitContactForm);
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [contactMethod, setContactMethod] = useState("");
  const [contactTimes, setContactTimes] = useState<string[]>([]);

  // E-mail contact doesn't need a time window — disable the whole "Mikor kereshetem?" block.
  const emailOnly = contactMethod === emailMethodLabel;

  // Time-only options: everything except "Bármikor".
  const timeOnly = (contactTimeOptions ?? []).filter((o) => o !== ALL_MARKER);

  function toggleContactTime(option: string, checked: boolean) {
    setContactTimes((prev) => {
      if (option === ALL_MARKER && checked) {
        // Checking "Bármikor" checks all time options (and itself).
        return Array.from(new Set([...timeOnly, ALL_MARKER]));
      }
      if (option === ALL_MARKER && !checked) {
        // Unchecking "Bármikor" clears all time options.
        return [];
      }
      // Toggling a time option: if all are selected, mark "Bármikor"; otherwise unmark it.
      const next = checked
        ? Array.from(new Set([...prev, option]))
        : prev.filter((o) => o !== option);
      const allTimeChecked = timeOnly.every((o) => next.includes(o));
      if (allTimeChecked) {
        return Array.from(new Set([...next, ALL_MARKER]));
      }
      return next.filter((o) => o !== ALL_MARKER);
    });
  }

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
          taxNumber: String(fd.get("taxNumber") ?? ""),
          message: String(fd.get("message") ?? ""),
          services: fd.getAll("services").map(String),
          contactMethod: String(fd.get("contactMethod") ?? ""),
          contactTime: contactTimes,
          privacyConsent: fd.get("privacyConsent") === "on",
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
        t("form.genericError"),
      );
    }
  }

  if (status === "done") {
    return (
      <div className="rounded-xl border border-primary/30 bg-primary/5 p-8">
        <h2 className="text-xl font-semibold text-foreground">{t("form.thanksTitle")}</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{t("form.thanksText")}</p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-6 inline-flex items-center rounded-md border border-input px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-accent"
        >
          {t("form.newMessage")}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="rounded-xl border border-border bg-card p-6 md:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block text-sm font-medium text-foreground">
          {t("form.lastName")} *
          <input name="lastName" required minLength={2} maxLength={80} className={inputClass} />
        </label>
        <label className="block text-sm font-medium text-foreground">
          {t("form.firstName")} *
          <input name="firstName" required minLength={2} maxLength={80} className={inputClass} />
        </label>
        <label className="block text-sm font-medium text-foreground">
          {t("form.email")} *
          <input name="email" type="email" required maxLength={160} className={inputClass} />
        </label>
        <label className="block text-sm font-medium text-foreground">
          {t("form.phone")} *
          <input
            name="phone"
            type="tel"
            required
            minLength={6}
            maxLength={30}
            className={inputClass}
          />
        </label>
        {showCompany ? (
          <>
            <label className="block text-sm font-medium text-foreground">
              {t("form.company")}
              <input
                name="company"
                maxLength={160}
                placeholder={t("form.optional")}
                className={inputClass}
              />
            </label>
            <label className="block text-sm font-medium text-foreground">
              {t("form.taxNumber")}
              <input
                name="taxNumber"
                maxLength={32}
                inputMode="numeric"
                placeholder={t("form.optional")}
                className={inputClass}
              />
            </label>
          </>
        ) : null}
      </div>

      {serviceOptions?.length ? (
        <fieldset className="mt-6">
          <legend className="text-sm font-medium text-foreground">{resolvedServiceLabel}</legend>
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
          <legend className="text-sm font-medium text-foreground">{t("form.howReach")}</legend>
          <div className="mt-3 flex flex-wrap gap-4">
            {contactMethodOptions.map((option) => (
              <label key={option} className="flex items-center gap-2 text-sm text-muted-foreground">
                <input
                  type="radio"
                  name="contactMethod"
                  value={option}
                  checked={contactMethod === option}
                  onChange={(e) => {
                    setContactMethod(e.target.value);
                    // Selecting e-mail contact clears any chosen time window.
                    if (e.target.value === emailMethodLabel) {
                      setContactTimes([]);
                    }
                  }}
                  className="h-4 w-4 accent-[var(--color-primary)]"
                />
                {option}
              </label>
            ))}
          </div>
        </fieldset>
      ) : null}

      {contactTimeOptions?.length ? (
        <fieldset className="mt-6">
          <div className="flex items-center gap-4">
            <legend className="text-sm font-medium text-foreground">{t("form.whenReach")}</legend>
            {contactTimeOptions.includes(ALL_MARKER) ? (
              <label
                className={`flex items-center gap-2 text-sm text-muted-foreground ${emailOnly ? "cursor-not-allowed opacity-50" : ""}`}
              >
                <input
                  type="checkbox"
                  name="contactTime"
                  value={ALL_MARKER}
                  checked={contactTimes.includes(ALL_MARKER)}
                  onChange={(e) => toggleContactTime(ALL_MARKER, e.target.checked)}
                  disabled={emailOnly}
                  className="h-4 w-4 accent-[var(--color-primary)]"
                />
                {ALL_MARKER}
              </label>
            ) : null}
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {timeOnly.map((option) => (
              <label
                key={option}
                className={`flex items-start gap-2.5 text-sm text-muted-foreground ${emailOnly ? "cursor-not-allowed opacity-50" : ""}`}
              >
                <input
                  type="checkbox"
                  name="contactTime"
                  value={option}
                  checked={contactTimes.includes(option)}
                  onChange={(e) => toggleContactTime(option, e.target.checked)}
                  disabled={emailOnly}
                  className="mt-0.5 h-4 w-4 accent-[var(--color-primary)]"
                />
                {option}
              </label>
            ))}
          </div>
        </fieldset>
      ) : null}

      <label className="mt-6 block text-sm font-medium text-foreground">

        {resolvedMessageLabel} *
        <textarea
          name="message"
          required
          minLength={5}
          maxLength={4000}
          rows={6}
          defaultValue={defaultMessage}
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

      <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-md border border-border bg-background p-3.5 text-xs leading-relaxed text-muted-foreground">
        <input
          type="checkbox"
          name="privacyConsent"
          required
          className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--color-primary)]"
        />
        <span>
          {t("form.privacy")}{" "}
          <a
            href={localPath("/adatvedelmi-tajekoztato")}
            target="_blank"
            rel="noreferrer"
            className="underline hover:text-foreground"
          >
            {t("form.privacyLink")}
          </a>
          . *
        </span>
      </label>

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
        {status === "sending" ? t("form.sending") : resolvedSubmitLabel}
      </button>
    </form>
  );
}
