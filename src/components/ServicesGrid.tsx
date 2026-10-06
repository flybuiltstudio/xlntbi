import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import heroVideo from "@/assets/termekek-hero.mp4.asset.json";
import kalkulatorImg from "@/assets/online-kalkulator.jpg";
import icKonyveles from "@/assets/icons/konyveles.png.asset.json";
import icEgyeni from "@/assets/icons/egyeni.png.asset.json";
import icKulfoldi from "@/assets/icons/kulfoldi.png.asset.json";
import icAdo from "@/assets/icons/ado.png.asset.json";
import icBi from "@/assets/icons/bi.png.asset.json";
import icKontrolling from "@/assets/icons/kontrolling.png.asset.json";
import icAudit from "@/assets/icons/audit.png.asset.json";
import icPontossag from "@/assets/icons/pontossag.png.asset.json";
import icIroda from "@/assets/icons/iroda.png.asset.json";
import icHatekonysag from "@/assets/icons/hatekonysag.png.asset.json";

/** Service path -> small illustrative icon (HU and EN paths). */
const ICONS: Record<string, string> = {
  "/konyveles": icKonyveles.url,
  "/en/bookkeeping": icKonyveles.url,
  "/ev-konyveles": icEgyeni.url,
  "/en/sole-trader-bookkeeping": icKulfoldi.url,
  "/adotanacsadas": icAdo.url,
  "/en/tax-advisory": icAdo.url,
  "/fintech-es-bi": icBi.url,
  "/en/fintech-and-bi": icBi.url,
  "/kontrolling": icKontrolling.url,
  "/en/controlling": icKontrolling.url,
  "/cegaudit": icAudit.url,
  "/en/company-audit": icAudit.url,
  "/konyvvizsgalat": icPontossag.url,
  "/en/statutory-audit": icPontossag.url,
  "/konyveloiroda-audit": icIroda.url,
  "/en/accounting-firm-audit": icIroda.url,
  "/digitalis-idomegtakaritasi-audit": icHatekonysag.url,
  "/en/digital-time-saving-audit": icHatekonysag.url,
};

type Item = { to: string; label: string };

export function ServicesGrid({ items, more, videoLabel }: { items: readonly Item[]; more: string; videoLabel: string }) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-14 md:py-16">
      <div className="grid items-start gap-10 lg:grid-cols-[3fr_2fr]">
        <div className="grid gap-5 sm:grid-cols-2">
          {items.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="group flex flex-col justify-between rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary"
            >
              <div className="flex items-start gap-4">
                {ICONS[item.to] && (
                  <img src={ICONS[item.to]} alt="" aria-hidden="true" loading="lazy" className="h-12 w-12 shrink-0 object-contain" />
                )}
                <h2 className="text-base font-semibold text-card-foreground">{item.label}</h2>
              </div>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                {more}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
        <div className="lg:sticky lg:top-24">
          <video
            src={heroVideo.url}
            poster={kalkulatorImg}
            autoPlay
            muted
            loop
            playsInline
            aria-label={videoLabel}
            className="w-full rounded-xl border border-border object-cover shadow-sm"
          />
        </div>
      </div>
    </div>
  );
}
