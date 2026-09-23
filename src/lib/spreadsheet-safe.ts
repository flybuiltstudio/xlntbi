/**
 * Spreadsheet formula neutralisation for exported cell values.
 *
 * A cell whose text starts with =, +, -, @, tab or carriage return is executed
 * as a formula by Excel / LibreOffice / Google Sheets. Values typed by
 * visitors (billing name, company, note, subscriber fields) end up in our CSV
 * and XLSX exports, so every string cell is prefixed with a single quote,
 * which spreadsheets treat as "this is text".
 */

const FORMULA_START = /^[=+\-@\t\r]/;

/**
 * Phone numbers and signed numbers start with + or - but can never be a
 * formula call, so they stay untouched: a leading quote would break provider
 * imports (e.g. "+36301234567" arriving as text in Mailchimp / Brevo).
 */
const PHONE_OR_NUMBER = /^[+-][\d\s()./-]+$/;

/** Returns the value as a cell that can never be read as a formula. */
export function safeCell<T extends string | number | null | undefined>(
  value: T,
): string | number {
  if (value == null) return "";
  if (typeof value === "number") return value;
  const text = String(value);
  if (PHONE_OR_NUMBER.test(text)) return text;
  return FORMULA_START.test(text) ? `'${text}` : text;
}

/** Neutralises every cell of a row. */
export function safeRow(
  row: readonly (string | number | null | undefined)[],
): (string | number)[] {
  return row.map((cell) => safeCell(cell));
}
