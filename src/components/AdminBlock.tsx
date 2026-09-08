import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

/**
 * Unified admin block header. Every admin panel gets exactly one h2 in this
 * shape (icon + xl bold title + one short Hungarian description line), so the
 * check pages read consistently no matter which panel renders below.
 */
export function AdminBlock({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: LucideIcon;
  title: string;
  description: ReactNode;
  children: ReactNode;
}) {
  return (
    <section>
      <h2 className="flex items-center gap-2 text-xl font-bold text-foreground">
        <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
        {title}
      </h2>
      <p className="mt-2 max-w-3xl text-sm text-muted-foreground">{description}</p>
      {children}
    </section>
  );
}
