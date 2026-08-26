import { AlertTriangle, ShieldCheck } from "lucide-react";

import { isCardPaymentAvailable, getStripeEnvironmentSafe, webhookEndpoint } from "@/lib/stripe";

/**
 * Shows unambiguously whether the checkout runs in TEST (preview/sandbox) or
 * LIVE Stripe mode, and which webhook endpoint receives the payment events.
 */
export function PaymentEnvironmentNotice({ className = "" }: { className?: string }) {
  if (!isCardPaymentAvailable()) {
    return (
      <div
        className={`rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive ${className}`}
      >
        <p className="font-semibold">Bankkártyás fizetés nem elérhető</p>
        <p className="mt-1">
          Ebben a környezetben nincs Stripe kulcs beállítva, ezért csak banki átutalásos
          megrendelés adható le.
        </p>
      </div>
    );
  }

  const env = getStripeEnvironmentSafe();
  const test = env === "sandbox";

  return (
    <div
      className={
        test
          ? `rounded-lg border border-amber-400 bg-amber-50 px-4 py-3 text-sm text-amber-900 ${className}`
          : `rounded-lg border border-primary/30 bg-secondary px-4 py-3 text-sm text-foreground ${className}`
      }
    >
      <p className="flex items-center gap-2 font-semibold">
        {test ? (
          <>
            <AlertTriangle className="h-4 w-4" aria-hidden="true" />
            TESZT (előnézet) fizetés — nem valódi pénzmozgás
          </>
        ) : (
          <>
            <ShieldCheck className="h-4 w-4 text-primary" aria-hidden="true" />
            ÉLES fizetés — valódi bankkártyás terhelés
          </>
        )}
      </p>
      <dl className="mt-2 grid gap-1 text-xs sm:grid-cols-2">
        <div>
          <dt className="inline font-medium">Stripe környezet: </dt>
          <dd className="inline">{test ? "sandbox (teszt)" : "live (éles)"}</dd>
        </div>
        <div>
          <dt className="inline font-medium">Webhook végpont: </dt>
          <dd className="inline break-all font-mono">{webhookEndpoint()}</dd>
        </div>
      </dl>
    </div>
  );
}
