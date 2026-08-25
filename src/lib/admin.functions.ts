import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

function claimsEmail(context: { claims: Record<string, any> }): string | undefined {
  return typeof context.claims["email"] === "string" ? context.claims["email"] : undefined;
}

async function gate(context: { userId: string; claims: Record<string, any> }) {
  const { assertAdmin } = await import("./admin.server");
  const ok = await assertAdmin(context.userId, claimsEmail(context));
  if (!ok) throw new Error("Nincs jogosultságod ehhez a felülethez.");
}

/** Statistics gate: both `admin` and `user` roles may read stats. */
async function gateStats(context: { userId: string; claims: Record<string, any> }) {
  const { getMyRole } = await import("./admin.server");
  const role = await getMyRole(context.userId, claimsEmail(context));
  if (!role) throw new Error("Nincs jogosultságod ehhez a felülethez.");
  return role;
}

export const adminMyRole = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { getMyRole } = await import("./admin.server");
    return { role: await getMyRole(context.userId, claimsEmail(context as any)) };
  });

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
    const role = await gateStats(context as any);
    const { orderStats } = await import("./admin.server");
    // Only admins may include TESZT- orders; plain users always get the clean stats.
    return orderStats(role === "admin" ? data.includeTests : false);
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

export const adminRetryInvoice = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ orderId: z.string().uuid() }).parse(data))
  .handler(async ({ context, data }) => {
    await gate(context as any);
    const { retryInvoice } = await import("./admin.server");
    return retryInvoice(data.orderId);
  });

export const adminListInvoiceLogs = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await gate(context as any);
    const { listInvoiceLogs } = await import("./admin.server");
    return { logs: await listInvoiceLogs() };
  });

export const adminInvoiceUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ orderId: z.string().uuid() }).parse(data))
  .handler(async ({ context, data }) => {
    await gate(context as any);
    const { invoiceDownloadUrl } = await import("./admin.server");
    return invoiceDownloadUrl(data.orderId);
  });

export const adminInvoiceSnapshot = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        orderId: z.string().uuid(),
        refresh: z.boolean().optional().default(false),
      })
      .parse(data),
  )
  .handler(async ({ context, data }) => {
    await gate(context as any);
    const { invoiceSnapshotForOrder } = await import("./admin.server");
    return invoiceSnapshotForOrder(data.orderId, data.refresh);
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

export const adminUpdateUserRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        userId: z.string().uuid(),
        role: z.enum(["admin", "user"]),
      })
      .parse(data),
  )
  .handler(async ({ context, data }) => {
    await gate(context as any);
    const { updateUserRole } = await import("./admin.server");
    return updateUserRole(data.userId, data.role, context.userId);
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

// ---------------------------------------------------------------------------
// "Friss verzió feltöltés" — product file swap + calculator overrides
// ---------------------------------------------------------------------------

export const adminListProductFiles = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await gate(context as any);
    const { listProductFiles } = await import("./admin.server");
    return { files: await listProductFiles() };
  });

/** Returns a signed upload URL; the browser uploads straight to storage. */
export const adminCreateProductUploadUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        slug: z.string().min(1),
        fileName: z.string().min(1),
        fileSize: z.number().int().nonnegative(),
      })
      .parse(data),
  )
  .handler(async ({ context, data }) => {
    await gate(context as any);
    const { createProductUploadUrl } = await import("./admin.server");
    return createProductUploadUrl(data);
  });

export const adminListCalculatorOverrides = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await gate(context as any);
    const { listCalculatorOverrides } = await import("./admin.server");
    return { overrides: await listCalculatorOverrides() };
  });

export const adminUploadCalculatorVersion = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        key: z.string().min(1),
        fileName: z.string().min(1),
        content: z.string().min(1),
      })
      .parse(data),
  )
  .handler(async ({ context, data }) => {
    await gate(context as any);
    const { uploadCalculatorVersion } = await import("./admin.server");
    return uploadCalculatorVersion({ ...data, updatedBy: context.userId });
  });

export const adminDeleteCalculatorOverride = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ key: z.string().min(1) }).parse(data))
  .handler(async ({ context, data }) => {
    await gate(context as any);
    const { deleteCalculatorOverride } = await import("./admin.server");
    return deleteCalculatorOverride(data.key);
  });

export const adminListProductPlacements = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await gate(context as any);
    const { listProductPlacements } = await import("./admin.server");
    return { placements: await listProductPlacements() };
  });

export const adminSaveProductPlacements = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        items: z
          .array(
            z.object({
              slug: z.string().min(1).max(120),
              category: z.string().min(1).max(60),
              sortOrder: z.number().int().min(0).max(999),
            }),
          )
          .min(1)
          .max(500),
      })
      .parse(data),
  )
  .handler(async ({ context, data }) => {
    await gate(context as any);
    const { saveProductPlacements } = await import("./admin.server");
    return saveProductPlacements(data.items, context.userId);
  });

export const adminResetProductPlacements = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await gate(context as any);
    const { resetProductPlacements } = await import("./admin.server");
    return resetProductPlacements();
  });

export const adminBillingoWebhookState = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await gate(context as any);
    const { billingoWebhookState } = await import("./admin.server");
    return billingoWebhookState();
  });

export const adminSetBillingoWebhook = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ enabled: z.boolean() }).parse(data))
  .handler(async ({ context, data }) => {
    await gate(context as any);
    const { setBillingoWebhookEnabled } = await import("./admin.server");
    return setBillingoWebhookEnabled(data.enabled, (context as any).userId);
  });

export const adminBillingoAudit = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await gate(context as any);
    const { billingoInvoiceAudit } = await import("./admin.server");
    return billingoInvoiceAudit();
  });
