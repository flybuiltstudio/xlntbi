import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import logoAsset from "@/assets/xlntbi-logo.png.asset.json";
import { productCategories, categoryProducts } from "@/lib/product-categories";
import {
  LanguageSwitcher,
  asPath,
  useLang,
  useLocalPath,
  useT,
  type TranslationKey,
} from "@/lib/i18n";

/** Hungarian canonical paths; localised at render time. */
const services: ReadonlyArray<{ hu: string; key: TranslationKey }> = [
  { hu: "/konyveles", key: "service.bookkeeping" },
  { hu: "/ev-konyveles", key: "service.soleTrader" },
  { hu: "/adotanacsadas", key: "service.taxAdvisory" },
  { hu: "/fintech-es-bi", key: "service.fintechBi" },
  { hu: "/kontrolling", key: "service.controlling" },
  { hu: "/cegaudit", key: "service.companyAudit" },
  { hu: "/konyvvizsgalat", key: "service.statutoryAudit" },
  { hu: "/konyveloiroda-audit", key: "service.firmAudit" },
  { hu: "/digitalis-idomegtakaritasi-audit", key: "service.timeAudit" },
];

const calculators: ReadonlyArray<{ hu: string; key: TranslationKey }> = [
  { hu: "/kalkulatorok", key: "nav.allCalculators" },
  { hu: "/kalkulatorok/szamla-datumok", key: "calc.invoiceDates" },
  { hu: "/kalkulatorok/berteszt", key: "calc.salaryTest" },
  { hu: "/kalkulatorok/jovedelemado", key: "calc.incomeTax" },
  { hu: "/kalkulatorok/atalanyado", key: "calc.flatRateTax" },
];

const mainLinks: ReadonlyArray<{ hu: string; key: TranslationKey }> = [
  { hu: "/oktatas", key: "nav.training" },
  { hu: "/rolam", key: "nav.about" },
  { hu: "/kapcsolat", key: "nav.contact" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const t = useT();
  const lang = useLang();
  const lp = useLocalPath();

  const toggleSection = (key: string) =>
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));

  const closeMenu = () => {
    setOpen(false);
    setOpenSections({});
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur">
      <div className="relative z-10 mx-auto flex h-20 max-w-6xl items-center gap-4 px-4 lg:gap-7">
        <Link
          to={asPath(lp("/"))}
          className="flex shrink-0 items-center"
          aria-label={t("nav.logoHome")}
        >
          <img
            src={logoAsset.url}
            alt={t("nav.logoAlt")}
            className="h-11 w-auto object-contain lg:h-20"
            width={240}
            height={160}
          />
        </Link>

        <nav
          className="hidden items-center gap-0.5 md:flex lg:gap-1"
          aria-label={t("nav.mainMenu")}
        >
          <Link
            to={asPath(lp("/"))}
            className="rounded-md px-2 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-accent lg:px-3 lg:text-sm"
            activeProps={{ className: "bg-accent" }}
            activeOptions={{ exact: true }}
          >
            {t("nav.home")}
          </Link>

          <div className="group relative">
            <Link
              to={asPath(lp("/szolgaltatasaim"))}
              className="flex items-center gap-1 rounded-md px-2 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-accent lg:px-3 lg:text-sm"
            >
              {t("nav.services")}
              <ChevronDown className="h-4 w-4" aria-hidden="true" />
            </Link>
            <div className="invisible absolute left-0 top-full w-72 rounded-md border border-border bg-popover p-2 opacity-0 shadow-lg transition-opacity group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
              {services.map((s) => (
                <Link
                  key={s.hu}
                  to={asPath(lp(s.hu))}
                  className="block rounded-md px-3 py-2 text-sm text-popover-foreground transition-colors hover:bg-accent"
                >
                  {t(s.key)}
                </Link>
              ))}
            </div>
          </div>

          <div className="group relative">
            <Link
              to={asPath(lp("/kalkulatorok"))}
              className="flex items-center gap-1 rounded-md px-2 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-accent lg:px-3 lg:text-sm"
            >
              {t("nav.calculators")}
              <ChevronDown className="h-4 w-4" aria-hidden="true" />
            </Link>
            <div className="invisible absolute left-0 top-full w-56 rounded-md border border-border bg-popover p-2 opacity-0 shadow-lg transition-opacity group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
              {calculators.map((s) => (
                <Link
                  key={s.hu}
                  to={asPath(lp(s.hu))}
                  className="block rounded-md px-3 py-2 text-sm text-popover-foreground transition-colors hover:bg-accent"
                >
                  {t(s.key)}
                </Link>
              ))}
            </div>
          </div>

          <Link
            to={asPath(lp("/termekeim"))}
            className="rounded-md px-2 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-accent lg:px-3 lg:text-sm"
            activeProps={{ className: "bg-accent" }}
          >
            {t("nav.products")}
          </Link>

          {mainLinks.map((l) => (
            <Link
              key={l.hu}
              to={asPath(lp(l.hu))}
              className="rounded-md px-2 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-accent lg:px-3 lg:text-sm"
              activeProps={{ className: "bg-accent" }}
            >
              {t(l.key)}
            </Link>
          ))}

          <LanguageSwitcher className="ml-1" />

          <Link
            to={asPath(lp("/konzultacio"))}
            className="ml-1 inline-flex items-center whitespace-nowrap rounded-md bg-primary px-3 py-2 text-[13px] font-semibold text-primary-foreground transition-colors hover:bg-brand-dark lg:ml-2 lg:px-4 lg:text-sm"
          >
            {t("nav.consultation")}
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-1 md:hidden">
          <LanguageSwitcher />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex items-center justify-center rounded-md p-2 text-foreground"
            aria-label={open ? t("nav.closeMenu") : t("nav.openMenu")}
            aria-expanded={open}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>

      {open ? (
        <div className="absolute inset-x-0 top-full z-10 max-h-[calc(100dvh-5rem)] overflow-y-auto border-b border-t border-border bg-background shadow-lg md:hidden">
          <nav className="mx-auto max-w-6xl px-4 py-4" aria-label={t("nav.mainMenu")}>
            <div className="flex items-center justify-between pb-2">
              <span className="text-sm font-semibold text-muted-foreground">
                {lang === "en" ? "Menu" : "Menü"}
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={t("nav.closeMenu")}
                className="rounded-md p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <ul className="space-y-1">
              <li>
                <Link
                  to={asPath(lp("/"))}
                  onClick={closeMenu}
                  className="block min-h-11 rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-accent"
                >
                  {t("nav.home")}
                </Link>
              </li>

              {/* Szolgáltatásaim — kinyitható */}
              <li>
                <button
                  type="button"
                  onClick={() => toggleSection("szolgaltatasaim")}
                  aria-expanded={openSections["szolgaltatasaim"] ?? false}
                  className="flex min-h-11 w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-accent"
                >
                  {t("nav.services")}
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 transition-transform duration-200 ${
                      openSections["szolgaltatasaim"] ? "rotate-180" : ""
                    }`}
                    aria-hidden="true"
                  />
                </button>
                {openSections["szolgaltatasaim"] ? (
                  <ul className="space-y-1 pl-3">
                    {services.map((s) => (
                      <li key={s.hu}>
                        <Link
                          to={asPath(lp(s.hu))}
                          onClick={closeMenu}
                          className="block rounded-md px-3 py-2 text-sm text-foreground hover:bg-accent"
                        >
                          {t(s.key)}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>

              {/* Kalkulátorok — kinyitható */}
              <li>
                <button
                  type="button"
                  onClick={() => toggleSection("kalkulatorok")}
                  aria-expanded={openSections["kalkulatorok"] ?? false}
                  className="flex min-h-11 w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-accent"
                >
                  {t("nav.calculators")}
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 transition-transform duration-200 ${
                      openSections["kalkulatorok"] ? "rotate-180" : ""
                    }`}
                    aria-hidden="true"
                  />
                </button>
                {openSections["kalkulatorok"] ? (
                  <ul className="space-y-1 pl-3">
                    {calculators.map((c) => (
                      <li key={c.hu}>
                        <Link
                          to={asPath(lp(c.hu))}
                          onClick={closeMenu}
                          className="block rounded-md px-3 py-2 text-sm text-foreground hover:bg-accent"
                        >
                          {t(c.key)}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>

              {/* Termékeim — kétszintű kinyíló (kategória → termékadatlap) */}
              <li>
                <button
                  type="button"
                  onClick={() => toggleSection("termekeim")}
                  aria-expanded={openSections["termekeim"] ?? false}
                  className="flex min-h-11 w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-accent"
                >
                  {t("nav.products")}
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 transition-transform duration-200 ${
                      openSections["termekeim"] ? "rotate-180" : ""
                    }`}
                    aria-hidden="true"
                  />
                </button>
                {openSections["termekeim"] ? (
                  <ul className="space-y-1 pl-3">
                    <li>
                      <Link
                        to={asPath(lp("/termekeim"))}
                        onClick={closeMenu}
                        className="block rounded-md px-3 py-2 text-sm font-semibold text-foreground hover:bg-accent"
                      >
                        {lang === "en" ? "All products" : "Összes termék"}
                      </Link>
                    </li>
                    {productCategories.map((cat) => {
                      const catKey = `kat-${cat.key}`;
                      const catOpen = openSections[catKey] ?? false;
                      const items = categoryProducts(cat);
                      return (
                        <li key={cat.key}>
                          <button
                            type="button"
                            onClick={() => toggleSection(catKey)}
                            aria-expanded={catOpen}
                            className="flex min-h-11 w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-accent"
                          >
                            {cat.title}
                            <ChevronDown
                              className={`h-4 w-4 shrink-0 transition-transform duration-200 ${
                                catOpen ? "rotate-180" : ""
                              }`}
                              aria-hidden="true"
                            />
                          </button>
                          {catOpen ? (
                            <ul className="space-y-1 pl-3">
                              {items.map((p) => (
                                <li key={p.slug}>
                                  <Link
                                    to="/termek/$slug"
                                    params={{ slug: p.slug }}
                                    onClick={closeMenu}
                                    className="block rounded-md px-3 py-2 text-sm text-foreground hover:bg-accent"
                                  >
                                    {p.name}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          ) : null}
                        </li>
                      );
                    })}
                  </ul>
                ) : null}
              </li>

              {mainLinks.map((l) => (
                <li key={l.hu}>
                  <Link
                    to={asPath(lp(l.hu))}
                    onClick={closeMenu}
                    className="block min-h-11 rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-accent"
                  >
                    {t(l.key)}
                  </Link>
                </li>
              ))}

              <li>
                <Link
                  to={asPath(lp("/konzultacio"))}
                  onClick={closeMenu}
                  className="mt-1 block min-h-11 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-brand-dark"
                >
                  {t("nav.consultation")}
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
