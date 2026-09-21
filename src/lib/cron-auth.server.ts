/**
 * Shared caller verification for the scheduled maintenance endpoints under
 * /api/public/*. The prefix bypasses site auth, so every handler must verify
 * the shared secret (`x-cron-secret` header or `?secret=`) itself.
 */
export function cronAuthorized(request: Request): boolean {
  const expected = process.env["MAINTENANCE_CRON_SECRET"];
  if (!expected) {
    console.error("MAINTENANCE_CRON_SECRET nincs beállítva.");
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

/** Uniform JSON response for the cron endpoints. */
export function cronJson(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
}
