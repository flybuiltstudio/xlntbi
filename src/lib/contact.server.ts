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
const RATE_LIMIT_WINDOW_MINUTES = 10;
const RATE_LIMIT_MAX = 3;

function clientIp() {
  const header =
    getRequestHeader("cf-connecting-ip") ??
    getRequestHeader("x-forwarded-for") ??
    getRequestHeader("x-real-ip") ??
    "";
  return header.split(",")[0]?.trim() || "unknown";
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
  }).select("id").single();

  if (error) {
    console.error("Submission insert failed:", error.message);
    return { ok: false as const, error: "A beküldés mentése nem sikerült. Kérlek, próbáld újra." };
  }

  const submissionId = inserted?.id ?? crypto.randomUUID();
  const isConsult = data.formType === "konzultacio";
  const label = isConsult ? "konzultációkérés" : "kapcsolatfelvétel";
  const fullName = `${data.lastName} ${data.firstName}`.trim();
  const rows: Array<[string, string]> = [
    ["Név", fullName],
    ["E-mail", data.email],
    ["Telefon", data.phone],
  ];
  if (data.company) rows.push(["Cégnév", data.company]);
  if (data.services.length) rows.push(["Szolgáltatás", data.services.join(", ")]);
  if (data.contactMethod) rows.push(["Hogyan kereshetem", data.contactMethod]);
  if (data.contactTime) rows.push(["Mikor kereshetem", data.contactTime]);
  rows.push(["Üzenet", data.message]);

  const userRows = rows.filter(([key]) => key !== "Üzenet");
  const emailsSent = await sendEmails([
    {
      template: "belso-urlap-ertesito",
      to: OWNER_EMAIL,
      key: `belso-urlap-${submissionId}`,
      data: { label, senderName: fullName, senderEmail: data.email, rows },
      replyTo: data.email,
    },
    {
      template: isConsult ? "konzultacio-visszaigazolas" : "kapcsolat-visszaigazolas",
      to: data.email,
      key: `visszaigazolas-${submissionId}`,
      data: { name: fullName, message: data.message, rows: userRows },
      replyTo: OWNER_EMAIL,
    },
  ]);

  return { ok: true as const, emailsSent };
}

