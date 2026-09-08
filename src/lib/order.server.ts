import { getRequestHeader } from "@tanstack/react-start/server";

import { sendEmails } from "./notify.server";
import { formatPrice, getProduct, getTier } from "./products";

type Order = {
  productSlug: string;
  tierId: string;
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
  paymentMethod: "card" | "transfer";
};

const OWNER_EMAIL = "xllentac@gmail.com";
const RATE_LIMIT_WINDOW_MINUTES = 10;
const RATE_LIMIT_MAX = 5;

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


export async function handleOrder(data: Order) {
  // Make sure the admin-managed license prices are in effect before totals.
  const { ensureProductOverrides } = await import("./product-overrides.server");
  await ensureProductOverrides();

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

  if (product.status !== "available") {
    return { ok: false as const, error: "Ez a termék még nem megrendelhető." };
  }

  // Live VIES check for other member states' VAT numbers. Fail-open: only a
  // definite "invalid" answer stops the order, an unreachable VIES does not.
  const { euVatPrefix } = await import("./eu-vat");
  const euPrefix = euVatPrefix(data.taxNumber);
  if (euPrefix && euPrefix !== "HU") {
    const { checkViesVatNumber } = await import("./vies.server");
    const vies = await checkViesVatNumber(data.taxNumber);
    if (vies.status === "invalid") {
      return {
        ok: false as const,
        error:
          "Az EU-s adószám az uniós VIES nyilvántartásban nem érvényes. Kérlek, ellenőrizd a számot, vagy hagyd üresen az adószám mezőt.",
      };
    }
    if (vies.status === "unknown") {
      console.log(`VIES ellenőrzés nem volt elvégezhető (${data.taxNumber}): ${vies.reason ?? "-"}`);
    }
  } else if (data.taxNumber) {
    // Live NAV (Online Számla) taxpayer check for Hungarian tax numbers.
    // Fail-open as well: only a definite "invalid" answer stops the order.
    const { checkNavTaxNumber } = await import("./nav-taxpayer.server");
    const nav = await checkNavTaxNumber(data.taxNumber);
    if (nav.status === "invalid") {
      return {
        ok: false as const,
        error:
          "Ez az adószám a NAV nyilvántartásában nem érvényes adózóhoz tartozik. Kérlek, ellenőrizd a számot, vagy hagyd üresen az adószám mezőt.",
      };
    }
    if (nav.status === "unknown") {
      console.log(`NAV ellenőrzés nem volt elvégezhető (${data.taxNumber}): ${nav.reason ?? "-"}`);
    }
  }




  const tier = getTier(product, data.tierId);
  const number = orderNumber();
  const total = tier.price * data.quantity;

  const { error } = await supabaseAdmin.from("orders").insert({
    order_number: number,
    product_slug: product.slug,
    product_name: product.name,
    quantity: data.quantity,
    unit_price: tier.price,
    tier_id: tier.id,
    tier_label: tier.label,
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
    payment_provider: data.paymentMethod === "card" ? "stripe" : null,
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
    ["Licenc csomag", tier.label],
    ["Egységár", formatPrice(tier.price)],
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
  rows.push([
    "Fizetési mód",
    data.paymentMethod === "card" ? "Bankkártya (Stripe)" : "Banki átutalás",
  ]);

  const productLabel = `${product.name} – ${tier.label} (${data.quantity} db)`;
  const emailsSent = await sendEmails([
    {
      template: "belso-rendeles-ertesito",
      to: OWNER_EMAIL,
      key: number,
      data: {
        orderNumber: number,
        productName: productLabel,
        total: formatPrice(total),
        customerEmail: data.email,
        paymentStatus: "unpaid",
        rows,
      },
      replyTo: data.email,
    },
    {
      template: "megrendeles-visszaigazolas",
      to: data.email,
      key: number,
      data: {
        name: data.billingName,
        orderNumber: number,
        productName: productLabel,
        total: formatPrice(total),
        paymentStatus: "unpaid",
        rows: rows.filter(([key]) => key !== "Rendelésszám"),
      },
      replyTo: OWNER_EMAIL,
    },
  ].filter((job) =>
    // Card orders get their customer confirmation from the paid webhook, so the
    // buyer never receives a bank-transfer instruction for a card payment.
    data.paymentMethod === "card" ? job.template !== "megrendeles-visszaigazolas" : true,
  ));

  return {
    ok: true as const,
    orderNumber: number,
    total,
    emailsSent,
  };
}

