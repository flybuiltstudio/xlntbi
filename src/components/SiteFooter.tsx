import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Linkedin, Mail, Phone } from "lucide-react";
import { openCookieSettings } from "@/components/CookieConsent";
import { asPath, useLocalPath, useT, type TranslationKey } from "@/lib/i18n";

import logoAsset from "@/assets/xlntbi-logo.png.asset.json";
import heroImg from "@/assets/bcg-savok.jpg";
import dspLogo from "@/assets/dsp-logo-feher.png.asset.json";
import neumannLogo from "@/assets/neumann-logo-feher.png.asset.json";

type FooterLink = { to: string; key: TranslationKey };

const pages: FooterLink[] = [
  { to: "/", key: "nav.home" },
  { to: "/szolgaltatasaim", key: "nav.services" },
  { to: "/kalkulatorok", key: "nav.calculators" },
  { to: "/termekeim", key: "nav.products" },
  { to: "/oktatas", key: "nav.training" },
  { to: "/rolam", key: "nav.about" },
  { to: "/kapcsolat", key: "nav.contact" },
  { to: "/konzultacio", key: "footer.consultation" },
];

const services: FooterLink[] = [
  { to: "/konyveles", key: "service.bookkeeping" },
  { to: "/adotanacsadas", key: "service.taxAdvisory" },
  { to: "/fintech-es-bi", key: "service.fintechBi" },
  { to: "/kontrolling", key: "service.controlling" },
  { to: "/cegaudit", key: "service.companyAudit" },
  { to: "/konyvvizsgalat", key: "service.statutoryAudit" },
  { to: "/konyveloiroda-audit", key: "service.firmAudit" },
  { to: "/digitalis-idomegtakaritasi-audit", key: "service.timeAudit" },
];

const legal: FooterLink[] = [
  { to: "/impresszum", key: "footer.imprint" },
  { to: "/adatvedelmi-tajekoztato", key: "footer.privacy" },
  { to: "/cookie-tajekoztato", key: "footer.cookiePolicy" },
  { to: "/aszf", key: "footer.terms" },
  { to: "/elallas-a-szerzodestol", key: "footer.withdrawal" },
  { to: "/fizetes-es-teljesites", key: "footer.payment" },
  { to: "/fogyasztovedelem", key: "footer.consumer" },
];

export function SiteFooter() {
  const t = useT();
  const localPath = useLocalPath();

  return (
    <footer className="relative isolate overflow-hidden bg-brand-dark text-primary-foreground">
      <img
        src={heroImg}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-brand-dark/95 via-brand-dark/90 to-brand-dark/80" />

      <div className="relative border-b border-primary-foreground/20">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <div className="flex flex-col items-center justify-center gap-8 sm:flex-row sm:justify-between sm:gap-4">
            <img
              src={dspLogo.url}
              alt={t("footer.dspAlt")}
              className="h-[177px] w-auto object-contain"
              loading="lazy"
            />
            <img
              src={neumannLogo.url}
              alt={t("footer.neumannAlt")}
              className="h-[112px] w-auto object-contain"
              loading="lazy"
            />
          </div>
          <p className="mt-8 text-center text-[17px] opacity-60">{t("footer.dspNote")}</p>
        </div>
      </div>

      <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-4">
        <div>
          <div className="inline-block rounded-2xl bg-white p-2.5">
            <img
              src={logoAsset.url}
              alt={t("nav.logoAlt")}
              className="h-36 w-auto object-contain"
              loading="lazy"
            />
          </div>
          <p className="mt-4 text-sm opacity-90">EXCELlent Business Intelligence</p>
          <p className="mt-1 text-sm opacity-90">Sarinay Dávid</p>
        </div>

        <nav aria-label={t("footer.pagesAria")}>
          <h2 className="text-sm font-semibold uppercase tracking-wider opacity-80">
            {t("footer.pages")}
          </h2>
          <ul className="mt-4 space-y-2 text-sm">
            {pages.map((l) => (
              <li key={l.to}>
                <Link
                  to={asPath(localPath(l.to))}
                  className="opacity-90 transition-opacity hover:opacity-100"
                >
                  {t(l.key)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label={t("footer.servicesAria")}>
          <h2 className="text-sm font-semibold uppercase tracking-wider opacity-80">
            {t("nav.services")}
          </h2>
          <ul className="mt-4 space-y-2 text-sm">
            {services.map((l) => (
              <li key={l.to}>
                <Link
                  to={asPath(localPath(l.to))}
                  className="opacity-90 transition-opacity hover:opacity-100"
                >
                  {t(l.key)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider opacity-80">
            {t("footer.contact")}
          </h2>
          <ul className="mt-4 space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4" aria-hidden="true" />
              <a href="tel:+36209622176" className="opacity-90 hover:opacity-100">
                20/962-2176
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4" aria-hidden="true" />
              <a href="mailto:info@xlntbi.hu" className="opacity-90 hover:opacity-100">
                info@xlntbi.hu
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Facebook className="h-4 w-4" aria-hidden="true" />
              <a
                href="https://www.facebook.com/xlntbi"
                target="_blank"
                rel="noopener noreferrer"
                className="opacity-90 hover:opacity-100"
              >
                Facebook
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Instagram className="h-4 w-4" aria-hidden="true" />
              <a
                href="https://www.instagram.com/xlntbi/"
                target="_blank"
                rel="noopener noreferrer"
                className="opacity-90 hover:opacity-100"
              >
                Instagram
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Linkedin className="h-4 w-4" aria-hidden="true" />
              <a
                href="https://www.linkedin.com/company/xlntbi/"
                target="_blank"
                rel="noopener noreferrer"
                className="opacity-90 hover:opacity-100"
              >
                LinkedIn
              </a>
            </li>
            <li className="flex items-center gap-2">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .57.04.84.13V9.4a6.34 6.34 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43V8.69a8.16 8.16 0 0 0 4.77 1.52V6.76a4.83 4.83 0 0 1-.04-.07z" />
              </svg>
              <a
                href="https://www.tiktok.com/@xlntbi"
                target="_blank"
                rel="noopener noreferrer"
                className="opacity-90 hover:opacity-100"
              >
                TikTok
              </a>
            </li>
          </ul>

          <h2 className="mt-6 text-sm font-semibold uppercase tracking-wider opacity-80">
            {t("footer.legal")}
          </h2>
          <ul
            aria-label={t("footer.legalAria")}
            className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-1"
          >
            {legal.map((l) => (
              <li key={l.to}>
                <Link
                  to={asPath(localPath(l.to))}
                  className="opacity-90 transition-opacity hover:opacity-100"
                >
                  {t(l.key)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="relative border-t border-primary-foreground/20">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-xs opacity-80 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} Sarinay Dávid EV – EXCELlent Business Intelligence</p>
          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={openCookieSettings}
              className="text-left underline underline-offset-4 opacity-90 transition-opacity hover:opacity-100"
            >
              {t("footer.cookieSettings")}
            </button>
            <span className="opacity-80">{t("footer.aiNote")}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
