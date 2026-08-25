import { readConsent, type ConsentState } from "@/components/CookieConsent";

/**
 * Google Analytics 4 (gtag.js) loader that respects cookie consent.
 *
 * GA4 measurement IDs are publishable (not secret), so this is safe in the
 * browser bundle. The script is only injected once the visitor has granted
 * "statistics" consent via the CookieConsent banner, per EU/GDPR rules.
 *
 * On SPA route changes (TanStack Router) a manual page_view event is sent so
 * GA4 records client-side navigations, not just the initial load.
 */

const GA_MEASUREMENT_ID = "G-PHGLH1TL5X";

let loaded = false;
let lastPath = "";

type GtagArgs = unknown[];
declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: GtagArgs) => void;
  }
}

function injectGtag() {
  if (loaded || typeof document === "undefined") return;
  loaded = true;

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  function gtag(...args: GtagArgs) {
    window.dataLayer!.push(args);
  }
  window.gtag = gtag;

  gtag("js", new Date());
  gtag("config", GA_MEASUREMENT_ID, { send_page_view: false });
  // Record the initial page view now that consent has been granted.
  gtag("event", "page_view", { page_path: location.pathname });
  lastPath = location.pathname;
}

function trackPageView(path: string) {
  if (!loaded || !window.gtag) return;
  if (path === lastPath) return;
  lastPath = path;
  window.gtag("event", "page_view", { page_path: path });
}

/** Remove the GA script + dataLayer (used when the user withdraws consent). */
function removeGtag() {
  if (!loaded) return;
  loaded = false;
  lastPath = "";
  document
    .querySelectorAll(
      `script[src^="https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}"]`,
    )
    .forEach((s) => s.remove());
  // Clear the data layer so no pending events fire.
  if (window.dataLayer) window.dataLayer.length = 0;
  window.gtag = undefined;
}

function applyConsent(state: ConsentState | null) {
  if (state?.statistics) {
    injectGtag();
  } else {
    removeGtag();
  }
}

/**
 * Call once on the client (e.g. in a useEffect in the root component).
 * Wires GA4 to the cookie-consent state and to route changes.
 */
export function initAnalytics() {
  if (typeof window === "undefined") return;

  // Apply whatever consent already exists (returning visitor who said yes).
  applyConsent(readConsent());

  // React to future consent changes from the banner.
  window.addEventListener("xlntbi:cookie-consent", (e) => {
    applyConsent((e as CustomEvent<ConsentState>).detail);
  });

  // Track SPA navigations.
  window.addEventListener("xlntbi:route-change", (e) => {
    const path = (e as CustomEvent<{ path: string }>).detail?.path;
    if (path) trackPageView(path);
  });

  // Fallback: also listen to popstate for non-router navigations.
  window.addEventListener("popstate", () => trackPageView(location.pathname));
}

export const GA_MEASUREMENT_ID_EXPORT = GA_MEASUREMENT_ID;
