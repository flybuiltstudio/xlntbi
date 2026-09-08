/**
 * Admin-side operations for the product description overrides:
 * Word upload -> AI draft (Hungarian + English) -> editable preview -> publish.
 */

import { getProduct } from "./products";
import { PRODUCT_SUMMARY_EN } from "./products-en";
import type { ProductDescriptionDraft } from "./product-content.server";

export const DOCX_MAX_BYTES = 10 * 1024 * 1024;

export type ProductContentInfo = {
  slug: string;
  productName: string;
  fileName: string;
  updatedAt: string;
  hasEnglish: boolean;
};

export type DraftPair = {
  hu: ProductDescriptionDraft;
  en: ProductDescriptionDraft | null;
  enError?: string;
};

function decodeBase64(value: string): Uint8Array {
  const binary = atob(value.includes(",") ? (value.split(",").pop() as string) : value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

/** Lists the products that currently run on an uploaded description. */
export async function listProductContentOverrides(): Promise<ProductContentInfo[]> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin
    .from("product_content_overrides")
    .select("slug, source_file_name, updated_at, intro_en")
    .order("updated_at", { ascending: false });
  return (data ?? []).map((row) => ({
    slug: row.slug,
    productName: getProduct(row.slug)?.name ?? row.slug,
    fileName: row.source_file_name,
    updatedAt: row.updated_at,
    hasEnglish: (row.intro_en ?? []).length > 0,
  }));
}

/**
 * Word document -> Hungarian draft -> English draft. Nothing is stored yet:
 * the admin reviews and edits the result before publishing.
 */
export async function generateProductDescription(input: {
  slug: string;
  fileName: string;
  fileBase64: string;
}): Promise<{ ok: true; draft: DraftPair; documentChars: number } | { ok: false; error: string }> {
  const product = getProduct(input.slug);
  if (!product) return { ok: false, error: "Ismeretlen termék." };
  if (!input.fileName.toLowerCase().endsWith(".docx")) {
    return { ok: false, error: "Csak .docx fájl tölthető fel (Word dokumentum)." };
  }

  let bytes: Uint8Array;
  try {
    bytes = decodeBase64(input.fileBase64);
  } catch {
    return { ok: false, error: "A fájlt nem sikerült beolvasni." };
  }
  if (bytes.length === 0 || bytes.length > DOCX_MAX_BYTES) {
    return { ok: false, error: "A fájl mérete legfeljebb 10 MB lehet." };
  }

  const { extractDocxText } = await import("./docx-text.server");
  const extracted = await extractDocxText(bytes);
  if (!extracted.ok) return { ok: false, error: extracted.error };

  const { draftHungarianDescription, translateDescriptionToEnglish } = await import(
    "./product-content.server"
  );
  const hu = await draftHungarianDescription({
    productName: product.name,
    documentText: extracted.text,
  });
  if (!hu.ok) return { ok: false, error: hu.error };

  const en = await translateDescriptionToEnglish({
    productName: product.name,
    draft: hu.draft,
  });

  return {
    ok: true,
    documentChars: extracted.text.length,
    draft: en.ok
      ? { hu: hu.draft, en: en.draft }
      : { hu: hu.draft, en: null, enError: en.error },
  };
}

/** Stores the reviewed drafts as the live description of a product. */
export async function publishProductDescription(input: {
  slug: string;
  fileName: string;
  hu: ProductDescriptionDraft;
  en: ProductDescriptionDraft | null;
  updatedBy: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!getProduct(input.slug)) return { ok: false, error: "Ismeretlen termék." };
  if (!input.hu.intro.length || !input.hu.features.length) {
    return { ok: false, error: "A bevezető és a funkciólista nem lehet üres." };
  }

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { error } = await supabaseAdmin.from("product_content_overrides").upsert(
    {
      slug: input.slug,
      intro: input.hu.intro,
      features: input.hu.features,
      why: input.hu.why || null,
      summary: input.hu.summary || null,
      meta_title: input.hu.metaTitle || null,
      meta_description: input.hu.metaDescription || null,
      intro_en: input.en?.intro ?? [],
      features_en: input.en?.features ?? [],
      why_en: input.en?.why || null,
      summary_en: input.en?.summary || null,
      meta_title_en: input.en?.metaTitle || null,
      meta_description_en: input.en?.metaDescription || null,
      source_file_name: input.fileName,
      updated_by: input.updatedBy,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "slug" },
  );
  if (error) return { ok: false, error: "A mentés nem sikerült. Próbáld újra." };

  const { ensureProductOverrides } = await import("./product-overrides.server");
  await ensureProductOverrides(true);
  return { ok: true };
}

/** Re-translates the stored Hungarian description into English. */
export async function regenerateEnglishDescription(input: {
  slug: string;
}): Promise<{ ok: true; draft: ProductDescriptionDraft } | { ok: false; error: string }> {
  const product = getProduct(input.slug);
  if (!product) return { ok: false, error: "Ismeretlen termék." };

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin
    .from("product_content_overrides")
    .select("intro, features, why, summary, meta_title, meta_description")
    .eq("slug", input.slug)
    .maybeSingle();
  if (!data || !(data.intro ?? []).length) {
    return {
      ok: false,
      error: "Ehhez a termékhez nincs mentett magyar leírás, amiből fordítani lehetne.",
    };
  }

  const { translateDescriptionToEnglish } = await import("./product-content.server");
  const translated = await translateDescriptionToEnglish({
    productName: product.name,
    draft: {
      intro: data.intro ?? [],
      features: data.features ?? [],
      why: data.why ?? "",
      summary: data.summary ?? "",
      metaTitle: data.meta_title ?? "",
      metaDescription: data.meta_description ?? "",
    },
  });
  if (!translated.ok) return { ok: false, error: translated.error };
  return { ok: true, draft: translated.draft };
}

/** Saves only the English side of an existing description override. */
export async function saveEnglishDescription(input: {
  slug: string;
  en: ProductDescriptionDraft;
  updatedBy: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { error } = await supabaseAdmin
    .from("product_content_overrides")
    .update({
      intro_en: input.en.intro,
      features_en: input.en.features,
      why_en: input.en.why || null,
      summary_en: input.en.summary || null,
      meta_title_en: input.en.metaTitle || null,
      meta_description_en: input.en.metaDescription || null,
      updated_by: input.updatedBy,
      updated_at: new Date().toISOString(),
    })
    .eq("slug", input.slug);
  if (error) return { ok: false, error: "Az angol leírás mentése nem sikerült." };
  const { ensureProductOverrides } = await import("./product-overrides.server");
  await ensureProductOverrides(true);
  return { ok: true };
}

/** Removes an override, restoring the bundled description. */
export async function deleteProductContentOverride(
  slug: string,
): Promise<{ ok: boolean }> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { error } = await supabaseAdmin
    .from("product_content_overrides")
    .delete()
    .eq("slug", slug);
  if (!error) {
    const { ensureProductOverrides } = await import("./product-overrides.server");
    await ensureProductOverrides(true);
  }
  return { ok: !error };
}

/** The bundled (code) description of a product — shown as a starting point. */
export function catalogDescription(slug: string): ProductDescriptionDraft | null {
  const product = getProduct(slug);
  if (!product) return null;
  return {
    intro: [...product.intro],
    features: [...product.features],
    why: product.why ?? "",
    summary: product.intro[0] ?? "",
    metaTitle: product.metaTitle,
    metaDescription: product.metaDescription,
  };
}

/** The bundled English summary of a product (for reference in the panel). */
export function catalogSummaryEn(slug: string): string {
  return PRODUCT_SUMMARY_EN[slug] ?? "";
}
