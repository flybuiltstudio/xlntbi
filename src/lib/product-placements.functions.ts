import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import type { ProductPlacement } from "@/lib/product-categories";

/**
 * Public read of the admin-managed product category/order overrides.
 * Falls back to an empty list, in which case the bundled order applies.
 */
export const getProductPlacements = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ placements: ProductPlacement[]; categoryOrder: string[] }> => {
    try {
      const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
      const supabase = createClient<Database>(process.env["SUPABASE_URL"]!, key, {
        auth: { persistSession: false },
        global: {
          fetch: (input, init) => {
            const h = new Headers(init?.headers);
            if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) {
              h.delete("Authorization");
            }
            h.set("apikey", key);
            return fetch(input, { ...init, headers: h });
          },
        },
      });
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
