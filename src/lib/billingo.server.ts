import { couponInvoiceLineName } from "./coupon-amount";
import {
  euVatPrefix,
  isEuReverseCharge,
  REVERSE_CHARGE_NOTE,
  VAT_KEYS,
  vatTreatmentFor,
} from "./eu-vat";
import { withXlntPrefix } from "./product-name";
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
    deutschland: "DE",
    ausztria: "AT",
    austria: "AT",
    österreich: "AT",
    szlovákia: "SK",
    slovakia: "SK",
    szlovénia: "SI",
    slovenia: "SI",
    románia: "RO",
    romania: "RO",
    horvátország: "HR",
    croatia: "HR",
    szerbia: "RS",
    serbia: "RS",
    csehország: "CZ",
    "cseh köztársaság": "CZ",
    czechia: "CZ",
    "czech republic": "CZ",
    lengyelország: "PL",
    poland: "PL",
    hollandia: "NL",
    netherlands: "NL",
    belgium: "BE",
    franciaország: "FR",
    france: "FR",
    olaszország: "IT",
    italy: "IT",
    spanyolország: "ES",
    spain: "ES",
    portugália: "PT",
    portugal: "PT",
    írország: "IE",
    ireland: "IE",
    dánia: "DK",
    denmark: "DK",
    svédország: "SE",
    sweden: "SE",
    finnország: "FI",
    finland: "FI",
    észtország: "EE",
    estonia: "EE",
    lettország: "LV",
    latvia: "LV",
    litvánia: "LT",
    lithuania: "LT",
    luxemburg: "LU",
    luxembourg: "LU",
    bulgária: "BG",
    bulgaria: "BG",
    görögország: "GR",
    greece: "GR",
    ciprus: "CY",
    cyprus: "CY",
    málta: "MT",
    malta: "MT",
    uk: "GB",
    "egyesült királyság": "GB",
    "united kingdom": "GB",
  };
  if (map[n]) return map[n];
  if (/^[a-z]{2}$/.test(n)) return n.toUpperCase();
  return "HU";
}

/**
 * Country code for the Billingo partner. When the buyer gave an EU VAT number
 * of another member state, that prefix is the authoritative country (the free
 * text "Ország" field can be spelled anything), so it wins over the name map.
 */
function partnerCountryCode(order: OrderRow): string {
  const prefix = euVatPrefix(order.tax_number);
  if (prefix && prefix !== "HU") return prefix === "EL" ? "GR" : prefix === "XI" ? "GB" : prefix;
  return countryCode(order.country);
}

/**
 * Tax type for the partner. A buyer with an EU VAT number from another member
 * state must be created as a foreign partner, otherwise Billingo rejects the
 * reverse-charge (EUFAD37) invoice. Non-EU buyers outside Hungary are foreign
 * as well; domestic buyers depend on whether they gave an adószám.
 */
function partnerTaxType(order: OrderRow): string {
  if (isEuReverseCharge(order.tax_number)) return "FOREIGN";
  if (partnerCountryCode(order) !== "HU") return "FOREIGN";
  return order.tax_number ? "HAS_TAX_NUMBER" : "NO_TAX_NUMBER";
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
      country_code: partnerCountryCode(order),
      post_code: order.postal_code,
      city: order.city,
      address: order.address_line,
    },
    emails: order.email ? [order.email] : [],
    taxcode: order.tax_number ?? "",
    phone: order.phone,
    tax_type: partnerTaxType(order),
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
  const name = withXlntPrefix(order.product_name);
  return order.tier_label ? `${name} – ${order.tier_label}` : name;
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
  const discountAmount = Math.max(0, Math.round((order as any).discount_amount ?? 0));
  const couponCode = ((order as any).coupon_code as string | null) ?? null;

  // AAM domestically; EU B2B buyer (VAT id of another member state) gets the
  // EUFAD37 key plus the mandatory "Reverse charge" note.
  const treatment = vatTreatmentFor(order.tax_number);
  const { vat, entitlement } = VAT_KEYS[treatment];
  const reverseCharge = treatment === "eufad37";

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
        vat,
        entitlement,
      },
      // Coupon discount as a separate negative line, so the invoice shows the
      // original price, the discount and the final amount actually paid.
      ...(discountAmount > 0
        ? [
            {
              name: couponInvoiceLineName(couponCode, discountAmount),
              unit_price: -discountAmount,
              unit_price_type: "gross",
              quantity: 1,
              unit: "db",
              vat,
              entitlement,
            },
          ]
        : []),
    ],
    comment: [
      `Rendelésszám: ${order.order_number}`,
      ...(discountAmount > 0
        ? [
            `Eredeti összeg: ${Math.round(order.total_price).toLocaleString("hu-HU")} Ft`,
            `Kuponkedvezmény${couponCode ? ` (${couponCode})` : ""}: -${discountAmount.toLocaleString("hu-HU")} Ft`,
            `Fizetett végösszeg: ${(Math.round(order.total_price) - discountAmount).toLocaleString("hu-HU")} Ft`,
          ]
        : []),
      ...(reverseCharge ? [REVERSE_CHARGE_NOTE] : []),
    ].join("\n"),

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

export type InvoiceAttemptSource =
  | "webhook"
  | "admin_approval"
  | "admin_retry"
  | "billingo_webhook"
  | "stripe_cancel"
  | "admin_purge"
  | "self_test";

export type InvoiceAttemptStatus = "success" | "error" | "canceled" | "cancel_error";

/**
 * Writes one row to billingo_invoice_logs for every invoicing attempt
 * (success, failure or storno). Logging itself must never break fulfilment.
 */
async function logInvoiceAttempt(entry: {
  orderId: string;
  orderNumber: string;
  source: InvoiceAttemptSource;
  status: InvoiceAttemptStatus;
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
 * Cancels (storno) the Billingo invoice of an order. Used automatically when a
 * Stripe payment fails, expires or is refunded after an invoice was already
 * issued. Idempotent: an order without an invoice id is a no-op, and the
 * order's invoice reference is cleared so a later successful payment can
 * invoice again. Never throws.
 */
export async function cancelInvoiceForOrder(
  order: Pick<OrderRow, "id" | "order_number" | "billingo_invoice_id" | "billingo_invoice_number">,
  options: { reason?: string; source?: InvoiceAttemptSource } = {},
): Promise<{ ok: boolean; error?: string; skipped?: boolean }> {
  const source: InvoiceAttemptSource = options.source ?? "stripe_cancel";
  if (!order.billingo_invoice_id) return { ok: true, skipped: true };

  try {
    // Billingo v3: POST /documents/{id}/cancel creates the storno document.
    const result = await billingo(`/documents/${order.billingo_invoice_id}/cancel`, {
      method: "POST",
    });

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await (supabaseAdmin as any)
      .from("orders")
      .update({
        billingo_invoice_id: null,
        billingo_invoice_number: null,
      })
      .eq("id", order.id);

    void logInvoiceAttempt({
      orderId: order.id,
      orderNumber: order.order_number,
      source,
      status: "canceled",
      invoiceId: order.billingo_invoice_id,
      invoiceNumber: order.billingo_invoice_number ?? null,
      errorMessage: options.reason ?? null,
    });
    console.log(
      `Billingo számla sztornózva: ${order.billingo_invoice_number ?? order.billingo_invoice_id}` +
        ` (rendelés ${order.order_number}, storno id ${result?.id ?? "?"})`,
    );
    return { ok: true };
  } catch (e: any) {
    const message = e?.message ?? "Ismeretlen hiba";
    await logInvoiceAttempt({
      orderId: order.id,
      orderNumber: order.order_number,
      source,
      status: "cancel_error",
      invoiceId: order.billingo_invoice_id,
      invoiceNumber: order.billingo_invoice_number ?? null,
      errorCode: e?.code ?? "UNKNOWN",
      errorMessage: message,
    });
    console.error(`Billingo sztornó sikertelen (${order.order_number}):`, message);
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

// ---------------------------------------------------------------------------
// Invoice snapshots (AAM VAT key, net/gross, invoice number) — read-back layer
// ---------------------------------------------------------------------------

export type InvoiceSnapshotItem = {
  name: string;
  quantity: number | null;
  unit: string | null;
  vat: string | null;
  entitlement: string | null;
  netUnitAmount: number | null;
  netAmount: number | null;
  vatAmount: number | null;
  grossAmount: number | null;
};

export type InvoiceSnapshot = {
  invoiceId: number;
  invoiceNumber: string | null;
  invoiceType: string | null;
  currency: string | null;
  invoiceDate: string | null;
  fulfillmentDate: string | null;
  paymentMethod: string | null;
  paid: boolean | null;
  netTotal: number | null;
  grossTotal: number | null;
  vatTotal: number | null;
  vatLabels: string[];
  items: InvoiceSnapshotItem[];
  orderNumberHint: string | null;
  fetchedAt: string;
};

function num(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function sum(values: Array<number | null>): number | null {
  const present = values.filter((v): v is number => v !== null);
  return present.length ? present.reduce((a, b) => a + b, 0) : null;
}

function dateOnly(value: unknown): string | null {
  return typeof value === "string" && value.length >= 10 ? value.slice(0, 10) : null;
}

/** Pulls the order number out of the document settings or its comment. */
function orderNumberHint(doc: any): string | null {
  const fromSettings = doc?.settings?.order_number;
  if (typeof fromSettings === "string" && fromSettings.trim()) return fromSettings.trim();
  const comment = typeof doc?.comment === "string" ? doc.comment : "";
  const match = comment.match(/Rendelésszám:\s*([A-Za-z0-9_\-]+)/);
  return match?.[1] ?? null;
}

function toSnapshot(doc: any): InvoiceSnapshot {
  const items: InvoiceSnapshotItem[] = (Array.isArray(doc?.items) ? doc.items : []).map(
    (item: any) => ({
      name: typeof item?.name === "string" ? item.name : "",
      quantity: num(item?.quantity),
      unit: typeof item?.unit === "string" ? item.unit : null,
      vat: typeof item?.vat === "string" ? item.vat : null,
      entitlement: typeof item?.entitlement === "string" ? item.entitlement : null,
      netUnitAmount: num(item?.net_unit_amount),
      netAmount: num(item?.net_amount),
      vatAmount: num(item?.vat_amount),
      grossAmount: num(item?.gross_amount),
    }),
  );

  const netTotal = num(doc?.total_net) ?? sum(items.map((i) => i.netAmount));
  const grossTotal =
    num(doc?.total_gross) ?? num(doc?.total) ?? sum(items.map((i) => i.grossAmount));
  const vatTotal = num(doc?.total_vat) ?? sum(items.map((i) => i.vatAmount));

  return {
    invoiceId: Number(doc?.id),
    invoiceNumber:
      (typeof doc?.invoice_number === "string" && doc.invoice_number) ||
      (typeof doc?.number === "string" && doc.number) ||
      null,
    invoiceType: typeof doc?.type === "string" ? doc.type : null,
    currency: typeof doc?.currency === "string" ? doc.currency : null,
    invoiceDate: dateOnly(doc?.invoice_date) ?? dateOnly(doc?.created_at),
    fulfillmentDate: dateOnly(doc?.fulfillment_date),
    paymentMethod: typeof doc?.payment_method === "string" ? doc.payment_method : null,
    paid: typeof doc?.paid === "boolean" ? doc.paid : null,
    netTotal,
    grossTotal,
    vatTotal,
    vatLabels: [...new Set(items.map((i) => i.vat).filter((v): v is string => !!v))],
    items,
    orderNumberHint: orderNumberHint(doc),
    fetchedAt: new Date().toISOString(),
  };
}

/** Fetches a Billingo document and normalises it into a snapshot. */
export async function fetchInvoiceSnapshot(
  invoiceId: number,
): Promise<{ ok: true; snapshot: InvoiceSnapshot; raw: any } | { ok: false; error: string }> {
  try {
    const doc = await billingo(`/documents/${invoiceId}`);
    if (!doc?.id) return { ok: false, error: "A Billingo nem adott vissza számlaadatot." };
    return { ok: true, snapshot: toSnapshot(doc), raw: doc };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "Ismeretlen hiba" };
  }
}

/** Persists the snapshot so the invoice data stays readable even later. */
export async function saveInvoiceSnapshot(
  orderId: string | null,
  snapshot: InvoiceSnapshot,
  raw: any,
): Promise<void> {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await (supabaseAdmin as any)
      .from("billingo_invoice_snapshots")
      .upsert(
        {
          order_id: orderId,
          billingo_invoice_id: snapshot.invoiceId,
          invoice_number: snapshot.invoiceNumber,
          invoice_type: snapshot.invoiceType,
          currency: snapshot.currency,
          invoice_date: snapshot.invoiceDate,
          fulfillment_date: snapshot.fulfillmentDate,
          payment_method: snapshot.paymentMethod,
          paid: snapshot.paid,
          net_total: snapshot.netTotal,
          gross_total: snapshot.grossTotal,
          vat_total: snapshot.vatTotal,
          vat_labels: snapshot.vatLabels,
          items: snapshot.items,
          raw,
          fetched_at: snapshot.fetchedAt,
        },
        { onConflict: "billingo_invoice_id" },
      );
    if (error) console.error("Invoice snapshot upsert failed:", error.message);
  } catch (e: any) {
    console.error("Invoice snapshot upsert failed:", e?.message ?? e);
  }
}
