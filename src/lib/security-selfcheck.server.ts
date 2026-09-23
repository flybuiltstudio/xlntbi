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
