import { z } from "zod";

export const testOrderSchema = z.object({
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

const couponCodeRegex = /^[A-Z0-9_-]{3,40}$/;

export const createCouponSchema = z
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
