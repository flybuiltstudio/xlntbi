import { useServerFn } from "@tanstack/react-start";
import { useCallback, useEffect, useState } from "react";
import { Loader2, ShieldCheck, TicketX } from "lucide-react";

import { adminCouponGuardState, adminSweepLiveCoupons } from "@/lib/admin.functions";
import { ALLOWED_LIVE_PROMOTION_CODES, TEST_PROMOTION_CODES } from "@/lib/coupons";

type GuardState = Awaited<ReturnType<typeof adminCouponGuardState>>;

/**
 * Admin panel: live-environment coupon guard. Lives on the Coupons page —
 * it manages coupon codes, not payment testing.
 */
export function LiveCouponGuardPanel() {
  const guardState = useServerFn(adminCouponGuardState);
  const sweepCoupons = useServerFn(adminSweepLiveCoupons);

  const [guard, setGuard] = useState<GuardState | null>(null);
  const [sweeping, setSweeping] = useState(false);
  const [sweepMessage, setSweepMessage] = useState("");

  const loadGuard = useCallback(() => {
    guardState()
      .then(setGuard)
      .catch(() => setGuard(null));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadGuard();
  }, [loadGuard]);

  async function onSweep() {
    setSweeping(true);
    setSweepMessage("");
    try {
      const res = await sweepCoupons();
      setSweepMessage(
        res.ok
          ? `Ellenőrizve ${res.checked} kuponkód. Kikapcsolva: ${
              res.deactivated.length ? res.deactivated.join(", ") : "nincs"
            }. Aktívan hagyva: ${res.kept.length ? res.kept.join(", ") : "nincs"}.`
          : `Hiba: ${res.error}`,
      );
      loadGuard();
    } catch {
      setSweepMessage("A kuponellenőrzés nem sikerült.");
    } finally {
      setSweeping(false);
    }
  }

  return (
    <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
      <h2 className="flex items-center gap-2 text-xl font-bold text-foreground">
        <ShieldCheck className="h-5 w-5 text-primary" aria-hidden="true" />
        Kuponvédelem éles környezetben
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Éles fizetésnél csak a kifejezetten engedélyezett kuponkódok maradhatnak aktívak; minden
        más kód (köztük a teszt kódok, pl. {TEST_PROMOTION_CODES.join(", ")}) automatikusan
        kikapcsolódik. Jelenleg engedélyezett éles kódok:{" "}
        <strong className="text-foreground">
          {ALLOWED_LIVE_PROMOTION_CODES.length
            ? ALLOWED_LIVE_PROMOTION_CODES.map((g) => {
                const expired = Date.parse(g.expiresAt) <= Date.now();
                return `${g.code} (${expired ? "lejárt" : "érvényes"}: ${new Date(g.expiresAt).toLocaleString("hu-HU")}-ig)`;
              }).join(", ")
            : "nincs"}
        </strong>
        .
      </p>

      {guard ? (
        <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="inline font-medium text-foreground">Utolsó ellenőrzés: </dt>
            <dd className="inline text-muted-foreground">
              {guard.lastRunAt
                ? new Date(guard.lastRunAt).toLocaleString("hu-HU")
                : "még nem futott"}
            </dd>
          </div>
          <div>
            <dt className="inline font-medium text-foreground">Legutóbb kikapcsolva: </dt>
            <dd className="inline text-muted-foreground">
              {guard.deactivated.length ? guard.deactivated.join(", ") : "nincs"}
            </dd>
          </div>
        </dl>
      ) : null}

      <button
        type="button"
        onClick={() => void onSweep()}
        disabled={sweeping}
        className="mt-5 inline-flex items-center gap-2 rounded-md border border-input px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent disabled:opacity-60"
      >
        {sweeping ? <Loader2 className="h-4 w-4 animate-spin" /> : <TicketX className="h-4 w-4" />}
        Éles kuponkódok ellenőrzése most
      </button>

      {sweepMessage ? <p className="mt-3 text-sm text-muted-foreground">{sweepMessage}</p> : null}
    </section>
  );
}
