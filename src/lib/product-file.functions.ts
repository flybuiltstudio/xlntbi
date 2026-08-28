import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/**
 * Public: returns the file name of the latest uploaded version for a product,
 * so the product page always shows the live name instead of a hardcoded value.
 */
export const getProductFileName = createServerFn({ method: "GET" })
  .inputValidator((data) => z.object({ slug: z.string().min(1) }).parse(data))
  .handler(async ({ data }) => {
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data: row } = await supabaseAdmin
        .from("product_file_versions")
        .select("file_name")
        .eq("product_slug", data.slug)
        .maybeSingle();
      const name = (row?.file_name as string | undefined)?.trim();
      return { fileName: name && name.length > 0 ? name : null };
    } catch {
      return { fileName: null as string | null };
    }
  });
