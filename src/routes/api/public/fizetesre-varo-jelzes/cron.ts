/**
 * Daily notification about orders waiting too long for payment (06:00).
 */
import { createFileRoute } from "@tanstack/react-router";

import { cronAuthorized, cronJson } from "@/lib/cron-auth.server";

async function run(request: Request): Promise<Response> {
  if (!cronAuthorized(request)) return cronJson({ error: "Unauthorized" }, 401);
  try {
    const { runStaleUnpaidCheck } = await import("@/lib/maintenance.server");
    const result = await runStaleUnpaidCheck();
    return cronJson({ ok: true, ...result });
  } catch (error) {
    return cronJson(
      { ok: false, error: error instanceof Error ? error.message : String(error) },
      500,
    );
  }
}

export const Route = createFileRoute("/api/public/fizetesre-varo-jelzes/cron")({
  server: { handlers: { GET: ({ request }) => run(request), POST: ({ request }) => run(request) } },
});
