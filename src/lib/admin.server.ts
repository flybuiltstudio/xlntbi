const ADMIN_EMAILS = ["xllentac@gmail.com", "info@xlntbi.hu"];

/** The owner account: cannot be deleted or demoted, even by another admin. */
export const SUPER_ADMIN_EMAIL = "xllentac@gmail.com";

export function isSuperAdminEmail(email: string | null | undefined): boolean {
  return (email ?? "").trim().toLowerCase() === SUPER_ADMIN_EMAIL;
}

/** Looks up the auth e-mail of a user id (null when unknown). */
async function emailOfUser(userId: string): Promise<string | null> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin.auth.admin.getUserById(userId);
  if (error) {
    console.error("User lookup failed:", error.message);
    return null;
  }
  return data.user?.email ?? null;
}

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
  billingoInvoiceId: number | null;
  billingoInvoiceNumber: string | null;
  /** Latest Billingo attempt failed and no invoice exists yet. */
  invoiceFailed: boolean;
  invoiceErrorMessage: string | null;
  /** When the license key was last e-mailed to the buyer (null = not yet). */
  licenseSentAt: string | null;

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

export type AdminRole = "admin" | "user";

/**
 * Returns the signed-in user's admin-area role. `admin` gets full access,
 * `user` may only read the statistics page, `null` means no access at all.
 */
export async function getMyRole(
  userId: string,
  email: string | undefined,
): Promise<AdminRole | null> {
  if (await assertAdmin(userId, email)) return "admin";

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin
    .from("user_roles")
    .select("id")
    .eq("user_id", userId)
    .eq("role", "user")
    .maybeSingle();

  return data ? "user" : null;
}

export type AdminUser = {
  id: string;
  email: string;
  createdAt: string;
  lastSignInAt: string | null;
  roles: string[];
};

export async function listUsers(): Promise<AdminUser[]> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const { data: authData, error } = await supabaseAdmin.auth.admin.listUsers({
    page: 1,
    perPage: 200,
  });
  if (error) {
    console.error("Admin user list failed:", error.message);
    return [];
  }

  const { data: roleRows } = await supabaseAdmin
    .from("user_roles")
    .select("user_id, role");

  const rolesByUser = new Map<string, string[]>();
  for (const row of roleRows ?? []) {
    const list = rolesByUser.get(row.user_id) ?? [];
    list.push(row.role);
    rolesByUser.set(row.user_id, list);
  }

  return (authData?.users ?? [])
    .map((u) => ({
      id: u.id,
      email: u.email ?? "",
      createdAt: u.created_at,
      lastSignInAt: u.last_sign_in_at ?? null,
      roles: rolesByUser.get(u.id) ?? [],
    }))
    .sort((a, b) => a.email.localeCompare(b.email));
}

export async function createUser(
  email: string,
  password: string,
  role: "admin" | "user",
): Promise<{ ok: boolean; error?: string }> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error || !data.user) {
    console.error("User creation failed:", error?.message);
    return {
      ok: false,
      error:
        error?.message?.toLowerCase().includes("already") ?
          "Ezzel az e-mail címmel már létezik felhasználó."
        : "A felhasználó létrehozása nem sikerült.",
    };
  }

  const { error: roleError } = await supabaseAdmin
    .from("user_roles")
    .insert({ user_id: data.user.id, role });
  if (roleError) {
    console.error("Role grant failed:", roleError.message);
    // Roll back: never leave an account behind without a role.
    const { error: rollbackError } = await supabaseAdmin.auth.admin.deleteUser(data.user.id);
    if (rollbackError) {
      console.error("User rollback failed:", rollbackError.message);
    }
    return {
      ok: false,
      error: "A felhasználó létrehozása nem sikerült (a szerepkör beállítása hibázott, a fiókot visszavontuk).",
    };
  }

  return { ok: true };
}

export async function updateUserRole(
  userId: string,
  role: "admin" | "user",
  requesterId: string,
): Promise<{ ok: boolean; error?: string }> {
  if (userId === requesterId) {
    return { ok: false, error: "A saját szerepkörödet nem módosíthatod." };
  }
  if (isSuperAdminEmail(await emailOfUser(userId))) {
    return { ok: false, error: "A szuper admin szerepköre nem módosítható." };
  }
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const { error: deleteError } = await supabaseAdmin
    .from("user_roles")
    .delete()
    .eq("user_id", userId);
  if (deleteError) {
    console.error("Role delete failed:", deleteError.message);
    return { ok: false, error: "A szerepkör módosítása nem sikerült." };
  }

  const { error: insertError } = await supabaseAdmin
    .from("user_roles")
    .insert({ user_id: userId, role });
  if (insertError) {
    console.error("Role insert failed:", insertError.message);
    return { ok: false, error: "A szerepkör módosítása nem sikerült." };
  }

  return { ok: true };
}

export async function deleteUser(
  userId: string,
  requesterId: string,
): Promise<{ ok: boolean; error?: string }> {
  if (userId === requesterId) {
    return { ok: false, error: "Saját magadat nem törölheted." };
  }
  if (isSuperAdminEmail(await emailOfUser(userId))) {
    return { ok: false, error: "A szuper admin (xllentac@gmail.com) nem törölhető." };
  }
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
  if (error) {
    console.error("User deletion failed:", error.message);
    return { ok: false, error: "A felhasználó törlése nem sikerült." };
  }
  return { ok: true };
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

  const rows = data ?? [];

  // Latest failed Billingo attempt per order, so the orders list can offer a
  // retry button without opening the invoicing log page.
  const failures = new Map<string, string | null>();
  if (rows.length > 0) {
    const { data: logs } = await (supabaseAdmin as any)
      .from("billingo_invoice_logs")
      .select("order_id, status, error_message, created_at")
      .in(
        "order_id",
        rows.map((o: any) => o.id),
      )
      .order("created_at", { ascending: true })
      .limit(1000);
    for (const log of (logs ?? []) as any[]) {
      if (!log.order_id) continue;
      if (log.status === "error") failures.set(log.order_id, log.error_message ?? null);
      else failures.delete(log.order_id);
    }
  }

  return rows.map((o: any) => ({
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
    billingoInvoiceId: o.billingo_invoice_id ?? null,
    billingoInvoiceNumber: o.billingo_invoice_number ?? null,
    invoiceFailed: !o.billingo_invoice_number && failures.has(o.id),
    invoiceErrorMessage: failures.get(o.id) ?? null,
    licenseSentAt: o.license_sent_at ?? null,

  }));
}

export type OrderStatRow = {
  productName: string;
  tierLabel: string | null;
  quantity: number;
  totalPrice: number;
  paymentStatus: string;
  createdAt: string;
  orderNumber: string;
  billingName: string;
  email: string;
};

/**
 * Minimal order rows for the admin statistics page (aggregated client-side).
 * Test orders (TESZT- prefix / payment_provider "test") are excluded unless
 * includeTests is true — the stats page exposes that as an admin-only toggle.
 */
export async function orderStats(includeTests = false): Promise<{ rows: OrderStatRow[] }> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  let query = supabaseAdmin
    .from("orders")
    .select(
      "product_name, tier_label, quantity, total_price, payment_status, created_at, order_number, billing_name, email",
    )
    .order("created_at", { ascending: true })
    .limit(5000);
  if (!includeTests) {
    query = query.neq("payment_provider", "test").not("order_number", "like", "TESZT-%");
  }
  const { data, error } = await query;

  if (error) {
    console.error("Admin order stats failed:", error.message);
    return { rows: [] };
  }

  return {
    rows: (data ?? []).map((o: any) => ({
      productName: o.product_name,
      tierLabel: o.tier_label ?? null,
      quantity: o.quantity,
      totalPrice: o.total_price,
      paymentStatus: o.payment_status,
      createdAt: o.created_at,
      orderNumber: o.order_number,
      billingName: o.billing_name,
      email: o.email,
    })),
  };
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

  // Auto-invoice via Billingo for the now-paid bank-transfer order.
  const { issueInvoiceForOrder } = await import("./billingo.server");
  await issueInvoiceForOrder(order as any, { sendToBuyer: true, source: "admin_approval" });

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

/** Internal address that receives a copy of every license e-mail. */
const LICENSE_BCC = "xllentac@gmail.com";

/**
 * Sends the license key of a paid order to the buyer, with a copy to the
 * internal address. The managed email API has no BCC field, so the copy is a
 * separate send of the same rendered template.
 */
export async function sendLicense(
  orderId: string,
  licenseKey: string,
): Promise<{ ok: boolean; error?: string; sentAt?: string }> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: order } = await supabaseAdmin
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .maybeSingle();

  if (!order) return { ok: false, error: "A megrendelés nem található." };
  if (order.payment_status !== "paid") {
    return { ok: false, error: "Licenszkód csak rendezett megrendeléshez küldhető." };
  }

  const data = {
    name: order.billing_name as string,
    orderNumber: order.order_number as string,
    productName: order.product_name as string,
    tierLabel: (order.tier_label as string | null) ?? "",
    licenseKey,
  };

  const { sendEmails } = await import("./notify.server");
  const stamp = Date.now();
  const ok = await sendEmails([
    {
      template: "licensz-kod",
      to: order.email as string,
      key: `${order.id}-${stamp}`,
      data,
      replyTo: "info@xlntbi.hu",
    },
    {
      template: "licensz-kod",
      to: LICENSE_BCC,
      key: `${order.id}-${stamp}-copy`,
      data,
      replyTo: "info@xlntbi.hu",
    },
  ]);

  if (!ok) return { ok: false, error: "A licenszkód kiküldése nem sikerült." };

  const sentAt = new Date().toISOString();
  const { error: updateError } = await (supabaseAdmin as any)
    .from("orders")
    .update({ license_sent_at: sentAt })
    .eq("id", orderId);
  if (updateError) {
    console.error("License send bookkeeping failed:", updateError.message);
  }

  return { ok: true, sentAt };
}

// ---------------------------------------------------------------------------
// Admin payment test mode
// ---------------------------------------------------------------------------

export type TestOrderInput = {
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
};

function testOrderNumber() {
  const now = new Date();
  const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(
    now.getDate(),
  ).padStart(2, "0")}`;
  const random = Math.floor(Math.random() * 9000 + 1000);
  return `TESZT-${stamp}-${random}`;
}

/**
 * Records a test order from the admin payment-test page. Marked with
 * payment_provider "test" so statistics ignore it; no e-mails are sent on
 * creation. A subsequent sandbox Stripe payment flips it to paid via the
 * regular webhook, which exercises the full delivery flow end to end.
 */
export async function createTestOrder(data: TestOrderInput): Promise<
  | {
      ok: true;
      orderNumber: string;
      total: number;
      priceId: string;
      quantity: number;
      customerEmail: string;
    }
  | { ok: false; error: string }
> {
  const { getProduct, getTier } = await import("./products");
  const product = getProduct(data.productSlug);
  if (!product || product.status !== "available") {
    return { ok: false, error: "A kiválasztott termék nem rendelhető." };
  }
  const tier = getTier(product, data.tierId);
  const number = testOrderNumber();
  const total = tier.price * data.quantity;

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
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
    tax_number: data.taxNumber || null,
    country: data.country,
    postal_code: data.postalCode,
    city: data.city,
    address_line: data.addressLine,
    email: data.email,
    phone: data.phone,
    note: "[TESZT] Admin felületről rögzített teszt megrendelés.",
    status: "new",
    payment_status: "unpaid",
    payment_provider: "test",
  });

  if (error) {
    console.error("Test order insert failed:", error.message);
    return { ok: false, error: "A teszt megrendelés mentése nem sikerült." };
  }

  return {
    ok: true,
    orderNumber: number,
    total,
    priceId: tier.priceId,
    quantity: data.quantity,
    customerEmail: data.email,
  };
}

export type TestOrderRow = {
  id: string;
  orderNumber: string;
  createdAt: string;
  productName: string;
  tierLabel: string | null;
  quantity: number;
  totalPrice: number;
  email: string;
  paymentStatus: string;
};

export async function listTestOrders(): Promise<TestOrderRow[]> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("orders")
    .select("id, order_number, created_at, product_name, tier_label, quantity, total_price, email, payment_status")
    .eq("payment_provider", "test")
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    console.error("Test order list failed:", error.message);
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
    email: o.email,
    paymentStatus: o.payment_status,
  }));
}

/**
 * Deletes a test order. A test row is either payment_provider = "test" or an
 * order number with the TESZT- prefix (the self-test marks the order paid
 * through the normal fulfilment chain, which rewrites payment_provider).
 * Reports an error when nothing was deleted so a leftover row is never
 * reported as clean.
 */
export async function deleteTestOrder(orderId: string): Promise<{ ok: boolean; error?: string }> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: order } = await supabaseAdmin
    .from("orders")
    .select("id, order_number, payment_provider")
    .eq("id", orderId)
    .maybeSingle();

  if (!order) return { ok: true };

  const isTest =
    order.payment_provider === "test" || String(order.order_number).startsWith("TESZT-");
  if (!isTest) {
    return { ok: false, error: "Ez nem teszt megrendelés, ezért nem törölhető." };
  }

  const { error, data: deleted } = await supabaseAdmin
    .from("orders")
    .delete()
    .eq("id", orderId)
    .select("id");

  if (error) {
    console.error("Test order deletion failed:", error.message);
    return { ok: false, error: "A teszt megrendelés törlése nem sikerült." };
  }
  if (!deleted || deleted.length === 0) {
    return { ok: false, error: "A teszt megrendelés nem lett törölve." };
  }
  return { ok: true };
}

/**
 * Manually (re)issues a Billingo invoice for a paid order. Only allowed for
 * orders that are actually paid. If the order already has a Billingo invoice
 * id, it is left untouched (idempotent). Returns the invoice number on success.
 */
export async function retryInvoice(
  orderId: string,
): Promise<{ ok: boolean; invoiceNumber?: string; error?: string }> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: order } = await supabaseAdmin
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .maybeSingle();

  if (!order) return { ok: false, error: "A megrendelés nem található." };
  if (order.payment_status !== "paid") {
    return { ok: false, error: "Csak rendezett megrendeléshez állítható ki számla." };
  }

  const { issueInvoiceForOrder } = await import("./billingo.server");
  const result = await issueInvoiceForOrder(order as any, {
    sendToBuyer: true,
    source: "admin_retry",
  });
  if (!result.ok) return { ok: false, error: result.error };
  return { ok: true, invoiceNumber: result.invoiceNumber };
}

// ---------------------------------------------------------------------------
// Billingo invoice logs + PDF download
// ---------------------------------------------------------------------------

export type InvoiceLogRow = {
  id: string;
  orderId: string | null;
  orderNumber: string;
  source: string;
  status: "success" | "error";
  invoiceNumber: string | null;
  errorCode: string | null;
  errorMessage: string | null;
  createdAt: string;
};

/** Lists Billingo invoicing attempts, newest first. */
export async function listInvoiceLogs(): Promise<InvoiceLogRow[]> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await (supabaseAdmin as any)
    .from("billingo_invoice_logs")
    .select(
      "id, order_id, order_number, source, status, invoice_number, error_code, error_message, created_at",
    )
    .order("created_at", { ascending: false })
    .limit(300);

  if (error) {
    console.error("Invoice log list failed:", error.message);
    return [];
  }

  return (data ?? []).map((row: any) => ({
    id: row.id,
    orderId: row.order_id ?? null,
    orderNumber: row.order_number ?? "",
    source: row.source ?? "webhook",
    status: row.status === "error" ? "error" : "success",
    invoiceNumber: row.invoice_number ?? null,
    errorCode: row.error_code ?? null,
    errorMessage: row.error_message ?? null,
    createdAt: row.created_at,
  }));
}

/**
 * Resolves the Billingo public download URL for an order's invoice, so the
 * admin can open or download the PDF straight from the orders list.
 */
export async function invoiceDownloadUrl(
  orderId: string,
): Promise<{ ok: true; url: string; invoiceNumber: string } | { ok: false; error: string }> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: order } = await supabaseAdmin
    .from("orders")
    .select("id, billingo_invoice_id, billingo_invoice_number")
    .eq("id", orderId)
    .maybeSingle();

  if (!order) return { ok: false, error: "A megrendelés nem található." };
  if (!order.billingo_invoice_id) {
    return { ok: false, error: "Ehhez a megrendeléshez még nincs Billingo számla." };
  }

  const { getInvoicePublicUrl } = await import("./billingo.server");
  const result = await getInvoicePublicUrl(order.billingo_invoice_id);
  if (!result.ok) return result;
  return {
    ok: true,
    url: result.url,
    invoiceNumber: order.billingo_invoice_number ?? "",
  };
}

export type InvoiceSnapshotView = {
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
  items: Array<{
    name: string;
    quantity: number | null;
    unit: string | null;
    vat: string | null;
    entitlement: string | null;
    netUnitAmount: number | null;
    netAmount: number | null;
    vatAmount: number | null;
    grossAmount: number | null;
  }>;
  fetchedAt: string;
  stored: boolean;
};

function snapshotRowToView(row: any): InvoiceSnapshotView {
  return {
    invoiceId: row.billingo_invoice_id,
    invoiceNumber: row.invoice_number ?? null,
    invoiceType: row.invoice_type ?? null,
    currency: row.currency ?? null,
    invoiceDate: row.invoice_date ?? null,
    fulfillmentDate: row.fulfillment_date ?? null,
    paymentMethod: row.payment_method ?? null,
    paid: typeof row.paid === "boolean" ? row.paid : null,
    netTotal: row.net_total === null ? null : Number(row.net_total),
    grossTotal: row.gross_total === null ? null : Number(row.gross_total),
    vatTotal: row.vat_total === null ? null : Number(row.vat_total),
    vatLabels: Array.isArray(row.vat_labels) ? row.vat_labels : [],
    items: Array.isArray(row.items) ? row.items : [],
    fetchedAt: row.fetched_at,
    stored: true,
  };
}

/**
 * Returns the stored invoice snapshot (AAM VAT key, net/gross, invoice number)
 * for an order. Fetches it live from Billingo when missing or when refreshed.
 */
export async function invoiceSnapshotForOrder(
  orderId: string,
  refresh = false,
): Promise<{ ok: true; snapshot: InvoiceSnapshotView } | { ok: false; error: string }> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: order } = await supabaseAdmin
    .from("orders")
    .select("id, billingo_invoice_id")
    .eq("id", orderId)
    .maybeSingle();

  if (!order) return { ok: false, error: "A megrendelés nem található." };
  if (!order.billingo_invoice_id) {
    return { ok: false, error: "Ehhez a megrendeléshez még nincs Billingo számla." };
  }

  if (!refresh) {
    const { data: stored } = await (supabaseAdmin as any)
      .from("billingo_invoice_snapshots")
      .select("*")
      .eq("billingo_invoice_id", order.billingo_invoice_id)
      .maybeSingle();
    if (stored) return { ok: true, snapshot: snapshotRowToView(stored) };
  }

  const { fetchInvoiceSnapshot, saveInvoiceSnapshot } = await import("./billingo.server");
  const fetched = await fetchInvoiceSnapshot(order.billingo_invoice_id);
  if (!fetched.ok) return { ok: false, error: fetched.error };
  await saveInvoiceSnapshot(orderId, fetched.snapshot, fetched.raw);
  return { ok: true, snapshot: { ...fetched.snapshot, stored: false } };
}



// ---------------------------------------------------------------------------
// "Friss verzió feltöltés" — termékfájl csere és kalkulátor-felülírások
// ---------------------------------------------------------------------------

const PRODUCT_FILES_BUCKET = "termekfajlok";
const PRODUCT_UPLOAD_MAX_BYTES = 300 * 1024 * 1024; // 300 MB
const CALCULATOR_UPLOAD_MAX_BYTES = 5 * 1024 * 1024; // 5 MB

export type ProductFileInfo = {
  slug: string;
  /** Name the buyer sees on download — the latest uploaded file's own name. */
  fileName: string;
  /** Fixed object name inside storage; never changes, so links stay valid. */
  storageFileName: string;
  size: number | null;
  updatedAt: string | null;
};

/** Reads the current storage metadata of every downloadable product file. */
export async function listProductFiles(): Promise<ProductFileInfo[]> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { products } = await import("@/lib/products");
  const { data: versionRows } = await supabaseAdmin
    .from("product_file_versions")
    .select("product_slug, file_name");
  const overrides = new Map<string, string>();
  for (const row of versionRows ?? []) {
    overrides.set(row.product_slug as string, row.file_name as string);
  }
  const result: ProductFileInfo[] = [];
  for (const product of products) {
    const download = product.status === "available" ? product.download : undefined;
    if (!download) continue;
    const slash = download.storagePath.lastIndexOf("/");
    const folder = download.storagePath.slice(0, slash);
    const fileName = download.storagePath.slice(slash + 1);
    const { data } = await supabaseAdmin.storage
      .from(PRODUCT_FILES_BUCKET)
      .list(folder, { search: fileName, limit: 5 });
    const entry = (data ?? []).find((item) => item.name === fileName);
    const meta = entry?.metadata as { size?: unknown } | null | undefined;
    result.push({
      slug: product.slug,
      fileName: overrides.get(product.slug) ?? download.fileName ?? fileName,
      storageFileName: fileName,
      size: meta && typeof meta.size === "number" ? meta.size : null,
      updatedAt: entry?.updated_at ?? entry?.created_at ?? null,
    });
  }
  return result;
}

/**
 * Remembers the name of the file the admin just uploaded for a product.
 * The storage object keeps its fixed, product-derived path, so existing links
 * never break; only the name buyers see when downloading follows the upload.
 */
export async function recordProductFileVersion(input: {
  slug: string;
  fileName: string;
  fileSize: number;
  uploadedBy?: string | null;
}): Promise<{ ok: boolean; error?: string }> {
  const { products } = await import("@/lib/products");
  const product = products.find((p) => p.slug === input.slug);
  const download = product?.status === "available" ? product.download : undefined;
  if (!product || !download) return { ok: false, error: "Ismeretlen termék." };
  const cleanName = input.fileName.split(/[\\/]/).pop()?.trim() ?? "";
  if (!cleanName) return { ok: false, error: "Érvénytelen fájlnév." };
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { error } = await supabaseAdmin.from("product_file_versions").upsert(
    {
      product_slug: product.slug,
      file_name: cleanName,
      size: input.fileSize,
      uploaded_by: input.uploadedBy ?? null,
      uploaded_at: new Date().toISOString(),
    },
    { onConflict: "product_slug" },
  );
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/**
 * Mints a one-time signed upload URL pointing at the product's EXISTING
 * storage path. The browser overwrites the file in place, so every previously
 * issued download link keeps working — now serving the new version.
 * The selected product (not the uploaded file's name) determines the target.
 */
export async function createProductUploadUrl(input: {
  slug: string;
  fileName: string;
  fileSize: number;
}): Promise<{ ok: true; path: string; token: string } | { ok: false; error: string }> {
  const { products } = await import("@/lib/products");
  const product = products.find((p) => p.slug === input.slug);
  const download = product?.status === "available" ? product.download : undefined;
  if (!product || !download) {
    return { ok: false, error: "A kiválasztott termék nem frissíthető." };
  }
  const targetExt = download.storagePath.split(".").pop()?.toLowerCase() ?? "";
  const uploadExt = input.fileName.split(".").pop()?.toLowerCase() ?? "";
  if (!["xlsm", "exe", "zip", "pdf"].includes(uploadExt)) {
    return { ok: false, error: "Csak .xlsm, .exe, .zip vagy .pdf fájl tölthető fel." };
  }
  if (uploadExt !== targetExt) {
    return {
      ok: false,
      error: `A fájl kiterjesztésének egyeznie kell a jelenlegi fájléval (.${targetExt}).`,
    };
  }
  if (input.fileSize <= 0 || input.fileSize > PRODUCT_UPLOAD_MAX_BYTES) {
    return { ok: false, error: "A fájl mérete legfeljebb 300 MB lehet." };
  }
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin.storage
    .from(PRODUCT_FILES_BUCKET)
    .createSignedUploadUrl(download.storagePath, { upsert: true });
  if (error || !data) {
    return { ok: false, error: "Nem sikerült feltöltési hozzáférést készíteni. Próbáld újra." };
  }
  return { ok: true, path: data.path, token: data.token };
}

// --- Kalkulátor-felülírások -------------------------------------------------

export type CalculatorOverrideInfo = {
  key: string;
  fileName: string;
  updatedAt: string;
};

export async function listCalculatorOverrides(): Promise<CalculatorOverrideInfo[]> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin
    .from("calculator_overrides")
    .select("key, file_name, updated_at")
    .order("key", { ascending: true });
  return (data ?? []).map((row) => ({
    key: row.key,
    fileName: row.file_name,
    updatedAt: row.updated_at,
  }));
}

/**
 * Stores an uploaded standalone calculator HTML as the override for the
 * SELECTED calculator. The upload's file name is irrelevant — the key is.
 */
export async function uploadCalculatorVersion(input: {
  key: string;
  fileName: string;
  content: string;
  updatedBy: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const { isCalculatorKey } = await import("@/lib/calculators/registry");
  if (!isCalculatorKey(input.key)) return { ok: false, error: "Ismeretlen kalkulátor." };
  if (!input.fileName.toLowerCase().endsWith(".html")) {
    return { ok: false, error: "Csak .html fájl tölthető fel." };
  }
  const byteLength = new TextEncoder().encode(input.content).length;
  if (byteLength === 0 || byteLength > CALCULATOR_UPLOAD_MAX_BYTES) {
    return { ok: false, error: "A fájl mérete legfeljebb 5 MB lehet." };
  }
  const { splitCalculatorHtml } = await import("@/lib/calculators/split");
  const { html, script } = splitCalculatorHtml(input.content);
  if (!html) return { ok: false, error: "A fájl nem tartalmaz megjeleníthető tartalmat." };
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { error } = await supabaseAdmin.from("calculator_overrides").upsert(
    {
      key: input.key,
      html,
      script,
      file_name: input.fileName,
      updated_by: input.updatedBy,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "key" },
  );
  if (error) return { ok: false, error: "A mentés nem sikerült. Próbáld újra." };
  return { ok: true };
}

/** Removes a calculator override, restoring the bundled version. */
export async function deleteCalculatorOverride(key: string): Promise<{ ok: boolean }> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { error } = await supabaseAdmin.from("calculator_overrides").delete().eq("key", key);
  return { ok: !error };
}

// ---------------------------------------------------------------------------
// Product placements — manual category + ordering overrides
// ---------------------------------------------------------------------------

export type ProductPlacementRow = { slug: string; category: string; sortOrder: number };

export async function listProductPlacements(): Promise<ProductPlacementRow[]> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin
    .from("product_placements")
    .select("slug, category, sort_order");
  return (data ?? []).map((row) => ({
    slug: row.slug,
    category: row.category,
    sortOrder: row.sort_order,
  }));
}

/** Overwrites the full placement list (category + position for every product). */
export async function saveProductPlacements(
  items: { slug: string; category: string; sortOrder: number }[],
  updatedBy: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { products } = await import("@/lib/products");
  const { productCategoryKeys } = await import("@/lib/product-categories");
  const validSlugs = new Set(products.map((p) => p.slug));
  const validCategories = new Set(productCategoryKeys);

  const rows = items
    .filter((item) => validSlugs.has(item.slug) && validCategories.has(item.category))
    .map((item) => ({
      slug: item.slug,
      category: item.category,
      sort_order: item.sortOrder,
      updated_by: updatedBy,
      updated_at: new Date().toISOString(),
    }));
  if (!rows.length) return { ok: false, error: "Nincs mentendő adat." };

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { error } = await supabaseAdmin
    .from("product_placements")
    .upsert(rows, { onConflict: "slug" });
  if (error) return { ok: false, error: "A mentés nem sikerült. Próbáld újra." };
  return { ok: true };
}

/** Clears every override, restoring the bundled categories and order. */
export async function resetProductPlacements(): Promise<{ ok: boolean }> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { error } = await supabaseAdmin.from("product_placements").delete().neq("slug", "");
  await supabaseAdmin.from("product_category_order").delete().neq("key", "");
  return { ok: !error };
}

/** Admin-managed order of the product categories (list of category keys). */
export async function listProductCategoryOrder(): Promise<string[]> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin
    .from("product_category_order")
    .select("key, sort_order")
    .order("sort_order", { ascending: true });
  return (data ?? []).map((row) => row.key);
}

/** Overwrites the category order with the given key list. */
export async function saveProductCategoryOrder(
  keys: string[],
  updatedBy: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { productCategoryKeys } = await import("@/lib/product-categories");
  const valid = new Set(productCategoryKeys);
  const unique = [...new Set(keys.filter((key) => valid.has(key)))];
  if (!unique.length) return { ok: false, error: "Nincs mentendő adat." };

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { error } = await supabaseAdmin.from("product_category_order").upsert(
    unique.map((key, index) => ({
      key,
      sort_order: index,
      updated_by: updatedBy,
      updated_at: new Date().toISOString(),
    })),
    { onConflict: "key" },
  );
  if (error) return { ok: false, error: "A mentés nem sikerült. Próbáld újra." };
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Billingo webhook switch + Stripe ↔ Billingo comment audit
// ---------------------------------------------------------------------------

export type BillingoWebhookState = {
  enabled: boolean;
  updatedAt: string | null;
};

export async function billingoWebhookState(): Promise<BillingoWebhookState> {
  const { getSetting, BILLINGO_WEBHOOK_KEY } = await import("./app-settings.server");
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const value = await getSetting(BILLINGO_WEBHOOK_KEY);
  const { data } = await (supabaseAdmin as any)
    .from("app_settings")
    .select("updated_at")
    .eq("key", BILLINGO_WEBHOOK_KEY)
    .maybeSingle();
  return { enabled: value["enabled"] === true, updatedAt: data?.updated_at ?? null };
}

export async function setBillingoWebhookEnabled(
  enabled: boolean,
  userId: string,
): Promise<BillingoWebhookState> {
  const { setSetting, BILLINGO_WEBHOOK_KEY } = await import("./app-settings.server");
  await setSetting(BILLINGO_WEBHOOK_KEY, { enabled }, userId);
  return billingoWebhookState();
}

export type InvoiceMatchRow = {
  orderId: string;
  orderNumber: string;
  createdAt: string;
  email: string;
  paymentProvider: string | null;
  /** Stripe payment/session reference stored on the order. */
  paymentReference: string | null;
  paymentStatus: string;
  billingoInvoiceId: number | null;
  billingoInvoiceNumber: string | null;
  /** Order number parsed out of the Billingo invoice comment. */
  invoiceComment: string | null;
  commentOrderNumber: string | null;
  /** "ok" | "mismatch" | "missing_comment" | "no_invoice" | "no_snapshot" */
  status: "ok" | "mismatch" | "missing_comment" | "no_invoice" | "no_snapshot";
  snapshotFetchedAt: string | null;
};

function commentOf(raw: any): string | null {
  const comment = raw?.comment;
  return typeof comment === "string" && comment.trim() ? comment.trim() : null;
}

function parseOrderNumber(comment: string | null): string | null {
  if (!comment) return null;
  const match = comment.match(/Rendelésszám:\s*([A-Za-z0-9_\-]+)/);
  return match?.[1] ?? null;
}

/**
 * Compares every order's Stripe reference and Billingo invoice comment so the
 * admin can verify the two systems point at the same order.
 */
export async function billingoInvoiceAudit(): Promise<{ rows: InvoiceMatchRow[] }> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: orders } = await supabaseAdmin
    .from("orders")
    .select(
      "id, order_number, created_at, email, payment_provider, payment_reference, payment_status, billingo_invoice_id, billingo_invoice_number",
    )
    .order("created_at", { ascending: false })
    .limit(300);

  const invoiceIds = (orders ?? [])
    .map((o: any) => o.billingo_invoice_id)
    .filter((id: number | null): id is number => typeof id === "number");

  const snapshots = new Map<number, any>();
  if (invoiceIds.length) {
    const { data } = await (supabaseAdmin as any)
      .from("billingo_invoice_snapshots")
      .select("billingo_invoice_id, invoice_number, raw, fetched_at")
      .in("billingo_invoice_id", invoiceIds);
    for (const row of data ?? []) snapshots.set(row.billingo_invoice_id, row);
  }

  const rows: InvoiceMatchRow[] = (orders ?? []).map((order: any) => {
    const snapshot = order.billingo_invoice_id
      ? snapshots.get(order.billingo_invoice_id)
      : undefined;
    const comment = snapshot ? commentOf(snapshot.raw) : null;
    const commentOrderNumber = parseOrderNumber(comment);

    let status: InvoiceMatchRow["status"];
    if (!order.billingo_invoice_id) status = "no_invoice";
    else if (!snapshot) status = "no_snapshot";
    else if (!commentOrderNumber) status = "missing_comment";
    else if (commentOrderNumber === order.order_number) status = "ok";
    else status = "mismatch";

    return {
      orderId: order.id,
      orderNumber: order.order_number,
      createdAt: order.created_at,
      email: order.email,
      paymentProvider: order.payment_provider ?? null,
      paymentReference: order.payment_reference ?? null,
      paymentStatus: order.payment_status,
      billingoInvoiceId: order.billingo_invoice_id ?? null,
      billingoInvoiceNumber:
        order.billingo_invoice_number ?? snapshot?.invoice_number ?? null,
      invoiceComment: comment,
      commentOrderNumber,
      status,
      snapshotFetchedAt: snapshot?.fetched_at ?? null,
    };
  });

  return { rows };
}

/** Belső (teszt) e-mail címek: a plus-alias (pl. xllentac+eles4@gmail.com) is ide tartozik. */
const INTERNAL_TEST_EMAILS = new Set([
  "xllentac@gmail.com",
  "info@xlntbi.hu",
  "sarinay.david@gmail.com",
]);

/** Fejlesztői próbarendelések e-mail címei (a fejlesztő saját tesztjei). */
const DEVELOPER_TEST_EMAILS = new Set(["fleck.tomi@gmail.com"]);

function baseEmail(email: unknown): string {
  const raw = String(email ?? "").trim().toLowerCase();
  if (!raw.includes("@")) return "";
  const [local, domain] = raw.split("@");
  return `${(local ?? "").split("+")[0]}@${domain}`;
}

function isInternalTestEmail(email: unknown): boolean {
  const base = baseEmail(email);
  if (!base) return false;
  const domain = base.split("@")[1];
  return INTERNAL_TEST_EMAILS.has(base) || domain === "xlntbi.hu";
}

function isDeveloperTestEmail(email: unknown): boolean {
  const base = baseEmail(email);
  return base ? DEVELOPER_TEST_EMAILS.has(base) : false;
}

function testOrderReason(order: any): string | null {
  if (order.payment_provider === "test") return "Teszt fizetési mód";
  if (String(order.order_number).startsWith("TESZT-")) return "TESZT- előtagú rendelésszám";
  if (isInternalTestEmail(order.email)) return "Belső teszt e-mail cím";
  if (isDeveloperTestEmail(order.email)) return "Fejlesztői próbarendelés";
  return null;
}

/** Rendelésszámok, amiket az admin kivett a törlési listából – többé nem ajánljuk fel. */
const KEEP_SETTING_KEY = "test_purge_keep";

async function keptOrderNumbers(): Promise<Set<string>> {
  const { getSetting } = await import("./app-settings.server");
  const value = await getSetting(KEEP_SETTING_KEY);
  const list = Array.isArray(value["orderNumbers"]) ? value["orderNumbers"] : [];
  return new Set(list.map((n: unknown) => String(n)));
}

/** Adds an order number to the keep list, so the purge never offers it again. */
export async function keepTestOrder(
  orderNumber: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const { getSetting, setSetting } = await import("./app-settings.server");
    const value = await getSetting(KEEP_SETTING_KEY);
    const list = Array.isArray(value["orderNumbers"]) ? value["orderNumbers"].map(String) : [];
    if (!list.includes(orderNumber)) list.push(orderNumber);
    await setSetting(KEEP_SETTING_KEY, { orderNumbers: list });
    return { ok: true };
  } catch (e: any) {
    console.error("Keep test order failed:", e?.message);
    return { ok: false, error: "A megrendelés megtartása nem sikerült." };
  }
}


export type TestOrderPreviewRow = {
  orderNumber: string;
  email: string;
  productName: string;
  totalPrice: number;
  paymentProvider: string | null;
  paymentStatus: string;
  invoiceNumber: string | null;
  createdAt: string;
  reason: string;
};

/** Dry run: lists exactly the orders the purge button would delete. */
export async function listTestOrdersPreview(): Promise<{
  ok: boolean;
  rows: TestOrderPreviewRow[];
  error?: string;
}> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("orders")
    .select(
      "order_number, email, product_name, total_price, payment_provider, payment_status, billingo_invoice_number, created_at",
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Test order preview failed:", error.message);
    return { ok: false, rows: [], error: "A teszt megrendelések betöltése nem sikerült." };
  }

  const rows: TestOrderPreviewRow[] = [];
  for (const order of data ?? []) {
    const reason = testOrderReason(order);
    if (!reason) continue;
    rows.push({
      orderNumber: String((order as any).order_number),
      email: String((order as any).email ?? ""),
      productName: String((order as any).product_name ?? ""),
      totalPrice: Number((order as any).total_price ?? 0),
      paymentProvider: ((order as any).payment_provider as string | null) ?? null,
      paymentStatus: String((order as any).payment_status ?? ""),
      invoiceNumber: ((order as any).billingo_invoice_number as string | null) ?? null,
      createdAt: String((order as any).created_at),
      reason,
    });
  }
  return { ok: true, rows };
}

/**
 * Deletes EVERY test order (test payment provider, TESZT- prefixed order number
 * or internal test e-mail) together with all rows that reference them: download
 * tokens, Billingo invoice logs and invoice snapshots. This clears the test data
 * from every admin surface (orders, statistics, Billingo audit and log pages).
 */
export async function purgeTestOrders(): Promise<{
  ok: boolean;
  deleted: number;
  error?: string;
}> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const { data: rows, error: listError } = await supabaseAdmin
    .from("orders")
    .select("id, order_number, payment_provider, email");

  if (listError) {
    console.error("Test order purge listing failed:", listError.message);
    return { ok: false, deleted: 0, error: "A teszt megrendelések betöltése nem sikerült." };
  }

  const tests = (rows ?? []).filter((o: any) => testOrderReason(o) !== null);
  if (tests.length === 0) return { ok: true, deleted: 0 };


  const ids = tests.map((o: any) => o.id as string);
  const numbers = tests.map((o: any) => String(o.order_number));

  for (const table of ["order_downloads", "billingo_invoice_snapshots"] as const) {
    const { error } = await supabaseAdmin.from(table).delete().in("order_id", ids);
    if (error) {
      console.error(`Test order purge failed on ${table}:`, error.message);
      return { ok: false, deleted: 0, error: "A kapcsolódó teszt adatok törlése nem sikerült." };
    }
  }

  const { error: logError } = await supabaseAdmin
    .from("billingo_invoice_logs")
    .delete()
    .or(`order_id.in.(${ids.join(",")}),order_number.in.(${numbers.join(",")})`);
  if (logError) {
    console.error("Test order purge failed on billingo_invoice_logs:", logError.message);
    return { ok: false, deleted: 0, error: "A számlázási naplók törlése nem sikerült." };
  }

  const { data: deleted, error } = await supabaseAdmin
    .from("orders")
    .delete()
    .in("id", ids)
    .select("id");
  if (error) {
    console.error("Test order purge failed:", error.message);
    return { ok: false, deleted: 0, error: "A teszt megrendelések törlése nem sikerült." };
  }
  return { ok: true, deleted: deleted?.length ?? 0 };
}
