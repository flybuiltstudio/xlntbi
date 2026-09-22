import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { isCalculatorKey } from "@/lib/calculators/registry";

export type CalculatorOverride = {
  key: string;
  html: string;
  script: string;
  updatedAt: string;
};

/**
 * Public read of a calculator override (if an admin uploaded a newer version).
 * Returns null when the calculator still runs the bundled version.
 *
 * The table itself is not readable by anonymous clients (it also stores
 * bookkeeping columns), so the read happens server-side with the trusted
 * client and only the public markup/script columns are returned. The key is
 * validated against the calculator registry first.
 */
export const getCalculatorOverride = createServerFn({ method: "GET" })
  .inputValidator((data) => z.object({ key: z.string() }).parse(data))
  .handler(async ({ data }): Promise<CalculatorOverride | null> => {
    if (!isCalculatorKey(data.key)) return null;
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data: row, error } = await supabaseAdmin
        .from("calculator_overrides")
        .select("key, html, script, updated_at")
        .eq("key", data.key)
        .maybeSingle();
      if (error || !row) return null;
      return { key: row.key, html: row.html, script: row.script, updatedAt: row.updated_at };
    } catch {
      // Fall back to the bundled calculator if the override cannot be loaded.
      return null;
    }
  });
