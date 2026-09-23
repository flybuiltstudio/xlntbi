/**
 * Combined daily business alerts: stale unpaid orders + paid orders without an
 * invoice, in one run and one email (07:00 Budapest / 05:00 UTC).
 */
import { createFileRoute } from "@tanstack/react-router";

import { cronAuthorized, cronJson } from "@/lib/cron-auth.server";

async function run(request: Request): Promise<Response> {
  if (!cronAuthorized(request)) return cronJson({ error: "Unauthorized" }, 401);
  try {
    const { runDailyOrderAlerts } = await import("@/lib/maintenance.server");
    const result = await runDailyOrderAlerts();
    return cronJson({ ok: true, ...result });
  } catch (error) {
    return cronJson(
      { ok: false, error: error instanceof Error ? error.message : String(error) },
      500,
    );
  }
}

export const Route = createFileRoute("/api/public/napi-jelzesek/cron")({
  server: { handlers: { GET: ({ request }) => run(request), POST: ({ request }) => run(request) } },
});
