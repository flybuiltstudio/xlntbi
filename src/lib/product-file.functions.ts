import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { products } from "./products";

/**
 * Public: returns the file name of the latest uploaded version for a product,
 * so the product page always shows the live name instead of a hardcoded value.
 *
 * Only slugs that exist in the public catalog are answered, so the privileged
 * read cannot be used to enumerate internal / unpublished upload rows.
 */
export const getProductFileName = createServerFn({ method: "GET" })
  .inputValidator((data) =>
    z
      .object({ slug: z.string().min(1).max(120) })
      .refine((v) => products.some((p) => p.slug === v.slug), {
        message: "Ismeretlen termék.",
      })
      .parse(data),
  )
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
