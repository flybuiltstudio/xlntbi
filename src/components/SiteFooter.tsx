import { Link } from "@tanstack/react-router";
import { Facebook, Mail, Phone } from "lucide-react";
import logoAsset from "@/assets/xlntbi-logo.png.asset.json";
import heroImg from "@/assets/bcg-1.jpg";

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
      <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-3">
        <div>
          <img
            src={logoAsset.url}
            alt="EXCELlent Business Intelligence logó"
            className="h-24 w-auto object-contain brightness-0 invert"
            loading="lazy"
          />
          <p className="mt-4 text-sm opacity-90">EXCELlent Business Intelligence</p>
          <p className="mt-1 text-sm opacity-90">Sarinay Dávid</p>
        </div>

        <nav aria-label="Oldalak a láblécben">
          <h2 className="text-sm font-semibold uppercase tracking-wider opacity-80">Oldalak</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {[
              { to: "/termekeim", label: "Termékeim" },
              { to: "/szolgaltatasaim", label: "Szolgáltatásaim" },
              { to: "/rolam", label: "Rólam" },
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
          <p>Ez a weboldal AI segítségével készült.</p>
        </div>
      </div>
    </footer>
  );
}
