/** Client-safe types for the Stripe product display-name sync. */

export type StripeNameStatus = "ok" | "needs_fix" | "missing";

export type StripeNameRow = {
  /** Human-readable Stripe price lookup key (as used in the catalog). */
  priceId: string;
  /** Catalog product slug. */
  slug: string;
  /** Stripe internal product id, when the price was found. */
  stripeProductId: string | null;
  /** Current display name in Stripe. */
  currentName: string | null;
  /** Desired, prefixed display name. */
  desiredName: string;
  status: StripeNameStatus;
};

export type StripeNameReport = {
  environment: "sandbox" | "live";
  rows: StripeNameRow[];
  okCount: number;
  fixCount: number;
  missingCount: number;
  error?: string;
};

export type StripeNameSyncResult = {
  environment: "sandbox" | "live";
  updated: string[];
  skipped: number;
  errors: Array<{ priceId: string; message: string }>;
  report: StripeNameReport;
};
