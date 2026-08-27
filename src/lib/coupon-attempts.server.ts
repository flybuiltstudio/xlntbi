/**
 * Failed coupon attempt log. Every unsuccessful validation is stored with its
 * reason code so support can answer "lejárt / érvénytelen / elhasznált /
 * összegkorlát alatt" questions from the admin panel.
 */

export type CouponAttemptRow = {
  id: string;
  createdAt: string;
  code: string;
  environment: string;
  reason: string;
  message: string;
  detail: string | null;
  email: string | null;
  orderNumber: string | null;
  amount: number | null;
  priceId: string | null;
};

export const COUPON_REASON_LABEL: Record<string, string> = {
  empty: "Nem adott meg kódot",
  malformed: "Formailag érvénytelen",
  no_campaign: "Nincs aktív kuponakció",
  not_found: "Nem létező kód",
  expired: "Lejárt kód",
  inactive: "Visszavont / inaktív kód",
  used_up: "Elhasznált kód",
  coupon_invalid: "Érvénytelen kedvezmény",
  coupon_expired: "Lejárt kedvezmény",
  below_minimum: "Összegkorlát alatt",
  stripe_error: "Ellenőrzési hiba",
  unknown: "Egyéb hiba",
};

export async function logCouponAttempt(entry: {
  code: string;
  environment: string;
  reason: string;
  message: string;
  detail?: string;
  email?: string;
  orderNumber?: string;
  amount?: number;
  priceId?: string;
}): Promise<void> {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await (supabaseAdmin as any).from("coupon_attempts").insert({
      code: entry.code.slice(0, 60),
      environment: entry.environment,
      outcome: "failed",
      reason_code: entry.reason,
      message: entry.message,
      detail: entry.detail ?? null,
      email: entry.email ?? null,
      order_number: entry.orderNumber ?? null,
      amount: typeof entry.amount === "number" ? entry.amount : null,
      price_id: entry.priceId ?? null,
    });
    if (error) console.error("Coupon attempt log insert failed:", error.message);
  } catch (e) {
    console.error("Coupon attempt log failed:", e);
  }
}

export async function listCouponAttempts(limit = 300): Promise<CouponAttemptRow[]> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await (supabaseAdmin as any)
    .from("coupon_attempts")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Coupon attempt listing failed:", error.message);
    return [];
  }

  return (data ?? []).map((row: any) => ({
    id: row.id,
    createdAt: row.created_at,
    code: row.code,
    environment: row.environment,
    reason: row.reason_code,
    message: row.message,
    detail: row.detail ?? null,
    email: row.email ?? null,
    orderNumber: row.order_number ?? null,
    amount: row.amount ?? null,
    priceId: row.price_id ?? null,
  }));
}
