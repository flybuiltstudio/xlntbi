/** Machine readable coupon failure reasons and their Hungarian labels. */
export const COUPON_REASON_LABEL: Record<string, string> = {
  empty: "Nem adott meg kódot",
  malformed: "Formailag érvénytelen",
  no_campaign: "Nincs aktív kuponakció",
  not_found: "Nem létező kód",
  expired: "Lejárt kód",
  inactive: "Visszavont / inaktív kód",
  used_up: "Elhasznált kód",
  coupon_invalid: "Érvénytelen kedvezmény",
  coupon_expired: "Lejárt kedvezmény",
  below_minimum: "Összegkorlát alatt",
  stripe_error: "Ellenőrzési hiba",
  unknown: "Egyéb hiba",
};
