/**
 * On-page navigation for the long "Termékek és Kalkulátorok" admin page:
 * a two-column, heading-less table of contents plus a "Tetejére" link that
 * each panel renders at its bottom.
 */

export const TOC_ANCHOR = "tartalom-jegyzek";

const productLinks = [
  ["uj-termek", "Új termék feltöltése"],
  ["kategoriak", "Termékkategóriák kezelése"],
  ["termek-verzio", "Termék új verziója"],
  ["termek-leiras", "Termékleírás frissítése"],
  ["termek-arak", "Termékárak frissítése"],
  ["sorrend", "Termékek sorrendje és kategóriája"],
] as const;

const calculatorLinks = [
  ["uj-kalkulator", "Új kalkulátor feltöltése"],
  ["kalkulator-frissites", "Kalkulátor frissítése"],
  ["kalkulator-sorrend", "Kalkulátorok sorrendje"],
] as const;

const buttonClass =
  "block rounded-md border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-primary hover:bg-accent";

export function AdminToc() {
  return (
    <nav id={TOC_ANCHOR} className="mt-6 grid gap-2 sm:grid-cols-2" aria-label="Tartalomjegyzék">
      <div className="grid gap-2 content-start">
        {productLinks.map(([id, label]) => (
          <a key={id} href={`#${id}`} className={buttonClass}>
            {label}
          </a>
        ))}
      </div>
      <div className="grid gap-2 content-start">
        {calculatorLinks.map(([id, label]) => (
          <a key={id} href={`#${id}`} className={buttonClass}>
            {label}
          </a>
        ))}
      </div>
    </nav>
  );
}

export function BackToTop() {
  return (
    <div className="mt-6 text-right">
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="rounded-md border border-border bg-background px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:border-primary hover:bg-accent hover:text-foreground"
      >
        ↑ Tetejére
      </button>
    </div>
  );
}
