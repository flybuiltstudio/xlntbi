/**
 * Monthly statistics close endpoint (pg_cron, 1st of the month 02:30).
 * Freezes the previous month's per-product totals.
 */
import { createFileRoute } from "@tanstack/react-router";

import { cronAuthorized, cronJson } from "@/lib/cron-auth.server";

async function run(request: Request): Promise<Response> {
  if (!cronAuthorized(request)) return cronJson({ error: "Unauthorized" }, 401);
  try {
    const { runMonthlyStatsClose } = await import("@/lib/maintenance.server");
    const result = await runMonthlyStatsClose();
    return cronJson({ ok: true, ...result });
  } catch (error) {
    return cronJson(
      { ok: false, error: error instanceof Error ? error.message : String(error) },
      500,
    );
  }
}

export const Route = createFileRoute("/api/public/havi-statisztika-zaras/cron")({
  server: { handlers: { GET: ({ request }) => run(request), POST: ({ request }) => run(request) } },
});
