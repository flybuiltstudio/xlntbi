import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import type { ProductPlacement } from "@/lib/product-categories";

/**
 * Public read of the admin-managed product category/order overrides.
 * Falls back to an empty list, in which case the bundled order applies.
 */
export const getProductPlacements = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ placements: ProductPlacement[] }> => {
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
      const { data, error } = await supabase
        .from("product_placements")
        .select("slug, category, sort_order");
      if (error || !data) return { placements: [] };
      return {
        placements: data.map((row) => ({
          slug: row.slug,
          category: row.category,
          sortOrder: row.sort_order,
        })),
      };
    } catch {
      return { placements: [] };
    }
  },
);
