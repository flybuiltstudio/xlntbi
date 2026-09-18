import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { z } from "zod";

import { submitFreeDownload } from "@/lib/free-download.functions";
import { getProduct } from "@/lib/products";

const searchSchema = z.object({ termek: z.string(), lang: z.enum(["hu", "en"]).optional() });

export const Route = createFileRoute("/ingyenes-letoltes")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Ingyenes kiadvány letöltése | XLNT BI" },
      { name: "description", content: "Ingyenes XLNT BI Tudástár-kiadvány igénylése védett letöltési linkkel." },
      { property: "og:title", content: "Ingyenes kiadvány letöltése | XLNT BI" },
      { property: "og:description", content: "Ingyenes Tudástár-kiadvány igénylése." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, follow" },
    ],
  }),
  component: FreeDownloadPage,
});

const inputClass = "mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring/40";

function FreeDownloadPage() {
  const { termek, lang } = Route.useSearch();
  const english = lang === "en";
  const product = getProduct(termek);
  const submit = useServerFn(submitFreeDownload);
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");

  if (!product || product.price !== 0) {
    return <div className="mx-auto max-w-2xl px-4 py-20"><h1 className="text-3xl font-bold text-foreground">{english ? "Publication not found" : "A kiadvány nem található"}</h1></div>;
  }
  if (state === "done") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20">
        <h1 className="text-3xl font-bold text-foreground">{english ? "Your download link is on its way" : "A letöltési link úton van"}</h1>
        <p className="mt-4 text-muted-foreground">{english ? "Check your inbox. The protected link is valid for 14 days." : "Nézd meg a postafiókodat. A védett link 14 napig érvényes."}</p>
        <Link to={english ? "/en/products" : "/termekeim"} className="mt-8 inline-flex rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground">{english ? "Back to products" : "Vissza a termékekhez"}</Link>
      </div>
    );
  }
  return (
    <div className="mx-auto max-w-2xl px-4 py-14">
      <h1 className="text-3xl font-bold text-foreground md:text-4xl">{english ? "Download the free publication" : "Ingyenes kiadvány letöltése"}</h1>
      <p className="mt-4 text-base leading-relaxed text-muted-foreground">{product.name}</p>
      <form className="mt-8 rounded-lg border border-border bg-card p-6 md:p-8" onSubmit={async (event) => {
        event.preventDefault(); setState("sending"); setError("");
        const fd = new FormData(event.currentTarget);
        try {
          const result = await submit({ data: { productSlug: product.slug, name: String(fd.get("name") ?? ""), email: String(fd.get("email") ?? ""), phone: String(fd.get("phone") ?? ""), website: String(fd.get("website") ?? ""), acceptPrivacy: true } });
          if (result.ok) setState("done"); else { setError(result.error); setState("error"); }
        } catch { setError(english ? "The request could not be submitted." : "Az igénylést nem sikerült elküldeni."); setState("error"); }
      }}>
        <label className="block text-sm font-medium text-foreground">{english ? "Name *" : "Név *"}<input name="name" required minLength={2} maxLength={160} className={inputClass} /></label>
        <label className="mt-5 block text-sm font-medium text-foreground">{english ? "Email *" : "E-mail *"}<input name="email" type="email" required maxLength={160} className={inputClass} /></label>
        <label className="mt-5 block text-sm font-medium text-foreground">{english ? "Phone" : "Telefonszám"}<input name="phone" type="tel" maxLength={30} className={inputClass} /></label>
        <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden"><input name="website" tabIndex={-1} autoComplete="off" /></div>
        <label className="mt-6 flex items-start gap-2.5 text-sm text-muted-foreground"><input type="checkbox" required className="mt-0.5 h-4 w-4 accent-[var(--color-primary)]" /><span>{english ? "I have read the " : "Megismertem az "}<a href="/adatvedelmi-tajekoztato" className="underline hover:text-foreground">{english ? "privacy notice" : "Adatvédelmi tájékoztatót"}</a>. *</span></label>
        {state === "error" ? <p className="mt-5 text-sm font-semibold text-destructive">{error}</p> : null}
        <button type="submit" disabled={state === "sending"} className="mt-7 inline-flex rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60">{state === "sending" ? (english ? "Sending…" : "Küldés…") : (english ? "Send download link" : "Letöltési link kérése")}</button>
      </form>
    </div>
  );
}