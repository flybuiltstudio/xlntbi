import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import im_konyveles from "@/assets/szolgaltatasok/konyveles.jpg";
import im_ev from "@/assets/szolgaltatasok/ev-konyveles.jpg";
import im_ado from "@/assets/szolgaltatasok/adotanacsadas.jpg";
import im_bi from "@/assets/szolgaltatasok/fintech-bi.jpg";
import im_kontrolling from "@/assets/szolgaltatasok/kontrolling.jpg";
import im_cegaudit from "@/assets/szolgaltatasok/cegaudit.jpg";
import im_vizsg from "@/assets/szolgaltatasok/konyvvizsgalat.jpg";
import im_iroda from "@/assets/szolgaltatasok/konyveloiroda-audit.jpg";
import im_ido from "@/assets/szolgaltatasok/idomegtakaritas.jpg";
import heroVideo from "@/assets/szolgaltatasok-hero.mp4.asset.json";
import posterImg from "@/assets/szolgaltatasok-hero.jpg";

/** Service path -> small illustrative icon (HU and EN paths). */
const ICONS: Record<string, string> = {
  "/konyveles": im_konyveles,
  "/en/bookkeeping": im_konyveles,
  "/ev-konyveles": im_ev,
  "/en/sole-trader-bookkeeping": im_ev,
  "/adotanacsadas": im_ado,
  "/en/tax-advisory": im_ado,
  "/fintech-es-bi": im_bi,
  "/en/fintech-and-bi": im_bi,
  "/kontrolling": im_kontrolling,
  "/en/controlling": im_kontrolling,
  "/cegaudit": im_cegaudit,
  "/en/company-audit": im_cegaudit,
  "/konyvvizsgalat": im_vizsg,
  "/en/statutory-audit": im_vizsg,
  "/konyveloiroda-audit": im_iroda,
  "/en/accounting-firm-audit": im_iroda,
  "/digitalis-idomegtakaritasi-audit": im_ido,
  "/en/digital-time-saving-audit": im_ido,
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
              className="group relative flex flex-col justify-between rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary"
            >
              {/* Icon is absolutely placed so it never grows the card; title keeps clear of it. */}
              <h2 className="pr-16 text-base font-semibold text-card-foreground">{item.label}</h2>
              <span className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                {more}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
              {ICONS[item.to] && (
                <img src={ICONS[item.to]} alt="" aria-hidden="true" loading="lazy" width={56} height={56} className="absolute right-4 top-4 h-14 w-14 rounded-lg object-cover shadow-sm" />
              )}
            </Link>
          ))}
        </div>
        <div className="lg:sticky lg:top-24">
          <video src={heroVideo.url} poster={posterImg} autoPlay muted loop playsInline aria-label={videoLabel} className="w-full rounded-xl border border-border object-cover shadow-sm" />
        </div>
      </div>
    </div>
  );
}
