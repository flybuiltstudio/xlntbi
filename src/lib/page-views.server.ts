/**
 * Aggregated page-view counters for product detail pages and service subpages.
 *
 * No personal data is stored: only a monthly counter per page. Writes happen
 * through a `security definer` SQL function so the table stays server-only.
 */

export type PageViewType = "product" | "service";

export type PageViewRow = {
  pageType: PageViewType;
  pageKey: string;
  year: number;
  month: number;
  views: number;
};

/** Increment the counter of one page for the current month. */
export async function recordView(pageType: PageViewType, pageKey: string): Promise<void> {
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
