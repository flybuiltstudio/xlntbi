import { Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import type { ReactNode } from "react";

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
          {listItems.map((item) => (
            <li
              key={item}
              className="flex items-start gap-3 rounded-lg border border-border bg-card p-4 text-sm font-medium text-card-foreground"
            >
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
              {item}
            </li>
          ))}
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
                {closing.items.map((item) => (
                  <li
                    key={item}
                    className="rounded-lg border border-border bg-card p-4 text-sm font-medium text-card-foreground"
                  >
                    {item}
                  </li>
                ))}
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
