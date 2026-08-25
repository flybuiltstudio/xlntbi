/**
 * Billingo webhook processing.
 *
 * Billingo notifies us when a document changes (created / paid). The payload is
 * treated as a pointer only: we always re-fetch the document from the Billingo
 * API, so the stored data (invoice number, AAM VAT key, net/gross, paid state)
 * comes from the authoritative source and cannot be spoofed by the payload.
 */

import {
  fetchInvoiceSnapshot,
  saveInvoiceSnapshot,
  type InvoiceSnapshot,
} from "./billingo.server";

export type BillingoWebhookResult = {
  handled: boolean;
  reason?: string;
  orderNumber?: string;
  invoiceNumber?: string | null;
  markedPaid?: boolean;
};

/** Best-effort extraction of the Billingo document id from any payload shape. */
export function extractDocumentId(payload: any): number | null {
  const candidates = [
    payload?.document_id,
    payload?.documentId,
    payload?.id,
    payload?.data?.document_id,
    payload?.data?.id,
    payload?.document?.id,
  ];
  for (const value of candidates) {
    const asNumber = typeof value === "string" ? Number(value) : value;
    if (typeof asNumber === "number" && Number.isFinite(asNumber) && asNumber > 0) {
      return asNumber;
    }
  }
  return null;
}

async function findOrder(snapshot: InvoiceSnapshot) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const byInvoice = await supabaseAdmin
    .from("orders")
    .select("*")
    .eq("billingo_invoice_id", snapshot.invoiceId)
    .maybeSingle();
  if (byInvoice.data) return byInvoice.data;

  if (snapshot.orderNumberHint) {
    const byNumber = await supabaseAdmin
      .from("orders")
      .select("*")
      .eq("order_number", snapshot.orderNumberHint)
      .maybeSingle();
    if (byNumber.data) return byNumber.data;
  }
  return null;
}

/**
 * Handles one Billingo webhook call: stores the invoice snapshot and syncs the
 * invoice number + paid state onto the matching order. Never throws.
 */
export async function handleBillingoWebhook(payload: any): Promise<BillingoWebhookResult> {
  const invoiceId = extractDocumentId(payload);
  if (!invoiceId) return { handled: false, reason: "nincs dokumentum-azonosító" };

  const fetched = await fetchInvoiceSnapshot(invoiceId);
  if (!fetched.ok) return { handled: false, reason: fetched.error };
  const { snapshot, raw } = fetched;

  // Only real invoices matter (skip drafts, proformas, receipts).
  if (snapshot.invoiceType && snapshot.invoiceType !== "invoice") {
    await saveInvoiceSnapshot(null, snapshot, raw);
    return { handled: false, reason: `nem számla (${snapshot.invoiceType})` };
  }

  const order = await findOrder(snapshot);
  await saveInvoiceSnapshot((order?.id as string | undefined) ?? null, snapshot, raw);

  if (!order) {
    return { handled: false, reason: "nincs hozzá tartozó megrendelés" };
  }

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const update: Record<string, unknown> = {};
  if (!order.billingo_invoice_id) update["billingo_invoice_id"] = snapshot.invoiceId;
  if (snapshot.invoiceNumber && order.billingo_invoice_number !== snapshot.invoiceNumber) {
    update["billingo_invoice_number"] = snapshot.invoiceNumber;
  }

  const shouldMarkPaid = snapshot.paid === true && order.payment_status !== "paid";
  if (shouldMarkPaid) {
    update["payment_status"] = "paid";
    update["status"] = "paid";
    update["payment_provider"] = order.payment_provider ?? "transfer";
    if (!order.payment_reference) {
      update["payment_reference"] = snapshot.invoiceNumber
        ? `Billingo ${snapshot.invoiceNumber}`
        : `Billingo #${snapshot.invoiceId}`;
    }
  }

  if (Object.keys(update).length) {
    const { error } = await supabaseAdmin.from("orders").update(update).eq("id", order.id);
    if (error) {
      console.error("Billingo webhook order update failed:", error.message);
      return { handled: false, reason: error.message, orderNumber: order.order_number as string };
    }
  }

  // A newly paid order still needs its download link + emails.
  if (shouldMarkPaid) {
    const { issueDownload } = await import("./download.server");
    await issueDownload({
      id: order.id as string,
      order_number: order.order_number as string,
      product_slug: order.product_slug as string,
      product_name: order.product_name as string,
      tier_label: (order.tier_label as string | null) ?? null,
      quantity: order.quantity as number,
      billing_name: order.billing_name as string,
      email: order.email as string,
    });
  }

  return {
    handled: true,
    orderNumber: order.order_number as string,
    invoiceNumber: snapshot.invoiceNumber,
    markedPaid: shouldMarkPaid,
  };
}
