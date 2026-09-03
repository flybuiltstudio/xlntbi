import { getRequestHeader } from "@tanstack/react-start/server";

import { sendEmails } from "./notify.server";
import { getSetting } from "./app-settings.server";
import { NEWSLETTER_MODE_IDS, type NewsletterMode } from "./newsletter-schema";
import { providerConfig, pushSubscriber } from "./newsletter-providers.server";

export const NEWSLETTER_SETTINGS_KEY = "newsletter";

type SubscribeInput = {
  lastName: string;
  firstName: string;
  email: string;
  phone: string;
  company: string;
  website: string;
};

const RATE_LIMIT_WINDOW_MINUTES = 10;
const RATE_LIMIT_MAX = 5;

export function siteOrigin(): string {
  return process.env["PUBLIC_SITE_URL"] ?? "https://xlntbi.hu";
}

function newToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

function clientIp(): string {
  const header =
    getRequestHeader("cf-connecting-ip") ??
    getRequestHeader("x-forwarded-for") ??
    getRequestHeader("x-real-ip") ??
    "";
  return header.split(",")[0]?.trim() || "unknown";
}

/** Selected mode + the (non-secret) provider settings. */
export async function newsletterSettings(): Promise<{
  mode: NewsletterMode;
  providers: Record<string, Record<string, string>>;
}> {
  const raw = await getSetting(NEWSLETTER_SETTINGS_KEY);
  const mode = NEWSLETTER_MODE_IDS.includes(raw["mode"]) ? (raw["mode"] as NewsletterMode) : "own";
  const providers =
    raw["providers"] && typeof raw["providers"] === "object" ?
      (raw["providers"] as Record<string, Record<string, string>>)
    : {};
  return { mode, providers };
}

export function confirmUrl(token: string): string {
  return `${siteOrigin()}/hirlevel-megerosites?token=${token}`;
}

export function unsubscribeUrl(token: string): string {
  return `${siteOrigin()}/leiratkozas?token=${token}`;
}

/** Public sign-up: stores the person as `pending` and sends the opt-in email. */
export async function subscribe(data: SubscribeInput) {
  // Honeypot: silently accept but drop.
  if (data.website) return { ok: true as const, pending: true };

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const db = supabaseAdmin as any;
  const ip = clientIp();
  const since = new Date(Date.now() - RATE_LIMIT_WINDOW_MINUTES * 60_000).toISOString();

  const { count } = await db
    .from("newsletter_subscribers")
    .select("id", { count: "exact", head: true })
    .eq("ip_address", ip)
    .gte("created_at", since);
  if ((count ?? 0) >= RATE_LIMIT_MAX) {
    return {
      ok: false as const,
      error: "Túl sok feliratkozás történt rövid időn belül. Kérlek, próbáld újra pár perc múlva.",
    };
  }

  const email = data.email.trim().toLowerCase();
  const token = newToken();

  const { data: existing } = await db
    .from("newsletter_subscribers")
    .select("id, status")
    .ilike("email", email)
    .maybeSingle();

  const row = {
    last_name: data.lastName,
    first_name: data.firstName,
    email,
    phone: data.phone || null,
    company: data.company || null,
    ip_address: ip,
    user_agent: getRequestHeader("user-agent") ?? null,
  };

  let id: string | undefined = existing?.id;
  if (existing) {
    if (existing.status === "confirmed") {
      return { ok: true as const, pending: false, already: true as const };
    }
    const { error } = await db
      .from("newsletter_subscribers")
      .update({ ...row, status: "pending", confirm_token: token, unsubscribed_at: null })
      .eq("id", existing.id);
    if (error) {
      console.error("Newsletter update failed:", error.message);
      return { ok: false as const, error: "A feliratkozás mentése nem sikerült." };
    }
  } else {
    const { data: inserted, error } = await db
      .from("newsletter_subscribers")
      .insert({ ...row, status: "pending", confirm_token: token })
      .select("id")
      .single();
    if (error) {
      console.error("Newsletter insert failed:", error.message);
      return { ok: false as const, error: "A feliratkozás mentése nem sikerült." };
    }
    id = inserted?.id;
  }

  await sendEmails([
    {
      template: "hirlevel-megerosites",
      to: email,
      key: `hirlevel-optin-${id ?? token}`,
      data: {
        name: `${data.lastName} ${data.firstName}`.trim(),
        confirmUrl: confirmUrl(token),
      },
    },
  ]);

  return { ok: true as const, pending: true };
}

/** Double opt-in confirmation. Also pushes to the selected external provider. */
export async function confirmSubscription(token: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const db = supabaseAdmin as any;

  const { data: row } = await db
    .from("newsletter_subscribers")
    .select("id, email, first_name, last_name, phone, company, status")
    .eq("confirm_token", token)
    .maybeSingle();

  if (!row) return { ok: false as const, error: "Ez a megerősítő link már nem érvényes." };
  if (row.status === "confirmed") return { ok: true as const, already: true as const };

  const { error } = await db
    .from("newsletter_subscribers")
    .update({ status: "confirmed", confirmed_at: new Date().toISOString(), unsubscribed_at: null })
    .eq("id", row.id);
  if (error) return { ok: false as const, error: "A megerősítést nem tudtam rögzíteni." };

  const { mode, providers } = await newsletterSettings();
  if (mode !== "own") {
    const config = providerConfig(mode, providers[mode] ?? {});
    const result = await pushSubscriber(mode, config, {
      email: row.email,
      firstName: row.first_name,
      lastName: row.last_name,
      phone: row.phone,
      company: row.company,
    });
    await db
      .from("newsletter_subscribers")
      .update({
        provider_name: mode,
        provider_synced_at: result.ok ? new Date().toISOString() : null,
        provider_error: result.ok ? null : result.error.slice(0, 500),
      })
      .eq("id", row.id);
  }

  return { ok: true as const, already: false as const };
}

/** One-click unsubscribe from the email footer. */
export async function unsubscribe(token: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const db = supabaseAdmin as any;
  const { data: row } = await db
    .from("newsletter_subscribers")
    .select("id, email")
    .eq("confirm_token", token)
    .maybeSingle();
  if (!row) return { ok: false as const, error: "Ez a leiratkozó link már nem érvényes." };

  const { error } = await db
    .from("newsletter_subscribers")
    .update({ status: "unsubscribed", unsubscribed_at: new Date().toISOString() })
    .eq("id", row.id);
  if (error) return { ok: false as const, error: "A leiratkozást nem tudtam rögzíteni." };
  return { ok: true as const, email: row.email as string };
}
