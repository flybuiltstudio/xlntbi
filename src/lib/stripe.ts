import { loadStripe, type Stripe } from "@stripe/stripe-js";

type StripeEnv = "sandbox" | "live";

const clientToken = import.meta.env.VITE_PAYMENTS_CLIENT_TOKEN as string | undefined;

function paymentsEnvironment(): StripeEnv {
  if (clientToken?.startsWith("pk_test_")) return "sandbox";
  if (clientToken?.startsWith("pk_live_")) return "live";
  throw new Error(
    "A bankkártyás fizetés ehhez a buildhez még nincs beállítva. Fejezd be a Stripe élesítést a Lovable projektben.",
  );
}

/** True when card payment can be offered at all (token present and recognized). */
export function isCardPaymentAvailable(): boolean {
  return Boolean(
    clientToken && (clientToken.startsWith("pk_test_") || clientToken.startsWith("pk_live_")),
  );
}

let stripePromise: Promise<Stripe | null> | null = null;

export function getStripe(): Promise<Stripe | null> {
  if (!stripePromise) {
    paymentsEnvironment();
    stripePromise = loadStripe(clientToken as string);
  }
  return stripePromise;
}

export function getStripeEnvironment(): StripeEnv {
  return paymentsEnvironment();
}
