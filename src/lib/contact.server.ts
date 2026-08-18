import { getRequestHeader } from "@tanstack/react-start/server";

type Submission = {
  formType: "kapcsolat" | "konzultacio";
  lastName: string;
  firstName: string;
  email: string;
  phone: string;
  company: string;
  message: string;
  services: string[];
  contactMethod: string;
  contactTime: string;
  website: string;
};

const OWNER_EMAIL = "xllentac@gmail.com";
const FROM_EMAIL = "EXCELlent <onboarding@resend.dev>";
const RATE_LIMIT_WINDOW_MINUTES = 10;
const RATE_LIMIT_MAX = 3;

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function clientIp() {
  const header =
    getRequestHeader("cf-connecting-ip") ??
    getRequestHeader("x-forwarded-for") ??
    getRequestHeader("x-real-ip") ??
    "";
  return header.split(",")[0]?.trim() || "unknown";
}

async function sendEmail(payload: { to: string; subject: string; html: string }) {
  const apiKey = process.env["RESEND_API_KEY"];
  if (!apiKey) {
    console.warn("RESEND_API_KEY missing – email not sent:", payload.subject);
    return false;
  }
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: [payload.to],
      subject: payload.subject,
      html: payload.html,
    }),
  });
  if (!response.ok) {
    console.error(`Resend error [${response.status}]: ${await response.text()}`);
    return false;
  }
  return true;
}

export async function handleSubmission(data: Submission) {
  // Honeypot: silently accept but drop.
  if (data.website) {
    return { ok: true as const };
  }

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const ip = clientIp();
  const since = new Date(Date.now() - RATE_LIMIT_WINDOW_MINUTES * 60_000).toISOString();

  const { count, error: countError } = await supabaseAdmin
    .from("contact_submissions")
    .select("id", { count: "exact", head: true })
    .eq("ip_address", ip)
    .gte("created_at", since);

  if (countError) {
    console.error("Rate limit check failed:", countError.message);
  } else if ((count ?? 0) >= RATE_LIMIT_MAX) {
    return {
      ok: false as const,
      error: "Túl sok beküldés történt rövid időn belül. Kérlek, próbáld újra pár perc múlva.",
    };
  }

  const { error } = await supabaseAdmin.from("contact_submissions").insert({
    form_type: data.formType,
    last_name: data.lastName,
    first_name: data.firstName,
    email: data.email,
    phone: data.phone,
    company: data.company || null,
    message: data.message,
    services: data.services,
    contact_method: data.contactMethod || null,
    contact_time: data.contactTime || null,
    ip_address: ip,
    user_agent: getRequestHeader("user-agent") ?? null,
  });

  if (error) {
    console.error("Submission insert failed:", error.message);
    return { ok: false as const, error: "A beküldés mentése nem sikerült. Kérlek, próbáld újra." };
  }

  const isConsult = data.formType === "konzultacio";
  const label = isConsult ? "Konzultációkérés" : "Kapcsolatfelvétel";
  const rows: Array<[string, string]> = [
    ["Név", `${data.lastName} ${data.firstName}`],
    ["E-mail", data.email],
    ["Telefon", data.phone],
  ];
  if (data.company) rows.push(["Cégnév", data.company]);
  if (data.services.length) rows.push(["Szolgáltatás", data.services.join(", ")]);
  if (data.contactMethod) rows.push(["Hogyan kereshetem", data.contactMethod]);
  if (data.contactTime) rows.push(["Mikor kereshetem", data.contactTime]);
  rows.push(["Üzenet", data.message]);

  const ownerHtml = `
    <h2>${label} – xlntbi.hu</h2>
    <table cellpadding="6" style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:14px">
      ${rows
        .map(
          ([k, v]) =>
            `<tr><td style="border:1px solid #dfe7e3;background:#f4f8f6"><b>${escapeHtml(k)}</b></td><td style="border:1px solid #dfe7e3">${escapeHtml(v).replace(/\n/g, "<br>")}</td></tr>`,
        )
        .join("")}
    </table>`;

  const userHtml = `
    <div style="font-family:Arial,sans-serif;font-size:15px;color:#16231d">
      <p>Kedves ${escapeHtml(data.lastName)} ${escapeHtml(data.firstName)}!</p>
      <p>Köszönöm a megkeresésedet. A ${isConsult ? "konzultációkérésedet" : "üzenetedet"} megkaptam,
      és rövid időn belül felveszem veled a kapcsolatot a részletek egyeztetéséhez.</p>
      <p><b>A beküldött üzenet:</b><br>${escapeHtml(data.message).replace(/\n/g, "<br>")}</p>
      <p>Üdvözlettel,<br>Sarinay Dávid<br>EXCELlent Accounting &amp; Consulting<br>
      06 20 962 2176 · info@xlntbi.hu</p>
    </div>`;

  const [ownerSent, userSent] = await Promise.all([
    sendEmail({
      to: OWNER_EMAIL,
      subject: `${label}: ${data.lastName} ${data.firstName}`,
      html: ownerHtml,
    }),
    sendEmail({
      to: data.email,
      subject: isConsult
        ? "Megkaptam a konzultációkérésedet – EXCELlent"
        : "Megkaptam az üzenetedet – EXCELlent",
      html: userHtml,
    }),
  ]);

  return { ok: true as const, emailsSent: ownerSent && userSent };
}
