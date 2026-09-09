/**
 * Catalog self-check.
 *
 * For every product and every licence tier it verifies:
 *  - the Stripe price lookup key exists in the selected environment,
 *  - the price is active, HUF, and its amount matches the catalog (Ft → fillér),
 *  - the Stripe display name carries the "XLNT " prefix,
 *  - the download file really exists in the private storage bucket,
 *  - already issued download tokens still point at the current object path.
 *
 * Read-only: nothing is created or modified in Stripe or in storage.
 */

import { withXlntPrefix } from "./product-name";
import { products } from "./products";
import { createStripeClient, getStripeErrorMessage, type StripeEnv } from "./stripe.server";
import { DOWNLOAD_BUCKET } from "./download.server";
import type {
  AuditStatus,
  CatalogAuditReport,
  DownloadAuditRow,
  TierAuditRow,
} from "./catalog-audit";

type StripeHit = {
  priceId: string;
  active: boolean;
  unitAmount: number | null;
  currency: string;
  productName: string | null;
  recurring: boolean;
};

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

function worst(statuses: AuditStatus[]): AuditStatus {
  if (statuses.includes("error")) return "error";
  if (statuses.includes("warn")) return "warn";
  return "ok";
}

/** Reads every catalog lookup key from Stripe (10 keys per request). */
async function readStripePrices(
  environment: StripeEnv,
  lookupKeys: string[],
): Promise<{ found: Map<string, StripeHit>; error?: string }> {
  const found = new Map<string, StripeHit>();
  try {
    const stripe = createStripeClient(environment);
    for (const group of chunk(lookupKeys, 10)) {
      const prices = await stripe.prices.list({
        lookup_keys: group,
        expand: ["data.product"],
        limit: 100,
      });
      for (const price of prices.data) {
        if (!price.lookup_key) continue;
        const product = price.product;
        let productName: string | null = null;
        if (typeof product === "string") {
          try {
            productName = (await stripe.products.retrieve(product)).name;
          } catch {
            productName = null;
          }
        } else if (product && !("deleted" in product && product.deleted)) {
          productName = (product as { name: string }).name;
        }
        found.set(price.lookup_key, {
          priceId: price.id,
          active: price.active,
          unitAmount: price.unit_amount ?? null,
          currency: price.currency,
          productName,
          recurring: Boolean(price.recurring),
        });
      }
    }
  } catch (error) {
    return { found, error: getStripeErrorMessage(error) };
  }
  return { found };
}

type StoredObject = { size: number | null };

/** Lists the storage objects behind the catalog paths (one list per folder). */
async function readStorageObjects(paths: string[]): Promise<Map<string, StoredObject>> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const folders = new Set<string>();
  for (const path of paths) {
    const idx = path.lastIndexOf("/");
    folders.add(idx === -1 ? "" : path.slice(0, idx));
  }

  const objects = new Map<string, StoredObject>();
  for (const folder of folders) {
    const { data, error } = await supabaseAdmin.storage
      .from(DOWNLOAD_BUCKET)
      .list(folder, { limit: 200 });
    if (error || !data) continue;
    for (const entry of data) {
      const size =
        (entry.metadata as { size?: number } | null)?.size ??
        null;
      objects.set(folder ? `${folder}/${entry.name}` : entry.name, { size });
    }
  }
  return objects;
}

export async function runCatalogAudit(
  environment: StripeEnv,
): Promise<CatalogAuditReport> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  // Admin price/description overrides and admin-created products are layered on
  // top of the bundled catalog at runtime. Without this the audit would compare
  // Stripe against the bundled prices and report false "Összeg eltérés" rows.
  const { ensureProductOverrides } = await import("./product-overrides.server");
  await ensureProductOverrides(true);

  const lookupKeys = Array.from(
    new Set(products.flatMap((p) => p.tiers.map((t) => t.priceId))),
  );
  const storagePaths = products
    .map((p) => p.download?.storagePath)
    .filter((p): p is string => Boolean(p));

  const [{ found, error: stripeError }, objects, fileVersions, tokens] =
    await Promise.all([
      readStripePrices(environment, lookupKeys),
      readStorageObjects(storagePaths),
      supabaseAdmin
        .from("product_file_versions")
        .select("product_slug, file_name")
        .then((r) => r.data ?? []),
      supabaseAdmin
        .from("order_downloads")
        .select("product_slug, storage_path")
        .then((r) => r.data ?? []),
    ]);

  const versionBySlug = new Map<string, string>();
  for (const row of fileVersions as Array<{ product_slug: string; file_name: string }>) {
    if (row.file_name?.trim()) versionBySlug.set(row.product_slug, row.file_name.trim());
  }

  // ---- Stripe tiers -------------------------------------------------------
  const tiers: TierAuditRow[] = [];
  for (const product of products) {
    const desiredName = withXlntPrefix(product.name);
    for (const tier of product.tiers) {
      const issues: string[] = [];
      const statuses: AuditStatus[] = [];
      const hit = found.get(tier.priceId);

      if (stripeError) {
        issues.push(`Stripe olvasási hiba: ${stripeError}`);
        statuses.push("error");
      } else if (!hit) {
        issues.push("Nincs ilyen lookup key a Stripe-ban — a fizetés hibára futna.");
        statuses.push("error");
      } else {
        if (!hit.active) {
          issues.push("Az ár inaktív a Stripe-ban.");
          statuses.push("error");
        }
        if (hit.currency.toLowerCase() !== "huf") {
          issues.push(`Nem HUF valuta: ${hit.currency.toUpperCase()}.`);
          statuses.push("error");
        }
        const expectedMinor = Math.round(tier.price * 100);
        if (hit.unitAmount === null) {
          issues.push("Az árnál nincs fix összeg (unit_amount).");
          statuses.push("error");
        } else if (hit.unitAmount !== expectedMinor) {
          issues.push(
            `Összeg eltérés: katalógus ${tier.price} Ft, Stripe ${Math.round(hit.unitAmount / 100)} Ft.`,
          );
          statuses.push("error");
        }
        if (hit.recurring) {
          issues.push("Az ár ismétlődő (előfizetés), de a katalógus egyszeri vásárlás.");
          statuses.push("warn");
        }
        if (hit.productName && hit.productName !== desiredName) {
          issues.push(`Stripe terméknév eltér: „${hit.productName}” ≠ „${desiredName}”.`);
          statuses.push("warn");
        }
      }

      tiers.push({
        slug: product.slug,
        productName: desiredName,
        tierId: tier.id,
        tierLabel: tier.label,
        priceId: tier.priceId,
        expectedPrice: tier.price,
        stripePrice:
          hit?.unitAmount === null || hit?.unitAmount === undefined
            ? null
            : Math.round(hit.unitAmount / 100),
        stripePriceId: hit?.priceId ?? null,
        stripeCurrency: hit ? hit.currency.toUpperCase() : null,
        stripeActive: hit ? hit.active : null,
        stripeProductName: hit?.productName ?? null,
        status: worst(statuses),
        issues,
      });
    }
  }

  // ---- Downloads ----------------------------------------------------------
  const tokenRows = tokens as Array<{ product_slug: string; storage_path: string }>;
  const downloads: DownloadAuditRow[] = products.map((product) => {
    const issues: string[] = [];
    const statuses: AuditStatus[] = [];
    const path = product.download?.storagePath ?? null;
    const fileName = product.download
      ? versionBySlug.get(product.slug) ?? product.download.fileName
      : null;

    let fileSize: number | null = null;
    if (!path) {
      if (product.status === "available") {
        issues.push("Elérhető termék, de nincs hozzá letöltési fájl megadva.");
        statuses.push("error");
      } else {
        issues.push("Előkészületben lévő termék, fájl nélkül.");
        statuses.push("warn");
      }
    } else {
      const object = objects.get(path);
      if (!object) {
        issues.push(`A fájl nincs a tárolóban: ${path}`);
        statuses.push("error");
      } else {
        fileSize = object.size;
        if (object.size !== null && object.size === 0) {
          issues.push("A tárolóban lévő fájl 0 byte méretű.");
          statuses.push("error");
        }
      }
    }

    const productTokens = tokenRows.filter((t) => t.product_slug === product.slug);
    const stale = productTokens.filter((t) => path && t.storage_path !== path);
    if (stale.length > 0) {
      issues.push(
        `${stale.length} korábbi letöltési token még a régi útvonalra mutat (pl. ${stale[0]!.storage_path}).`,
      );
      statuses.push("error");
    }
    for (const token of productTokens) {
      if (!objects.has(token.storage_path)) {
        issues.push(`Kiadott token nem létező fájlra mutat: ${token.storage_path}`);
        statuses.push("error");
        break;
      }
    }

    return {
      slug: product.slug,
      productName: withXlntPrefix(product.name),
      storagePath: path,
      fileName,
      fileSize,
      tokenCount: productTokens.length,
      staleTokenCount: stale.length,
      status: worst(statuses),
      issues,
    };
  });

  const report: CatalogAuditReport = {
    environment,
    ranAt: new Date().toISOString(),
    tiers,
    downloads,
    summary: {
      tierCount: tiers.length,
      tierOk: tiers.filter((t) => t.status === "ok").length,
      tierWarn: tiers.filter((t) => t.status === "warn").length,
      tierError: tiers.filter((t) => t.status === "error").length,
      productCount: downloads.length,
      downloadOk: downloads.filter((d) => d.status === "ok").length,
      downloadWarn: downloads.filter((d) => d.status === "warn").length,
      downloadError: downloads.filter((d) => d.status === "error").length,
    },
  };
  if (stripeError) report.stripeError = stripeError;
  return report;
}
