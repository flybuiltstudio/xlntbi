/**
 * Admin-side license price management.
 *
 * A price change is stored in `product_price_overrides` (so every page, the
 * order form and the server-side order total use it immediately) and pushed to
 * Stripe: a new price object is created for the same product, the catalog
 * lookup key is transferred to it, and the previous price is archived. Checkout
 * resolves prices by lookup key, so existing links keep working and simply
 * charge the new amount.
 */

import { getProduct, products } from "./products";
import { catalogTierPrice } from "./product-overrides";
import { createStripeClient, getStripeErrorMessage, type StripeEnv } from "./stripe.server";

export type PriceTierRow = {
  slug: string;
  productName: string;
  tierId: string;
  tierLabel: string;
  priceId: string;
  catalogPrice: number;
  currentPrice: number;
  overridden: boolean;
  stripeSyncedAt: string | null;
  stripeError: string | null;
};

export type PriceSyncRow = {
  priceId: string;
  environment: StripeEnv;
  ok: boolean;
  message: string;
};

const MIN_PRICE = 100;
const MAX_PRICE = 10_000_000;

/** Current price of every product tier, with the catalog value for reference. */
export async function listProductPrices(): Promise<PriceTierRow[]> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin
    .from("product_price_overrides")
    .select("slug, tier_id, price, stripe_synced_at, stripe_error");

  const overrides = new Map<
    string,
    { price: number; syncedAt: string | null; error: string | null }
  >();
  for (const row of data ?? []) {
    overrides.set(`${row.slug}::${row.tier_id}`, {
      price: row.price,
      syncedAt: row.stripe_synced_at,
      error: row.stripe_error,
    });
  }

  const rows: PriceTierRow[] = [];
  for (const product of products) {
    for (const tier of product.tiers) {
      const override = overrides.get(`${product.slug}::${tier.id}`);
      const catalogPrice = catalogTierPrice(product.slug, tier.id) ?? tier.price;
      rows.push({
        slug: product.slug,
        productName: product.name,
        tierId: tier.id,
        tierLabel: tier.label,
        priceId: tier.priceId,
        catalogPrice,
        currentPrice: override?.price ?? catalogPrice,
        overridden: Boolean(override),
        stripeSyncedAt: override?.syncedAt ?? null,
        stripeError: override?.error ?? null,
      });
    }
  }
  return rows;
}

function validate(input: { slug: string; tierId: string; price: number }): string | null {
  const product = getProduct(input.slug);
  if (!product) return "Ismeretlen termék.";
  const tier = product.tiers.find((t) => t.id === input.tierId);
  if (!tier) return "Ismeretlen licenccsomag.";
  if (!Number.isInteger(input.price)) return "Az ár csak egész forintösszeg lehet.";
  if (input.price < MIN_PRICE || input.price > MAX_PRICE) {
    return `Az ár ${MIN_PRICE} és ${MAX_PRICE.toLocaleString("hu-HU")} Ft között lehet.`;
  }
  return null;
}

/** Pushes one amount to Stripe in one environment. */
async function syncOne(
  environment: StripeEnv,
  lookupKey: string,
  priceHuf: number,
): Promise<PriceSyncRow> {
  const minor = Math.round(priceHuf * 100);
  try {
    const stripe = createStripeClient(environment);
    const existing = await stripe.prices.list({ lookup_keys: [lookupKey], limit: 1 });
    const current = existing.data[0];
    if (!current) {
      return {
        priceId: lookupKey,
        environment,
        ok: false,
        message: "Nincs ilyen ár a Stripe-ban (lookup kulcs).",
      };
    }
    if (current.active && current.unit_amount === minor) {
      return { priceId: lookupKey, environment, ok: true, message: "Már egyezett." };
    }

    const productId =
      typeof current.product === "string" ? current.product : current.product.id;
    const created = await stripe.prices.create({
      product: productId,
      currency: current.currency,
      unit_amount: minor,
      lookup_key: lookupKey,
      transfer_lookup_key: true,
      ...(current.tax_behavior && current.tax_behavior !== "unspecified"
        ? { tax_behavior: current.tax_behavior }
        : {}),
    });
    if (created.id !== current.id) {
      await stripe.prices.update(current.id, { active: false });
    }
    return {
      priceId: lookupKey,
      environment,
      ok: true,
      message: `Frissítve: ${priceHuf.toLocaleString("hu-HU")} Ft.`,
    };
  } catch (error) {
    return {
      priceId: lookupKey,
      environment,
      ok: false,
      message: getStripeErrorMessage(error),
    };
  }
}

/**
 * Saves one tier price and syncs it to Stripe (sandbox and live). The saved
 * value applies on the site even if a Stripe environment is unavailable — the
 * failure is reported back and stored on the row.
 */
export async function saveProductPrice(input: {
  slug: string;
  tierId: string;
  price: number;
  updatedBy: string;
}): Promise<{ ok: boolean; error?: string; sync: PriceSyncRow[] }> {
  const invalid = validate(input);
  if (invalid) return { ok: false, error: invalid, sync: [] };

  const product = getProduct(input.slug)!;
  const tier = product.tiers.find((t) => t.id === input.tierId)!;

  const sync: PriceSyncRow[] = [];
  for (const environment of ["sandbox", "live"] as StripeEnv[]) {
    sync.push(await syncOne(environment, tier.priceId, input.price));
  }
  const failed = sync.filter((row) => !row.ok);

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { error } = await supabaseAdmin.from("product_price_overrides").upsert(
    {
      slug: input.slug,
      tier_id: input.tierId,
      price: input.price,
      stripe_price_id: tier.priceId,
      stripe_synced_at: failed.length === 0 ? new Date().toISOString() : null,
      stripe_error: failed.length
        ? failed.map((row) => `${row.environment}: ${row.message}`).join(" · ")
        : null,
      updated_by: input.updatedBy,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "slug,tier_id" },
  );
  if (error) {
    return { ok: false, error: "Az ár mentése nem sikerült az adatbázisba.", sync };
  }

  const { ensureProductOverrides } = await import("./product-overrides.server");
  await ensureProductOverrides(true);
  return { ok: true, sync };
}

/** Restores the bundled catalog price of a tier (Stripe included). */
export async function resetProductPrice(input: {
  slug: string;
  tierId: string;
}): Promise<{ ok: boolean; error?: string; sync: PriceSyncRow[] }> {
  const product = getProduct(input.slug);
  const tier = product?.tiers.find((t) => t.id === input.tierId);
  if (!product || !tier) return { ok: false, error: "Ismeretlen licenccsomag.", sync: [] };

  const catalogPrice = catalogTierPrice(input.slug, input.tierId) ?? tier.price;
  const sync: PriceSyncRow[] = [];
  for (const environment of ["sandbox", "live"] as StripeEnv[]) {
    sync.push(await syncOne(environment, tier.priceId, catalogPrice));
  }

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  await supabaseAdmin
    .from("product_price_overrides")
    .delete()
    .eq("slug", input.slug)
    .eq("tier_id", input.tierId);

  const { ensureProductOverrides } = await import("./product-overrides.server");
  await ensureProductOverrides(true);
  return { ok: true, sync };
}
