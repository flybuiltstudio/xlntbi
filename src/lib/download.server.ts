import { sendEmails } from "./notify.server";
import { getProduct } from "./products";
import { withXlntPrefix } from "./product-name";

const OWNER_EMAIL = "xllentac@gmail.com";
const BUCKET = "termekfajlok";
const EXPIRY_DAYS = 14;
const MAX_DOWNLOADS = 10;

export const DOWNLOAD_BUCKET = BUCKET;

type OrderRow = {
  id: string;
  order_number: string;
  product_slug: string;
  product_name: string;
  tier_label: string | null;
  quantity: number;
  billing_name: string;
  email: string;
};

function newToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

function siteOrigin(): string {
  return process.env["PUBLIC_SITE_URL"] ?? "https://xlntbi.hu";
}

function formatDate(value: Date): string {
  return `${value.getFullYear()}. ${String(value.getMonth() + 1).padStart(2, "0")}. ${String(
    value.getDate(),
  ).padStart(2, "0")}.`;
}

/**
 * Name the buyer sees when downloading. The storage object name is fixed
 * (product-derived), but the admin's latest uploaded file name wins here, so a
 * new yearly version arrives under its own name without any code change.
 */
async function downloadFileName(slug: string, fallback: string): Promise<string> {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin
      .from("product_file_versions")
      .select("file_name")
      .eq("product_slug", slug)
      .maybeSingle();
    const name = data?.file_name as string | undefined;
    return name && name.trim() ? name.trim() : fallback;
  } catch {
    return fallback;
  }
}

/**
 * Creates a single-order download token for the purchased file and emails the
 * link to the buyer. Idempotent: an existing, still-valid token is reused.
 */
export async function issueDownload(order: OrderRow): Promise<void> {
  const productName = withXlntPrefix(order.product_name);
  const product = getProduct(order.product_slug);
  if (!product?.download) {
    // No binary yet (e.g. "coming soon" product) — notify the owner to handle it.
    await sendEmails([
      {
        template: "belso-rendeles-ertesito",
        to: OWNER_EMAIL,
        key: `${order.order_number}-nofile`,
        data: {
          orderNumber: order.order_number,
          productName,
          total: "—",
          customerEmail: order.email,
          paymentStatus: "paid",
          rows: [
            ["Figyelem", "Ehhez a termékhez nincs feltöltött fájl, a letöltést kézzel küldd el."],
            ["Termék", productName],
            ["E-mail", order.email],
          ] as Array<[string, string]>,
        },
        replyTo: order.email,
      },
    ]);
    return;
  }

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const { data: existing } = await supabaseAdmin
    .from("order_downloads")
    .select("token, expires_at")
    .eq("order_id", order.id)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();

  let token = existing?.token as string | undefined;
  const expiresAt = existing?.expires_at
    ? new Date(existing.expires_at as string)
    : new Date(Date.now() + EXPIRY_DAYS * 24 * 60 * 60 * 1000);

  const currentFileName = await downloadFileName(
    order.product_slug,
    product.download.fileName,
  );

  if (!token) {
    token = newToken();
    const { error } = await supabaseAdmin.from("order_downloads").insert({
      order_id: order.id,
      order_number: order.order_number,
      product_slug: order.product_slug,
      storage_path: product.download.storagePath,
      file_name: currentFileName,
      token,
      email: order.email,
      max_downloads: MAX_DOWNLOADS,
      expires_at: expiresAt.toISOString(),
    });
    if (error) {
      console.error("Download token insert failed:", error.message);
      return;
    }
  }

  const productLabel = order.tier_label
    ? `${productName} – ${order.tier_label} (${order.quantity} db)`
    : `${productName} (${order.quantity} db)`;

  await sendEmails([
    {
      template: "letoltes-elerheto",
      to: order.email,
      key: `${order.order_number}-${token.slice(0, 10)}`,
      data: {
        name: order.billing_name,
        orderNumber: order.order_number,
        productName,
        productLabel,
        tierLabel: order.tier_label ?? "",
        fileName: currentFileName,
        downloadUrl: `${siteOrigin()}/api/public/letoltes/${token}`,
        expiresAt: formatDate(expiresAt),
        maxDownloads: MAX_DOWNLOADS,
        rows: [
          ["Termék", productName],
          ...(order.tier_label ? [["Licenc csomag", order.tier_label] as [string, string]] : []),
          ["Fájl", currentFileName],
          ["Elérhető eddig", formatDate(expiresAt)],
        ] as Array<[string, string]>,
      },
      replyTo: OWNER_EMAIL,
    },
  ]);
}

export type ResolvedDownload =
  | { ok: true; url: string }
  | { ok: false; reason: "not_found" | "expired" | "limit" | "error" };

/** Validates a download token and returns a short-lived signed storage URL. */
export async function resolveDownload(token: string): Promise<ResolvedDownload> {
  if (!/^[a-f0-9]{64}$/.test(token)) return { ok: false, reason: "not_found" };

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const { data: row, error } = await supabaseAdmin
    .from("order_downloads")
    .select("id, storage_path, file_name, product_slug, download_count, max_downloads, expires_at")
    .eq("token", token)
    .maybeSingle();

  if (error) {
    console.error("Download lookup failed:", error.message);
    return { ok: false, reason: "error" };
  }
  if (!row) return { ok: false, reason: "not_found" };
  if (new Date(row.expires_at as string).getTime() < Date.now()) {
    return { ok: false, reason: "expired" };
  }
  if ((row.download_count as number) >= (row.max_downloads as number)) {
    return { ok: false, reason: "limit" };
  }

  // Always serve the newest uploaded name, even for tokens issued earlier.
  const serveName = await downloadFileName(
    row.product_slug as string,
    row.file_name as string,
  );

  const { data: signed, error: signError } = await supabaseAdmin.storage
    .from(BUCKET)
    .createSignedUrl(row.storage_path as string, 300, {
      download: serveName,
    });

  if (signError || !signed?.signedUrl) {
    console.error("Signed URL failed:", signError?.message);
    return { ok: false, reason: "error" };
  }

  await supabaseAdmin
    .from("order_downloads")
    .update({
      download_count: (row.download_count as number) + 1,
      last_downloaded_at: new Date().toISOString(),
    })
    .eq("id", row.id as string);

  return { ok: true, url: signed.signedUrl };
}
