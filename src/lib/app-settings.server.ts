/**
 * Small key/value settings store for internal switches (e.g. whether the
 * Billingo webhook endpoint accepts calls). Read and written with the service
 * role only; the admin UI goes through server functions.
 */

export const BILLINGO_WEBHOOK_KEY = "billingo_webhook";

export async function getSetting(key: string): Promise<Record<string, any>> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await (supabaseAdmin as any)
    .from("app_settings")
    .select("value")
    .eq("key", key)
    .maybeSingle();
  const value = data?.value;
  return value && typeof value === "object" ? value : {};
}

export async function setSetting(
  key: string,
  value: Record<string, any>,
  updatedBy?: string,
): Promise<void> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { error } = await (supabaseAdmin as any).from("app_settings").upsert(
    {
      key,
      value,
      updated_by: updatedBy ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "key" },
  );
  if (error) throw new Error(error.message);
}

/** Whether the Billingo webhook endpoint should process incoming calls. */
export async function billingoWebhookEnabled(): Promise<boolean> {
  const value = await getSetting(BILLINGO_WEBHOOK_KEY);
  return value["enabled"] === true;
}
