import { getRequestHeader } from "@tanstack/react-start/server";

import { formatPrice, getProduct } from "./products";

type Order = {
  productSlug: string;
  quantity: number;
  billingName: string;
  companyName: string;
  taxNumber: string;
  country: string;
  postalCode: string;
  city: string;
  addressLine: string;
  email: string;
  phone: string;
  note: string;
  website: string;
};

const OWNER_EMAIL = "xllentac@gmail.com";
const FROM_EMAIL = "EXCELlent <onboarding@resend.dev>";
const RATE_LIMIT_WINDOW_MINUTES = 10;
const RATE_LIMIT_MAX = 5;

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function clientIp() {
  const header =
    getRequestHeader("cf-connecting-ip") ??
    getRequestHeader("x-forwarded-for") ??
    getRequestHeader("x-real-ip") ??
    "";
  return header.split(",")[0]?.trim() || "unknown";
}

function orderNumber() {
  const now = new Date();
  const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(
    now.getDate(),
  ).padStart(2, "0")}`;
  const random = Math.floor(Math.random() * 9000 + 1000);
  return `XLNT-${stamp}-${random}`;
}

async function sendEmail(payload: { to: string; subject: string; html: string }) {
  const apiKey = process.env["RESEND_API_KEY"];
  if (!apiKey) {
    console.warn("RESEND_API_KEY missing – email not sent:", payload.subject);
    return false;
  }
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: [payload.to],
      subject: payload.subject,
      html: payload.html,
    }),
  });
  if (!response.ok) {
    console.error(`Resend error [${response.status}]: ${await response.text()}`);
    return false;
  }
  return true;
}

export async function handleOrder(data: Order) {
  // Honeypot: silently accept but drop.
  if (data.website) {
    return { ok: true as const, orderNumber: orderNumber() };
  }

  const product = getProduct(data.productSlug);
  if (!product) {
    return { ok: false as const, error: "A megrendelt termék nem található." };
  }

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const ip = clientIp();
  const since = new Date(Date.now() - RATE_LIMIT_WINDOW_MINUTES * 60_000).toISOString();

  const { count, error: countError } = await supabaseAdmin
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("ip_address", ip)
    .gte("created_at", since);

  if (countError) {
    console.error("Order rate limit check failed:", countError.message);
  } else if ((count ?? 0) >= RATE_LIMIT_MAX) {
    return {
      ok: false as const,
      error: "Túl sok megrendelés történt rövid időn belül. Kérlek, próbáld újra pár perc múlva.",
    };
  }

  const number = orderNumber();
  const total = product.price * data.quantity;

  const { error } = await supabaseAdmin.from("orders").insert({
    order_number: number,
    product_slug: product.slug,
    product_name: product.name,
    quantity: data.quantity,
    unit_price: product.price,
    total_price: total,
    currency: product.currency,
    billing_name: data.billingName,
    company_name: data.companyName || null,
    tax_number: data.taxNumber || null
    ,
    country: data.country,
    postal_code: data.postalCode,
    city: data.city,
    address_line: data.addressLine,
    email: data.email,
    phone: data.phone,
    note: data.note || null,
    status: "new",
    payment_status: "unpaid",
    payment_provider: null,
    ip_address: ip,
    user_agent: getRequestHeader("user-agent") ?? null,
  });

  if (error) {
    console.error("Order insert failed:", error.message);
    return {
      ok: false as const,
      error: "A megrendelés mentése nem sikerült. Kérlek, próbáld újra.",
    };
  }

  const rows: Array<[string, string]> = [
    ["Rendelésszám", number],
    ["Termék", `${product.name} (${data.quantity} db)`],
    ["Egységár", formatPrice(product.price)],
    ["Fizetendő", formatPrice(total)],
    ["Számlázási név", data.billingName],
  ];
  if (data.companyName) rows.push(["Cégnév", data.companyName]);
  if (data.taxNumber) rows.push(["Adószám", data.taxNumber]);
  rows.push(
    ["Számlázási cím", `${data.country}, ${data.postalCode} ${data.city}, ${data.addressLine}`],
    ["E-mail", data.email],
    ["Telefon", data.phone],
  );
  if (data.note) rows.push(["Megjegyzés", data.note]);

  const ownerHtml = `
    <h2>Új megrendelés – xlntbi.hu</h2>
    <table cellpadding="6" style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:14px">
      ${rows
        .map(
          ([k, v]) =>
            `<tr><td style="border:1px solid #dfe7e3;background:#f4f8f6"><b>${escapeHtml(k)}</b></td><td style="border:1px solid #dfe7e3">${escapeHtml(v).replace(/\n/g, "<br>")}</td></tr>`,
        )
        .join("")}
    </table>`;

  const userHtml = `
    <div style="font-family:Arial,sans-serif;font-size:15px;color:#16231d">
      <p>Kedves ${escapeHtml(data.billingName)}!</p>
      <p>Köszönöm a megrendelésedet. Az alábbi adatokkal rögzítettem:</p>
      <table cellpadding="6" style="border-collapse:collapse;font-size:14px">
        ${rows
          .map(
            ([k, v]) =>
              `<tr><td style="border:1px solid #dfe7e3;background:#f4f8f6"><b>${escapeHtml(k)}</b></td><td style="border:1px solid #dfe7e3">${escapeHtml(v).replace(/\n/g, "<br>")}</td></tr>`,
          )
          .join("")}
      </table>
      <p>A számlát és a termék letöltési tudnivalóit hamarosan elküldöm erre az e-mail címre.
      Ha bármi kérdésed van, válaszolj erre a levélre.</p>
      <p>Üdvözlettel,<br>Sarinay Dávid<br>EXCELlent Accounting &amp; Consulting<br>
      06 20 962 2176 · info@xlntbi.hu</p>
    </div>`;

  const [ownerSent, userSent] = await Promise.all([
    sendEmail({
      to: OWNER_EMAIL,
      subject: `Új megrendelés (${number}): ${product.name}`,
      html: ownerHtml,
    }),
    sendEmail({
      to: data.email,
      subject: `Megrendelés visszaigazolása – ${number}`,
      html: userHtml,
    }),
  ]);

  return {
    ok: true as const,
    orderNumber: number,
    total,
    emailsSent: ownerSent && userSent,
  };
}
