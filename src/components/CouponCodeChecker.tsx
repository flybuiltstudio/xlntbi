import { AlertCircle, CheckCircle2, Loader2, TicketPercent } from "lucide-react";
import { useState } from "react";

import { getStripeEnvironment } from "@/lib/stripe";
import { validatePromotionCode } from "@/utils/payments.functions";

type CheckState =
  | { status: "idle" }
  | { status: "checking" }
  | { status: "result"; ok: boolean; message: string; detail?: string };

/**
 * Lets the buyer check a coupon code before paying, with detailed Hungarian
 * feedback (invalid / expired / used up / minimum amount), instead of the
 * terse generic error shown inside the Stripe checkout iframe.
 */
export function CouponCodeChecker({ amount, priceId }: { amount: number; priceId?: string }) {
  const [code, setCode] = useState("");
  const [state, setState] = useState<CheckState>({ status: "idle" });

  async function onCheck(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState({ status: "checking" });
    try {
      const result = await validatePromotionCode({
        data: {
          code,
          environment: getStripeEnvironment(),
          amount,
          ...(priceId ? { priceId } : {}),
        },
      });
      setState({
        status: "result",
        ok: result.ok,
        message: result.message,
        ...(result.detail ? { detail: result.detail } : {}),
      });
    } catch {
      setState({
        status: "result",
        ok: false,
        message: "A kuponkódot most nem tudtam ellenőrizni.",
        detail: "Próbáld újra kicsit később, vagy add meg a kódot közvetlenül a fizetési űrlapon.",
      });
    }
  }

  return (
    <div className="mt-6 rounded-lg border border-border bg-card p-4">
      <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <TicketPercent className="h-4 w-4 text-primary" aria-hidden="true" />
        Van kuponkódod?
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        Itt előre ellenőrizheted, hogy érvényes-e. Beváltani a lenti fizetési űrlap „Kuponkód”
        mezőjében tudod.
      </p>
      <form onSubmit={onCheck} className="mt-3 flex flex-wrap gap-2">
        <input
          value={code}
          onChange={(e) => {
            setCode(e.target.value.toUpperCase());
            setState({ status: "idle" });
          }}
          placeholder="KUPONKÓD"
          maxLength={40}
          aria-label="Kuponkód"
          className="min-w-[12rem] flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm uppercase tracking-wide text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring/40"
        />
        <button
          type="submit"
          disabled={state.status === "checking" || code.trim().length === 0}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-brand-dark disabled:opacity-60"
        >
          {state.status === "checking" ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Ellenőrzés…
            </>
          ) : (
            "Kuponkód ellenőrzése"
          )}
        </button>
      </form>

      {state.status === "result" ? (
        <div
          role="status"
          aria-live="polite"
          className={
            state.ok
              ? "mt-3 flex gap-2 rounded-md border border-primary/30 bg-secondary px-3 py-2.5 text-sm text-foreground"
              : "mt-3 flex gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
          }
        >
          {state.ok ? (
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
          ) : (
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          )}
          <span>
            <strong className="font-semibold">{state.message}</strong>
            {state.detail ? <span className="mt-0.5 block text-xs">{state.detail}</span> : null}
          </span>
        </div>
      ) : null}
    </div>
  );
}
