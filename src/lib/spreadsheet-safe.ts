/**
 * Spreadsheet formula neutralisation for exported cell values.
 *
 * Two goals:
 * 1. Security: a cell whose text starts with =, @, tab or carriage return (or
 *    +/- followed by a non-numeric payload) is executed as a formula by
 *    Excel / LibreOffice / Google Sheets. Values typed by visitors end up in
 *    our exports, so those are prefixed with a single quote ("this is text").
 * 2. Readability: phone-style numbers starting with + or 0, and digit strings
 *    long enough that Excel would rewrite them in scientific notation, also
 *    get the quote so they display as typed.
 *
 * Everything else is exported unchanged.
 */

const FORMULA_START = /^[=@\t\r]/;
const FORMULA_SIGN = /^[+-][^\d\s()./-]/;

/** Phone-style values: "+36 30 123 4567", "06-1-234-5678". */
const PHONE_STYLE = /^\+?[\d\s()./-]+$/;

/** Digit count at which Excel switches to scientific notation. */
const EXCEL_MAX_DIGITS = 11;

function digitsOf(text: string): string {
  return text.replace(/\D/g, "");
}

/** Returns the value as a cell that can never be read as a formula. */
export function safeCell<T extends string | number | null | undefined>(
  value: T,
): string | number {
  if (value == null) return "";
  if (typeof value === "number") return value;
  const text = String(value);
  if (FORMULA_START.test(text) || FORMULA_SIGN.test(text)) return `'${text}`;
  if (PHONE_STYLE.test(text)) {
    const digits = digitsOf(text);
    if (
      text.startsWith("+") ||
      text.startsWith("0") ||
      digits.length > EXCEL_MAX_DIGITS
    ) {
      return `'${text}`;
    }
  }
  return text;
}

/**
 * Same as safeCell, but leaves phone-style values ("+36…", "06…") untouched.
 * Only for newsletter-provider CSV imports, where a leading quote would be
 * stored as part of the phone field and break the upload.
 */
export function safeCellKeepPhones<T extends string | number | null | undefined>(
  value: T,
): string | number {
  if (value == null) return "";
  if (typeof value === "number") return value;
  const text = String(value);
  if (FORMULA_START.test(text) || FORMULA_SIGN.test(text)) return `'${text}`;
  return text;
}

/** Neutralises every cell of a row. */
export function safeRow(
  row: readonly (string | number | null | undefined)[],
): (string | number)[] {
  return row.map((cell) => safeCell(cell));
}
