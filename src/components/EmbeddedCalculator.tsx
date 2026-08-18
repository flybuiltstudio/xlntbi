import { useEffect, useRef } from "react";

type Props = {
  html: string;
  script: string;
};

/**
 * Renders the original calculator markup (identical to the previous site) on the
 * server so crawlers see the full content, then runs its vanilla-JS engine
 * after hydration.
 */
export function EmbeddedCalculator({ html, script }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const el = document.createElement("script");
    el.type = "text/javascript";
    el.text = script;
    container.appendChild(el);
    return () => {
      el.remove();
    };
  }, [script]);

  return (
    <div ref={containerRef}>
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
