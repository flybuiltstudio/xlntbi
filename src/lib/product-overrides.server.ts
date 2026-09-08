/**
 * Server-side reader for the product description / price / custom-product
 * overrides. Uses the publishable key (public read-only policy), never the
 * admin client.
 */

import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import {
  applyProductOverrides,
  type ProductOverrideData,
} from "./product-overrides";
import type { CustomProductRow, CustomTier } from "./custom-products";

const EMPTY: ProductOverrideData = { content: [], prices: [], custom: [], categories: [] };

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

/** Parses the stored licence tiers, dropping anything malformed. */
export function parseTiers(value: unknown): CustomTier[] {
  if (!Array.isArray(value)) return [];
  const tiers: CustomTier[] = [];
  for (const entry of value) {
    if (!entry || typeof entry !== "object") continue;
    const row = entry as Record<string, unknown>;
    const id = typeof row["id"] === "string" ? row["id"] : "";
    const label = typeof row["label"] === "string" ? row["label"] : "";
    const price = typeof row["price"] === "number" ? row["price"] : 0;
    if (!id || !label || !Number.isInteger(price) || price <= 0) continue;
    tiers.push({
      id,
      label,
      price,
      note: typeof row["note"] === "string" && row["note"] ? row["note"] : null,
    });
  }
  return tiers;
}

/** Reads every override table. Never throws — falls back to the catalog. */
export async function readProductOverrides(): Promise<ProductOverrideData> {
  try {
    const supabase = publicClient();
    const [content, prices, custom, categories] = await Promise.all([
      supabase.from("product_content_overrides").select("*"),
      supabase.from("product_price_overrides").select("slug, tier_id, price"),
      supabase.from("custom_products").select("*"),
      supabase.from("custom_categories").select("*").order("sort_order"),
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
      custom: (custom.data ?? []).map(
        (row): CustomProductRow => ({
          slug: row.slug,
          name: row.name,
          tagline: row.tagline,
          status: row.status === "coming_soon" ? "coming_soon" : "available",
          categoryKey: row.category_key,
          position: row.position,
          imagePath: row.image_path,
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
          tiers: parseTiers(row.tiers),
          downloadFileName: row.download_file_name,
          downloadStoragePath: row.download_storage_path,
          stripeError: row.stripe_error,
          updatedAt: row.updated_at,
        }),
      ),
      categories: (categories.data ?? []).map((row) => ({
        key: row.key,
        title: row.title,
        titleEn: row.title_en,
        sortOrder: row.sort_order,
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
