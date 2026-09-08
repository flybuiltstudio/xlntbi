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

const tierSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  price: z.number().int(),
  note: z.string().nullable(),
});

/* --------------------------------------------------------------- products */

export const adminListCustomProducts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { gate } = await import("./admin-gate.server");
    await gate(context as any);
    const { listCustomProducts } = await import("./custom-products.server");
    return { products: await listCustomProducts() };
  });

export const adminPrepareCustomProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        name: z.string().min(1),
        fileName: z.string().min(1),
        fileBase64: z.string().min(1),
      })
      .parse(data),
  )
  .handler(async ({ context, data }) => {
    const { gate } = await import("./admin-gate.server");
    await gate(context as any);
    const { prepareCustomProduct } = await import("./custom-products.server");
    return prepareCustomProduct(data);
  });

export const adminPublishCustomProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        slug: z.string().min(1),
        name: z.string().min(1),
        categoryKey: z.string().min(1),
        position: z.number().int().min(0),
        tiers: z.array(tierSchema).min(1),
        hu: draftSchema,
        en: draftSchema.nullable(),
        fileName: z.string().min(1),
        fileSize: z.number().int().min(1),
        imageName: z.string().nullable(),
      })
      .parse(data),
  )
  .handler(async ({ context, data }) => {
    const { gate } = await import("./admin-gate.server");
    await gate(context as any);
    const { publishCustomProduct } = await import("./custom-products.server");
    return publishCustomProduct({ ...data, updatedBy: context.userId });
  });

export const adminDeleteCustomProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ slug: z.string().min(1) }).parse(data))
  .handler(async ({ context, data }) => {
    const { gate } = await import("./admin-gate.server");
    await gate(context as any);
    const { deleteCustomProduct } = await import("./custom-products.server");
    return deleteCustomProduct(data.slug);
  });

/* ------------------------------------------------------------- categories */

export const adminListCategories = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { gate } = await import("./admin-gate.server");
    await gate(context as any);
    const { listAdminCategories } = await import("./custom-categories.server");
    return { categories: await listAdminCategories() };
  });

export const adminCreateCategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z.object({ title: z.string().min(1), titleEn: z.string() }).parse(data),
  )
  .handler(async ({ context, data }) => {
    const { gate } = await import("./admin-gate.server");
    await gate(context as any);
    const { createCategory } = await import("./custom-categories.server");
    return createCategory({ ...data, updatedBy: context.userId });
  });

export const adminRenameCategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({ key: z.string().min(1), title: z.string().min(1), titleEn: z.string() })
      .parse(data),
  )
  .handler(async ({ context, data }) => {
    const { gate } = await import("./admin-gate.server");
    await gate(context as any);
    const { renameCategory } = await import("./custom-categories.server");
    return renameCategory({ ...data, updatedBy: context.userId });
  });

export const adminDeleteCategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ key: z.string().min(1) }).parse(data))
  .handler(async ({ context, data }) => {
    const { gate } = await import("./admin-gate.server");
    await gate(context as any);
    const { deleteCategory } = await import("./custom-categories.server");
    return deleteCategory(data.key);
  });
