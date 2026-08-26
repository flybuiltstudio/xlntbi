import { useEffect } from "react";

import { recordPageView } from "./page-views.functions";

/** Hostnames where page views are counted (the published site only). */
const COUNTED_HOSTS = ["xlntbi.hu", "www.xlntbi.hu", "xlntbi.lovable.app"];

/**
 * Counts one page view for the given page on the published site.
 * Preview, localhost and obvious bots are ignored, and no personal data is sent.
 */
export function usePageView(pageType: "product" | "service", pageKey: string) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!COUNTED_HOSTS.includes(window.location.hostname)) return;
    if (/bot|crawler|spider|crawling|preview/i.test(navigator.userAgent)) return;

    let cancelled = false;
    const timer = window.setTimeout(() => {
      if (cancelled) return;
      recordPageView({ data: { pageType, pageKey } }).catch(() => {
        /* a counter failure must never break the page */
      });
    }, 400);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [pageType, pageKey]);
}
