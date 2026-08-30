/**
 * Catalog auto-fix.
 *
 * Runs the read-only catalog audit first, then repairs the issue classes that
 * have exactly one safe remedy:
 *   - Stripe product display name differs from the catalog name → rename.
 *   - Stripe price is inactive but currency + amount match the catalog → reactivate.
 *   - Issued download tokens point at an outdated storage path → repoint them
 *     to the product's current path (only when that file really exists).
 *
 * Everything else (missing lookup key, missing/empty file, amount mismatch,
 * recurring price, token pointing at a file that no longer exists) is returned
 * as manual work — the fixer never invents prices or files.
 */

import { runCatalogAudit } from "./catalog-audit.server";
import type { CatalogFixAction, CatalogFixResult } from "./catalog-fix";
import { products } from "./products";
import { withXlntPrefix } from "./product-name";
import { createStripeClient, getStripeErrorMessage, type StripeEnv } from "./stripe.server";

export async function fixCatalogIssues(environment: StripeEnv): Promise<CatalogFixResult> {
  const report = await runCatalogAudit(environment);
  const actions: CatalogFixAction[] = [];
  const manual: string[] = [];

  // ---- Stripe: names + inactive prices -----------------------------------
  const needsName = report.tiers.filter(
    (row) =>
      row.stripePriceId &&
      row.stripeProductName &&
      row.stripeProductName !== row.productName,
  );
  const needsActivation = report.tiers.filter(
    (row) =>
      row.stripePriceId &&
      row.stripeActive === false &&
      row.stripeCurrency === "HUF" &&
      row.stripePrice === row.expectedPrice,
  );

  if (report.stripeError) {
    manual.push(`Stripe olvasási hiba, a Stripe javítások kimaradtak: ${report.stripeError}`);
  } else if (needsName.length > 0 || needsActivation.length > 0) {
    try {
      const stripe = createStripeClient(environment);

      // One rename per Stripe product, even when several tiers share it.
      const renamed = new Set<string>();
      for (const row of needsName) {
        try {
          const price = await stripe.prices.retrieve(row.stripePriceId!);
          const productId =
            typeof price.product === "string" ? price.product : price.product?.id ?? null;
          if (!productId) {
            actions.push({
              kind: "stripe_name",
              slug: row.slug,
              target: row.priceId,
              ok: false,
              detail: "Nem sikerült azonosítani a Stripe terméket.",
            });
            continue;
          }
          if (renamed.has(productId)) continue;
          renamed.add(productId);
          await stripe.products.update(productId, { name: row.productName });
          actions.push({
            kind: "stripe_name",
            slug: row.slug,
            target: row.priceId,
            ok: true,
            detail: `„${row.stripeProductName}” → „${row.productName}”`,
          });
        } catch (error) {
          actions.push({
            kind: "stripe_name",
            slug: row.slug,
            target: row.priceId,
            ok: false,
            detail: getStripeErrorMessage(error),
          });
        }
      }

      for (const row of needsActivation) {
        try {
          await stripe.prices.update(row.stripePriceId!, { active: true });
          actions.push({
            kind: "stripe_reactivate",
            slug: row.slug,
            target: row.priceId,
            ok: true,
            detail: `Az ár újra aktív (${row.expectedPrice} Ft).`,
          });
        } catch (error) {
          actions.push({
            kind: "stripe_reactivate",
            slug: row.slug,
            target: row.priceId,
            ok: false,
            detail: getStripeErrorMessage(error),
          });
        }
      }
    } catch (error) {
      manual.push(`Stripe kapcsolat hiba: ${getStripeErrorMessage(error)}`);
    }
  }

  // Non-fixable Stripe findings.
  for (const row of report.tiers) {
    if (row.status === "ok") continue;
    const fixable =
      needsName.includes(row) || needsActivation.includes(row) || Boolean(report.stripeError);
    if (fixable) continue;
    for (const issue of row.issues) {
      manual.push(`${row.productName} – ${row.tierLabel} (${row.priceId}): ${issue}`);
    }
  }

  // ---- Downloads: repoint stale tokens ------------------------------------
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const pathBySlug = new Map<string, string>();
  for (const product of products) {
    if (product.download?.storagePath) pathBySlug.set(product.slug, product.download.storagePath);
  }

  for (const row of report.downloads) {
    if (row.status === "ok") continue;
    const currentPath = pathBySlug.get(row.slug) ?? null;
    // The current file must exist before any token is repointed to it.
    const fileOk = Boolean(currentPath) && row.fileSize !== null && row.fileSize > 0;

    if (row.staleTokenCount > 0 && currentPath && fileOk) {
      const { error, count } = await (supabaseAdmin as any)
        .from("order_downloads")
        .update({ storage_path: currentPath }, { count: "exact" })
        .eq("product_slug", row.slug)
        .neq("storage_path", currentPath);
      actions.push({
        kind: "download_token_path",
        slug: row.slug,
        target: currentPath,
        ok: !error,
        detail: error
          ? error.message
          : `${count ?? row.staleTokenCount} letöltési token átállítva a jelenlegi fájlra.`,
      });
    }

    for (const issue of row.issues) {
      const handled =
        row.staleTokenCount > 0 && fileOk && issue.includes("letöltési token");
      if (handled) continue;
      manual.push(`${withXlntPrefix(row.productName)}: ${issue}`);
    }
  }

  const fixed = actions.filter((a) => a.ok).length;
  return {
    environment,
    ranAt: new Date().toISOString(),
    actions,
    manual,
    summary: { fixed, failed: actions.length - fixed, manual: manual.length },
  };
}
