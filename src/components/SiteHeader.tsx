import { Link, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import logoAsset from "@/assets/xlntbi-logo.png.asset.json";
import { HeaderIntro } from "@/components/HeaderIntro";

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
  { to: "/kalkulatorok/szamla-datumok", label: "Számla dátumok" },
  { to: "/kalkulatorok/invoice-dates", label: "Invoice Dates (EN)" },
  { to: "/kalkulatorok/berteszt", label: "Bérteszt" },
  { to: "/kalkulatorok/jovedelemado", label: "Jövedelemadó" },
  { to: "/kalkulatorok/atalanyado", label: "Átalányadó" },
] as const;

const mainLinks = [
  { to: "/oktatas", label: "Oktatás" },
  { to: "/rolam", label: "Rólam" },
  { to: "/kapcsolat", label: "Kapcsolat" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur">
      {pathname === "/" ? <HeaderIntro /> : null}
      <div className="relative z-10 mx-auto flex h-20 max-w-6xl items-center gap-5 px-4 lg:gap-7">
        <Link to="/" className="flex shrink-0 items-center" aria-label="EXCELlent Business Intelligence – főoldal">
          <img
            src={logoAsset.url}
            alt="EXCELlent Business Intelligence logó"
            className="h-14 w-auto object-contain lg:h-20"
            width={240}
            height={160}
          />
        </Link>

        <nav className="hidden items-center gap-0.5 min-[900px]:flex lg:gap-1" aria-label="Főmenü">
          <Link
            to="/"
            className="rounded-md px-2 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-accent lg:px-3 lg:text-sm"
            activeProps={{ className: "bg-accent" }}
            activeOptions={{ exact: true }}
          >
            Főoldal
          </Link>

          <div className="group relative">
            <Link
              to="/szolgaltatasaim"
              className="flex items-center gap-1 rounded-md px-2 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-accent lg:px-3 lg:text-sm"
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
              className="flex items-center gap-1 rounded-md px-2 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-accent lg:px-3 lg:text-sm"
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

          <Link
            to="/termekeim"
            className="rounded-md px-2 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-accent lg:px-3 lg:text-sm"
            activeProps={{ className: "bg-accent" }}
          >
            Termékeim
          </Link>

          {mainLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="rounded-md px-2 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-accent lg:px-3 lg:text-sm"
              activeProps={{ className: "bg-accent" }}
            >
              {l.label}
            </Link>
          ))}

          <Link
            to="/konzultacio"
            className="ml-1 inline-flex items-center whitespace-nowrap rounded-md bg-primary px-3 py-2 text-[13px] font-semibold text-primary-foreground transition-colors hover:bg-brand-dark lg:ml-2 lg:px-4 lg:text-sm"
          >
            Konzultációt kérek
          </Link>
        </nav>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="ml-auto inline-flex items-center justify-center rounded-md p-2 text-foreground min-[900px]:hidden"
          aria-label={open ? "Menü bezárása" : "Menü megnyitása"}
          aria-expanded={open}
        >
          {open ? <Menu className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open ? (
        <div className="absolute inset-x-0 top-full z-10 max-h-[calc(100dvh-5rem)] overflow-y-auto border-b border-t border-border bg-background shadow-lg min-[900px]:hidden">
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
                { to: "/termekeim", label: "Termékeim" },
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
