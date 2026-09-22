import { sendEmails } from "./notify.server";
import { sendRawEmail } from "./email-templates/send-email";
import { getProduct } from "./products";
import { isKnowledgeProduct } from "./product-categories";
import { withXlntPrefix } from "./product-name";

const OWNER_EMAIL = "xllentac@gmail.com";
const BUCKET = "termekfajlok";
const MAX_DOWNLOADS = 5;
const EXPIRY_DAYS = 7;

function newToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

function siteOrigin(): string {
  return process.env["PUBLIC_SITE_URL"] ?? "https://xlntbi.hu";
}

/** Escapes visitor-supplied values before they go into the owner's HTML mail. */
function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatDate(value: Date): string {
  return `${value.getFullYear()}. ${String(value.getMonth() + 1).padStart(2, "0")}. ${String(
    value.getDate(),
  ).padStart(2, "0")}.`;
}

export async function requestDemo(input: {
  productSlug: string;
  name: string;
  email: string;
  phone: string;
  companyName: string;
  taxNumber: string;
  hwid: string;
  testUntil: string | null;
  website: string;
  ipAddress: string;
  userAgent: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  // Honeypot: silently accept but drop.
  if (input.website) return { ok: true };

  const product = getProduct(input.productSlug);
  if (!product || product.status !== "available") {
    return { ok: false, error: "Ez a termék nem elérhető." };
  }
  if (isKnowledgeProduct(product.slug)) {
    return { ok: false, error: "Ez a termék nem rendelkezik DEMO verzióval." };
  }
  if (!product.download) {
    return { ok: false, error: "Ehhez a termékhez jelenleg nem érhető el DEMO letöltés." };
  }

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  // Rate limit: max 3 DEMO requests per IP per hour.
  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count } = await supabaseAdmin
    .from("demo_requests")
    .select("id", { count: "exact", head: true })
    .eq("ip_address", input.ipAddress)
    .gte("created_at", since);
  if ((count ?? 0) >= 3) {
    return {
      ok: false,
      error: "Túl sok DEMO-igénylés érkezett erről a címről. Kérlek, próbáld újra egy óra múlva.",
    };
  }

  // Per-email limit: max 2 active DEMO requests per email.
  const { count: emailCount } = await supabaseAdmin
    .from("demo_requests")
    .select("id", { count: "exact", head: true })
    .eq("email", input.email)
    .gt("expires_at", new Date().toISOString());
  if ((emailCount ?? 0) >= 2) {
    return {
      ok: false,
      error:
        "Ehhez az e-mail címhez már két aktív DEMO-letöltés tartozik. Kérlek, használd fel a meglévő letöltési linket.",
    };
  }

  const token = newToken();
  const expiresAt = new Date(Date.now() + EXPIRY_DAYS * 24 * 60 * 60 * 1000);

  const { error } = await supabaseAdmin.from("demo_requests").insert({
    product_slug: product.slug,
    product_name: product.name,
    name: input.name,
    email: input.email,
    phone: input.phone || null,
    company_name: input.companyName || null,
    tax_number: input.taxNumber || null,
    hwid: input.hwid || null,
    test_until: input.testUntil || null,
    token,
    max_downloads: MAX_DOWNLOADS,
    expires_at: expiresAt.toISOString(),
    ip_address: input.ipAddress,
    user_agent: input.userAgent,
  });
  if (error) return { ok: false, error: "A DEMO-igénylés mentése nem sikerült." };

  const productName = withXlntPrefix(product.name);
  const downloadUrl = `${siteOrigin()}/api/public/letoltes/${token}`;
  const hwidValue = input.hwid || "nem megadott";

  // 1) Download email to the user — uses the existing letoltes-elerheto template
  //    with isDemo so the license-request section reflects the DEMO context.
  await sendEmails([
    {
      template: "letoltes-elerheto",
      to: input.email,
      key: `demo-${token.slice(0, 12)}`,
      data: {
        name: input.name,
        orderNumber: "DEMO",
        productName,
        productLabel: `${productName} – DEMO licenc`,
        tierLabel: "DEMO",
        fileName: product.download.fileName,
        downloadUrl,
        expiresAt: formatDate(expiresAt),
        maxDownloads: MAX_DOWNLOADS,
        isDemo: true,
        demoHwid: hwidValue,
        rows: [
          ["Termék", productName],
          ["Licenc", "DEMO (korlátozott idejű)"],
          ["Fájl", product.download.fileName],
          ["Elérhető eddig", formatDate(expiresAt)],
        ],
      },
      replyTo: OWNER_EMAIL,
    },
  ]);

  // 2) Owner notification email with CSAK DEMO markings, sent as raw HTML
  //    so the subject can start with "CSAK DEMO" and the first line is red.
  const testUntilText = input.testUntil
    ? formatDate(new Date(input.testUntil))
    : "nem megadott";

  const licenseSubject = `${productName} – DEMO – beírandó licenc`;
  const licenseBody = [
    "Tisztelt Vásárló!",
    "",
    "Küldöm a licencet az alábbi termékhez:",
    "",
    `Termék: ${productName}`,
    "Típus: DEMO (korlátozott idejű)",
    "",
    "Licenszkód:",
    "________________  (IDE ÍRD A LICENSZKÓDOT)",
    "",
    "Üdvözlettel:",
    "Sarinay Dávid",
    "XLNT BI",
  ].join("\n");
  const licenseMailto = `mailto:${input.email}?subject=${encodeURIComponent(licenseSubject)}&body=${encodeURIComponent(licenseBody)}`;

  const ownerHtml = `<!DOCTYPE html>
<html lang="hu"><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f5f4;font-family:Arial,Helvetica,sans-serif">
<div style="max-width:560px;margin:0 auto;padding:24px">
<p style="font-size:18px;font-weight:800;color:#DC2626;margin:0 0 16px">CSAK DEMO LICENCET KAPHAT!</p>
<h2 style="color:#0d4a2a;margin:0 0 8px">DEMO licenc igénylés</h2>
<p style="color:#444;margin:0 0 16px">${esc(productName)} – fizetés nélküli DEMO igény</p>
<table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:16px">
<tr><td style="padding:6px 8px;border:1px solid #ddd;color:#888">Termék</td><td style="padding:6px 8px;border:1px solid #ddd;font-weight:600">${esc(productName)}</td></tr>
<tr><td style="padding:6px 8px;border:1px solid #ddd;color:#888">Név</td><td style="padding:6px 8px;border:1px solid #ddd">${esc(input.name)}</td></tr>
<tr><td style="padding:6px 8px;border:1px solid #ddd;color:#888">E-mail</td><td style="padding:6px 8px;border:1px solid #ddd">${esc(input.email)}</td></tr>
<tr><td style="padding:6px 8px;border:1px solid #ddd;color:#888">Telefon</td><td style="padding:6px 8px;border:1px solid #ddd">${esc(input.phone || "nem megadott")}</td></tr>
<tr><td style="padding:6px 8px;border:1px solid #ddd;color:#888">Cégnév</td><td style="padding:6px 8px;border:1px solid #ddd">${esc(input.companyName || "nem megadott")}</td></tr>
<tr><td style="padding:6px 8px;border:1px solid #ddd;color:#888">Adószám</td><td style="padding:6px 8px;border:1px solid #ddd">${esc(input.taxNumber || "nem megadott")}</td></tr>
<tr><td style="padding:6px 8px;border:1px solid #ddd;color:#888">Gépazonosító (HWID)</td><td style="padding:6px 8px;border:1px solid #ddd;font-family:monospace">${esc(hwidValue)}</td></tr>
<tr><td style="padding:6px 8px;border:1px solid #ddd;color:#888">Tesztidő</td><td style="padding:6px 8px;border:1px solid #ddd">${esc(testUntilText)}</td></tr>
<tr><td style="padding:6px 8px;border:1px solid #ddd;color:#888">Letöltőlink</td><td style="padding:6px 8px;border:1px solid #ddd"><a href="${esc(downloadUrl)}">${esc(downloadUrl)}</a></td></tr>
<tr><td style="padding:6px 8px;border:1px solid #ddd;color:#888">Lejár</td><td style="padding:6px 8px;border:1px solid #ddd">${esc(formatDate(expiresAt))}</td></tr>
</table>
<p style="margin:0 0 16px"><a href="${esc(licenseMailto)}" style="display:inline-block;background:#0d4a2a;color:#ffffff;border-radius:8px;padding:10px 18px;font-weight:700;font-size:14px;text-decoration:none">Licenc küldése az igénylőnek</a></p>
<p style="font-size:12px;color:#888;margin:0">Ez a DEMO-igény nem jelenik meg a vásárlási statisztikában, és nem kerül számlázásra.</p>
</div></body></html>`;

  const ownerText = [
    "CSAK DEMO LICENCET KAPHAT!",
    "",
    `DEMO licenc igénylés: ${productName}`,
    "",
    `Termék:        ${productName}`,
    `Név:           ${input.name}`,
    `E-mail:        ${input.email}`,
    `Telefon:       ${input.phone || "nem megadott"}`,
    `Cégnév:        ${input.companyName || "nem megadott"}`,
    `Adószám:       ${input.taxNumber || "nem megadott"}`,
    `Gépazonosító:  ${hwidValue}`,
    `Tesztidő:      ${testUntilText}`,
    `Letöltőlink:   ${downloadUrl}`,
    `Lejár:         ${formatDate(expiresAt)}`,
    "",
    `Licenc küldése az igénylőnek (előre kitöltött levél): ${licenseMailto}`,
    "",
    "Ez a DEMO-igény nem jelenik meg a vásárlási statisztikában.",
  ].join("\n");

  try {
    await sendRawEmail({
      to: OWNER_EMAIL,
      subject: `CSAK DEMO – DEMO licenc igénylés: ${productName}`,
      html: ownerHtml,
      text: ownerText,
      label: "demo-ertesito",
      idempotencyKey: `demo-ertesito-${token.slice(0, 12)}`,
      replyTo: input.email,
    });
  } catch (e) {
    console.error("DEMO owner email send failed:", e instanceof Error ? e.message : e);
  }

  return { ok: true };
}
