/**
 * Server-side promotion code validation with detailed, user friendly
 * Hungarian messages. Runs before the embedded Stripe checkout so the buyer
 * gets a clear explanation ("lejárt", "elfogyott", "nem erre a termékre
 * érvényes") instead of Stripe's terse generic error inside the iframe.
 */

import { promotionCodesEnabled } from "./coupons";
import { type StripeEnv, createStripeClient, getStripeErrorMessage } from "./stripe.server";

export type CouponCheckResult = {
  ok: boolean;
  /** Short headline shown to the buyer. */
  message: string;
  /** Optional extra explanation / next step. */
  detail?: string;
  /** Human readable discount, e.g. "100% kedvezmény" — only when ok. */
  discount?: string;
  /** Normalized code to type into the checkout coupon field. */
  code?: string;
};

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
    return currency === "HUF"
      ? `${formatHuf(coupon.amount_off)} kedvezmény`
      : `${coupon.amount_off / 100} ${currency} kedvezmény`;
  }
  return "kedvezmény";
}

export async function checkPromotionCode(input: {
  code: string;
  environment: StripeEnv;
  /** Order total in HUF (major units) — used for minimum amount checks. */
  amount?: number;
  priceId?: string;
}): Promise<CouponCheckResult> {
  const code = input.code.trim().toUpperCase();

  if (!code) {
    return { ok: false, message: "Nem adtál meg kuponkódot." };
  }
  if (!/^[A-Z0-9_-]{2,40}$/.test(code)) {
    return {
      ok: false,
      message: "Ez a kuponkód formailag érvénytelen.",
      detail: "A kuponkód csak betűket, számokat, kötőjelet és aláhúzást tartalmazhat.",
    };
  }
  if (!promotionCodesEnabled(input.environment)) {
    return {
      ok: false,
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
        message: "Ez a kuponkód lejárt.",
        detail: `Érvényessége lejárt: ${until}.`,
      };
    }

    if (!promo.active) {
      return {
        ok: false,
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
        message: "Ezt a kuponkódot már elhasználták.",
        detail: `A kód legfeljebb ${promo.max_redemptions} alkalommal volt beváltható.`,
      };
    }

    const coupon: any = promo.coupon;
    if (coupon?.valid === false) {
      return {
        ok: false,
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
        message: "Ez a kedvezmény lejárt.",
        detail: `Beváltási határidő: ${until}.`,
      };
    }

    const minimum = promo.restrictions?.minimum_amount;
    if (typeof minimum === "number" && typeof input.amount === "number") {
      const orderMinor = Math.round(input.amount);
      if (orderMinor < minimum) {
        return {
          ok: false,
          message: "A rendelés összege nem éri el a kupon alsó határát.",
          detail: `A kód ${formatHuf(minimum)} feletti rendelésnél váltható be, a jelenlegi összeg ${formatHuf(orderMinor)}.`,
        };
      }
    }

    if (promo.restrictions?.first_time_transaction) {
      return {
        ok: true,
        code,
        message: `A kuponkód érvényes: ${describeDiscount(coupon ?? {})}.`,
        detail: "Figyelem: ez a kód csak első vásárlásnál váltható be.",
        discount: describeDiscount(coupon ?? {}),
      };
    }

    return {
      ok: true,
      code,
      message: `A kuponkód érvényes: ${describeDiscount(coupon ?? {})}.`,
      detail: "Írd be a kódot a fizetési űrlap „Kuponkód” mezőjébe, és nyomj a Beváltás gombra.",
      discount: describeDiscount(coupon ?? {}),
    };
  } catch (error) {
    console.error("Coupon validation failed:", getStripeErrorMessage(error));
    return {
      ok: false,
      message: "A kuponkódot most nem tudtam ellenőrizni.",
      detail: "Próbáld újra néhány másodperc múlva, vagy add meg a kódot közvetlenül a fizetési űrlapon.",
    };
  }
}
