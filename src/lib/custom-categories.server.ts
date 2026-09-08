/**
 * Admin management of the product categories.
 *
 * The bundled categories stay in the code; the database only stores what the
 * admin changed: a renamed title, a new category or a different order. A
 * renamed bundled category keeps its URL key, so no link breaks.
 */

import { productCategories } from "./product-categories";
import { slugifyName } from "./custom-products";

export type CategoryAdminRow = {
  key: string;
  title: string;
  titleEn: string;
  bundled: boolean;
  productCount: number;
  sortOrder: number;
};

/** Every category currently shown on the site, admin metadata included. */
export async function listAdminCategories(): Promise<CategoryAdminRow[]> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { ensureProductOverrides } = await import("./product-overrides.server");
  await ensureProductOverrides(true);
  const { data } = await supabaseAdmin.from("custom_categories").select("key, bundled");
  const bundledFlag = new Map((data ?? []).map((row) => [row.key, row.bundled]));
  return productCategories.map((category, index) => ({
    key: category.key,
    title: category.title,
    titleEn: category.titleEn,
    bundled: bundledFlag.get(category.key) ?? true,
    productCount: category.slugs.length,
    sortOrder: index,
  }));
}

/** True when the key belongs to a category that exists right now. */
export async function customCategoryExists(key: string): Promise<boolean> {
  const { ensureProductOverrides } = await import("./product-overrides.server");
  await ensureProductOverrides(true);
  return productCategories.some((category) => category.key === key);
}

async function persist(rows: CategoryAdminRow[], updatedBy: string): Promise<void> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const now = new Date().toISOString();
  await supabaseAdmin.from("custom_categories").upsert(
    rows.map((row, index) => ({
      key: row.key,
      title: row.title,
      title_en: row.titleEn,
      bundled: row.bundled,
      sort_order: index,
      updated_by: updatedBy,
      updated_at: now,
    })),
    { onConflict: "key" },
  );
  const { ensureProductOverrides } = await import("./product-overrides.server");
  await ensureProductOverrides(true);
}

/** Creates a new, empty category. */
export async function createCategory(input: {
  title: string;
  titleEn: string;
  updatedBy: string;
}): Promise<{ ok: boolean; error?: string; key?: string }> {
  const title = input.title.trim();
  const titleEn = input.titleEn.trim() || title;
  if (title.length < 3) return { ok: false, error: "Adj meg kategórianevet." };
  const key = slugifyName(title);
  if (!key) return { ok: false, error: "A névből nem képezhető URL-kulcs." };

  const rows = await listAdminCategories();
  if (rows.some((row) => row.key === key)) {
    return { ok: false, error: "Már van ilyen kategória." };
  }
  rows.push({ key, title, titleEn, bundled: false, productCount: 0, sortOrder: rows.length });
  await persist(rows, input.updatedBy);
  return { ok: true, key };
}

/** Renames a category. The URL key never changes, so links stay valid. */
export async function renameCategory(input: {
  key: string;
  title: string;
  titleEn: string;
  updatedBy: string;
}): Promise<{ ok: boolean; error?: string }> {
  const rows = await listAdminCategories();
  const target = rows.find((row) => row.key === input.key);
  if (!target) return { ok: false, error: "Ismeretlen kategória." };
  if (input.title.trim().length < 3) return { ok: false, error: "Adj meg kategórianevet." };
  target.title = input.title.trim();
  target.titleEn = input.titleEn.trim() || target.title;
  await persist(rows, input.updatedBy);
  return { ok: true };
}

/** Deletes an empty, admin-created category. */
export async function deleteCategory(key: string): Promise<{ ok: boolean; error?: string }> {
  const rows = await listAdminCategories();
  const target = rows.find((row) => row.key === key);
  if (!target) return { ok: false, error: "Ismeretlen kategória." };
  if (target.bundled) return { ok: false, error: "Beépített kategória nem törölhető." };
  if (target.productCount > 0) {
    return { ok: false, error: "Csak üres kategória törölhető." };
  }
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { error } = await supabaseAdmin.from("custom_categories").delete().eq("key", key);
  if (error) return { ok: false, error: error.message };
  const { ensureProductOverrides } = await import("./product-overrides.server");
  await ensureProductOverrides(true);
  return { ok: true };
}
