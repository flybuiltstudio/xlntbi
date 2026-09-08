/**
 * Admin flow for creating a brand new product from the "Friss verzió" page.
 *
 * Steps:
 *   1. `prepareCustomProduct` — Word document -> Hungarian AI description ->
 *      English translation. Nothing is saved yet: the admin edits the preview.
 *   2. `publishCustomProduct` — creates the Stripe product and every licence
 *      price in BOTH the test and the live environment, stores the product row
 *      and returns signed upload URLs for the product file and the image.
 *      If the live Stripe environment refuses anything, nothing is published.
 *   3. `deleteCustomProduct` — removes the product from the site (the Stripe
 *      product is archived, so old payments stay intact).
 */

import { getProduct } from "./products";
import { extractDocxText } from "./docx-text.server";
import {
  draftHungarianDescription,
  translateDescriptionToEnglish,
  type ProductDescriptionDraft,
} from "./product-content.server";
import { createStripeClient, getStripeErrorMessage, type StripeEnv } from "./stripe.server";
import { withXlntPrefix } from "./product-name";
import {
  customPriceId,
  customProductFolder,
  slugifyName,
  type CustomTier,
} from "./custom-products";

const BUCKET = "termekfajlok";
const FILE_EXTS = ["xlsm", "exe", "zip", "pdf"];
const IMAGE_EXTS = ["jpg", "jpeg", "png", "webp"];
const FILE_MAX_BYTES = 300 * 1024 * 1024;
const IMAGE_MAX_BYTES = 5 * 1024 * 1024;
const DOCX_MAX_BYTES = 10 * 1024 * 1024;
const MIN_PRICE = 100;
const MAX_PRICE = 10_000_000;

export type CustomProductInfo = {
  slug: string;
  name: string;
  categoryKey: string;
  position: number;
  tiers: CustomTier[];
  fileName: string | null;
  hasImage: boolean;
  hasEnglish: boolean;
  stripeError: string | null;
  updatedAt: string;
};

function decodeBase64(value: string): Uint8Array {
  const binary = atob(value.includes(",") ? (value.split(",").pop() as string) : value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function ext(name: string): string {
  return name.split(".").pop()?.toLowerCase() ?? "";
}

/** Lists the admin-created products. */
export async function listCustomProducts(): Promise<CustomProductInfo[]> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { parseTiers } = await import("./product-overrides.server");
  const { data } = await supabaseAdmin
    .from("custom_products")
    .select(
      "slug, name, category_key, position, tiers, download_file_name, image_path, intro_en, stripe_error, updated_at",
    )
    .order("updated_at", { ascending: false });
  return (data ?? []).map((row) => ({
    slug: row.slug,
    name: row.name,
    categoryKey: row.category_key,
    position: row.position,
    tiers: parseTiers(row.tiers),
    fileName: row.download_file_name,
    hasImage: Boolean(row.image_path),
    hasEnglish: (row.intro_en ?? []).length > 0,
    stripeError: row.stripe_error,
    updatedAt: row.updated_at,
  }));
}

/** Word document -> editable Hungarian + English draft. Saves nothing. */
export async function prepareCustomProduct(input: {
  name: string;
  fileName: string;
  fileBase64: string;
}): Promise<
  | {
      ok: true;
      slug: string;
      hu: ProductDescriptionDraft;
      en: ProductDescriptionDraft | null;
      enError?: string;
    }
  | { ok: false; error: string }
> {
  const name = input.name.trim();
  if (name.length < 3) return { ok: false, error: "Adj meg egy termék nevet." };
  if (ext(input.fileName) !== "docx") {
    return { ok: false, error: "A leíráshoz .docx fájlt tölts fel." };
  }
  const bytes = decodeBase64(input.fileBase64);
  if (bytes.byteLength > DOCX_MAX_BYTES) {
    return { ok: false, error: "A Word dokumentum legfeljebb 10 MB lehet." };
  }
  const slug = slugifyName(name);
  if (!slug) return { ok: false, error: "A névből nem képezhető URL. Írd át a nevet." };
  if (getProduct(slug)) {
    return { ok: false, error: `Már létezik termék ezzel az URL-lel: /termek/${slug}` };
  }

  const text = await extractDocxText(bytes);
  if (!text.ok) return { ok: false, error: text.error };

  const hu = await draftHungarianDescription({
    productName: withXlntPrefix(name),
    documentText: text.text,
  });
  if (!hu.ok) return { ok: false, error: hu.error };

  const en = await translateDescriptionToEnglish({
    productName: withXlntPrefix(name),
    draft: hu.draft,
  });
  return {
    ok: true,
    slug,
    hu: hu.draft,
    en: en.ok ? en.draft : null,
    ...(en.ok ? {} : { enError: en.error }),
  };
}

function validateTiers(tiers: CustomTier[]): string | null {
  if (!tiers.length) return "Adj meg legalább egy licenc típust és árat.";
  const ids = new Set<string>();
  for (const tier of tiers) {
    if (!tier.id || !/^[a-z0-9-]+$/.test(tier.id)) return "Hibás licenc azonosító.";
    if (ids.has(tier.id)) return "Két licenc azonosító megegyezik.";
    ids.add(tier.id);
    if (!tier.label.trim()) return "Minden licenchez adj meg megnevezést.";
    if (!Number.isInteger(tier.price)) return "Az árakat egész forintban add meg.";
    if (tier.price < MIN_PRICE || tier.price > MAX_PRICE) {
      return `Az ár ${MIN_PRICE} és ${MAX_PRICE.toLocaleString("hu-HU")} Ft között lehet.`;
    }
  }
  return null;
}

/** Creates the Stripe product and every licence price in one environment. */
async function createStripeProduct(
  environment: StripeEnv,
  input: { slug: string; name: string; description: string; tiers: CustomTier[] },
): Promise<{ ok: true; productId: string } | { ok: false; error: string }> {
  try {
    const stripe = createStripeClient(environment);
    const product = await stripe.products.create({
      name: withXlntPrefix(input.name),
      description: input.description.slice(0, 500),
      metadata: { slug: input.slug },
      tax_code: "txcd_10000000",
    });
    for (const tier of input.tiers) {
      await stripe.prices.create({
        product: product.id,
        currency: "huf",
        // HUF is a decimal currency at Stripe: amounts travel in fillér.
        unit_amount: Math.round(tier.price * 100),
        lookup_key: customPriceId(input.slug, tier.id),
        transfer_lookup_key: true,
        tax_behavior: "inclusive",
        nickname: tier.label.slice(0, 200),
      });
    }
    return { ok: true, productId: product.id };
  } catch (error) {
    return { ok: false, error: getStripeErrorMessage(error) };
  }
}

async function archiveStripeProduct(environment: StripeEnv, productId: string): Promise<void> {
  try {
    const stripe = createStripeClient(environment);
    const prices = await stripe.prices.list({ product: productId, limit: 100 });
    for (const price of prices.data) {
      if (price.active) await stripe.prices.update(price.id, { active: false });
    }
    await stripe.products.update(productId, { active: false });
  } catch {
    // best effort: an orphan archived product does not affect the site
  }
}

export type CustomProductDraft = {
  intro: string[];
  features: string[];
  why: string;
  summary: string;
  metaTitle: string;
  metaDescription: string;
};

/**
 * Publishes the new product. Stripe (test AND live) has to accept everything,
 * otherwise nothing appears on the site.
 */
export async function publishCustomProduct(input: {
  slug: string;
  name: string;
  categoryKey: string;
  position: number;
  tiers: CustomTier[];
  hu: CustomProductDraft;
  en: CustomProductDraft | null;
  fileName: string;
  fileSize: number;
  imageName: string | null;
  updatedBy: string;
}): Promise<
  | {
      ok: true;
      slug: string;
      fileUpload: { path: string; token: string };
      imageUpload: { path: string; token: string } | null;
    }
  | { ok: false; error: string }
> {
  const name = input.name.trim();
  const slug = slugifyName(input.slug || name);
  if (!slug) return { ok: false, error: "Hibás URL-részlet." };
  if (getProduct(slug)) {
    return { ok: false, error: `Már létezik termék ezzel az URL-lel: /termek/${slug}` };
  }
  const tierError = validateTiers(input.tiers);
  if (tierError) return { ok: false, error: tierError };
  if (!input.hu.intro.length || !input.hu.features.length) {
    return { ok: false, error: "A magyar leírás bevezetője és funkciólistája nem lehet üres." };
  }
  if (!FILE_EXTS.includes(ext(input.fileName))) {
    return { ok: false, error: "A termékfájl xlsm, exe, zip vagy pdf lehet." };
  }
  if (input.fileSize <= 0 || input.fileSize > FILE_MAX_BYTES) {
    return { ok: false, error: "A termékfájl legfeljebb 300 MB lehet." };
  }
  if (input.imageName && !IMAGE_EXTS.includes(ext(input.imageName))) {
    return { ok: false, error: "A termékkép jpg, png vagy webp lehet." };
  }

  const { customCategoryExists } = await import("./custom-categories.server");
  if (!(await customCategoryExists(input.categoryKey))) {
    return { ok: false, error: "Ismeretlen kategória." };
  }

  const description = input.hu.summary || input.hu.intro[0] || name;
  const sandbox = await createStripeProduct("sandbox", {
    slug,
    name,
    description,
    tiers: input.tiers,
  });
  if (!sandbox.ok) {
    return { ok: false, error: `A teszt Stripe környezet elutasította: ${sandbox.error}` };
  }
  const live = await createStripeProduct("live", {
    slug,
    name,
    description,
    tiers: input.tiers,
  });
  if (!live.ok) {
    await archiveStripeProduct("sandbox", sandbox.productId);
    return {
      ok: false,
      error: `Az éles Stripe környezet elutasította, ezért a termék nem jött létre: ${live.error}`,
    };
  }

  const folder = customProductFolder(slug);
  const filePath = `${folder}/${input.fileName.split(/[\\/]/).pop()}`;
  const imagePath = input.imageName
    ? `${folder}/kep-${slug}.${ext(input.imageName)}`
    : null;

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const now = new Date().toISOString();
  const { error } = await supabaseAdmin.from("custom_products").insert({
    slug,
    name,
    status: "available",
    category_key: input.categoryKey,
    position: Math.max(0, input.position),
    image_path: imagePath,
    intro: input.hu.intro,
    features: input.hu.features,
    why: input.hu.why || null,
    summary: input.hu.summary || null,
    meta_title: input.hu.metaTitle || null,
    meta_description: input.hu.metaDescription || null,
    intro_en: input.en?.intro ?? [],
    features_en: input.en?.features ?? [],
    why_en: input.en?.why ?? null,
    summary_en: input.en?.summary ?? null,
    meta_title_en: input.en?.metaTitle ?? null,
    meta_description_en: input.en?.metaDescription ?? null,
    tiers: input.tiers,
    download_file_name: input.fileName.split(/[\\/]/).pop() ?? input.fileName,
    download_storage_path: filePath,
    stripe_product_sandbox: sandbox.productId,
    stripe_product_live: live.productId,
    stripe_error: null,
    source_file_name: "",
    created_by: input.updatedBy,
    updated_at: now,
  });
  if (error) {
    await archiveStripeProduct("sandbox", sandbox.productId);
    await archiveStripeProduct("live", live.productId);
    return { ok: false, error: `A termék mentése nem sikerült: ${error.message}` };
  }

  const fileUrl = await supabaseAdmin.storage.from(BUCKET).createSignedUploadUrl(filePath, {
    upsert: true,
  });
  if (fileUrl.error || !fileUrl.data) {
    return { ok: false, error: "A fájlfeltöltési link létrehozása nem sikerült." };
  }
  let imageUpload: { path: string; token: string } | null = null;
  if (imagePath) {
    const img = await supabaseAdmin.storage
      .from(BUCKET)
      .createSignedUploadUrl(imagePath, { upsert: true });
    if (!img.error && img.data) {
      imageUpload = { path: img.data.path, token: img.data.token };
    }
  }

  const { ensureProductOverrides } = await import("./product-overrides.server");
  await ensureProductOverrides(true);

  return {
    ok: true,
    slug,
    fileUpload: { path: fileUrl.data.path, token: fileUrl.data.token },
    imageUpload,
  };
}

/** Removes an admin-created product from the site. */
export async function deleteCustomProduct(
  slug: string,
): Promise<{ ok: boolean; error?: string }> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: row } = await supabaseAdmin
    .from("custom_products")
    .select("stripe_product_sandbox, stripe_product_live, download_storage_path, image_path")
    .eq("slug", slug)
    .maybeSingle();
  if (!row) return { ok: false, error: "Nincs ilyen saját termék." };

  if (row.stripe_product_sandbox) {
    await archiveStripeProduct("sandbox", row.stripe_product_sandbox);
  }
  if (row.stripe_product_live) {
    await archiveStripeProduct("live", row.stripe_product_live);
  }
  const paths = [row.download_storage_path, row.image_path].filter(
    (p): p is string => Boolean(p),
  );
  if (paths.length) await supabaseAdmin.storage.from(BUCKET).remove(paths);

  const { error } = await supabaseAdmin.from("custom_products").delete().eq("slug", slug);
  if (error) return { ok: false, error: error.message };

  const { ensureProductOverrides } = await import("./product-overrides.server");
  await ensureProductOverrides(true);
  return { ok: true };
}
