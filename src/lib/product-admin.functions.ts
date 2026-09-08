import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const draftSchema = z.object({
  intro: z.array(z.string()),
  features: z.array(z.string()),
  why: z.string(),
  summary: z.string(),
  metaTitle: z.string(),
  metaDescription: z.string(),
});

/* ---------------------------------------------------------------- descriptions */

export const adminListProductDescriptions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { gate } = await import("./admin-gate.server");
    await gate(context as any);
    const { listProductContentOverrides } = await import("./product-content-admin.server");
    return { overrides: await listProductContentOverrides() };
  });

export const adminGenerateProductDescription = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        slug: z.string().min(1),
        fileName: z.string().min(1),
        fileBase64: z.string().min(1),
      })
      .parse(data),
  )
  .handler(async ({ context, data }) => {
    const { gate } = await import("./admin-gate.server");
    await gate(context as any);
    const { generateProductDescription } = await import("./product-content-admin.server");
    return generateProductDescription(data);
  });

export const adminPublishProductDescription = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        slug: z.string().min(1),
        fileName: z.string().min(1),
        hu: draftSchema,
        en: draftSchema.nullable(),
      })
      .parse(data),
  )
  .handler(async ({ context, data }) => {
    const { gate } = await import("./admin-gate.server");
    await gate(context as any);
    const { publishProductDescription } = await import("./product-content-admin.server");
    return publishProductDescription({ ...data, updatedBy: context.userId });
  });

export const adminRegenerateProductEnglish = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ slug: z.string().min(1) }).parse(data))
  .handler(async ({ context, data }) => {
    const { gate } = await import("./admin-gate.server");
    await gate(context as any);
    const { regenerateEnglishDescription } = await import("./product-content-admin.server");
    return regenerateEnglishDescription(data);
  });

export const adminSaveProductEnglish = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z.object({ slug: z.string().min(1), en: draftSchema }).parse(data),
  )
  .handler(async ({ context, data }) => {
    const { gate } = await import("./admin-gate.server");
    await gate(context as any);
    const { saveEnglishDescription } = await import("./product-content-admin.server");
    return saveEnglishDescription({ ...data, updatedBy: context.userId });
  });

export const adminDeleteProductDescription = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ slug: z.string().min(1) }).parse(data))
  .handler(async ({ context, data }) => {
    const { gate } = await import("./admin-gate.server");
    await gate(context as any);
    const { deleteProductContentOverride } = await import("./product-content-admin.server");
    return deleteProductContentOverride(data.slug);
  });

/* --------------------------------------------------------------------- prices */

export const adminListProductPrices = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { gate } = await import("./admin-gate.server");
    await gate(context as any);
    const { listProductPrices } = await import("./product-prices.server");
    return { rows: await listProductPrices() };
  });

export const adminSaveProductPrice = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        slug: z.string().min(1),
        tierId: z.string().min(1),
        price: z.number().int(),
      })
      .parse(data),
  )
  .handler(async ({ context, data }) => {
    const { gate } = await import("./admin-gate.server");
    await gate(context as any);
    const { saveProductPrice } = await import("./product-prices.server");
    return saveProductPrice({ ...data, updatedBy: context.userId });
  });

export const adminResetProductPrice = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z.object({ slug: z.string().min(1), tierId: z.string().min(1) }).parse(data),
  )
  .handler(async ({ context, data }) => {
    const { gate } = await import("./admin-gate.server");
    await gate(context as any);
    const { resetProductPrice } = await import("./product-prices.server");
    return resetProductPrice(data);
  });
