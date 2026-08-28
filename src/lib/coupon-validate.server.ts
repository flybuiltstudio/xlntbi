/**
 * Server-side promotion code validation with detailed, user friendly
 * Hungarian messages. Runs before the embedded Stripe checkout so the buyer
 * gets a clear explanation ("lejárt", "elfogyott", "nem erre a termékre
 * érvényes") instead of Stripe's terse generic error inside the iframe.
 */

import { promotionCodesEnabled } from "./coupons";
import { type StripeEnv, createStripeClient, getStripeErrorMessage } from "./stripe.server";

export type CouponReason =
  | "empty"
  | "malformed"
  | "no_campaign"
  | "not_found"
  | "expired"
  | "inactive"
  | "used_up"
  | "coupon_invalid"
  | "coupon_expired"
  | "below_minimum"
  | "stripe_error"
  | "valid";

export type CouponCheckResult = {
  ok: boolean;
  /** Machine readable failure reason (admin log + support). */
  reason?: CouponReason;
  /** Short headline shown to the buyer. */
  message: string;
  /** Optional extra explanation / next step. */
  detail?: string;
  /** Human readable discount, e.g. "100% kedvezmény" — only when ok. */
  discount?: string;
  /** Normalized code to type into the checkout coupon field. */
  code?: string;
  /** Itemized breakdown for the buyer (HUF, only when the order total is known). */
  originalAmount?: number;
  discountAmount?: number;
  newAmount?: number;
};

/**
 * Itemized discount breakdown so the buyer always sees how much is saved
 * and what the new total is.
 */
function computeBreakdown(
  coupon: { percent_off?: number | null; amount_off?: number | null; currency?: string | null } | null | undefined,
  amount: number | undefined,
): { originalAmount?: number; discountAmount?: number; newAmount?: number } {
  if (!coupon || typeof amount !== "number" || !Number.isFinite(amount) || amount <= 0) return {};
  const original = Math.round(amount);
  let discount = 0;
  if (coupon.percent_off) {
    discount = Math.round((original * coupon.percent_off) / 100);
  } else if (coupon.amount_off && String(coupon.currency ?? "huf").toLowerCase() === "huf") {
    // Stripe stores HUF amounts in minor units (fillér).
    discount = Math.round(coupon.amount_off / 100);
  } else {
    return {};
  }
  discount = Math.min(discount, original);
  return { originalAmount: original, discountAmount: discount, newAmount: original - discount };
}

function formatHuf(amountInMinor: number): string {
  return `${Math.round(amountInMinor).toLocaleString("hu-HU")} Ft`;
}

function describeDiscount(coupon: {
  percent_off?: number | null;
  amount_off?: number | null;
  currency?: string | null;
  duration?: string | null;
}): string {
  if (coupon.percent_off) return `${coupon.percent_off}% kedvezmény`;
  if (coupon.amount_off) {
    const currency = (coupon.currency ?? "huf").toUpperCase();
    // Stripe amounts are minor units for both HUF (fillér) and e.g. EUR (cent).
    return currency === "HUF"
      ? `${formatHuf(coupon.amount_off / 100)} kedvezmény`
      : `${coupon.amount_off / 100} ${currency} kedvezmény`;
  }
  return "kedvezmény";
}

export type CouponCheckInput = {
  code: string;
  environment: StripeEnv;
  /** Order total in HUF (major units) — used for minimum amount checks. */
  amount?: number;
  priceId?: string;
  /** Buyer email + order number, when known (admin log only). */
  email?: string;
  orderNumber?: string;
};

/**
 * Validates the code and records every unsuccessful attempt in
 * `coupon_attempts`, so support can check "lejárt / érvénytelen /
 * elhasznált / összegkorlát alatt" complaints in the admin panel.
 */
export async function checkPromotionCode(
  input: CouponCheckInput,
): Promise<CouponCheckResult> {
  const result = await evaluatePromotionCode(input);
  if (!result.ok) {
    const { logCouponAttempt } = await import("./coupon-attempts.server");
    await logCouponAttempt({
      code: input.code.trim().toUpperCase(),
      environment: input.environment,
      reason: result.reason ?? "unknown",
      message: result.message,
      ...(result.detail ? { detail: result.detail } : {}),
      ...(input.email ? { email: input.email } : {}),
      ...(input.orderNumber ? { orderNumber: input.orderNumber } : {}),
      ...(typeof input.amount === "number" ? { amount: Math.round(input.amount) } : {}),
      ...(input.priceId ? { priceId: input.priceId } : {}),
    });
  }
  return result;
}

async function evaluatePromotionCode(input: CouponCheckInput): Promise<CouponCheckResult> {
  const code = input.code.trim().toUpperCase();

  if (!code) {
    return { ok: false, reason: "empty", message: "Nem adtál meg kuponkódot." };
  }
  if (!/^[A-Z0-9_-]{2,40}$/.test(code)) {
    return {
      ok: false,
      reason: "malformed",
      message: "Ez a kuponkód formailag érvénytelen.",
      detail: "A kuponkód csak betűket, számokat, kötőjelet és aláhúzást tartalmazhat.",
    };
  }
  if (!promotionCodesEnabled(input.environment)) {
    return {
      ok: false,
      reason: "no_campaign",
      message: "Jelenleg nincs érvényes kuponakció.",
      detail: "A megadott árak a végleges árak. Ha kaptál kódot, írj a info@xlntbi.hu címre.",
    };
  }

  try {
    const stripe = createStripeClient(input.environment);
    const list = await stripe.promotionCodes.list({ code, limit: 10 });
    const promo =
      list.data.find((p) => p.code.trim().toUpperCase() === code && p.active) ?? list.data[0];

    if (!promo) {
      return {
        ok: false,
        reason: "not_found",
        message: "Ilyen kuponkód nem létezik.",
        detail: "Ellenőrizd a kódot – a kis- és nagybetű nem számít, de a kötőjelek igen.",
      };
    }

    const nowSec = Math.floor(Date.now() / 1000);

    if (promo.expires_at && promo.expires_at <= nowSec) {
      const until = new Date(promo.expires_at * 1000).toLocaleString("hu-HU", {
        timeZone: "Europe/Budapest",
      });
      return {
        ok: false,
        reason: "expired",
        message: "Ez a kuponkód lejárt.",
        detail: `Érvényessége lejárt: ${until}.`,
      };
    }

    if (!promo.active) {
      return {
        ok: false,
        reason: "inactive",
        message: "Ez a kuponkód már nem használható.",
        detail: "A kódot visszavontuk vagy lejárt az akció.",
      };
    }

    if (
      typeof promo.max_redemptions === "number" &&
      promo.times_redeemed >= promo.max_redemptions
    ) {
      return {
        ok: false,
        reason: "used_up",
        message: "Ezt a kuponkódot már elhasználták.",
        detail: `A kód legfeljebb ${promo.max_redemptions} alkalommal volt beváltható.`,
      };
    }

    const rawCoupon = (promo as any).promotion?.coupon ?? (promo as any).coupon;
    const coupon: any =
      typeof rawCoupon === "string" ? await stripe.coupons.retrieve(rawCoupon) : rawCoupon;
    if (coupon?.valid === false) {
      return {
        ok: false,
        reason: "coupon_invalid",
        message: "Ehhez a kuponkódhoz tartozó kedvezmény már nem érvényes.",
        detail: "Kérj új kódot, vagy folytasd a vásárlást kedvezmény nélkül.",
      };
    }
    if (coupon?.redeem_by && coupon.redeem_by <= nowSec) {
      const until = new Date(coupon.redeem_by * 1000).toLocaleString("hu-HU", {
        timeZone: "Europe/Budapest",
      });
      return {
        ok: false,
        reason: "coupon_expired",
        message: "Ez a kedvezmény lejárt.",
        detail: `Beváltási határidő: ${until}.`,
      };
    }

    const rawMinimum = promo.restrictions?.minimum_amount;
    // Stripe stores the minimum in minor units (fillér); the order total arrives in forints.
    const minimum = typeof rawMinimum === "number" ? Math.round(rawMinimum / 100) : undefined;
    if (typeof minimum === "number" && typeof input.amount === "number") {
      const orderAmount = Math.round(input.amount);
      if (orderAmount < minimum) {
        return {
          ok: false,
          reason: "below_minimum",
          message: "A rendelés összege nem éri el a kupon alsó határát.",
          detail: `A kód ${formatHuf(minimum)} feletti rendelésnél váltható be, a jelenlegi összeg ${formatHuf(orderAmount)}.`,
        };
      }
    }

    const breakdown = computeBreakdown(coupon, input.amount);

    if (promo.restrictions?.first_time_transaction) {
      return {
        ok: true,
        reason: "valid",
        code,
        message: `A kuponkód érvényes: ${describeDiscount(coupon ?? {})}.`,
        detail: "Figyelem: ez a kód csak első vásárlásnál váltható be.",
        discount: describeDiscount(coupon ?? {}),
        ...breakdown,
      };
    }

    return {
      ok: true,
      reason: "valid",
      code,
      message: `A kuponkód érvényes: ${describeDiscount(coupon ?? {})}.`,
      detail: "Írd be a kódot a fizetési űrlap „Kuponkód” mezőjébe, és nyomj a Beváltás gombra.",
      discount: describeDiscount(coupon ?? {}),
      ...breakdown,
    };
  } catch (error) {
    console.error("Coupon validation failed:", getStripeErrorMessage(error));
    return {
      ok: false,
      reason: "stripe_error",
      message: "A kuponkódot most nem tudtam ellenőrizni.",
      detail: "Próbáld újra néhány másodperc múlva, vagy add meg a kódot közvetlenül a fizetési űrlapon.",
    };
  }
}
