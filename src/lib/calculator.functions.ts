import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
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
 */
export const getCalculatorOverride = createServerFn({ method: "GET" })
  .inputValidator((data) => z.object({ key: z.string() }).parse(data))
  .handler(async ({ data }): Promise<CalculatorOverride | null> => {
    if (!isCalculatorKey(data.key)) return null;
    try {
      const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
      const supabase = createClient<Database>(process.env["SUPABASE_URL"]!, key, {
        auth: { persistSession: false },
        global: {
          fetch: (input, init) => {
            const h = new Headers(init?.headers);
            if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) {
              h.delete("Authorization");
            }
            h.set("apikey", key);
            return fetch(input, { ...init, headers: h });
          },
        },
      });
      const { data: row, error } = await supabase
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
