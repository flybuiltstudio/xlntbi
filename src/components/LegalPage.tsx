import type { ReactNode } from "react";

export type LegalSection = {
  heading: string;
  paragraphs?: string[];
  list?: string[];
  afterList?: string[];
};

type Props = {
  title: string;
  intro?: string[];
  sections: LegalSection[];
  footer?: ReactNode;
};

export function LegalPage({ title, intro, sections, footer }: Props) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 md:py-20">
      <h1 className="text-3xl font-bold text-foreground md:text-4xl">{title}</h1>
      {intro?.map((p) => (
        <p key={p} className="mt-4 text-base leading-relaxed text-muted-foreground">
          {p}
        </p>
      ))}
      <div className="mt-10 space-y-10">
        {sections.map((section) => (
          <section key={section.heading}>
            <h2 className="text-xl font-semibold text-foreground">{section.heading}</h2>
            {section.paragraphs?.map((p) => (
              <p key={p} className="mt-3 text-base leading-relaxed text-muted-foreground">
                {p}
              </p>
            ))}
            {section.list?.length ? (
              <ul className="mt-4 list-disc space-y-2 pl-6 text-base leading-relaxed text-muted-foreground">
                {section.list.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : null}
            {section.afterList?.map((p) => (
              <p key={p} className="mt-3 text-base leading-relaxed text-muted-foreground">
                {p}
              </p>
            ))}
          </section>
        ))}
      </div>
      {footer ? <div className="mt-12">{footer}</div> : null}
    </div>
  );
}
