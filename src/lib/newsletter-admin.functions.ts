import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

import { campaignSchema, NEWSLETTER_MODE_IDS, type NewsletterMode } from "./newsletter-schema";

const modeSchema = z.object({
  mode: z.enum(NEWSLETTER_MODE_IDS as unknown as [NewsletterMode, ...NewsletterMode[]]),
});

const configSchema = modeSchema.extend({
  fields: z.record(z.string(), z.string().max(500)).default({}),
});

export const listNewsletterSubscribers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { gate } = await import("./admin-gate.server");
    await gate(context);
    const { listSubscribers } = await import("./newsletter-admin.server");
    return listSubscribers();
  });

const idSchema = z.object({ id: z.string().uuid() });

export const deleteNewsletterSubscriber = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => idSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { gate } = await import("./admin-gate.server");
    await gate(context);
    const { deleteSubscriber } = await import("./newsletter-admin.server");
    return deleteSubscriber(data.id);
  });

export const listNewsletterBlocklist = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { gate } = await import("./admin-gate.server");
    await gate(context);
    const { listBlocklist } = await import("./newsletter-admin.server");
    return listBlocklist();
  });

const blockSchema = z.object({
  email: z.string().trim().email().max(200),
  note: z.string().trim().max(300).default(""),
});

export const addNewsletterBlocklistEntry = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => blockSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { gate } = await import("./admin-gate.server");
    await gate(context);
    const { addToBlocklist } = await import("./newsletter-admin.server");
    return addToBlocklist(data.email, data.note, context.userId);
  });

export const removeNewsletterBlocklistEntry = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => idSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { gate } = await import("./admin-gate.server");
    await gate(context);
    const { removeFromBlocklist } = await import("./newsletter-admin.server");
    return removeFromBlocklist(data.id);
  });

export const getNewsletterSettings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { gate } = await import("./admin-gate.server");
    await gate(context);
    const { getNewsletterConfig } = await import("./newsletter-admin.server");
    return getNewsletterConfig();
  });

export const saveNewsletterSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => configSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { gate } = await import("./admin-gate.server");
    await gate(context);
    const { saveNewsletterConfig } = await import("./newsletter-admin.server");
    return saveNewsletterConfig(data.mode, data.fields, context.userId);
  });

export const testNewsletterConnection = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => modeSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { gate } = await import("./admin-gate.server");
    await gate(context);
    const { testNewsletterProvider } = await import("./newsletter-admin.server");
    return testNewsletterProvider(data.mode);
  });

export const syncNewsletterSubscribers = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { gate } = await import("./admin-gate.server");
    await gate(context);
    const { syncSubscribers } = await import("./newsletter-admin.server");
    return syncSubscribers();
  });

export const listNewsletterCampaigns = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { gate } = await import("./admin-gate.server");
    await gate(context);
    const { listCampaigns } = await import("./newsletter-admin.server");
    return listCampaigns();
  });

export const sendNewsletterCampaign = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => campaignSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { gate, claimsEmail } = await import("./admin-gate.server");
    await gate(context);
    const callerEmail = (claimsEmail(context) ?? "").trim().toLowerCase();
    let testEmail = (data.testEmail ?? "").trim().toLowerCase();
    if (data.testOnly && testEmail && testEmail !== callerEmail) {
      // Test sends are bound server-side: only the caller's own address or an
      // active newsletter subscriber may receive a test message.
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data: sub } = await (supabaseAdmin as any)
        .from("newsletter_subscribers")
        .select("email")
        .ilike("email", testEmail)
        .eq("status", "confirmed")
        .maybeSingle();
      if (!sub) {
        return {
          ok: false as const,
          error: "Tesztlevél csak a saját címedre vagy aktív feliratkozónak küldhető.",
        };
      }
    }
    
    const { sendCampaign } = await import("./newsletter-admin.server");
    return sendCampaign({
      subject: data.subject,
      html: data.html,
      editorMode: data.editorMode,
      testEmail,
      testOnly: data.testOnly,
      userId: context.userId,
      userEmail: claimsEmail(context) ?? "",
    });
  });

const testEmailSchema = z.object({
  template: z.enum(["hirlevel-megerosites", "hirlevel"]),
  to: z.string().trim().email().max(200),
});

/** Admin-only deliverability test with the newsletter / opt-in templates. */
export const sendNewsletterTestEmail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => testEmailSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { gate, claimsEmail } = await import("./admin-gate.server");
    await gate(context);
    const { sendNewsletterTestEmail: send } = await import("./newsletter-admin.server");
    return send({
      template: data.template,
      to: data.to,
      userEmail: claimsEmail(context) ?? "",
    });
  });
