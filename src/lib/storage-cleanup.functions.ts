import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/** Runs the read-only storage scan (admin only). */
export const adminScanStorage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { gate } = await import("./admin-gate.server");
    await gate(context as any);
    const { scanStorageOrphans } = await import("./storage-cleanup.server");
    return scanStorageOrphans();
  });

/** Returns the report stored by the weekly cleanup job, if any. */
export const adminLastStorageReport = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { gate } = await import("./admin-gate.server");
    await gate(context as any);
    const { getSetting } = await import("./app-settings.server");
    const { STORAGE_CLEANUP_KEY } = await import("./maintenance.server");
    const value = await getSetting(STORAGE_CLEANUP_KEY);
    return { report: Object.keys(value).length > 0 ? value : null };
  });

/** Deletes the selected unreferenced files (admin only, re-checked server side). */
export const adminDeleteStorageFiles = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z.object({ paths: z.array(z.string().min(1).max(500)).min(1).max(200) }).parse(data),
  )
  .handler(async ({ context, data }) => {
    const { gate } = await import("./admin-gate.server");
    await gate(context as any);
    const { deleteStorageObjects } = await import("./storage-cleanup.server");
    return deleteStorageObjects(data.paths);
  });
