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

export const adminOrderStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({ includeTests: z.boolean().optional().default(false) })
      .parse(data ?? {}),
  )
  .handler(async ({ context, data }) => {
    await gate(context as any);
    const { orderStats } = await import("./admin.server");
    return orderStats(data.includeTests);
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

export const adminListUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await gate(context as any);
    const { listUsers } = await import("./admin.server");
    return { users: await listUsers() };
  });

export const adminCreateUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        email: z.string().trim().email().max(200),
        password: z.string().min(8).max(200),
        role: z.enum(["admin", "user"]),
      })
      .parse(data),
  )
  .handler(async ({ context, data }) => {
    await gate(context as any);
    const { createUser } = await import("./admin.server");
    return createUser(data.email, data.password, data.role);
  });

export const adminDeleteUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ userId: z.string().uuid() }).parse(data))
  .handler(async ({ context, data }) => {
    await gate(context as any);
    const { deleteUser } = await import("./admin.server");
    return deleteUser(data.userId, context.userId);
  });

const testOrderSchema = z.object({
  productSlug: z.string().trim().min(2).max(80),
  tierId: z.string().trim().min(1).max(80),
  quantity: z.coerce.number().int().min(1).max(20),
  billingName: z.string().trim().min(2).max(160),
  companyName: z.string().trim().max(160).optional().default(""),
  taxNumber: z.string().trim().max(40).optional().default(""),
  country: z.string().trim().min(2).max(80),
  postalCode: z.string().trim().min(2).max(20),
  city: z.string().trim().min(2).max(80),
  addressLine: z.string().trim().min(3).max(200),
  email: z.string().trim().email().max(160),
  phone: z.string().trim().min(6).max(30),
});

export const adminCreateTestOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => testOrderSchema.parse(data))
  .handler(async ({ context, data }) => {
    await gate(context as any);
    const { createTestOrder } = await import("./admin.server");
    return createTestOrder(data);
  });

export const adminListTestOrders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await gate(context as any);
    const { listTestOrders } = await import("./admin.server");
    return { orders: await listTestOrders() };
  });

export const adminDeleteTestOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ orderId: z.string().uuid() }).parse(data))
  .handler(async ({ context, data }) => {
    await gate(context as any);
    const { deleteTestOrder } = await import("./admin.server");
    return deleteTestOrder(data.orderId);
  });
