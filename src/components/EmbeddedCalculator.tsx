import { useEffect, useMemo, useRef } from "react";

import { sanitizeEmbeddedHtml } from "@/lib/sanitize-html";

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

  // Stored markup is hardened before it reaches the DOM: no inline scripts,
  // event handlers or script-ish URLs. The calculator engine itself is the
  // separately loaded `script`, so behaviour is unchanged.
  const safeHtml = useMemo(() => sanitizeEmbeddedHtml(html), [html]);

  return (
    <div ref={containerRef}>
      <div dangerouslySetInnerHTML={{ __html: safeHtml }} />
    </div>
  );
}
