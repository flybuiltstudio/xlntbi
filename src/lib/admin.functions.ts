import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function gate(context: { userId: string; claims: Record<string, any> }) {
  const { assertAdmin } = await import("./admin.server");
  const email = typeof context.claims["email"] === "string" ? context.claims["email"] : undefined;
  const ok = await assertAdmin(context.userId, email);
  if (!ok) throw new Error("Nincs jogosultságod ehhez a felülethez.");
}

export const adminListOrders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await gate(context as any);
    const { listOrders } = await import("./admin.server");
    return { orders: await listOrders() };
  });

export const adminApproveTransfer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        orderId: z.string().uuid(),
        reference: z.string().trim().max(120).optional().default(""),
      })
      .parse(data),
  )
  .handler(async ({ context, data }) => {
    await gate(context as any);
    const { approveTransfer } = await import("./admin.server");
    return approveTransfer(data.orderId, data.reference);
  });

export const adminResendDownload = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ orderId: z.string().uuid() }).parse(data))
  .handler(async ({ context, data }) => {
    await gate(context as any);
    const { resendDownload } = await import("./admin.server");
    return resendDownload(data.orderId);
  });
