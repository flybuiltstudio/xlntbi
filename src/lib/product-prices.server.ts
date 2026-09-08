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
  syncedSandboxAt: string | null;
  syncedLiveAt: string | null;
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
    .select("slug, tier_id, price, synced_sandbox_at, synced_live_at, sync_error");

  const overrides = new Map<
    string,
    {
      price: number;
      sandboxAt: string | null;
      liveAt: string | null;
      error: string | null;
    }
  >();
  for (const row of data ?? []) {
    overrides.set(`${row.slug}::${row.tier_id}`, {
      price: row.price,
      sandboxAt: row.synced_sandbox_at,
      liveAt: row.synced_live_at,
      error: row.sync_error,
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
        syncedSandboxAt: override?.sandboxAt ?? null,
        syncedLiveAt: override?.liveAt ?? null,
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
  // HUF is a decimal currency at Stripe: amounts travel in fillér.
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
      return {
        priceId: lookupKey,
        environment,
        ok: true,
        message: `Már egyezett: ${priceHuf.toLocaleString("hu-HU")} Ft.`,
      };
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
    const readBack = (created.unit_amount ?? minor) / 100;
    return {
      priceId: lookupKey,
      environment,
      ok: true,
      message: `Frissítve, a Stripe-ban most: ${readBack.toLocaleString("hu-HU")} Ft.`,
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

/** Effective price of a tier right now (override first, catalog otherwise). */
async function currentPrice(slug: string, tierId: string, fallback: number): Promise<number> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin
    .from("product_price_overrides")
    .select("price")
    .eq("slug", slug)
    .eq("tier_id", tierId)
    .maybeSingle();
  return typeof data?.price === "number" ? data.price : fallback;
}

/**
 * Pushes a price to Stripe first, and only shows it on the site when the LIVE
 * environment accepted it. If live fails, the sandbox change is rolled back to
 * the previous amount and the site keeps the old price, so the displayed price
 * can never differ from what the customer is charged.
 */
async function pushPrice(input: {
  slug: string;
  tierId: string;
  lookupKey: string;
  price: number;
  previousPrice: number;
}): Promise<{ ok: boolean; error?: string; sync: PriceSyncRow[] }> {
  const sync: PriceSyncRow[] = [];
  for (const environment of ["sandbox", "live"] as StripeEnv[]) {
    sync.push(await syncOne(environment, input.lookupKey, input.price));
  }
  const live = sync.find((row) => row.environment === "live")!;
  if (!live.ok) {
    const sandbox = sync.find((row) => row.environment === "sandbox")!;
    if (sandbox.ok && input.previousPrice !== input.price) {
      const rollback = await syncOne("sandbox", input.lookupKey, input.previousPrice);
      sync.push({
        ...rollback,
        message: rollback.ok
          ? `Visszaállítva a korábbi árra: ${input.previousPrice.toLocaleString("hu-HU")} Ft.`
          : `A teszt ár visszaállítása sem sikerült: ${rollback.message}`,
      });
    }
    return {
      ok: false,
      error: `Az éles Stripe-ár frissítése nem sikerült, ezért az oldalon a régi ár (${input.previousPrice.toLocaleString("hu-HU")} Ft) maradt. Stripe hibája: ${live.message}`,
      sync,
    };
  }
  return { ok: true, sync };
}

/**
 * Saves one tier price. The new amount only appears on the site if Stripe (live
 * included) accepted it.
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
  const catalogPrice = catalogTierPrice(input.slug, input.tierId) ?? tier.price;
  const previousPrice = await currentPrice(input.slug, input.tierId, catalogPrice);

  const pushed = await pushPrice({
    slug: input.slug,
    tierId: input.tierId,
    lookupKey: tier.priceId,
    price: input.price,
    previousPrice,
  });
  if (!pushed.ok) return pushed;

  const now = new Date().toISOString();
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { error } = await supabaseAdmin.from("product_price_overrides").upsert(
    {
      slug: input.slug,
      tier_id: input.tierId,
      price: input.price,
      stripe_price_id: tier.priceId,
      synced_sandbox_at: pushed.sync.find((row) => row.environment === "sandbox")?.ok
        ? now
        : null,
      synced_live_at: now,
      sync_error: null,
      updated_by: input.updatedBy,
      updated_at: now,
    },
    { onConflict: "slug,tier_id" },
  );
  if (error) {
    return { ok: false, error: "Az ár mentése nem sikerült az adatbázisba.", sync: pushed.sync };
  }

  const { ensureProductOverrides } = await import("./product-overrides.server");
  await ensureProductOverrides(true);
  return { ok: true, sync: pushed.sync };
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
  const previousPrice = await currentPrice(input.slug, input.tierId, catalogPrice);

  const pushed = await pushPrice({
    slug: input.slug,
    tierId: input.tierId,
    lookupKey: tier.priceId,
    price: catalogPrice,
    previousPrice,
  });
  if (!pushed.ok) return pushed;

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  await supabaseAdmin
    .from("product_price_overrides")
    .delete()
    .eq("slug", input.slug)
    .eq("tier_id", input.tierId);

  const { ensureProductOverrides } = await import("./product-overrides.server");
  await ensureProductOverrides(true);
  return { ok: true, sync: pushed.sync };
}

