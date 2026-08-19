import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import logoAsset from "@/assets/xlntbi-logo.png.asset.json";

const services = [
  { to: "/konyveles", label: "Könyvelés" },
  { to: "/adotanacsadas", label: "Adótanácsadás" },
  { to: "/fintech-es-bi", label: "Fintech és BI" },
  { to: "/kontrolling", label: "Kontrolling" },
  { to: "/cegaudit", label: "Cégaudit" },
  { to: "/konyvvizsgalat", label: "Könyvvizsgálat" },
  { to: "/konyveloiroda-audit", label: "Könyvelőiroda audit" },
  {
    to: "/digitalis-idomegtakaritasi-audit",
    label: "Digitális időmegtakarítási audit",
  },
] as const;

const calculators = [
  { to: "/kalkulatorok", label: "Összes kalkulátor" },
  { to: "/kalkulatorok/berteszt", label: "Bérteszt" },
  { to: "/kalkulatorok/jovedelemado", label: "Jövedelemadó" },
] as const;

const mainLinks = [
  { to: "/termekeim", label: "Termékeim" },
  { to: "/oktatas", label: "Oktatás" },
  { to: "/rolam", label: "Rólam" },
  { to: "/kapcsolat", label: "Kapcsolat" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-6xl items-center justify-between gap-4 px-4">
        <Link to="/" className="flex items-center" aria-label="EXCELlent Business Intelligence – főoldal">
          <img
            src={logoAsset.url}
            alt="EXCELlent Business Intelligence logó"
            className="h-16 w-auto object-contain"
            width={240}
            height={160}
          />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Főmenü">
          <Link
            to="/"
            className="rounded-md px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
            activeProps={{ className: "bg-accent" }}
            activeOptions={{ exact: true }}
          >
            Főoldal
          </Link>

          <div className="group relative">
            <Link
              to="/szolgaltatasaim"
              className="flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
            >
              Szolgáltatásaim
              <ChevronDown className="h-4 w-4" aria-hidden="true" />
            </Link>
            <div className="invisible absolute left-0 top-full w-72 rounded-md border border-border bg-popover p-2 opacity-0 shadow-lg transition-opacity group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
              {services.map((s) => (
                <Link
                  key={s.to}
                  to={s.to}
                  className="block rounded-md px-3 py-2 text-sm text-popover-foreground transition-colors hover:bg-accent"
                >
                  {s.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="group relative">
            <Link
              to="/kalkulatorok"
              className="flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
            >
              Kalkulátorok
              <ChevronDown className="h-4 w-4" aria-hidden="true" />
            </Link>
            <div className="invisible absolute left-0 top-full w-56 rounded-md border border-border bg-popover p-2 opacity-0 shadow-lg transition-opacity group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
              {calculators.map((s) => (
                <Link
                  key={s.to}
                  to={s.to}
                  className="block rounded-md px-3 py-2 text-sm text-popover-foreground transition-colors hover:bg-accent"
                >
                  {s.label}
                </Link>
              ))}
            </div>
          </div>

          {mainLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="rounded-md px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
              activeProps={{ className: "bg-accent" }}
            >
              {l.label}
            </Link>
          ))}

          <Link
            to="/konzultacio"
            className="ml-2 inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-brand-dark"
          >
            Konzultációt kérek
          </Link>
        </nav>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center justify-center rounded-md p-2 text-foreground lg:hidden"
          aria-label={open ? "Menü bezárása" : "Menü megnyitása"}
          aria-expanded={open}
        >
          {open ? <Menu className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open ? (
        <div className="border-t border-border bg-background lg:hidden">
          <nav className="mx-auto max-w-6xl px-4 py-4" aria-label="Mobil menü">
            <div className="flex items-center justify-between pb-2">
              <span className="text-sm font-semibold text-muted-foreground">Menü</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Menü bezárása"
                className="rounded-md p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <ul className="space-y-1">
              {[
                { to: "/", label: "Főoldal" },
                { to: "/szolgaltatasaim", label: "Szolgáltatásaim" },
                ...services,
                ...calculators,
                ...mainLinks,
                { to: "/konzultacio", label: "Konzultáció" },
              ].map((l) => (
                <li key={l.to + l.label}>
                  <Link
                    to={l.to}
                    onClick={() => setOpen(false)}
                    className="block rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-accent"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
