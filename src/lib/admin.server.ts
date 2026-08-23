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
    return { ok: false, error: "A felhasználó létrejött, de a szerepkör beállítása nem sikerült." };
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
  }));
}

export type OrderStatRow = {
  productName: string;
  tierLabel: string | null;
  quantity: number;
  totalPrice: number;
  paymentStatus: string;
  createdAt: string;
};

/** Minimal order rows for the admin statistics page (aggregated client-side). */
export async function orderStats(): Promise<{ rows: OrderStatRow[] }> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("orders")
    .select("product_name, tier_label, quantity, total_price, payment_status, created_at")
    .order("created_at", { ascending: true })
    .limit(5000);

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
