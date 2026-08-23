import heroImg from "@/assets/bcg-savok.jpg";
import type { ReactNode } from "react";

export function PageHero({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className="relative isolate overflow-hidden">
      <img
        src={heroImg}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-brand-dark/90 via-brand-dark/80 to-brand-dark/60" />
      <div
        className={`relative mx-auto max-w-6xl px-4 py-10 md:py-12 ${className ?? ""}`}
      >
        {children}
      </div>
    </section>
  );
}
