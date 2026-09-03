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
    const { sendCampaign } = await import("./newsletter-admin.server");
    return sendCampaign({
      subject: data.subject,
      html: data.html,
      testEmail: data.testEmail ?? "",
      testOnly: data.testOnly,
      userId: context.userId,
      userEmail: claimsEmail(context) ?? "",
    });
  });
