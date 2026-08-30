/**
 * Shared types for the catalog auto-fix (client-safe, no server imports).
 *
 * The fixer only repairs issues that have a single safe, deterministic
 * remedy. Anything that would need a business decision (missing Stripe price,
 * missing file in storage, price amount mismatch) is reported as manual work.
 */

export type CatalogFixKind =
  | "stripe_name"
  | "stripe_reactivate"
  | "download_token_path";

export type CatalogFixAction = {
  kind: CatalogFixKind;
  /** Product slug the action belongs to. */
  slug: string;
  target: string;
  ok: boolean;
  detail: string;
};

export type CatalogFixResult = {
  environment: "sandbox" | "live";
  ranAt: string;
  actions: CatalogFixAction[];
  /** Issues that cannot be fixed automatically — need a human. */
  manual: string[];
  summary: { fixed: number; failed: number; manual: number };
};

export const FIX_KIND_LABEL: Record<CatalogFixKind, string> = {
  stripe_name: "Stripe terméknév javítása",
  stripe_reactivate: "Inaktív Stripe ár újraaktiválása",
  download_token_path: "Elavult letöltési token útvonalának frissítése",
};
