import { Link } from "@tanstack/react-router";
import { Mail, Phone } from "lucide-react";
import logoWhite from "@/assets/xlnt-logo-white.png";

export function SiteFooter() {
  return (
    <footer className="bg-brand-dark text-primary-foreground">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-4">
        <div>
          <img
            src={logoWhite}
            alt="EXCELlent Accounting & Consulting logó"
            className="h-20 w-20 object-contain"
            loading="lazy"
            width={80}
            height={80}
          />
          <p className="mt-4 text-sm opacity-90">Perfect Solutions. Automated Future.</p>
          <p className="mt-1 text-sm opacity-90">Sarinay Dávid</p>
        </div>

        <nav aria-label="Szolgáltatások a láblécben">
          <h2 className="text-sm font-semibold uppercase tracking-wider opacity-80">
            Szolgáltatások
          </h2>
          <ul className="mt-4 space-y-2 text-sm">
            {[
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
            ].map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="opacity-90 transition-opacity hover:opacity-100">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Oldalak a láblécben">
          <h2 className="text-sm font-semibold uppercase tracking-wider opacity-80">Oldalak</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {[
              { to: "/termekeim", label: "Termékeim" },
              { to: "/termek/nav-online-szamla-letolto", label: "NAV Online Számla letöltő" },
              { to: "/termek/nav-penztargep-letolto", label: "NAV Pénztárgép letöltő" },
              { to: "/kalkulatorok", label: "Kalkulátorok" },

              { to: "/oktatas", label: "Oktatás" },
              { to: "/rolam", label: "Rólam" },
              { to: "/szolgaltatasaim", label: "Szolgáltatásaim" },
              { to: "/konzultacio", label: "Konzultáció" },
              { to: "/kapcsolat", label: "Kapcsolat" },
            ].map((l) => (
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
                06 20 962 2176
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4" aria-hidden="true" />
              <a href="mailto:info@xlntbi.hu" className="opacity-90 hover:opacity-100">
                info@xlntbi.hu
              </a>
            </li>
          </ul>

          <h2 className="mt-6 text-sm font-semibold uppercase tracking-wider opacity-80">
            Jogi információk
          </h2>
          <ul className="mt-4 space-y-2 text-sm">
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

      <div className="border-t border-primary-foreground/20">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-xs opacity-80 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} Sarinay Dávid – EXCELlent Accounting &amp; Consulting</p>
          <p>Ez a weboldal AI segítségével készült.</p>
        </div>
      </div>
    </footer>
  );
}
