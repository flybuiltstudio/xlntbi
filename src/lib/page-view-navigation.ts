import { servicePageItems } from "./services";

const servicePaths = new Set(servicePageItems.map((item) => item.to));

const normalizePath = (path: string) => path.replace(/\/+$/, "") || "/";

export function isCountedPagePath(pathname: string): boolean {
  const path = normalizePath(pathname);
  return servicePaths.has(path) || /^\/(?:termek|en\/product)\/[a-z0-9-]+$/.test(path);
}

/** Use real document delivery for counted destinations, not a public write RPC.
 * The server still validates product existence and owns all counter keys.
 * Same-page search/hash changes must not reload a form or inflate its views.
 */
export function requiresCountedDocument(nextPath: string, currentPath: string): boolean {
  const path = normalizePath(nextPath);
  if (path === normalizePath(currentPath)) return false;
  return isCountedPagePath(path);
}

/** History and bfcache restoration bypass router.navigate. Request an actual
 * document for these counted visits too, without any client-side counter write.
 * Install only after hydration; no browser globals are read during SSR.
 */
export type CountedHistoryChange = { pathname: string; isHistoryReturn: boolean };

export function installCountedHistoryNavigation(
  subscribeToHistory: (listener: (change: CountedHistoryChange) => void) => () => void,
): () => void {
  let previousPath = window.location.pathname;
  let reloading = false;
  const reload = () => {
    if (reloading) return;
    reloading = true;
    window.location.reload();
  };
  const disposeHistory = subscribeToHistory(({ pathname, isHistoryReturn }) => {
    if (isHistoryReturn && requiresCountedDocument(pathname, previousPath)) reload();
    previousPath = pathname;
  });
  const onPageShow = (event: PageTransitionEvent) => {
    if (event.persisted && isCountedPagePath(window.location.pathname)) reload();
  };
  window.addEventListener("pageshow", onPageShow);
  return () => {
    disposeHistory();
    window.removeEventListener("pageshow", onPageShow);
  };
}