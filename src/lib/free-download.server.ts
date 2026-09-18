import { sendEmails } from "./notify.server";
import { getProduct } from "./products";
import { isKnowledgeProduct } from "./product-categories";

const MAX_DOWNLOADS = 10;
const EXPIRY_DAYS = 14;

function newToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function siteOrigin(): string {
  return process.env["PUBLIC_SITE_URL"] ?? "https://xlntbi.hu";
}

function formatDate(value: Date): string {
  return `${value.getFullYear()}. ${String(value.getMonth() + 1).padStart(2, "0")}. ${String(value.getDate()).padStart(2, "0")}.`;
}

export async function requestFreeDownload(input: {
  productSlug: string;
  name: string;
  email: string;
  phone: string;
  website: string;
  ipAddress: string;
  userAgent: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  if (input.website) return { ok: true };
  const product = getProduct(input.productSlug);
  if (!product || !isKnowledgeProduct(product.slug) || product.price !== 0 || !product.download) {
    return { ok: false, error: "Ez az ingyenes kiadvány nem található." };
  }

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count } = await supabaseAdmin
    .from("free_download_requests")
    .select("id", { count: "exact", head: true })
    .eq("ip_address", input.ipAddress)
    .gte("created_at", since);
  if ((count ?? 0) >= 5) {
    return { ok: false, error: "Túl sok igénylés érkezett. Kérlek, próbáld újra egy óra múlva." };
  }

  const token = newToken();
  const expiresAt = new Date(Date.now() + EXPIRY_DAYS * 24 * 60 * 60 * 1000);
  const { error } = await supabaseAdmin.from("free_download_requests").insert({
    product_slug: product.slug,
    product_name: product.name,
    file_name: product.download.fileName,
    storage_path: product.download.storagePath,
    name: input.name,
    email: input.email,
    phone: input.phone || null,
    token,
    max_downloads: MAX_DOWNLOADS,
    expires_at: expiresAt.toISOString(),
    ip_address: input.ipAddress,
    user_agent: input.userAgent,
  });
  if (error) return { ok: false, error: "Az igénylés mentése nem sikerült." };

  await sendEmails([
    {
      template: "letoltes-elerheto",
      to: input.email,
      key: `free-${token.slice(0, 12)}`,
      data: {
        name: input.name,
        orderNumber: "INGYENES KIADVÁNY",
        productName: product.name,
        productLabel: product.name,
        fileName: product.download.fileName,
        downloadUrl: `${siteOrigin()}/api/public/letoltes/${token}`,
        expiresAt: formatDate(expiresAt),
        maxDownloads: MAX_DOWNLOADS,
        isKnowledge: true,
        isFree: true,
        rows: [
          ["Kiadvány", product.name],
          ["Fájl", product.download.fileName],
          ["Elérhető eddig", formatDate(expiresAt)],
        ],
      },
      replyTo: "info@xlntbi.hu",
    },
  ]);
  return { ok: true };
}
