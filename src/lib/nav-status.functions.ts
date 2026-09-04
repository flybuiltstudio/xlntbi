import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const inputSchema = z.object({ limit: z.coerce.number().int().min(1).max(200).default(40) });

/** Admin: NAV (Online Számla) status of recent Billingo invoices. */
export const adminNavStatusCheck = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => inputSchema.parse(data ?? {}))
  .handler(async ({ context, data }) => {
    const { gate } = await import("./admin-gate.server");
    await gate(context as any);
    const { runNavStatusCheck } = await import("./nav-status.server");
    return { report: await runNavStatusCheck({ limit: data.limit }) };
  });

/** Admin: metadata about the last NAV check. */
export const adminNavCheckState = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { gate } = await import("./admin-gate.server");
    await gate(context as any);
    const { navCheckState } = await import("./nav-status.server");
    return { state: await navCheckState() };
  });
