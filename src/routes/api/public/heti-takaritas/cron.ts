/**
 * Weekly maintenance cleanup endpoint (pg_cron, Sunday 02:00 Europe/Budapest).
 * Public prefix, so the shared cron secret is verified inside the handler.
 */
import { createFileRoute } from "@tanstack/react-router";

import { cronAuthorized, cronJson } from "@/lib/cron-auth.server";

async function run(request: Request): Promise<Response> {
  if (!cronAuthorized(request)) return cronJson({ error: "Unauthorized" }, 401);
  try {
    const { runWeeklyCleanup } = await import("@/lib/maintenance.server");
    const result = await runWeeklyCleanup();
    return cronJson({ ok: true, ...result });
  } catch (error) {
    return cronJson(
      { ok: false, error: error instanceof Error ? error.message : String(error) },
      500,
    );
  }
}

export const Route = createFileRoute("/api/public/heti-takaritas/cron")({
  server: { handlers: { GET: ({ request }) => run(request), POST: ({ request }) => run(request) } },
});
