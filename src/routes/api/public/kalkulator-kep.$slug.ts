import { createFileRoute } from "@tanstack/react-router";

/**
 * Serves the card image of an admin-uploaded calculator from private storage.
 * Public read-only: the image is meant to be visible on the calculator pages.
 */
export const Route = createFileRoute("/api/public/kalkulator-kep/$slug")({
  server: {
    handlers: {
      GET: async ({ params, request }) => {
        const slug = String(params.slug ?? "").replace(/[^a-z0-9-]/gi, "");
        if (!slug) return new Response("Not found", { status: 404 });
        const lang = new URL(request.url).searchParams.get("lang") === "en" ? "en" : "hu";

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: row } = await supabaseAdmin
          .from("custom_calculators")
          .select("image_hu_path, image_en_path")
          .eq("slug", slug)
          .maybeSingle();
        const path = lang === "en" ? row?.image_en_path : row?.image_hu_path;
        if (!path) return new Response("Not found", { status: 404 });

        const { data, error } = await supabaseAdmin.storage
          .from("termekfajlok")
          .download(path);
        if (error || !data) return new Response("Not found", { status: 404 });

        return new Response(await data.arrayBuffer(), {
          headers: {
            "Content-Type": path.endsWith(".png") ? "image/png" : "image/jpeg",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
