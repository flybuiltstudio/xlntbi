/**
 * Storage housekeeping — read-only scan of the private `termekfajlok` bucket.
 *
 * Lists every stored object and compares it against every path the app can
 * still hand out: bundled + admin created products (download file and image),
 * custom calculator assets, product file versions, and every issued download
 * token (paid orders, free downloads, DEMO requests). Anything not referenced
 * is reported as an orphan candidate — nothing is deleted by the scan itself.
 *
 * Non-expiring free (Tudástár) links are treated as live references, so their
 * files can never show up as deletable.
 */

import { DOWNLOAD_BUCKET } from "./download.server";
import { products } from "./products";

/** Files younger than this are never offered for deletion (fresh uploads). */
const FRESH_DAYS = 30;

export type OrphanRow = {
  path: string;
  size: number | null;
  updatedAt: string | null;
};

export type StorageCleanupReport = {
  ranAt: string;
  totalObjects: number;
  referenced: number;
  freshSkipped: number;
  orphans: OrphanRow[];
};

type StoredObject = { path: string; size: number | null; updatedAt: string | null };

/** Recursively lists every object in the bucket (folders are walked depth-first). */
async function listAllObjects(prefix = "", depth = 0): Promise<StoredObject[]> {
  if (depth > 6) return [];
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const out: StoredObject[] = [];
  let offset = 0;
  for (;;) {
    const { data, error } = await supabaseAdmin.storage
      .from(DOWNLOAD_BUCKET)
      .list(prefix, { limit: 100, offset });
    if (error || !data || data.length === 0) break;
    for (const entry of data) {
      const path = prefix ? `${prefix}/${entry.name}` : entry.name;
      const isFolder = entry.id === null;
      if (isFolder) {
        out.push(...(await listAllObjects(path, depth + 1)));
      } else {
        out.push({
          path,
          size: (entry.metadata as { size?: number } | null)?.size ?? null,
          updatedAt: entry.updated_at ?? entry.created_at ?? null,
        });
      }
    }
    if (data.length < 100) break;
    offset += data.length;
  }
  return out;
}

/** Every storage path the app may still serve. */
async function collectReferencedPaths(): Promise<Set<string>> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const refs = new Set<string>();
  const add = (value: unknown) => {
    if (typeof value === "string" && value.trim()) refs.add(value.trim());
  };

  // Bundled catalog (includes admin overrides once they are layered in).
  const { ensureProductOverrides } = await import("./product-overrides.server");
  await ensureProductOverrides(true);
  for (const product of products) add(product.download?.storagePath);

  const [custom, calculators, versions, orderTokens, freeTokens] = await Promise.all([
    supabaseAdmin.from("custom_products").select("download_storage_path, image_path"),
    supabaseAdmin.from("custom_calculators").select("image_hu_path, image_en_path"),
    supabaseAdmin.from("product_file_versions").select("product_slug, file_name"),
    supabaseAdmin.from("order_downloads").select("storage_path"),
    supabaseAdmin.from("free_download_requests").select("storage_path"),
  ]);

  for (const row of custom.data ?? []) {
    add(row.download_storage_path);
    add(row.image_path);
  }
  for (const row of calculators.data ?? []) {
    add(row.image_hu_path);
    add(row.image_en_path);
  }
  for (const row of versions.data ?? []) {
    if (row.file_name) add(`termekek/${row.product_slug}/${row.file_name}`);
  }
  for (const row of orderTokens.data ?? []) add(row.storage_path);
  for (const row of freeTokens.data ?? []) add(row.storage_path);

  // Product and category images live in storage too.
  const [images, categories] = await Promise.all([
    supabaseAdmin.from("product_placements").select("slug"),
    supabaseAdmin.from("custom_categories").select("image_path"),
  ]);
  void images;
  for (const row of categories.data ?? []) add(row.image_path);

  return refs;
}

/** Runs the read-only scan and returns the orphan candidates. */
export async function scanStorageOrphans(): Promise<StorageCleanupReport> {
  const [objects, refs] = await Promise.all([listAllObjects(), collectReferencedPaths()]);
  const freshBefore = Date.now() - FRESH_DAYS * 24 * 60 * 60 * 1000;

  let referenced = 0;
  let freshSkipped = 0;
  const orphans: OrphanRow[] = [];

  for (const object of objects) {
    if (refs.has(object.path)) {
      referenced += 1;
      continue;
    }
    const stamp = object.updatedAt ? Date.parse(object.updatedAt) : NaN;
    if (!Number.isNaN(stamp) && stamp > freshBefore) {
      freshSkipped += 1;
      continue;
    }
    orphans.push({ path: object.path, size: object.size, updatedAt: object.updatedAt });
  }

  orphans.sort((a, b) => a.path.localeCompare(b.path, "hu"));

  return {
    ranAt: new Date().toISOString(),
    totalObjects: objects.length,
    referenced,
    freshSkipped,
    orphans,
  };
}

/**
 * Deletes the given storage objects — only after re-checking that they are
 * still unreferenced, so a file that got linked meanwhile is never removed.
 */
export async function deleteStorageObjects(
  paths: string[],
): Promise<{ ok: boolean; deleted: string[]; skipped: string[]; error?: string }> {
  const wanted = paths.map((p) => p.trim()).filter(Boolean);
  if (wanted.length === 0) return { ok: true, deleted: [], skipped: [] };

  const refs = await collectReferencedPaths();
  const deletable = wanted.filter((p) => !refs.has(p));
  const skipped = wanted.filter((p) => refs.has(p));
  if (deletable.length === 0) return { ok: true, deleted: [], skipped };

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { error } = await supabaseAdmin.storage.from(DOWNLOAD_BUCKET).remove(deletable);
  if (error) return { ok: false, deleted: [], skipped, error: error.message };
  return { ok: true, deleted: deletable, skipped };
}
