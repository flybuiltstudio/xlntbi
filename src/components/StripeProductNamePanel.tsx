import { useServerFn } from "@tanstack/react-start";
import { useCallback, useEffect, useState } from "react";

import { useAdminSession } from "@/components/admin-panels";
import {
  adminStripeNameStatus,
  adminStripeNameSync,
} from "@/lib/stripe-product-names.functions";
import type {
  StripeNameReport,
  StripeNameStatus,
  StripeNameSyncResult,
} from "@/lib/stripe-product-names";
import { getStripeEnvironment } from "@/lib/stripe";

type Env = "sandbox" | "live";

const STATUS_LABEL: Record<StripeNameStatus, string> = {
  ok: "Rendben",
  needs_fix: "Javítandó",
  missing: "Nincs a Stripe-ban",
};

/**
 * Admin panel: compares the Stripe display names with the branded catalog
 * names ("XLNT ..."), and rewrites the mismatching ones on request.
 */
export function StripeProductNamePanel() {
  const { role } = useAdminSession();
  const isAdmin = role === "admin";

  const [env, setEnv] = useState<Env>(() => {
    try {
      return getStripeEnvironment();
    } catch {
      return "sandbox";
    }
  });
  const [report, setReport] = useState<StripeNameReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState<StripeNameSyncResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const statusFn = useServerFn(adminStripeNameStatus);
  const syncFn = useServerFn(adminStripeNameSync);

  const refresh = useCallback(
    async (environment: Env) => {
      if (!isAdmin) return;
      setLoading(true);
      setError(null);
      try {
        const res = await statusFn({ data: { environment } });
        setReport(res.report);
      } catch {
        setReport(null);
        setError("A Stripe terméknevek betöltése sikertelen.");
      } finally {
        setLoading(false);
      }
    },
    [statusFn, isAdmin],
  );

  useEffect(() => {
    void refresh(env);
  }, [env, refresh]);

  async function runSync() {
    if (!isAdmin) return;
    setSyncing(true);
    setError(null);
    try {
      const res = await syncFn({ data: { environment: env } });
      setResult(res.result);
      setReport(res.result.report);
    } catch {
      setError("A terméknevek javítása sikertelen.");
    } finally {
      setSyncing(false);
    }
  }

  if (!isAdmin) {
    return (
      <p className="mt-6 text-sm text-muted-foreground">
        A Stripe terméknevek kezelése csak admin szerepkörrel érhető el.
      </p>
    );
  }

  const rows = report?.rows ?? [];

  return (
    <section className="mt-10">
      <h2 className="text-xl font-semibold text-foreground">Stripe terméknevek</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        A fizetőűrlap tétel-sorában és a Stripe visszaigazolásokon a Stripe-ban tárolt
        terméknév látszik. Itt ellenőrizhető, hogy mindegyik „XLNT ” előtaggal kezdődik-e,
        és egy kattintással javítható. A termék- és árazonosítók nem változnak.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <label className="text-sm text-muted-foreground">
          Környezet{" "}
          <select
            value={env}
            onChange={(e) => setEnv(e.target.value as Env)}
            className="ml-1 rounded-md border border-input bg-background px-2 py-1 text-sm text-foreground"
          >
            <option value="sandbox">Teszt (sandbox)</option>
            <option value="live">Éles (live)</option>
          </select>
        </label>
        <button
          type="button"
          onClick={() => void refresh(env)}
          disabled={loading || syncing}
          className="rounded-md border border-input px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-accent disabled:opacity-50"
        >
          {loading ? "Ellenőrzés…" : "Checkout-ellenőrzés"}
        </button>
        <button
          type="button"
          onClick={() => void runSync()}
          disabled={loading || syncing || (report?.fixCount ?? 0) === 0}
          className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90 disabled:opacity-50"
        >
          {syncing ? "Javítás folyamatban…" : "Nevek javítása"}
        </button>
      </div>

      {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
      {report?.error ? (
        <p className="mt-3 text-sm text-destructive">Stripe hiba: {report.error}</p>
      ) : null}

      {report && !report.error ? (
        <p className="mt-3 text-sm text-muted-foreground">
          Rendben: <strong className="text-foreground">{report.okCount}</strong> · Javítandó:{" "}
          <strong className="text-foreground">{report.fixCount}</strong> · Nincs a Stripe-ban:{" "}
          <strong className="text-foreground">{report.missingCount}</strong>
        </p>
      ) : null}

      {result ? (
        <div className="mt-3 rounded-md border border-border bg-muted/40 p-3 text-sm">
          <p className="font-medium text-foreground">
            Javítva: {result.updated.length} · Változatlan: {result.skipped} · Hiba:{" "}
            {result.errors.length}
          </p>
          {result.updated.length ? (
            <ul className="mt-2 list-disc pl-5 text-muted-foreground">
              {result.updated.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          ) : null}
          {result.errors.length ? (
            <ul className="mt-2 list-disc pl-5 text-destructive">
              {result.errors.map((e) => (
                <li key={e.priceId}>
                  {e.priceId}: {e.message}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted-foreground">
              <th className="py-2 pr-3 font-medium">Árazonosító</th>
              <th className="py-2 pr-3 font-medium">Stripe név</th>
              <th className="py-2 pr-3 font-medium">Kívánt név</th>
              <th className="py-2 font-medium">Állapot</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-4 text-muted-foreground">
                  {loading ? "Betöltés…" : "Nincs megjeleníthető adat."}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.priceId} className="border-b border-border/60 align-top">
                  <td className="py-2 pr-3 font-mono text-xs text-muted-foreground">
                    {row.priceId}
                  </td>
                  <td className="py-2 pr-3 text-foreground">{row.currentName ?? "—"}</td>
                  <td className="py-2 pr-3 text-foreground">{row.desiredName}</td>
                  <td
                    className={
                      row.status === "ok"
                        ? "py-2 text-foreground"
                        : "py-2 font-medium text-destructive"
                    }
                  >
                    {STATUS_LABEL[row.status]}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
