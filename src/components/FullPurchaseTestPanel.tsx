import { useServerFn } from "@tanstack/react-start";
import { useCallback, useEffect, useState } from "react";
import {
  CheckCircle2,
  CircleDashed,
  Loader2,
  PlayCircle,
  ShieldCheck,
  TicketX,
  XCircle,
} from "lucide-react";

import {
  adminCouponGuardState,
  adminRunPurchaseTest,
  adminSweepLiveCoupons,
} from "@/lib/admin.functions";
import { PaymentEnvironmentNotice } from "@/components/PaymentEnvironmentNotice";
import { getStripeEnvironmentSafe } from "@/lib/stripe";
import { getTier, products } from "@/lib/products";
import { ALLOWED_LIVE_PROMOTION_CODES, TEST_PROMOTION_CODES } from "@/lib/coupons";

type TestResult = Awaited<ReturnType<typeof adminRunPurchaseTest>>;
type GuardState = Awaited<ReturnType<typeof adminCouponGuardState>>;

const inputClass =
  "mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-ring/40";

function StepIcon({ status }: { status: TestResult["steps"][number]["status"] }) {
  if (status === "ok") return <CheckCircle2 className="h-4 w-4 text-primary" aria-hidden="true" />;
  if (status === "error") return <XCircle className="h-4 w-4 text-destructive" aria-hidden="true" />;
  if (status === "warn")
    return <CircleDashed className="h-4 w-4 text-amber-600" aria-hidden="true" />;
  return <CircleDashed className="h-4 w-4 text-muted-foreground" aria-hidden="true" />;
}

export function FullPurchaseTestPanel() {
  const runTest = useServerFn(adminRunPurchaseTest);
  const guardState = useServerFn(adminCouponGuardState);
  const sweepCoupons = useServerFn(adminSweepLiveCoupons);

  const orderable = products.filter((p) => p.status === "available");
  const [slug, setSlug] = useState(orderable[0]!.slug);
  const [email, setEmail] = useState("xllentac@gmail.com");
  const [paymentMethod, setPaymentMethod] = useState<"card" | "transfer">("card");
  const [environment, setEnvironment] = useState<"sandbox" | "live">(
    getStripeEnvironmentSafe() ?? "sandbox",
  );
  const [sendLicenseEmail, setSendLicenseEmail] = useState(true);
  const [cleanup, setCleanup] = useState(true);

  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<TestResult | null>(null);
  const [error, setError] = useState("");

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

  async function onRun() {
    setRunning(true);
    setError("");
    setResult(null);
    try {
      const product = orderable.find((p) => p.slug === slug)!;
      const res = await runTest({
        data: {
          productSlug: slug,
          tierId: getTier(product).id,
          email,
          paymentMethod,
          environment,
          sendLicenseEmail,
          cleanup,
        },
      });
      setResult(res);
    } catch {
      setError("A teszt futtatása nem sikerült. Nézd meg a szerver naplót.");
    } finally {
      setRunning(false);
    }
  }

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
    <div className="mt-10 space-y-8">
      <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
        <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
          <PlayCircle className="h-5 w-5 text-primary" />
          Teljes vásárlási teszt
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Egy kattintással végigfut egy teljes megrendelés a választott fizetési móddal, majd a
          rendszer ellenőrzi a Billingo számlát, a letöltő linket és a licensz kiküldést. A teszt
          megrendelés <strong className="text-foreground">TESZT-</strong> előtagot kap és nem
          kerül a statisztikába.
        </p>

        <div className="mt-5">
          <PaymentEnvironmentNotice />
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium text-foreground">
            Termék
            <select className={inputClass} value={slug} onChange={(e) => setSlug(e.target.value)}>
              {orderable.map((p) => (
                <option key={p.slug} value={p.slug}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-medium text-foreground">
            Teszt e-mail cím
            <input
              type="email"
              className={inputClass}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label className="block text-sm font-medium text-foreground">
            Fizetési mód
            <select
              className={inputClass}
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as "card" | "transfer")}
            >
              <option value="card">Bankkártya (Stripe teljesítési lánc)</option>
              <option value="transfer">Banki átutalás (admin jóváhagyás)</option>
            </select>
          </label>
          <label className="block text-sm font-medium text-foreground">
            Stripe környezet
            <select
              className={inputClass}
              value={environment}
              onChange={(e) => setEnvironment(e.target.value as "sandbox" | "live")}
              disabled={paymentMethod === "transfer"}
            >
              <option value="sandbox">Teszt (sandbox)</option>
              <option value="live">Éles (live)</option>
            </select>
          </label>
          <div className="space-y-2 pt-6 text-sm text-foreground">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={sendLicenseEmail}
                onChange={(e) => setSendLicenseEmail(e.target.checked)}
              />
              Licensz e-mail kiküldése is (teszt kóddal)
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={cleanup}
                onChange={(e) => setCleanup(e.target.checked)}
              />
              Teszt után sztornó + rendelés törlése
            </label>
          </div>
        </div>

        <button
          type="button"
          onClick={() => void onRun()}
          disabled={running}
          className="mt-6 inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
        >
          {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlayCircle className="h-4 w-4" />}
          {running ? "Teszt fut…" : "Teljes vásárlási teszt indítása"}
        </button>

        {error ? (
          <p className="mt-4 rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </p>
        ) : null}

        {result ? (
          <div className="mt-6 rounded-lg border border-border">
            <div
              className={`flex items-center justify-between gap-2 rounded-t-lg px-4 py-3 text-sm font-semibold ${
                result.ok
                  ? "bg-secondary text-foreground"
                  : "bg-destructive/10 text-destructive"
              }`}
            >
              <span>
                {result.ok ? "A teljes lánc rendben lefutott." : "A lánc hibát jelzett."}
              </span>
              <span className="font-mono text-xs">{result.orderNumber ?? ""}</span>
            </div>
            <ul className="divide-y divide-border">
              {result.steps.map((step) => (
                <li key={step.key} className="flex gap-3 px-4 py-3 text-sm">
                  <StepIcon status={step.status} />
                  <div>
                    <p className="font-medium text-foreground">{step.label}</p>
                    <p className="text-muted-foreground">{step.detail}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>

      <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
        <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
          <ShieldCheck className="h-5 w-5 text-primary" />
          Kuponvédelem éles környezetben
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Éles fizetésnél csak a kifejezetten engedélyezett kuponkódok maradhatnak aktívak; minden
          más kód (köztük a teszt kódok, pl. {TEST_PROMOTION_CODES.join(", ")}) automatikusan
          kikapcsolódik. Jelenleg engedélyezett éles kódok:{" "}
          <strong className="text-foreground">
            {ALLOWED_LIVE_PROMOTION_CODES.length ? ALLOWED_LIVE_PROMOTION_CODES.join(", ") : "nincs"}
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

        {sweepMessage ? (
          <p className="mt-3 text-sm text-muted-foreground">{sweepMessage}</p>
        ) : null}
      </section>
    </div>
  );
}
