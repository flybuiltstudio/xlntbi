import { createFileRoute } from "@tanstack/react-router";

/**
 * Serves the illustration of an admin-created product from private storage.
 * Public read-only: the image is meant to be visible on the product page.
 */
export const Route = createFileRoute("/api/public/termek-kep/$slug")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const slug = String(params.slug ?? "").replace(/[^a-z0-9-]/gi, "");
        if (!slug) return new Response("Not found", { status: 404 });

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: row } = await supabaseAdmin
          .from("custom_products")
          .select("image_path")
          .eq("slug", slug)
          .maybeSingle();
        if (!row?.image_path) return new Response("Not found", { status: 404 });

        const { data, error } = await supabaseAdmin.storage
          .from("termekfajlok")
          .download(row.image_path);
        if (error || !data) return new Response("Not found", { status: 404 });

        return new Response(await data.arrayBuffer(), {
          headers: {
            "Content-Type": row.image_path.endsWith(".png") ? "image/png" : "image/jpeg",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
