import { Link } from "@tanstack/react-router";
import { Facebook, Mail, Phone } from "lucide-react";
import { openCookieSettings } from "@/components/CookieConsent";

import logoAsset from "@/assets/xlntbi-logo.png.asset.json";
import heroImg from "@/assets/bcg-savok.jpg";
import dspLogo from "@/assets/dsp-logo-feher.png.asset.json";
import neumannLogo from "@/assets/neumann-logo-feher.png.asset.json";

const pages = [
  { to: "/", label: "Főoldal" },
  { to: "/szolgaltatasaim", label: "Szolgáltatásaim" },
  { to: "/kalkulatorok", label: "Kalkulátorok" },
  { to: "/termekeim", label: "Termékeim" },
  { to: "/oktatas", label: "Oktatás" },
  { to: "/rolam", label: "Rólam" },
  { to: "/kapcsolat", label: "Kapcsolat" },
  { to: "/konzultacio", label: "Konzultáció" },
] as const;

const services = [
  { to: "/konyveles", label: "Könyvelés" },
  { to: "/adotanacsadas", label: "Adótanácsadás" },
  { to: "/fintech-es-bi", label: "Fintech és BI" },
  { to: "/kontrolling", label: "Kontrolling" },
  { to: "/cegaudit", label: "Cégaudit" },
  { to: "/konyvvizsgalat", label: "Könyvvizsgálat" },
  { to: "/konyveloiroda-audit", label: "Könyvelőiroda audit" },
  { to: "/digitalis-idomegtakaritasi-audit", label: "Digitális időmegtakarítási audit" },
] as const;

export function SiteFooter() {
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
              alt="Demján Sándor Program logó"
              className="h-[177px] w-auto object-contain"
              loading="lazy"
            />
            <img
              src={neumannLogo.url}
              alt="Neumann János Nonprofit Kft. logó"
              className="h-[112px] w-auto object-contain"
              loading="lazy"
            />
          </div>
          <p className="mt-8 text-center text-[17px] opacity-60">
            A weboldal a Demján Sándor Program keretében és támogatásával valósult meg.
          </p>
        </div>
      </div>

      <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-4">
        <div>
          <div className="inline-block rounded-2xl bg-white p-2.5">
            <img
              src={logoAsset.url}
              alt="EXCELlent Business Intelligence logó"
              className="h-36 w-auto object-contain"
              loading="lazy"
            />
          </div>
          <p className="mt-4 text-sm opacity-90">EXCELlent Business Intelligence</p>
          <p className="mt-1 text-sm opacity-90">Sarinay Dávid</p>
        </div>

        <nav aria-label="Oldalak a láblécben">
          <h2 className="text-sm font-semibold uppercase tracking-wider opacity-80">Oldalak</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {pages.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="opacity-90 transition-opacity hover:opacity-100">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Szolgáltatások a láblécben">
          <h2 className="text-sm font-semibold uppercase tracking-wider opacity-80">Szolgáltatásaim</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {services.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="opacity-90 transition-opacity hover:opacity-100">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider opacity-80">Elérhetőség</h2>
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
                href="https://www.facebook.com/xllentac"
                target="_blank"
                rel="noopener noreferrer"
                className="opacity-90 hover:opacity-100"
              >
                Facebook
              </a>
            </li>
          </ul>

          <h2 className="mt-6 text-sm font-semibold uppercase tracking-wider opacity-80">
            Jogi információk
          </h2>
          <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-1">
            {[
              { to: "/impresszum", label: "Impresszum" },
              { to: "/adatvedelmi-tajekoztato", label: "Adatvédelmi tájékoztató" },
              { to: "/cookie-tajekoztato", label: "Cookie-tájékoztató" },
              { to: "/aszf", label: "ÁSZF" },
              { to: "/elallas-a-szerzodestol", label: "Elállási tájékoztató" },
              { to: "/fizetes-es-teljesites", label: "Fizetési és teljesítési feltételek" },
              { to: "/fogyasztovedelem", label: "Fogyasztóvédelmi tájékoztatás" },
            ].map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="opacity-90 transition-opacity hover:opacity-100">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="relative border-t border-primary-foreground/20">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-xs opacity-80 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} Sarinay Dávid EV – EXCELlent Business Intelligence</p>
          <button
            type="button"
            onClick={openCookieSettings}
            className="text-left underline underline-offset-4 opacity-90 transition-opacity hover:opacity-100"
          >
            Cookie-beállítások
          </button>

        </div>
      </div>
    </footer>
  );
}
