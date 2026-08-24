/**
 * Billingo.hu API v3 integration.
 *
 * Creates an AAM (alanyi adómentes) invoice automatically for a PAID order.
 * Called only after a payment is confirmed (Stripe webhook or admin-approved
 * bank transfer). Idempotent: an order already carrying a Billingo invoice id
 * is never invoiced twice.
 *
 * Secrets: BILLINGO_API_KEY (server-only, read inside handlers).
 * The seller is AAM, so every line item uses vat "0%" + entitlement "AAM" and
 * the gross unit price equals the net price (no VAT is added on top).
 */

const API_BASE = "https://api.billingo.hu/v3";

type OrderRow = {
  id: string;
  order_number: string;
  product_slug: string;
  product_name: string;
  tier_label: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
  currency: string;
  billing_name: string;
  company_name: string | null;
  tax_number: string | null;
  country: string;
  postal_code: string;
  city: string;
  address_line: string;
  email: string;
  phone: string;
  payment_provider: string | null;
  billingo_invoice_id: number | null;
  billingo_invoice_number: string | null;
};

function apiKey(): string {
  const key = process.env["BILLINGO_API_KEY"];
  if (!key) throw new Error("BILLINGO_API_KEY nincs beállítva.");
  return key;
}

class BillingoError extends Error {
  code: string;
  constructor(message: string, code: string) {
    super(message);
    this.code = code;
  }
}

async function billingo(path: string, init: RequestInit = {}): Promise<any> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers: {
        "X-API-KEY": apiKey(),
        "Content-Type": "application/json",
        ...(init.headers ?? {}),
      },
    });
  } catch (e: any) {
    throw new BillingoError(
      `Billingo ${path}: hálózati hiba (${e?.message ?? "ismeretlen"})`,
      "NETWORK",
    );
  }
  const text = await res.text();
  let body: any = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = null;
  }
  if (!res.ok) {
    const msg =
      body?.error?.message ?? body?.message ?? `Billingo HTTP ${res.status}`;
    throw new BillingoError(`Billingo ${path}: ${msg}`, `HTTP_${res.status}`);
  }
  return body;
}

/** Maps a free-text country name to a 2-letter ISO code (defaults to HU). */
function countryCode(name: string): string {
  const n = (name ?? "").trim().toLowerCase();
  const map: Record<string, string> = {
    magyarország: "HU",
    hungary: "HU",
    "magyar koztarsasag": "HU",
    németország: "DE",
    germany: "DE",
    ausztria: "AT",
    austria: "AT",
    szlovákia: "SK",
    slovakia: "SK",
    románia: "RO",
    romania: "RO",
    horvátország: "HR",
    croatia: "HR",
    szerbia: "RS",
    serbia: "RS",
    uk: "GB",
    "egyesült királyság": "GB",
    "united kingdom": "GB",
  };
  if (map[n]) return map[n];
  if (/^[a-z]{2}$/.test(n)) return n.toUpperCase();
  return "HU";
}

/** Tax type for the partner: HAS_TAX_NUMBER when an adószám is present. */
function partnerTaxType(taxNumber: string | null): string {
  return taxNumber ? "HAS_TAX_NUMBER" : "NO_TAX_NUMBER";
}

/** Picks the document block matching the fulfilment year, falling back to the latest invoice block. */
async function resolveBlockId(fulfilmentYear: number): Promise<number> {
  const data = await billingo(`/document-blocks`);
  const blocks: Array<{ id: number; name: string; type: string }> =
    data?.data ?? [];
  const invoiceBlocks = blocks.filter((b) => b.type === "invoice");
  const byYear = invoiceBlocks.find((b) =>
    b.name.includes(String(fulfilmentYear)),
  );
  if (byYear) return byYear.id;
  const last = invoiceBlocks[invoiceBlocks.length - 1];
  if (last) return last.id;
  throw new Error("Nem található számlatömb (document block) a Billingóban.");
}

/** Finds an existing partner by email or tax number, otherwise creates one. Returns the partner id. */
async function findOrCreatePartner(order: OrderRow): Promise<number> {
  // Try to find by email.
  if (order.email) {
    const data = await billingo(
      `/partners?query=${encodeURIComponent(order.email)}`,
    );
    const partners: Array<any> = data?.data ?? [];
    const match = partners.find((p) =>
      (p.emails ?? []).some((e: string) => e.toLowerCase() === order.email.toLowerCase()),
    );
    if (match && typeof match.id === "number") return match.id;
  }

  const partner = {
    name: order.company_name || order.billing_name,
    address: {
      country_code: countryCode(order.country),
      post_code: order.postal_code,
      city: order.city,
      address: order.address_line,
    },
    emails: order.email ? [order.email] : [],
    taxcode: order.tax_number ?? "",
    phone: order.phone,
    tax_type: partnerTaxType(order.tax_number),
  };

  const created = await billingo(`/partners`, {
    method: "POST",
    body: JSON.stringify(partner),
  });
  if (!created?.id) {
    throw new Error("A Billingo partner létrehozása nem sikerült.");
  }
  return created.id;
}

function paymentMethodFor(order: OrderRow): string {
  // bankcard for card payments (Stripe), elore_utalas for bank transfers.
  return order.payment_provider === "stripe" ? "bankcard" : "elore_utalas";
}

function productNameLabel(order: OrderRow): string {
  return order.tier_label
    ? `${order.product_name} – ${order.tier_label}`
    : order.product_name;
}

/** Creates the invoice document (already marked paid). Returns the Billingo invoice id + number. */
async function createInvoice(
  order: OrderRow,
  partnerId: number,
  blockId: number,
): Promise<{ id: number; number: string }> {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10);
  const unitPrice = order.quantity > 0 ? order.total_price / order.quantity : 0;

  const document = {
    partner_id: partnerId,
    block_id: blockId,
    type: "invoice",
    fulfillment_date: dateStr,
    due_date: dateStr,
    payment_method: paymentMethodFor(order),
    language: "hu",
    currency: order.currency || "HUF",
    electronic: true,
    paid: true,
    items: [
      {
        name: productNameLabel(order),
        unit_price: Math.round(unitPrice),
        unit_price_type: "gross",
        quantity: order.quantity,
        unit: "db",
        vat: "0%",
        entitlement: "AAM",
      },
    ],
    comment: `Rendelésszám: ${order.order_number}`,
    settings: {
      order_number: order.order_number,
    },
  };

  const created = await billingo(`/documents`, {
    method: "POST",
    body: JSON.stringify(document),
  });
  const id = created?.id;
  const number = created?.invoice_number ?? created?.number ?? "";
  if (!id) throw new Error("A Billingo számla létrehozása nem sikerült.");
  return { id, number };
}

/** Sends the invoice to the buyer via Billingo (uses the partner's registered email). */
async function sendInvoiceToBuyer(invoiceId: number): Promise<void> {
  await billingo(`/documents/${invoiceId}/send`, {
    method: "POST",
    body: JSON.stringify({ send_options: { send_email: true } }),
  });
}

export type IssueInvoiceResult =
  | { ok: true; invoiceId: number; invoiceNumber: string }
  | { ok: false; error: string };

export type InvoiceAttemptSource = "webhook" | "admin_approval" | "admin_retry";

/**
 * Writes one row to billingo_invoice_logs for every invoicing attempt
 * (success or failure). Logging itself must never break fulfilment.
 */
async function logInvoiceAttempt(entry: {
  orderId: string;
  orderNumber: string;
  source: InvoiceAttemptSource;
  status: "success" | "error";
  invoiceId?: number | null;
  invoiceNumber?: string | null;
  errorCode?: string | null;
  errorMessage?: string | null;
}): Promise<void> {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await (supabaseAdmin as any)
      .from("billingo_invoice_logs")
      .insert({
        order_id: entry.orderId,
        order_number: entry.orderNumber,
        source: entry.source,
        status: entry.status,
        billingo_invoice_id: entry.invoiceId ?? null,
        invoice_number: entry.invoiceNumber ?? null,
        error_code: entry.errorCode ?? null,
        error_message: entry.errorMessage ?? null,
      });
    if (error) console.error("Invoice log insert failed:", error.message);
  } catch (e: any) {
    console.error("Invoice log insert failed:", e?.message ?? e);
  }
}

/**
 * Issues a Billingo invoice for a paid order. Idempotent: skips if the order
 * already has a Billingo invoice id. Never throws — failures are logged and
 * returned so payment fulfilment (download link + emails) is never blocked.
 * Every real attempt is written to billingo_invoice_logs.
 */
export async function issueInvoiceForOrder(
  order: OrderRow,
  options: { sendToBuyer?: boolean; source?: InvoiceAttemptSource } = {},
): Promise<IssueInvoiceResult> {
  const sendToBuyer = options.sendToBuyer ?? true;
  const source: InvoiceAttemptSource = options.source ?? "webhook";

  // Idempotency: already invoiced.
  if (order.billingo_invoice_id) {
    return {
      ok: true,
      invoiceId: order.billingo_invoice_id,
      invoiceNumber: order.billingo_invoice_number ?? "",
    };
  }

  try {
    const year = new Date().getFullYear();
    const [partnerId, blockId] = await Promise.all([
      findOrCreatePartner(order),
      resolveBlockId(year),
    ]);
    const { id, number } = await createInvoice(order, partnerId, blockId);

    // Persist the invoice reference for idempotency + admin visibility.
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin
      .from("orders")
      .update({
        billingo_invoice_id: id,
        billingo_invoice_number: number,
      })
      .eq("id", order.id);

    if (sendToBuyer) {
      await sendInvoiceToBuyer(id).catch((e) =>
        console.error("Billingo send invoice email failed:", e.message),
      );
    }

    console.log(
      `Billingo számla létrejött: ${number} (id ${id}) — rendelés ${order.order_number}`,
    );
    void logInvoiceAttempt({
      orderId: order.id,
      orderNumber: order.order_number,
      source,
      status: "success",
      invoiceId: id,
      invoiceNumber: number,
    });
    return { ok: true, invoiceId: id, invoiceNumber: number };
  } catch (e: any) {
    const message = e?.message ?? "Ismeretlen hiba";
    const code = e instanceof BillingoError ? e.code : "UNKNOWN";
    console.error(
      `Billingo számlázás sikertelen (${order.order_number}):`,
      message,
    );
    await logInvoiceAttempt({
      orderId: order.id,
      orderNumber: order.order_number,
      source,
      status: "error",
      errorCode: code,
      errorMessage: message,
    });
    return { ok: false, error: message };
  }
}

/**
 * Returns the Billingo public download URL for an already-issued invoice,
 * so the admin can open or download the PDF.
 */
export async function getInvoicePublicUrl(
  invoiceId: number,
): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  try {
    const data = await billingo(`/documents/${invoiceId}/public-url`);
    const url = data?.public_url;
    if (!url || typeof url !== "string") {
      return { ok: false, error: "A Billingo nem adott vissza letölthető linket." };
    }
    return { ok: true, url };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "Ismeretlen hiba" };
  }
}
