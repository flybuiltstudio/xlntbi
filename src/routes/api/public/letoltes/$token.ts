import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/letoltes/$token")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const { resolveDownload } = await import("@/lib/download.server");
        const result = await resolveDownload(params.token);

        if (result.ok) {
          return new Response(null, {
            status: 302,
            headers: { Location: result.url, "Cache-Control": "no-store" },
          });
        }

        return new Response(null, {
          status: 302,
          headers: {
            Location: `/letoltes-hiba?ok=${result.reason}`,
            "Cache-Control": "no-store",
          },
        });
      },
    },
  },
});
