import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const envSchema = z.object({ environment: z.enum(["sandbox", "live"]) });

/** Admin: current Stripe display names vs. the prefixed catalog names. */
export const adminStripeNameStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => envSchema.parse(data))
  .handler(async ({ context, data }) => {
    const { gate } = await import("./admin-gate.server");
    await gate(context as any);
    const { listStripeProductNameStatus } = await import("./stripe-product-names.server");
    return { report: await listStripeProductNameStatus(data.environment) };
  });

/** Admin: rewrite every mismatching Stripe display name to the "XLNT " form. */
export const adminStripeNameSync = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => envSchema.parse(data))
  .handler(async ({ context, data }) => {
    const { gate } = await import("./admin-gate.server");
    await gate(context as any);
    const { syncStripeProductNames } = await import("./stripe-product-names.server");
    return { result: await syncStripeProductNames(data.environment) };
  });
