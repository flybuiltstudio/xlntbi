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

export const adminSendLicense = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        orderId: z.string().uuid(),
        licenseKey: z
          .string()
          .trim()
          .min(8, "A licenszkód túl rövid.")
          .max(200, "A licenszkód túl hosszú."),
      })
      .parse(data),
  )
  .handler(async ({ context, data }) => {
    await gate(context as any);
    const { sendLicense } = await import("./admin.server");
    return sendLicense(data.orderId, data.licenseKey);
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

export const adminListProductCategoryOrder = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await gate(context as any);
    const { listProductCategoryOrder } = await import("./admin.server");
    return { categoryOrder: await listProductCategoryOrder() };
  });

export const adminSaveProductCategoryOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z.object({ keys: z.array(z.string().min(1).max(60)).min(1).max(50) }).parse(data),
  )
  .handler(async ({ context, data }) => {
    await gate(context as any);
    const { saveProductCategoryOrder } = await import("./admin.server");
    return saveProductCategoryOrder(data.keys, context.userId);
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

// ---------------------------------------------------------------------------
// Full purchase self-test + live coupon guard
// ---------------------------------------------------------------------------

export const adminRunPurchaseTest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        productSlug: z.string().trim().min(2).max(80),
        tierId: z.string().trim().min(1).max(80),
        email: z.string().trim().email().max(160),
        paymentMethod: z.enum(["card", "transfer"]),
        environment: z.enum(["sandbox", "live"]).optional().default("sandbox"),
        sendLicenseEmail: z.boolean().optional().default(false),
        cleanup: z.boolean().optional().default(true),
      })
      .parse(data),
  )
  .handler(async ({ context, data }) => {
    await gate(context as any);
    const { runFullPurchaseTest } = await import("./purchase-test.server");
    return runFullPurchaseTest(data);
  });

export const adminCleanupTestOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z.object({ orderNumber: z.string().trim().min(2).max(40) }).parse(data),
  )
  .handler(async ({ context, data }) => {
    await gate(context as any);
    const { cleanupTestOrder } = await import("./purchase-test.server");
    return cleanupTestOrder(data.orderNumber);
  });

export const adminCouponGuardState = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await gate(context as any);
    const { couponGuardState } = await import("./coupon-guard.server");
    return couponGuardState();
  });

export const adminSweepLiveCoupons = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await gate(context as any);
    const { sweepLivePromotionCodes } = await import("./coupon-guard.server");
    return sweepLivePromotionCodes();
  });

export const adminPurgeTestOrders = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await gate(context as any);
    const { purgeTestOrders } = await import("./admin.server");
    return purgeTestOrders();
  });

export const adminPreviewTestOrders = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await gate(context as any);
    const { listTestOrdersPreview } = await import("./admin.server");
    return listTestOrdersPreview();
  });

/** Product detail / service subpage view counters (statistics readers). */
export const adminPageViewStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await gateStats(context as any);
    const { listPageViews } = await import("./page-views.server");
    return { rows: await listPageViews() };
  });

/** Coupon usage history (which code, when, how much, which order).
 *  Read-only: both `admin` and `user` roles may view. */
export const adminListCouponUsage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z.object({ environment: z.enum(["sandbox", "live"]) }).parse(data),
  )
  .handler(async ({ context, data }) => {
    await gateStats(context as any);
    const { listCouponUsage } = await import("./coupon-usage.server");
    return listCouponUsage(data.environment);
  });

/** Failed coupon attempts (expired / invalid / used up / below minimum).
 *  Read-only: both `admin` and `user` roles may view. */
export const adminListCouponAttempts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await gateStats(context as any);
    const { listCouponAttempts } = await import("./coupon-attempts.server");
    return { rows: await listCouponAttempts() };
  });

// ---------------------------------------------------------------------------
// Coupon management: list / create / disable Stripe promotion codes
// ---------------------------------------------------------------------------

const couponCodeRegex = /^[A-Z0-9_-]{3,40}$/;

const createCouponSchema = z
  .object({
    code: z
      .string()
      .trim()
      .toUpperCase()
      .regex(couponCodeRegex, "A kuponkód 3–40 karakter, nagybetű, szám, kötőjel vagy aláhúzás lehet."),
    environment: z.enum(["sandbox", "live"]),
    expiresAt: z.string().trim().min(1).nullable(),
    discountType: z.enum(["percent", "amount"]),
    percentOff: z.number().int().min(1).max(100).nullable(),
    amountOff: z.number().int().positive().nullable(),
    currency: z.string().trim().toLowerCase().default("huf"),
    productSlugs: z.array(z.string().trim().min(1).max(120)).default([]),
    allProducts: z.boolean().default(true),
    maxRedemptions: z.number().int().positive().nullable(),
    minAmount: z.number().int().positive().nullable(),
  })
  .superRefine((v, ctx) => {
    if (v.discountType === "percent" && !v.percentOff) {
      ctx.addIssue({ code: "custom", message: "A százalékos kedvezmény 1–100 között kell legyen.", path: ["percentOff"] });
    }
    if (v.discountType === "amount" && !v.amountOff) {
      ctx.addIssue({ code: "custom", message: "A kedvezmény összege nagyobb kell legyen nullánál.", path: ["amountOff"] });
    }
    if (!v.allProducts && v.productSlugs.length === 0) {
      ctx.addIssue({ code: "custom", message: "Válassz legalább egy terméket, vagy pipáld be a „Minden termékre” opciót.", path: ["productSlugs"] });
    }
    if (v.expiresAt) {
      const t = Date.parse(v.expiresAt);
      if (!Number.isFinite(t)) {
        ctx.addIssue({ code: "custom", message: "Érvénytelen lejárati dátum.", path: ["expiresAt"] });
      } else if (t <= Date.now()) {
        ctx.addIssue({ code: "custom", message: "A lejárat a jövőben kell legyen.", path: ["expiresAt"] });
      }
    }
  });

export const adminListCoupons = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z.object({ environment: z.enum(["sandbox", "live"]) }).parse(data ?? {}),
  )
  .handler(async ({ context, data }) => {
    await gate(context as any);
    const { listAdminCoupons } = await import("./coupons-admin.server");
    return { coupons: await listAdminCoupons(data.environment) };
  });

export const adminCreateCoupon = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => createCouponSchema.parse(data))
  .handler(async ({ context, data }) => {
    await gate(context as any);
    const { createAdminCoupon } = await import("./coupons-admin.server");
    try {
      return {
        ok: true,
        coupon: await createAdminCoupon({ ...data, createdBy: context.userId }),
      };
    } catch (error: any) {
      return { ok: false, error: error?.message ?? "Ismeretlen hiba a kupon létrehozásakor." };
    }
  });

export const adminDisableCoupon = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        code: z.string().trim().min(1).max(40),
        environment: z.enum(["sandbox", "live"]),
      })
      .parse(data),
  )
  .handler(async ({ context, data }) => {
    await gate(context as any);
    const { disableAdminCoupon } = await import("./coupons-admin.server");
    return disableAdminCoupon(data.code, data.environment);
  });

export const adminCouponSyncStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z.object({ environment: z.enum(["sandbox", "live"]) }).parse(data ?? {}),
  )
  .handler(async ({ context, data }) => {
    await gate(context as any);
    const { couponSyncStatus } = await import("./coupons-admin.server");
    return { report: await couponSyncStatus(data.environment) };
  });
