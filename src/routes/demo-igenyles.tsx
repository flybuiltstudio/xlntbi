import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { z } from "zod";

import { submitDemoRequest } from "@/lib/demo-request.functions";
import { getProduct } from "@/lib/products";
import { handleHwidDownload } from "@/lib/hwid-download";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";

const searchSchema = z.object({ termek: z.string() });

export const Route = createFileRoute("/demo-igenyles")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "DEMO licenc igénylése | XLNT BI" },
      {
        name: "description",
        content: "Próbáld ki az XLNT BI szoftvert fizetés nélkül, korlátozott ideig.",
      },
      { property: "og:title", content: "DEMO licenc igénylése | XLNT BI" },
      { property: "og:description", content: "Fizetés nélküli DEMO licenc igénylése." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, follow" },
    ],
  }),
  component: DemoRequestPage,
});

const inputClass =
  "mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring/40";

function DemoRequestPage() {
  const { termek } = Route.useSearch();
  const product = getProduct(termek);
  const submit = useServerFn(submitDemoRequest);
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");

  if (!product || product.price === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20">
        <h1 className="text-3xl font-bold text-foreground">A termék nem található</h1>
        <Link to="/termekeim" className="mt-6 inline-flex rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground">
          Vissza a termékekhez
        </Link>
      </div>
    );
  }

  if (state === "done") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20">
        <h1 className="text-3xl font-bold text-foreground">DEMO letöltési link úton van</h1>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
          Nézd meg a postafiókodat. A védett letöltési link 7 napig érvényes, és legfeljebb 5
          alkalommal használható. A letöltés után indítsd el a programot, küldd el a gépazonosítót,
          és küldök egy DEMO licenszkódot.
        </p>
        <Link
          to="/termekeim"
          className="mt-8 inline-flex rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
        >
          Vissza a termékekhez
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-14">
      <h1 className="text-3xl font-bold text-foreground md:text-4xl">DEMO licenc igénylése</h1>
      <p className="mt-4 text-base leading-relaxed text-muted-foreground">
        Próbáld ki a(z) <strong className="text-foreground">{product.name}</strong> szoftvert
        fizetés nélkül, korlátozott ideig. A DEMO teljes verzió, csak a használati idő van
        lekorlátozva. A letöltési linket e-mailben kapod meg.
      </p>

      <form
        className="mt-8 rounded-lg border border-border bg-card p-6 md:p-8"
        onSubmit={async (event) => {
          event.preventDefault();
          setState("sending");
          setError("");
          const fd = new FormData(event.currentTarget);
          try {
            const result = await submit({
              data: {
                productSlug: product.slug,
                name: String(fd.get("name") ?? ""),
                email: String(fd.get("email") ?? ""),
                phone: String(fd.get("phone") ?? ""),
                hwid: String(fd.get("hwid") ?? ""),
                testUntil: String(fd.get("testUntil") ?? "") || null,
                website: String(fd.get("website") ?? ""),
                acceptPrivacy: true,
              },
            });
            if (result.ok) setState("done");
            else {
              setError(result.error);
              setState("error");
            }
          } catch {
            setError("Az igénylést nem sikerült elküldeni.");
            setState("error");
          }
        }}
      >
        <label className="block text-sm font-medium text-foreground">
          Név *
          <input name="name" required minLength={2} maxLength={160} className={inputClass} />
        </label>
        <label className="mt-5 block text-sm font-medium text-foreground">
          E-mail *
          <input name="email" type="email" required maxLength={160} className={inputClass} />
        </label>
        <label className="mt-5 block text-sm font-medium text-foreground">
          Telefonszám *
          <input name="phone" type="tel" required minLength={6} maxLength={30} className={inputClass} />
        </label>

        {/* Gépazonosító (HWID) — opcionális */}
        <div className="mt-5">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-medium text-foreground">Gépazonosító (HWID)</span>
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button type="button" className="text-muted-foreground hover:text-foreground">
                    <Info className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  Töltsd le és futtasd a gépazonosító-mutató programot, majd a kapott azonosítót
                  másold be ide. A program csak Windows asztali gépen futtatható.
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="mt-1.5 flex gap-2">
            <input
              name="hwid"
              maxLength={100}
              placeholder="pl. 13B9D1D807614D61"
              className={inputClass}
            />
            <Button
              type="button"
              variant="outline"
              className="h-auto shrink-0 px-4 py-2.5 text-sm"
              onClick={() => handleHwidDownload("hu")}
            >
              Gépazonosító letöltése
            </Button>
          </div>
          <p className="mt-1.5 text-xs text-muted-foreground">Nem kötelező, de gyorsítja a licencküldést.</p>
        </div>

        {/* Tesztidő — opcionális dátum */}
        <label className="mt-5 block text-sm font-medium text-foreground">
          Meddig van szükséged a tesztelésre?
          <input
            name="testUntil"
            type="date"
            className={inputClass}
          />
        </label>
        <p className="mt-1.5 text-xs text-muted-foreground">
          Nem kötelező. A letöltési link lejárati idejét nem befolyásolja.
        </p>

        {/* Honeypot */}
        <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
          <input name="website" tabIndex={-1} autoComplete="off" />
        </div>

        <label className="mt-6 flex items-start gap-2.5 text-sm text-muted-foreground">
          <input type="checkbox" required className="mt-0.5 h-4 w-4 accent-[var(--color-primary)]" />
          <span>
            Megismertem az{" "}
            <a href="/adatvedelmi-tajekoztato" className="underline hover:text-foreground">
              Adatvédelmi tájékoztatót
            </a>
            . *
          </span>
        </label>

        {state === "error" ? (
          <p className="mt-5 text-sm font-semibold text-destructive">{error}</p>
        ) : null}

        <Button type="submit" disabled={state === "sending"} className="mt-7 h-auto px-6 py-3">
          {state === "sending" ? "Küldés…" : "DEMO letöltési link kérése"}
        </Button>
      </form>
    </div>
  );
}
