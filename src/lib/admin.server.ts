const ADMIN_EMAILS = ["xllentac@gmail.com", "info@xlntbi.hu"];

export type AdminOrder = {
  id: string;
  orderNumber: string;
  createdAt: string;
  productName: string;
  tierLabel: string | null;
  quantity: number;
  totalPrice: number;
  billingName: string;
  companyName: string | null;
  taxNumber: string | null;
  address: string;
  email: string;
  phone: string;
  note: string | null;
  status: string;
  paymentStatus: string;
  paymentProvider: string | null;
  paymentReference: string | null;
};

/**
 * Server-side admin gate. The signed-in user must either already hold the
 * `admin` role, or sign in with one of the owner's addresses — in which case
 * the role is created on first use.
 */
export async function assertAdmin(userId: string, email: string | undefined): Promise<boolean> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const { data } = await supabaseAdmin
    .from("user_roles")
    .select("id")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();

  if (data) return true;

  const normalized = (email ?? "").trim().toLowerCase();
  if (!ADMIN_EMAILS.includes(normalized)) return false;

  const { error } = await supabaseAdmin
    .from("user_roles")
    .insert({ user_id: userId, role: "admin" });
  if (error && !error.message.includes("duplicate")) {
    console.error("Admin role grant failed:", error.message);
    return false;
  }
  return true;
}

export async function listOrders(): Promise<AdminOrder[]> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    console.error("Admin order list failed:", error.message);
    return [];
  }

  return (data ?? []).map((o: any) => ({
    id: o.id,
    orderNumber: o.order_number,
    createdAt: o.created_at,
    productName: o.product_name,
    tierLabel: o.tier_label ?? null,
    quantity: o.quantity,
    totalPrice: o.total_price,
    billingName: o.billing_name,
    companyName: o.company_name ?? null,
    taxNumber: o.tax_number ?? null,
    address: `${o.country}, ${o.postal_code} ${o.city}, ${o.address_line}`,
    email: o.email,
    phone: o.phone,
    note: o.note ?? null,
    status: o.status,
    paymentStatus: o.payment_status,
    paymentProvider: o.payment_provider ?? null,
    paymentReference: o.payment_reference ?? null,
  }));
}

/** Marks a bank-transfer order as paid and emails the download link. */
export async function approveTransfer(
  orderId: string,
  reference: string,
): Promise<{ ok: boolean; error?: string }> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const { data: order, error } = await supabaseAdmin
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .maybeSingle();

  if (error || !order) {
    return { ok: false, error: "A megrendelés nem található." };
  }

  if (order.payment_status !== "paid") {
    const { error: updateError } = await supabaseAdmin
      .from("orders")
      .update({
        payment_status: "paid",
        status: "paid",
        payment_provider: order.payment_provider ?? "transfer",
        payment_reference: reference || order.payment_reference,
      })
      .eq("id", orderId);

    if (updateError) {
      console.error("Transfer approval failed:", updateError.message);
      return { ok: false, error: "A jóváhagyás mentése nem sikerült." };
    }
  }

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

  return { ok: true };
}

/** Re-sends the download link for an already paid order. */
export async function resendDownload(orderId: string): Promise<{ ok: boolean; error?: string }> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: order } = await supabaseAdmin
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .maybeSingle();

  if (!order) return { ok: false, error: "A megrendelés nem található." };
  if (order.payment_status !== "paid") {
    return { ok: false, error: "Csak rendezett megrendeléshez küldhető letöltés." };
  }

  // Expire any existing token so a fresh link is generated.
  await supabaseAdmin
    .from("order_downloads")
    .update({ expires_at: new Date(Date.now() - 1000).toISOString() })
    .eq("order_id", orderId);

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

  return { ok: true };
}
