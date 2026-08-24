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
  billingoInvoiceId: number | null;
  billingoInvoiceNumber: string | null;
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
    billingoInvoiceId: o.billingo_invoice_id ?? null,
    billingoInvoiceNumber: o.billingo_invoice_number ?? null,
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

/** Deletes a test order (only rows marked payment_provider = "test"). */
export async function deleteTestOrder(orderId: string): Promise<{ ok: boolean; error?: string }> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { error } = await supabaseAdmin
    .from("orders")
    .delete()
    .eq("id", orderId)
    .eq("payment_provider", "test");

  if (error) {
    console.error("Test order deletion failed:", error.message);
    return { ok: false, error: "A teszt megrendelés törlése nem sikerült." };
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

// ---------------------------------------------------------------------------
// "Friss verzió feltöltés" — termékfájl csere és kalkulátor-felülírások
// ---------------------------------------------------------------------------

const PRODUCT_FILES_BUCKET = "termekfajlok";
const PRODUCT_UPLOAD_MAX_BYTES = 300 * 1024 * 1024; // 300 MB
const CALCULATOR_UPLOAD_MAX_BYTES = 5 * 1024 * 1024; // 5 MB

export type ProductFileInfo = {
  slug: string;
  fileName: string;
  size: number | null;
  updatedAt: string | null;
};

/** Reads the current storage metadata of every downloadable product file. */
export async function listProductFiles(): Promise<ProductFileInfo[]> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { products } = await import("@/lib/products");
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
      fileName,
      size: meta && typeof meta.size === "number" ? meta.size : null,
      updatedAt: entry?.updated_at ?? entry?.created_at ?? null,
    });
  }
  return result;
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
  if (!["xlsm", "exe"].includes(uploadExt)) {
    return { ok: false, error: "Csak .xlsm vagy .exe fájl tölthető fel." };
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
