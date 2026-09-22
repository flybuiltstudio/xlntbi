import { createServerFn } from "@tanstack/react-start";
import type { ProductPlacement } from "@/lib/product-categories";

/**
 * Public read of the admin-managed product category/order overrides.
 * The tables carry admin bookkeeping columns and are not readable by
 * anonymous clients, so the read happens here with the trusted server client
 * and only the public columns are returned.
 * Falls back to an empty list, in which case the bundled order applies.
 */
export const getProductPlacements = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ placements: ProductPlacement[]; categoryOrder: string[] }> => {
    try {
      const { supabaseAdmin: supabase } = await import("@/integrations/supabase/client.server");
      const [placementsResult, orderResult] = await Promise.all([
        supabase.from("product_placements").select("slug, category, sort_order"),
        supabase
          .from("product_category_order")
          .select("key, sort_order")
          .order("sort_order", { ascending: true }),
      ]);
      const placements = (placementsResult.data ?? []).map((row) => ({
        slug: row.slug,
        category: row.category,
        sortOrder: row.sort_order,
      }));
      const categoryOrder = (orderResult.data ?? []).map((row) => row.key);
      return { placements, categoryOrder };
    } catch {
      return { placements: [], categoryOrder: [] };
    }
  },
);
