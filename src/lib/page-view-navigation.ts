import { serviceItems } from "./services";
import { ROUTE_PAIRS } from "./i18n/routes";

const servicePaths = new Set<string>(serviceItems.map((item) => item.to));
for (const pair of ROUTE_PAIRS) {
  if (servicePaths.has(pair.hu)) servicePaths.add(pair.en);
}

const normalizePath = (path: string) => path.replace(/\/+$/, "") || "/";

/** Use real document delivery for counted destinations, not a public write RPC.
 * The server still validates product existence and owns all counter keys.
 * Same-page search/hash changes must not reload a form or inflate its views.
 */
export function requiresCountedDocument(nextPath: string, currentPath: string): boolean {
  const path = normalizePath(nextPath);
  if (path === normalizePath(currentPath)) return false;
  return servicePaths.has(path) || /^\/(?:termek|en\/product)\/[a-z0-9-]+$/.test(path);
}