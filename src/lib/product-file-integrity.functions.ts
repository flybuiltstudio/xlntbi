import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/** Runs the integrity check on every product file now (admin only). */
export const adminRunFileIntegrity = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { gate } = await import("./admin-gate.server");
    await gate(context as any);
    const { runProductFileIntegrity } = await import("./product-file-integrity.server");
    return runProductFileIntegrity();
  });

/** Last stored report (weekly job or manual run). */
export const adminLastFileIntegrity = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { gate } = await import("./admin-gate.server");
    await gate(context as any);
    const { getSetting } = await import("./app-settings.server");
    const { PRODUCT_FILE_INTEGRITY_KEY } = await import("./product-file-integrity.server");
    const value = await getSetting(PRODUCT_FILE_INTEGRITY_KEY);
    return { report: value && typeof value["ranAt"] === "string" ? (value as any) : null };
  });

/** Checks the stored file of one product right after an upload. */
export const adminCheckProductFile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ slug: z.string().min(1).max(200) }).parse(data))
  .handler(async ({ context, data }) => {
    const { gate } = await import("./admin-gate.server");
    await gate(context as any);
    const { getProduct } = await import("./products");
    const path = getProduct(data.slug)?.download?.storagePath;
    if (!path) return { path: "", size: 0, ok: false, detail: "Ismeretlen termék." };
    const { checkStoredPath } = await import("./product-file-integrity.server");
    return checkStoredPath(path);
  });

/** Checks a freshly uploaded storage object (e.g. right after a new product upload). */
export const adminCheckUploadedFile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ path: z.string().min(1).max(500) }).parse(data))
  .handler(async ({ context, data }) => {
    const { gate } = await import("./admin-gate.server");
    await gate(context as any);
    const { checkStoredPath } = await import("./product-file-integrity.server");
    return checkStoredPath(data.path);
  });
