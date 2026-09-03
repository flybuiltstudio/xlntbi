/**
 * Admin-side newsletter logic: subscriber list, mode/provider settings,
 * provider tests, bulk sync and campaign sending.
 *
 * Provider API keys are stored in the `newsletter` app_settings row (service
 * role only) or come from project secrets. They are never returned to the
 * browser — the admin UI only learns whether a key is set.
 */

import { setSetting } from "./app-settings.server";
import { sendTemplateEmail } from "./email-templates/send-email";
import { newsletterPlainText, sanitizeNewsletterHtml } from "./newsletter-html";
import { NEWSLETTER_MODES, type NewsletterMode } from "./newsletter-schema";
import {
  providerConfig,
  pushSubscriber,
  testProvider,
  type ProviderConfig,
} from "./newsletter-providers.server";
import {
  NEWSLETTER_SETTINGS_KEY,
  newsletterSettings,
  unsubscribeUrl,
} from "./newsletter.server";

export type SubscriberRow = {
  id: string;
  lastName: string;
  firstName: string;
  email: string;
  phone: string;
  company: string;
  status: string;
  source: string;
  createdAt: string;
  confirmedAt: string | null;
  unsubscribedAt: string | null;
  providerName: string | null;
  providerSyncedAt: string | null;
  providerError: string | null;
};

function secretKeys(mode: NewsletterMode): string[] {
  const entry = NEWSLETTER_MODES.find((m) => m.id === mode);
  return (entry?.fields ?? []).filter((f) => f.secret).map((f) => f.key);
}

export async function listSubscribers(): Promise<SubscriberRow[]> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await (supabaseAdmin as any)
    .from("newsletter_subscribers")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5000);
  if (error) throw new Error(error.message);
  return (data ?? []).map((r: any) => ({
    id: r.id,
    lastName: r.last_name ?? "",
    firstName: r.first_name ?? "",
    email: r.email ?? "",
    phone: r.phone ?? "",
    company: r.company ?? "",
    status: r.status ?? "pending",
    source: r.source ?? "",
    createdAt: r.created_at,
    confirmedAt: r.confirmed_at ?? null,
    unsubscribedAt: r.unsubscribed_at ?? null,
    providerName: r.provider_name ?? null,
    providerSyncedAt: r.provider_synced_at ?? null,
    providerError: r.provider_error ?? null,
  }));
}

/** Mode + which provider fields are filled (secrets masked). */
export async function getNewsletterConfig() {
  const { mode, providers } = await newsletterSettings();
  const status: Record<string, { configured: boolean; values: Record<string, string> }> = {};
  for (const entry of NEWSLETTER_MODES) {
    if (entry.id === "own") continue;
    const stored = providers[entry.id] ?? {};
    const effective = providerConfig(entry.id, stored);
    const secrets = secretKeys(entry.id);
    const values: Record<string, string> = {};
    for (const field of entry.fields) {
      if (!field.secret) values[field.key] = stored[field.key] ?? effective[field.key] ?? "";
    }
    status[entry.id] = {
      configured: secrets.every((key) => Boolean(effective[key])),
      values,
    };
  }
  return { mode, providers: status };
}

export async function saveNewsletterConfig(
  mode: NewsletterMode,
  fields: Record<string, string>,
  userId: string,
) {
  const { providers } = await newsletterSettings();
  const next: Record<string, ProviderConfig> = { ...providers };
  if (mode !== "own") {
    const current = { ...(next[mode] ?? {}) };
    for (const [key, value] of Object.entries(fields)) {
      const trimmed = value.trim();
      // Empty secret field = keep the previously stored value.
      if (!trimmed && secretKeys(mode).includes(key)) continue;
      if (!trimmed) delete current[key];
      else current[key] = trimmed;
    }
    next[mode] = current;
  }
  await setSetting(NEWSLETTER_SETTINGS_KEY, { mode, providers: next }, userId);
  return getNewsletterConfig();
}

export async function testNewsletterProvider(mode: NewsletterMode) {
  if (mode === "own") return { ok: true as const };
  const { providers } = await newsletterSettings();
  return testProvider(mode, providerConfig(mode, providers[mode] ?? {}));
}

/** Pushes every confirmed subscriber to the selected provider. */
export async function syncSubscribers() {
  const { mode, providers } = await newsletterSettings();
  if (mode === "own") {
    return { ok: false as const, error: "A saját lista módban nincs mit szinkronizálni." };
  }
  const config = providerConfig(mode, providers[mode] ?? {});
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const db = supabaseAdmin as any;
  const { data, error } = await db
    .from("newsletter_subscribers")
    .select("id, email, first_name, last_name, phone, company")
    .eq("status", "confirmed")
    .limit(2000);
  if (error) return { ok: false as const, error: error.message };

  let synced = 0;
  let failed = 0;
  let lastError = "";
  for (const row of data ?? []) {
    const result = await pushSubscriber(mode, config, {
      email: row.email,
      firstName: row.first_name,
      lastName: row.last_name,
      phone: row.phone,
      company: row.company,
    });
    if (result.ok) synced += 1;
    else {
      failed += 1;
      lastError = result.error;
    }
    await db
      .from("newsletter_subscribers")
      .update({
        provider_name: mode,
        provider_synced_at: result.ok ? new Date().toISOString() : null,
        provider_error: result.ok ? null : result.error.slice(0, 500),
      })
      .eq("id", row.id);
  }
  return { ok: true as const, synced, failed, lastError, mode };
}

export type CampaignRow = {
  id: string;
  subject: string;
  sentAt: string;
  recipients: number;
  sentCount: number;
  failedCount: number;
  testOnly: boolean;
  createdByEmail: string | null;
};

export async function listCampaigns(): Promise<CampaignRow[]> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await (supabaseAdmin as any)
    .from("newsletter_campaigns")
    .select("*")
    .order("sent_at", { ascending: false })
    .limit(200);
  if (error) throw new Error(error.message);
  return (data ?? []).map((r: any) => ({
    id: r.id,
    subject: r.subject ?? "",
    sentAt: r.sent_at,
    recipients: r.recipients ?? 0,
    sentCount: r.sent_count ?? 0,
    failedCount: r.failed_count ?? 0,
    testOnly: Boolean(r.test_only),
    createdByEmail: r.created_by_email ?? null,
  }));
}

const BATCH_SIZE = 8;

/**
 * Sends the campaign with the built-in email system. `testOnly` sends a single
 * copy to the admin so the layout can be checked before the real send.
 */
export async function sendCampaign(input: {
  subject: string;
  html: string;
  testEmail: string;
  testOnly: boolean;
  userId: string;
  userEmail: string;
}) {
  const html = sanitizeNewsletterHtml(input.html);
  if (newsletterPlainText(html).length < 5) {
    return { ok: false as const, error: "A levél szövege üres a tisztítás után." };
  }

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const db = supabaseAdmin as any;

  if (input.testOnly) {
    const to = input.testEmail || input.userEmail;
    if (!to) return { ok: false as const, error: "Adj meg egy teszt e-mail címet." };
    try {
      await sendTemplateEmail("hirlevel", to, {
        templateData: {
          subject: input.subject,
          html,
          unsubscribeUrl: `${(await import("./newsletter.server")).siteOrigin()}/leiratkozas?token=teszt`,
        },
        idempotencyKey: `hirlevel-teszt-${crypto.randomUUID()}`,
      });
    } catch (error) {
      return {
        ok: false as const,
        error: error instanceof Error ? error.message : "A teszt levél nem ment ki.",
      };
    }
    return { ok: true as const, testOnly: true as const, sent: 1, failed: 0, recipients: 1 };
  }

  const { data: rows, error } = await db
    .from("newsletter_subscribers")
    .select("id, email, confirm_token")
    .eq("status", "confirmed")
    .limit(5000);
  if (error) return { ok: false as const, error: error.message };
  const recipients = rows ?? [];
  if (recipients.length === 0) {
    return { ok: false as const, error: "Nincs megerősített feliratkozó, akinek küldhetnék." };
  }

  const campaignId = crypto.randomUUID();
  let sent = 0;
  let failed = 0;
  for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
    const batch = recipients.slice(i, i + BATCH_SIZE);
    const results = await Promise.all(
      batch.map(async (row: any) => {
        try {
          const result = await sendTemplateEmail("hirlevel", row.email, {
            templateData: {
              subject: input.subject,
              html,
              unsubscribeUrl: unsubscribeUrl(row.confirm_token ?? ""),
            },
            idempotencyKey: `hirlevel-${campaignId}-${row.id}`,
          });
          return result.sent;
        } catch (sendError) {
          console.error(
            "Newsletter send failed:",
            sendError instanceof Error ? sendError.message : sendError,
          );
          return false;
        }
      }),
    );
    for (const ok of results) ok ? (sent += 1) : (failed += 1);
  }

  await db.from("newsletter_campaigns").insert({
    id: campaignId,
    subject: input.subject,
    body_html: html,
    test_only: false,
    recipients: recipients.length,
    sent_count: sent,
    failed_count: failed,
    created_by: input.userId,
    created_by_email: input.userEmail,
  });

  return {
    ok: true as const,
    testOnly: false as const,
    sent,
    failed,
    recipients: recipients.length,
  };
}

/**
 * Sends a single test email with one of the newsletter templates so the admin
 * can check deliverability (inbox vs. spam) before a real campaign.
 */
export async function sendNewsletterTestEmail(input: {
  template: "hirlevel-megerosites" | "hirlevel";
  to: string;
  userEmail: string;
}) {
  const to = input.to.trim() || input.userEmail;
  if (!to) return { ok: false as const, error: "Adj meg egy e-mail címet." };

  const { siteOrigin } = await import("./newsletter.server");
  const origin = siteOrigin();
  const stamp = new Date().toLocaleString("hu-HU");

  try {
    const result =
      input.template === "hirlevel-megerosites" ?
        await sendTemplateEmail("hirlevel-megerosites", to, {
          templateData: {
            name: "Teszt Feliratkozó",
            confirmUrl: `${origin}/hirlevel-megerosites?token=teszt`,
          },
          idempotencyKey: `hirlevel-optin-teszt-${crypto.randomUUID()}`,
        })
      : await sendTemplateEmail("hirlevel", to, {
          templateData: {
            subject: `Kézbesítési teszt – ${stamp}`,
            html: sanitizeNewsletterHtml(
              `<p>Ez egy <strong>kézbesítési teszt</strong> az xlntbi.hu hírlevél-rendszeréből.</p>` +
                `<p>Küldés ideje: ${stamp}. Ha ez a levél a Levélszemét mappában landolt, jelöld „Nem spam”-ként.</p>`,
            ),
            unsubscribeUrl: `${origin}/leiratkozas?token=teszt`,
          },
          idempotencyKey: `hirlevel-kezbesites-teszt-${crypto.randomUUID()}`,
        });

    if (!result.sent) {
      return {
        ok: false as const,
        error:
          result.reason === "recipient_suppressed" ?
            "Ez a cím tiltólistán van (korábbi visszapattanás vagy leiratkozás miatt), ezért nem kapott levelet."
          : "A levelet nem sikerült kiküldeni.",
      };
    }
    return { ok: true as const, to, from: "noreply@notify.xlntbi.hu" };
  } catch (error) {
    return {
      ok: false as const,
      error: error instanceof Error ? error.message : "A teszt levél nem ment ki.",
    };
  }
}
