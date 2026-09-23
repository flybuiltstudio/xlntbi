/**
 * Daily security self-check (04:00 Budapest / 02:00 UTC).
 */
import { createFileRoute } from "@tanstack/react-router";

import { cronAuthorized, cronJson } from "@/lib/cron-auth.server";

async function run(request: Request): Promise<Response> {
  if (!cronAuthorized(request)) return cronJson({ error: "Unauthorized" }, 401);
  try {
    const { runSecuritySelfCheck } = await import("@/lib/security-selfcheck.server");
    const result = await runSecuritySelfCheck();
    return cronJson({ ok: true, ...result });
  } catch (error) {
    return cronJson(
      { ok: false, error: error instanceof Error ? error.message : String(error) },
      500,
    );
  }
}

export const Route = createFileRoute("/api/public/biztonsagi-ellenorzes/cron")({
  server: { handlers: { GET: ({ request }) => run(request), POST: ({ request }) => run(request) } },
});
