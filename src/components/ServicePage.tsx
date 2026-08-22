import { Link } from "@tanstack/react-router";
import {
  BarChart3,
  Bot,
  Brain,
  Building2,
  CalendarClock,
  ChartPie,
  CircleDollarSign,
  ClipboardCheck,
  Cog,
  Database,
  FileSpreadsheet,
  FileText,
  GraduationCap,
  Landmark,
  Laptop,
  Link2,
  MessageSquare,
  Percent,
  ScrollText,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  User,
  Users,
  Workflow,
  Zap,
  Check,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";

const ICON_RULES: Array<[RegExp, LucideIcon]> = [
  [/riport|dashboard|beszámoló/i, BarChart3],
  [/power bi|adatösszekapcsol|adatbevitel|adatb/i, Database],
  [/excel|képlet|táblá/i, FileSpreadsheet],
  [/makró|automatiz|automatizál/i, Cog],
  [/\bai\b|mesterséges/i, Sparkles],
  [/gyorsít|hibaforrás|felesleges manuális/i, Zap],
  [/könyvvizsgálat|átvilágítás|due diligence|audit/i, ClipboardCheck],
  [/kontroll|minőségbiztosítás/i, ShieldCheck],
  [/kockázat/i, Search],
  [/nav|bevallás|adózás|adó/i, Landmark],
  [/áfa|százalék/i, Percent],
  [/profit|elemzés|döntés/i, TrendingUp],
  [/projekt|folyamat|munkafolyamat/i, Workflow],
  [/zárás|határidő/i, CalendarClock],
  [/kifizetés|juttatás|pénzügy|díj|költség/i, CircleDollarSign],
  [/oktatás|vizsga|felkészít|tanul|gyakorlat|hallgató|egyetem|főiskola/i, GraduationCap],
  [/kommunikáció|egyeztetés/i, MessageSquare],
  [/csapat|feladatkiosztás|könyvelőirod/i, Users],
  [/cég|vállalkoz/i, Building2],
  [/magánszemély|egyéni/i, User],
  [/magánszemély|egyéni|pályakezdő|kezdő/i, User],
  [/haladó/i, Brain],
  [/szakember|ügyfél/i, Users],
  [/digitál|online|papírmentes|szoftver/i, Laptop],
  [/könyvelés|ügyvitel|ügyintézés|könyvelő|mérlegképes/i, ScrollText],
  [/modell|logika/i, ChartPie],
  [/összekapcsol|integrá/i, Link2],
  [/robot|bot/i, Bot],
  [/szemlélet|tudás/i, Brain],
  [/dokumentum|irat|szerződés/i, FileText],
];

function iconFor(label: string): LucideIcon {
  for (const [pattern, Icon] of ICON_RULES) {
    if (pattern.test(label)) return Icon;
  }
  return Check;
}

export type ServicePageProps = {
  title: string;
  intro: string[];
  ctaLabel: string;
  ctaTo: string;
  image: string;
  imageAlt: string;
  listTitle: string;
  listItems: string[];
  closing?: {
    eyebrow?: string;
    heading: string;
    text?: string;
    items?: string[];
    ctaLabel?: string;
    ctaTo?: string;
  };
  children?: ReactNode;
};

export function ServicePage({
  title,
  intro,
  ctaLabel,
  ctaTo,
  image,
  imageAlt,
  listTitle,
  listItems,
  closing,
  children,
}: ServicePageProps) {
  return (
    <div>
      <section className="border-b border-border bg-secondary/60">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-2 md:py-20">
          <div>
            <h1 className="text-3xl font-bold leading-tight text-foreground md:text-4xl">
              {title}
            </h1>
            {intro.map((p) => (
              <p key={p} className="mt-5 text-base leading-relaxed text-muted-foreground">
                {p}
              </p>
            ))}
            <Link
              to={ctaTo}
              className="mt-8 inline-flex items-center rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-brand-dark"
            >
              {ctaLabel}
            </Link>
          </div>
          <img
            src={image}
            alt={imageAlt}
            loading="lazy"
            className="w-full rounded-xl border border-border object-cover shadow-sm"
          />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-2xl font-bold text-foreground">{listTitle}</h2>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {listItems.map((item) => {
            const Icon = iconFor(item);
            return (
              <li
                key={item}
                className="flex items-start gap-3 rounded-lg border border-border bg-card p-4 text-sm font-medium text-card-foreground"
              >
                <Icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                {item}
              </li>
            );
          })}
        </ul>
        <Link
          to="/kapcsolat"
          className="mt-8 inline-flex items-center rounded-md border border-input px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-accent"
        >
          Kapcsolat
        </Link>
      </section>

      {closing ? (
        <section className="border-t border-border bg-secondary/60">
          <div className="mx-auto max-w-6xl px-4 py-16">
            {closing.eyebrow ? (
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                {closing.eyebrow}
              </p>
            ) : null}
            <h2 className="mt-2 text-2xl font-bold text-foreground">{closing.heading}</h2>
            {closing.text ? (
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
                {closing.text}
              </p>
            ) : null}
            {closing.items ? (
              <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {closing.items.map((item) => {
                  const Icon = iconFor(item);
                  return (
                    <li
                      key={item}
                      className="flex items-start gap-3 rounded-lg border border-border bg-card p-4 text-sm font-medium text-card-foreground"
                    >
                      <Icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                      {item}
                    </li>
                  );
                })}
              </ul>
            ) : null}
            {closing.ctaLabel && closing.ctaTo ? (
              <Link
                to={closing.ctaTo}
                className="mt-8 inline-flex items-center rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-brand-dark"
              >
                {closing.ctaLabel}
              </Link>
            ) : null}
          </div>
        </section>
      ) : null}

      {children}
    </div>
  );
}
