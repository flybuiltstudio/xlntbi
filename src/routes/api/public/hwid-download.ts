import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/hwid-download")({
  server: {
    handlers: {
      GET: async () => {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data, error } = await supabaseAdmin.storage
          .from("termekfajlok")
          .createSignedUrl("hwid/HWIDGenerator.exe", 300, {
            download: "HWIDGenerator.exe",
          });

        if (error || !data?.signedUrl) {
          console.error("HWID signed URL failed:", error?.message);
          return new Response("Download unavailable", { status: 500 });
        }

        return new Response(null, {
          status: 302,
          headers: { Location: data.signedUrl, "Cache-Control": "no-store" },
        });
      },
    },
  },
});
