import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const envSchema = z.object({ environment: z.enum(["sandbox", "live"]) });

/** Admin: full catalog self-check (Stripe prices + download files). */
export const adminCatalogAudit = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => envSchema.parse(data))
  .handler(async ({ context, data }) => {
    const { gate } = await import("./admin-gate.server");
    await gate(context as any);
    const { runCatalogAudit } = await import("./catalog-audit.server");
    return { report: await runCatalogAudit(data.environment) };
  });
