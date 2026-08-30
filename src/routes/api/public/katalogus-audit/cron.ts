import { createFileRoute } from "@tanstack/react-router";

/**
 * Scheduled catalog audit endpoint (weekly, called by pg_cron).
 *
 * Public prefix, so the caller is verified with a shared secret
 * (`x-cron-secret` header or `?secret=`). Read-only audit + owner notification;
 * nothing is modified in Stripe or storage.
 */
function authorized(request: Request): boolean {
  const expected = process.env["CATALOG_AUDIT_CRON_SECRET"];
  if (!expected) {
    console.error("CATALOG_AUDIT_CRON_SECRET nincs beállítva.");
    return false;
  }
  const url = new URL(request.url);
  const provided = request.headers.get("x-cron-secret") ?? url.searchParams.get("secret") ?? "";
  if (provided.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= provided.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return diff === 0;
}

async function handle(request: Request): Promise<Response> {
  if (!authorized(request)) {
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
      GET: ({ request }) => handle(request),
      POST: ({ request }) => handle(request),
    },
  },
});
