/**
 * Server-side reader for the product description / price overrides.
 * Uses the publishable key (public read-only policy), never the admin client.
 */

import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import {
  applyProductOverrides,
  type ProductOverrideData,
} from "./product-overrides";

const EMPTY: ProductOverrideData = { content: [], prices: [] };

function publicClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(process.env["SUPABASE_URL"]!, key, {
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
}

/** Reads both override tables. Never throws — falls back to the catalog. */
export async function readProductOverrides(): Promise<ProductOverrideData> {
  try {
    const supabase = publicClient();
    const [content, prices] = await Promise.all([
      supabase.from("product_content_overrides").select("*"),
      supabase.from("product_price_overrides").select("slug, tier_id, price"),
    ]);
    return {
      content: (content.data ?? []).map((row) => ({
        slug: row.slug,
        intro: row.intro ?? [],
        features: row.features ?? [],
        why: row.why,
        summary: row.summary,
        metaTitle: row.meta_title,
        metaDescription: row.meta_description,
        introEn: row.intro_en ?? [],
        featuresEn: row.features_en ?? [],
        whyEn: row.why_en,
        summaryEn: row.summary_en,
        metaTitleEn: row.meta_title_en,
        metaDescriptionEn: row.meta_description_en,
        sourceFileName: row.source_file_name,
        updatedAt: row.updated_at,
      })),
      prices: (prices.data ?? []).map((row) => ({
        slug: row.slug,
        tierId: row.tier_id,
        price: row.price,
      })),
    };
  } catch {
    return EMPTY;
  }
}

let lastLoad = 0;

/**
 * Makes sure the catalog in this worker instance carries the current
 * overrides. Used by server-side flows (order creation, e-mails, Stripe)
 * that do not go through the root route loader. Cached for 30 seconds.
 */
export async function ensureProductOverrides(force = false): Promise<void> {
  const now = Date.now();
  if (!force && now - lastLoad < 30_000) return;
  lastLoad = now;
  applyProductOverrides(await readProductOverrides());
}
