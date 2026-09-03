/**
 * Outbound sync to the external newsletter providers.
 *
 * Keys live either in the project secret store (env) or – when the admin typed
 * them on the Hírlevél page – in the `newsletter` app_settings row. They are
 * read here on the server only and never returned to the browser.
 */

import type { NewsletterMode } from "./newsletter-schema";

export type ProviderConfig = Record<string, string>;

export type Subscriber = {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  company?: string | null;
};

export type ProviderResult = { ok: true } | { ok: false; error: string };

function envKey(name: string): string {
  return process.env[name] ?? "";
}

/** Merges stored settings with env secrets (env wins only when nothing stored). */
export function providerConfig(mode: NewsletterMode, stored: ProviderConfig): ProviderConfig {
  const get = (key: string, env: string) => stored[key]?.trim() || envKey(env);
  switch (mode) {
    case "mailerlite":
      return { apiKey: get("apiKey", "MAILERLITE_API_KEY"), groupId: get("groupId", "MAILERLITE_GROUP_ID") };
    case "emailoctopus":
      return { apiKey: get("apiKey", "EMAILOCTOPUS_API_KEY"), listId: get("listId", "EMAILOCTOPUS_LIST_ID") };
    case "sender":
      return { apiKey: get("apiKey", "SENDER_API_KEY"), groupId: get("groupId", "SENDER_GROUP_ID") };
    case "sendpulse":
      return {
        clientId: get("clientId", "SENDPULSE_CLIENT_ID"),
        clientSecret: get("clientSecret", "SENDPULSE_CLIENT_SECRET"),
        listId: get("listId", "SENDPULSE_LIST_ID"),
      };
    case "brevo":
      return { apiKey: get("apiKey", "BREVO_API_KEY"), listId: get("listId", "BREVO_LIST_ID") };
    default:
      return {};
  }
}

async function readError(response: Response): Promise<string> {
  const text = await response.text().catch(() => "");
  return `[${response.status}] ${text.slice(0, 400)}`;
}

async function sendpulseToken(config: ProviderConfig): Promise<string> {
  const response = await fetch("https://api.sendpulse.com/oauth/access_token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grant_type: "client_credentials",
      client_id: config["clientId"] ?? "",
      client_secret: config["clientSecret"] ?? "",
    }),
  });
  if (!response.ok) throw new Error(await readError(response));
  const data = (await response.json()) as { access_token?: string };
  if (!data.access_token) throw new Error("A SendPulse nem adott vissza tokent.");
  return data.access_token;
}

/** Pushes one subscriber to the selected provider. Never throws. */
export async function pushSubscriber(
  mode: NewsletterMode,
  config: ProviderConfig,
  person: Subscriber,
): Promise<ProviderResult> {
  try {
    switch (mode) {
      case "mailerlite": {
        if (!config["apiKey"]) return { ok: false, error: "Nincs MailerLite API-kulcs." };
        const response = await fetch("https://connect.mailerlite.com/api/subscribers", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${config["apiKey"]}`,
          },
          body: JSON.stringify({
            email: person.email,
            fields: {
              name: person.firstName,
              last_name: person.lastName,
              phone: person.phone ?? "",
              company: person.company ?? "",
            },
            ...(config["groupId"] ? { groups: [config["groupId"]] } : {}),
          }),
        });
        if (!response.ok) return { ok: false, error: await readError(response) };
        return { ok: true };
      }
      case "emailoctopus": {
        if (!config["apiKey"]) return { ok: false, error: "Nincs EmailOctopus API-kulcs." };
        if (!config["listId"]) return { ok: false, error: "Nincs EmailOctopus lista-azonosító." };
        const response = await fetch(
          `https://api.emailoctopus.com/lists/${encodeURIComponent(config["listId"])}/contacts`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${config["apiKey"]}`,
            },
            body: JSON.stringify({
              email_address: person.email,
              fields: {
                FirstName: person.firstName,
                LastName: person.lastName,
                Company: person.company ?? "",
                Phone: person.phone ?? "",
              },
              status: "subscribed",
            }),
          },
        );
        if (!response.ok) return { ok: false, error: await readError(response) };
        return { ok: true };
      }
      case "sender": {
        if (!config["apiKey"]) return { ok: false, error: "Nincs Sender API-kulcs." };
        const response = await fetch("https://api.sender.net/v2/subscribers", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${config["apiKey"]}`,
          },
          body: JSON.stringify({
            email: person.email,
            firstname: person.firstName,
            lastname: person.lastName,
            phone: person.phone || undefined,
            ...(config["groupId"] ? { groups: [config["groupId"]] } : {}),
          }),
        });
        if (!response.ok) return { ok: false, error: await readError(response) };
        return { ok: true };
      }
      case "sendpulse": {
        if (!config["clientId"] || !config["clientSecret"]) {
          return { ok: false, error: "Nincs SendPulse azonosító vagy titkos kulcs." };
        }
        if (!config["listId"]) return { ok: false, error: "Nincs SendPulse címlista azonosító." };
        const token = await sendpulseToken(config);
        const response = await fetch(
          `https://api.sendpulse.com/addressbooks/${encodeURIComponent(config["listId"])}/emails`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              emails: [
                {
                  email: person.email,
                  variables: {
                    Név: `${person.lastName} ${person.firstName}`.trim(),
                    Telefon: person.phone ?? "",
                    Cégnév: person.company ?? "",
                  },
                },
              ],
            }),
          },
        );
        if (!response.ok) return { ok: false, error: await readError(response) };
        return { ok: true };
      }
      case "brevo": {
        if (!config["apiKey"]) return { ok: false, error: "Nincs Brevo API-kulcs." };
        const listId = Number(config["listId"]);
        const response = await fetch("https://api.brevo.com/v3/contacts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "api-key": config["apiKey"],
          },
          body: JSON.stringify({
            email: person.email,
            updateEnabled: true,
            attributes: {
              FIRSTNAME: person.firstName,
              LASTNAME: person.lastName,
              SMS: person.phone || undefined,
              COMPANY: person.company || undefined,
            },
            ...(Number.isFinite(listId) && listId > 0 ? { listIds: [listId] } : {}),
          }),
        });
        if (!response.ok) return { ok: false, error: await readError(response) };
        return { ok: true };
      }
      default:
        return { ok: false, error: "Ehhez a módhoz nincs külső szolgáltató." };
    }
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  }
}

/** Read-only credential check so the admin sees whether a key works. */
export async function testProvider(
  mode: NewsletterMode,
  config: ProviderConfig,
): Promise<ProviderResult> {
  try {
    switch (mode) {
      case "mailerlite": {
        if (!config["apiKey"]) return { ok: false, error: "Nincs API-kulcs." };
        const r = await fetch("https://connect.mailerlite.com/api/groups?limit=1", {
          headers: { Authorization: `Bearer ${config["apiKey"]}`, Accept: "application/json" },
        });
        return r.ok ? { ok: true } : { ok: false, error: await readError(r) };
      }
      case "emailoctopus": {
        if (!config["apiKey"]) return { ok: false, error: "Nincs API-kulcs." };
        const r = await fetch("https://api.emailoctopus.com/lists?limit=1", {
          headers: { Authorization: `Bearer ${config["apiKey"]}` },
        });
        return r.ok ? { ok: true } : { ok: false, error: await readError(r) };
      }
      case "sender": {
        if (!config["apiKey"]) return { ok: false, error: "Nincs API-kulcs." };
        const r = await fetch("https://api.sender.net/v2/groups", {
          headers: { Authorization: `Bearer ${config["apiKey"]}`, Accept: "application/json" },
        });
        return r.ok ? { ok: true } : { ok: false, error: await readError(r) };
      }
      case "sendpulse": {
        await sendpulseToken(config);
        return { ok: true };
      }
      case "brevo": {
        if (!config["apiKey"]) return { ok: false, error: "Nincs API-kulcs." };
        const r = await fetch("https://api.brevo.com/v3/account", {
          headers: { "api-key": config["apiKey"], Accept: "application/json" },
        });
        return r.ok ? { ok: true } : { ok: false, error: await readError(r) };
      }
      default:
        return { ok: false, error: "Ehhez a módhoz nincs külső szolgáltató." };
    }
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  }
}
