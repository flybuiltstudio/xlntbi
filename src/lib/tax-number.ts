/**
 * Tax number validation for the order form.
 *
 * Hungarian tax numbers (adószám) are 11 digits: 8-digit base with a check
 * digit, a 1-digit VAT code (1-5) and a 2-digit county code. Foreign EU VAT
 * ids are accepted in the generic "2 letters + 2-12 alphanumerics" shape,
 * because we cannot check their country-specific checksums.
 */

export type TaxNumberCheck = { ok: true; normalized: string } | { ok: false; error: string };

const HU_COUNTY_CODES = new Set([
  "02","03","04","05","06","07","08","09","10","11","12","13","14","15","16","17","18","19",
  "20","21","22","23","24","25","26","27","28","29","30","31","32","33","34","35","36","37",
  "38","39","40","41","42","43","44","51",
]);

const HU_WEIGHTS = [9, 7, 3, 1, 9, 7, 3];

export function huTaxBaseIsValid(base: string): boolean {
  if (!/^\d{8}$/.test(base)) return false;
  let sum = 0;
  for (let i = 0; i < 7; i += 1) sum += Number(base[i]) * HU_WEIGHTS[i]!;
  const check = (10 - (sum % 10)) % 10;
  return check === Number(base[7]);
}

/** Formats 11 digits as 12345678-1-42. */
function formatHu(digits: string) {
  return `${digits.slice(0, 8)}-${digits.slice(8, 9)}-${digits.slice(9, 11)}`;
}

export function checkTaxNumber(raw: string): TaxNumberCheck {
  const value = raw.trim();
  if (!value) return { ok: true, normalized: "" };

  const compact = value.replace(/[\s.\-/]/g, "").toUpperCase();

  const withoutHu = compact.startsWith("HU") ? compact.slice(2) : compact;

  if (/^\d+$/.test(withoutHu)) {
    if (withoutHu.length === 8) {
      return huTaxBaseIsValid(withoutHu)
        ? { ok: true, normalized: withoutHu }
        : {
            ok: false,
            error:
              "Az adószám ellenőrzőszáma nem stimmel. Kérlek, ellenőrizd a számjegyeket.",
          };
    }
    if (withoutHu.length !== 11) {
      return {
        ok: false,
        error:
          "A magyar adószám 11 számjegyű (pl. 12345678-1-42). Külföldi adószámnál add meg az országkódot is.",
      };
    }
    if (!huTaxBaseIsValid(withoutHu.slice(0, 8))) {
      return {
        ok: false,
        error: "Az adószám ellenőrzőszáma nem stimmel. Kérlek, ellenőrizd a számjegyeket.",
      };
    }
    const vatCode = withoutHu[8]!;
    if (!/[1-5]/.test(vatCode)) {
      return {
        ok: false,
        error: "Az adószám 9. jegye (áfakód) csak 1 és 5 közötti szám lehet.",
      };
    }
    if (!HU_COUNTY_CODES.has(withoutHu.slice(9, 11))) {
      return {
        ok: false,
        error: "Az adószám utolsó két jegye (területi kód) érvénytelen.",
      };
    }
    return { ok: true, normalized: formatHu(withoutHu) };
  }

  if (/^[A-Z]{2}[0-9A-Z]{2,12}$/.test(compact)) {
    return { ok: true, normalized: compact };
  }

  return {
    ok: false,
    error:
      "Az adószám formátuma érvénytelen. Magyar adószám: 12345678-1-42, külföldi: országkód + szám.",
  };
}

export function isValidTaxNumber(raw: string) {
  return checkTaxNumber(raw).ok;
}
