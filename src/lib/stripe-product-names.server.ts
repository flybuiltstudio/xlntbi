/**
 * Stripe product display-name sync.
 *
 * The site brands every product with an "XLNT " prefix (see product-name.ts),
 * but the line item shown inside Stripe Embedded Checkout (and on Stripe's own
 * receipts) comes from the Stripe *product* object's `name`. This module
 * compares the Stripe names with the catalog names and can rewrite them.
 *
 * Product and price ids (the sync keys) are never touched — only `name`.
 */

import { withXlntPrefix } from "./product-name";
import { products } from "./products";
import { createStripeClient, getStripeErrorMessage, type StripeEnv } from "./stripe.server";

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
  status: "ok" | "needs_fix" | "missing";
};

export type StripeNameReport = {
  environment: StripeEnv;
  rows: StripeNameRow[];
  okCount: number;
  fixCount: number;
  missingCount: number;
  error?: string;
};

export type StripeNameSyncResult = {
  environment: StripeEnv;
  updated: string[];
  skipped: number;
  errors: Array<{ priceId: string; message: string }>;
  report: StripeNameReport;
};

type CatalogEntry = { priceId: string; slug: string; desiredName: string };

/** Every catalog price lookup key with the desired (prefixed) product name. */
export function catalogNameTargets(): CatalogEntry[] {
  const seen = new Set<string>();
  const entries: CatalogEntry[] = [];
  for (const product of products) {
    const desiredName = withXlntPrefix(product.name);
    for (const tier of product.tiers) {
      if (seen.has(tier.priceId)) continue;
      seen.add(tier.priceId);
      entries.push({ priceId: tier.priceId, slug: product.slug, desiredName });
    }
  }
  return entries;
}

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

/**
 * Reads the current Stripe display name behind every catalog price and marks
 * the ones that are missing the "XLNT " prefix (or differ from the catalog).
 */
export async function listStripeProductNameStatus(
  environment: StripeEnv,
): Promise<StripeNameReport> {
  const targets = catalogNameTargets();
  const rows: StripeNameRow[] = [];

  try {
    const stripe = createStripeClient(environment);
    // Stripe accepts at most 10 lookup keys per request.
    const found = new Map<string, { productId: string; productName: string }>();

    for (const group of chunk(targets, 10)) {
      const prices = await stripe.prices.list({
        lookup_keys: group.map((t) => t.priceId),
        expand: ["data.product"],
        limit: 100,
      });
      for (const price of prices.data) {
        if (!price.lookup_key) continue;
        const product = price.product;
        if (typeof product === "string") {
          const full = await stripe.products.retrieve(product);
          found.set(price.lookup_key, { productId: full.id, productName: full.name });
        } else if (product && !("deleted" in product && product.deleted)) {
          found.set(price.lookup_key, {
            productId: product.id,
            productName: (product as { name: string }).name,
          });
        }
      }
    }

    for (const target of targets) {
      const hit = found.get(target.priceId);
      if (!hit) {
        rows.push({
          priceId: target.priceId,
          slug: target.slug,
          stripeProductId: null,
          currentName: null,
          desiredName: target.desiredName,
          status: "missing",
        });
        continue;
      }
      rows.push({
        priceId: target.priceId,
        slug: target.slug,
        stripeProductId: hit.productId,
        currentName: hit.productName,
        desiredName: target.desiredName,
        status: hit.productName === target.desiredName ? "ok" : "needs_fix",
      });
    }
  } catch (error) {
    return {
      environment,
      rows: [],
      okCount: 0,
      fixCount: 0,
      missingCount: 0,
      error: getStripeErrorMessage(error),
    };
  }

  return {
    environment,
    rows,
    okCount: rows.filter((r) => r.status === "ok").length,
    fixCount: rows.filter((r) => r.status === "needs_fix").length,
    missingCount: rows.filter((r) => r.status === "missing").length,
  };
}

/**
 * Renames every Stripe product whose display name differs from the prefixed
 * catalog name. Idempotent: correct names are left alone.
 */
export async function syncStripeProductNames(
  environment: StripeEnv,
): Promise<StripeNameSyncResult> {
  const before = await listStripeProductNameStatus(environment);
  const updated: string[] = [];
  const errors: Array<{ priceId: string; message: string }> = [];

  if (before.error) {
    return { environment, updated, skipped: 0, errors: [{ priceId: "-", message: before.error }], report: before };
  }

  const stripe = createStripeClient(environment);
  // One Stripe product can back several prices — rename it only once.
  const done = new Set<string>();

  for (const row of before.rows) {
    if (row.status !== "needs_fix" || !row.stripeProductId) continue;
    if (done.has(row.stripeProductId)) continue;
    done.add(row.stripeProductId);
    try {
      await stripe.products.update(row.stripeProductId, { name: row.desiredName });
      updated.push(`${row.priceId}: ${row.currentName ?? "—"} → ${row.desiredName}`);
    } catch (error) {
      errors.push({ priceId: row.priceId, message: getStripeErrorMessage(error) });
    }
  }

  const report = await listStripeProductNameStatus(environment);
  return { environment, updated, skipped: before.okCount, errors, report };
}
