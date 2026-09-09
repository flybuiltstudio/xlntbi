import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/hwid-download")({
  server: {
    handlers: {
      GET: async () => {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data, error } = await supabaseAdmin.storage
          .from("termekfajlok")
          .download("hwid/HWIDGenerator.exe");

        if (error || !data) {
          console.error("HWID download failed:", error?.message);
          return new Response("Download unavailable", { status: 500 });
        }

        const arrayBuffer = await data.arrayBuffer();

        return new Response(arrayBuffer, {
          status: 200,
          headers: {
            "Content-Type": "application/vnd.microsoft.portable-executable",
            "Content-Disposition": 'attachment; filename="HWIDGenerator.exe"',
            "Content-Length": String(arrayBuffer.byteLength),
            "Cache-Control": "no-store",
          },
        });
      },
    },
  },
});
