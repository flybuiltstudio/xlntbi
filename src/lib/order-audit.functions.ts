import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/** Admin-only: order-level Billingo audit (invoices paired with stornos). */
export const adminOrderAudit = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { gate } = await import("./admin-gate.server");
    await gate(context as any);
    const { buildOrderAudit } = await import("./order-audit.server");
    return buildOrderAudit();
  });
