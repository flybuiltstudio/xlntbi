/**
 * Aggregated page-view counters for product detail pages and service subpages.
 *
 * No personal data is stored: only a monthly counter per page. Writes happen
 * through a `security definer` SQL function so the table stays server-only.
 */

import { getProduct } from "./products";
import { serviceItems } from "./services";
import { ROUTE_PAIRS } from "./i18n/routes";

export type PageViewType = "product" | "service";

export type PageViewRow = {
  pageType: PageViewType;
  pageKey: string;
  year: number;
  month: number;
  views: number;
};

const COUNTED_HOSTS = new Set(["xlntbi.hu", "www.xlntbi.hu", "xlntbi.lovable.app"]);
const SERVICE_PATHS = new Set<string>(serviceItems.map((item) => item.to));
for (const pair of ROUTE_PAIRS) {
  if (SERVICE_PATHS.has(pair.hu)) SERVICE_PATHS.add(pair.en);
}

/** Resolve only real catalog pages, never arbitrary counter keys. */
export function servedPageTarget(pathname: string): { pageType: PageViewType; pageKey: string } | null {
  const path = pathname.replace(/\/+$/, "") || "/";
  if (SERVICE_PATHS.has(path)) return { pageType: "service", pageKey: path };
  const productMatch = /^\/(?:termek|en\/product)\/([a-z0-9-]+)$/.exec(path);
  if (!productMatch) return null;
  const product = getProduct(productMatch[1]);
  return product ? { pageType: "product", pageKey: product.slug } : null;
}

/** Count only successful, published HTML document delivery. No public write RPC. */
export async function recordServedPageView(request: Request, response: Response): Promise<void> {
  const url = new URL(request.url);
  if (!COUNTED_HOSTS.has(url.hostname) || request.method !== "GET") return;
  if (response.status !== 200 || !response.headers.get("content-type")?.toLowerCase().startsWith("text/html")) return;
  if (!request.headers.get("accept")?.includes("text/html")) return;
  const destination = request.headers.get("sec-fetch-dest");
  if (destination && destination !== "document") return;
  if (request.headers.has("purpose") || request.headers.has("sec-purpose")) return;
  if (/bot|crawler|spider|crawling|preview/i.test(request.headers.get("user-agent") ?? "")) return;

  // SSR has already loaded the full catalog, including admin-created products.
  const target = servedPageTarget(url.pathname);
  if (!target) return;
  await incrementServedPage(target.pageType, target.pageKey);
}

/** Private write helper: reachable only after successful page delivery checks. */
async function incrementServedPage(pageType: PageViewType, pageKey: string): Promise<void> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const now = new Date();
  const { error } = await supabaseAdmin.rpc("increment_page_view", {
    _page_type: pageType,
    _page_key: pageKey,
    _year: now.getUTCFullYear(),
    _month: now.getUTCMonth() + 1,
  });
  if (error) console.error("[page-views] increment failed:", error.message);
}

/** All stored counters, for the admin statistics page. */
export async function listPageViews(): Promise<PageViewRow[]> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("page_views")
    .select("page_type, page_key, year, month, views");
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => ({
    pageType: row.page_type as PageViewType,
    pageKey: row.page_key,
    year: row.year,
    month: row.month,
    views: row.views,
  }));
}
