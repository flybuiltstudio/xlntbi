import { createFileRoute } from "@tanstack/react-router";

/**
 * Scheduled catalog audit endpoint (weekly, called by pg_cron).
 *
 * Public prefix, so the caller is verified with a one-time nonce: the cron job
 * inserts a random nonce into `cron_call_nonces` (not reachable by anon or
 * authenticated users) and sends it in `x-cron-nonce`. The nonce is consumed
 * here and must be fresh, so no reusable credential exists in the source.
 */
const NONCE_MAX_AGE_MS = 10 * 60 * 1000;

async function authorized(request: Request): Promise<boolean> {
  const nonce = request.headers.get("x-cron-nonce") ?? "";
  if (!/^[a-f0-9]{64}$/.test(nonce)) return false;
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("cron_call_nonces")
    .delete()
    .eq("nonce", nonce)
    .eq("job", "catalog-audit")
    .select("created_at")
    .maybeSingle();
  if (error || !data) return false;
  return Date.now() - new Date(data.created_at).getTime() <= NONCE_MAX_AGE_MS;
}

async function handle(request: Request): Promise<Response> {
  if (!(await authorized(request))) {
    return new Response("Unauthorized", { status: 401 });
  }
  const url = new URL(request.url);
  const environment = url.searchParams.get("environment") === "sandbox" ? "sandbox" : "live";

  const { runScheduledCatalogAudit } = await import("@/lib/catalog-audit-cron.server");
  const state = await runScheduledCatalogAudit(environment);

  return new Response(
    JSON.stringify({
      ok: true,
      environment: state.environment,
      errorCount: state.errorCount,
      warnCount: state.warnCount,
      notified: state.notified,
      error: state.error,
    }),
    { status: 200, headers: { "content-type": "application/json", "cache-control": "no-store" } },
  );
}

export const Route = createFileRoute("/api/public/katalogus-audit/cron")({
  server: {
    handlers: {
      POST: ({ request }) => handle(request),
    },
  },
});
