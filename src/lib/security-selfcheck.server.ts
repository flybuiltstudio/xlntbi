/**
 * Daily security self-check (pg_cron → /api/public/biztonsagi-ellenorzes/cron).
 *
 * Calls the read-only public.security_selfcheck() SQL function, stores every
 * finding in public.security_alerts_sent, and emails only the findings that were
 * never reported before. A finding that disappears is marked resolved, so a
 * returning problem is reported again.
 *
 * This is NOT the platform deep code scan (that cannot be triggered from the
 * app); it covers database and configuration level issues.
 */

import { sendEmails } from "./notify.server";

const OWNER_EMAIL = "xllentac@gmail.com";

export type SecurityFinding = {
  finding_key: string;
  finding_type: string;
  detail: string;
};

function huTime(date = new Date()): string {
  return new Intl.DateTimeFormat("hu-HU", {
    timeZone: "Europe/Budapest",
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

function dayKey(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

export type SelfCheckResult = {
  found: number;
  fresh: number;
  resolved: number;
  emailed: boolean;
  findings: SecurityFinding[];
};

export async function runSecuritySelfCheck(): Promise<SelfCheckResult> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const { data, error } = await (supabaseAdmin as any).rpc("security_selfcheck");
  if (error) throw new Error(`security_selfcheck: ${error.message}`);

  const findings = ((data ?? []) as SecurityFinding[]).filter(
    (row) => row && typeof row.finding_key === "string",
  );
  const keys = findings.map((row) => row.finding_key);

  // Already known, still unresolved keys stay quiet.
  const { data: known } = await (supabaseAdmin as any)
    .from("security_alerts_sent")
    .select("finding_key, resolved_at");
  const knownRows = (known ?? []) as Array<{ finding_key: string; resolved_at: string | null }>;
  const silent = new Set(
    knownRows.filter((row) => row.resolved_at === null).map((row) => row.finding_key),
  );

  // Findings the admin already decided about never alert again.
  const decided = await listDecidedKeys();
  for (const key of decided) silent.add(key);

  const fresh = findings.filter((row) => !silent.has(row.finding_key));

  const now = new Date().toISOString();

  if (findings.length > 0) {
    const { error: upsertError } = await (supabaseAdmin as any)
      .from("security_alerts_sent")
      .upsert(
        findings.map((row) => ({
          finding_key: row.finding_key,
          finding_type: row.finding_type,
          detail: row.detail,
          last_seen_at: now,
          resolved_at: null,
        })),
        { onConflict: "finding_key" },
      );
    if (upsertError) console.error("security_alerts_sent upsert:", upsertError.message);
  }

  // Findings that are gone become resolved, so a later return is reported again.
  const goneKeys = knownRows
    .filter((row) => row.resolved_at === null && !keys.includes(row.finding_key))
    .map((row) => row.finding_key);
  if (goneKeys.length > 0) {
    const { error: resolveError } = await (supabaseAdmin as any)
      .from("security_alerts_sent")
      .update({ resolved_at: now })
      .in("finding_key", goneKeys);
    if (resolveError) console.error("security_alerts_sent resolve:", resolveError.message);
  }

  if (fresh.length === 0) {
    return { found: findings.length, fresh: 0, resolved: goneKeys.length, emailed: false, findings };
  }

  await sendEmails([
    {
      template: "belso-biztonsagi-jelzes",
      to: OWNER_EMAIL,
      key: `security-selfcheck-${dayKey()}`,
      data: {
        ranAt: huTime(),
        summary: `${fresh.length} új biztonsági találat a napi önellenőrzésben.`,
        rows: [
          ["Új találat", String(fresh.length)],
          ["Összes nyitott találat", String(findings.length)],
          ["Megszűnt találat", String(goneKeys.length)],
        ],
        issues: fresh.map((row) => row.detail).slice(0, 40),
      },
    },
  ]);

  return {
    found: findings.length,
    fresh: fresh.length,
    resolved: goneKeys.length,
    emailed: true,
    findings,
  };
}

/* ------------------------------------------------------------------ *
 * Admin surface: open findings, remembered decisions, one-click fix
 * ------------------------------------------------------------------ */

export type DecisionValue = "keep" | "fix";

export type SecurityDecision = {
  finding_key: string;
  finding_type: string;
  decision: DecisionValue;
  detail: string | null;
  decided_at: string;
};

/** Finding types that need an explicit admin decision before being fixed. */
export const DECISION_TYPES = ["anon_policy", "anon_write", "cron_no_secret"] as const;

async function listDecidedKeys(): Promise<Set<string>> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await (supabaseAdmin as any)
    .from("security_decisions")
    .select("finding_key");
  if (error) {
    console.error("security_decisions read:", error.message);
    return new Set();
  }
  return new Set(((data ?? []) as Array<{ finding_key: string }>).map((row) => row.finding_key));
}

export async function listDecisions(): Promise<SecurityDecision[]> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await (supabaseAdmin as any)
    .from("security_decisions")
    .select("finding_key, finding_type, decision, detail, decided_at")
    .order("decided_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as SecurityDecision[];
}

/** Live scan result for the admin page: only findings that still need action. */
export async function listOpenFindings(): Promise<{
  findings: SecurityFinding[];
  decisions: SecurityDecision[];
  ranAt: string;
}> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await (supabaseAdmin as any).rpc("security_selfcheck");
  if (error) throw new Error(`security_selfcheck: ${error.message}`);

  const decided = await listDecidedKeys();
  const findings = ((data ?? []) as SecurityFinding[]).filter(
    (row) => row && typeof row.finding_key === "string" && !decided.has(row.finding_key),
  );
  return { findings, decisions: await listDecisions(), ranAt: huTime() };
}

export async function clearDecision(findingKey: string): Promise<void> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { error } = await (supabaseAdmin as any)
    .from("security_decisions")
    .delete()
    .eq("finding_key", findingKey);
  if (error) throw new Error(error.message);
}

export type AutofixResult = {
  fixed: string[];
  skipped: string[];
  errors: string[];
  remaining: number;
};

/**
 * Runs the database-side autofix plus the storage-bucket fix, remembers every
 * decision the admin made, then re-runs the self-check so fixed findings are
 * marked resolved.
 */
export async function runSecurityAutofix(
  decisions: Record<string, DecisionValue>,
  decidedBy?: string | null,
): Promise<AutofixResult> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  // Snapshot before fixing: needed for bucket fixes and for storing decisions.
  const before = await listOpenFindings();

  const { data, error } = await (supabaseAdmin as any).rpc("security_autofix", {
    _decisions: decisions,
    _cron_token: process.env["MAINTENANCE_CRON_TOKEN"] ?? null,
  });
  if (error) throw new Error(`security_autofix: ${error.message}`);

  const payload = (data ?? {}) as {
    fixed?: Array<{ action?: string }>;
    skipped?: Array<{ reason?: string; finding_key?: string }>;
    errors?: Array<{ error?: string; finding_key?: string }>;
  };
  const fixed = (payload.fixed ?? []).map((row) => row.action ?? "").filter(Boolean);
  const errors = (payload.errors ?? [])
    .map((row) => `${row.finding_key ?? ""}: ${row.error ?? ""}`)
    .filter((row) => row.trim().length > 2);
  const skipped = (payload.skipped ?? [])
    .map((row) => `${row.finding_key ?? ""} — ${row.reason ?? ""}`)
    .filter(Boolean);

  // Public buckets are handled through the Storage API, not SQL.
  for (const finding of before.findings) {
    if (finding.finding_type !== "public_bucket") continue;
    const bucket = finding.finding_key.split(":")[1] ?? "";
    if (!bucket) continue;
    const { error: bucketError } = await supabaseAdmin.storage.updateBucket(bucket, {
      public: false,
    });
    if (bucketError) errors.push(`${finding.finding_key}: ${bucketError.message}`);
    else fixed.push(`Tároló priváttá téve: ${bucket}`);
  }

  // Remember every decision the admin made, so we never ask again.
  const rows = before.findings
    .filter((finding) => decisions[finding.finding_key] !== undefined)
    .map((finding) => ({
      finding_key: finding.finding_key,
      finding_type: finding.finding_type,
      decision: decisions[finding.finding_key] as DecisionValue,
      detail: finding.detail,
      decided_by: decidedBy ?? null,
      decided_at: new Date().toISOString(),
    }));
  if (rows.length > 0) {
    const { error: saveError } = await (supabaseAdmin as any)
      .from("security_decisions")
      .upsert(rows, { onConflict: "finding_key" });
    if (saveError) errors.push(`döntés mentése: ${saveError.message}`);
  }

  // Re-run so fixed findings get resolved_at and the list stays honest.
  await runSecuritySelfCheck();
  const after = await listOpenFindings();

  return { fixed, skipped, errors, remaining: after.findings.length };
}

