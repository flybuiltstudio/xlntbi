/**
 * Every product on the site is branded with an "XLNT " prefix. This helper is
 * the single place that enforces it, so new products (and names coming back
 * from Stripe) are always displayed consistently — and never doubled up.
 */

const PREFIX = "XLNT";

/**
 * Adds the "XLNT " prefix when it is missing. Idempotent and case-insensitive:
 * "xlnt Beszámoló", "XLNT  Beszámoló" and "XLNT Beszámoló" all normalize to
 * "XLNT Beszámoló"; an empty name is returned untouched.
 */
export function withXlntPrefix(name: string | null | undefined): string {
  const trimmed = (name ?? "").trim();
  if (!trimmed) return "";

  // Already prefixed (any casing, any amount of whitespace after it)?
  const match = /^xlnt(?:\s+|$)/i.exec(trimmed);
  if (match) {
    const rest = trimmed.slice(match[0].length).trim();
    return rest ? `${PREFIX} ${rest}` : PREFIX;
  }

  return `${PREFIX} ${trimmed}`;
}

/** True when the name already carries the brand prefix. */
export function hasXlntPrefix(name: string | null | undefined): boolean {
  return /^xlnt(?:\s+|$)/i.test((name ?? "").trim());
}
