/**
 * Live Hungarian tax number check through the NAV Online Invoice
 * (Online Számla) v3.0 queryTaxpayer operation.
 *
 * Fail-open by design, exactly like the VIES check: the order is only rejected
 * when NAV explicitly answers that the tax number is not a valid taxpayer.
 * Missing credentials, timeouts, HTTP errors, NAV outages or any unexpected
 * payload result in "unknown" and the order proceeds.
 */

import { sha3_512 } from "js-sha3";

const NAV_BASE = "https://api.onlineszamla.nav.gov.hu/invoiceService/v3";
const TIMEOUT_MS = 8000;

export type NavTaxpayerResult = {
  status: "valid" | "invalid" | "unknown";
  /** Registered taxpayer name, when NAV returns one. */
  name?: string | null;
  /** Registered address as a single line, when NAV returns one. */
  address?: string | null;
  /** Why the check could not be completed (only for "unknown"). */
  reason?: string;
};

/** Bare 8-digit base of a Hungarian tax number, or null when not recognisable. */
export function hungarianTaxBase(taxNumber: string | null | undefined): string | null {
  const compact = (taxNumber ?? "").replace(/[\s.\-/]/g, "").toUpperCase();
  const digits = compact.startsWith("HU") ? compact.slice(2) : compact;
  if (!/^\d{8}(\d{3})?$/.test(digits)) return null;
  return digits.slice(0, 8);
}

async function sha512Hex(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-512", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
}

function navTimestamps(now: Date): { iso: string; signature: string } {
  const p = (n: number, len = 2) => String(n).padStart(len, "0");
  const y = now.getUTCFullYear();
  const mo = p(now.getUTCMonth() + 1);
  const d = p(now.getUTCDate());
  const h = p(now.getUTCHours());
  const mi = p(now.getUTCMinutes());
  const s = p(now.getUTCSeconds());
  return {
    iso: `${y}-${mo}-${d}T${h}:${mi}:${s}.${p(now.getUTCMilliseconds(), 3)}Z`,
    signature: `${y}${mo}${d}${h}${mi}${s}`,
  };
}

function randomRequestId(): string {
  const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
  const bytes = crypto.getRandomValues(new Uint8Array(20));
  let out = "R";
  for (const b of bytes) out += alphabet[b % alphabet.length];
  return out;
}

function xmlEscape(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function tagText(xml: string, tag: string): string | null {
  const m = new RegExp(`<(?:[A-Za-z0-9]+:)?${tag}[^>]*>([\\s\\S]*?)</(?:[A-Za-z0-9]+:)?${tag}>`).exec(
    xml,
  );
  return m ? m[1]!.trim() : null;
}

/**
 * Queries NAV for a Hungarian tax number. Returns "unknown" for anything that
 * is not a Hungarian tax number, or when the query cannot be completed.
 */
export async function checkNavTaxNumber(
  taxNumber: string | null | undefined,
): Promise<NavTaxpayerResult> {
  const base = hungarianTaxBase(taxNumber);
  if (!base) return { status: "unknown", reason: "nem magyar adószám" };

  const login = process.env["NAV_TECH_LOGIN"];
  const password = process.env["NAV_TECH_PASSWORD"];
  const signKey = process.env["NAV_SIGN_KEY"];
  const ownTaxNumber = process.env["NAV_TAX_NUMBER"];
  if (!login || !password || !signKey || !ownTaxNumber) {
    return { status: "unknown", reason: "NAV technikai felhasználó nincs beállítva" };
  }

  const requestId = randomRequestId();
  const { iso, signature } = navTimestamps(new Date());
  const passwordHash = await sha512Hex(password);
  const requestSignature = sha3_512(`${requestId}${signature}${signKey}`).toUpperCase();
  const softwareId = `HU${ownTaxNumber.slice(0, 8)}XLNTBI01`.slice(0, 18);

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<QueryTaxpayerRequest xmlns="http://schemas.nav.gov.hu/OSA/3.0/api" xmlns:common="http://schemas.nav.gov.hu/NTCA/1.0/common">
  <common:header>
    <common:requestId>${requestId}</common:requestId>
    <common:timestamp>${iso}</common:timestamp>
    <common:requestVersion>3.0</common:requestVersion>
    <common:headerVersion>1.0</common:headerVersion>
  </common:header>
  <common:user>
    <common:login>${xmlEscape(login)}</common:login>
    <common:passwordHash cryptoType="SHA-512">${passwordHash}</common:passwordHash>
    <common:taxNumber>${xmlEscape(ownTaxNumber.slice(0, 8))}</common:taxNumber>
    <common:requestSignature cryptoType="SHA3-512">${requestSignature}</common:requestSignature>
  </common:user>
  <software>
    <softwareId>${softwareId}</softwareId>
    <softwareName>xlntbi</softwareName>
    <softwareOperation>LOCAL_SOFTWARE</softwareOperation>
    <softwareMainVersion>1.0</softwareMainVersion>
    <softwareDevName>Sarinay David</softwareDevName>
    <softwareDevContact>info@xlntbi.hu</softwareDevContact>
    <softwareDevCountryCode>HU</softwareDevCountryCode>
    <softwareDevTaxNumber>${xmlEscape(ownTaxNumber.slice(0, 8))}</softwareDevTaxNumber>
  </software>
  <taxNumber>${base}</taxNumber>
</QueryTaxpayerRequest>`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${NAV_BASE}/queryTaxpayer`, {
      method: "POST",
      signal: controller.signal,
      headers: { "Content-Type": "application/xml", Accept: "application/xml" },
      body,
    });
    const xml = await res.text();
    if (!res.ok) {
      const code = tagText(xml, "errorCode") ?? `HTTP ${res.status}`;
      return { status: "unknown", reason: `NAV hiba: ${code}` };
    }
    const funcCode = tagText(xml, "funcCode");
    if (funcCode !== "OK") {
      const code = tagText(xml, "errorCode") ?? funcCode ?? "ismeretlen";
      return { status: "unknown", reason: `NAV válasz: ${code}` };
    }
    const validity = tagText(xml, "taxpayerValidity");
    if (validity === "false") return { status: "invalid" };
    if (validity !== "true") {
      // No taxpayerValidity element at all: NAV does not know this number.
      return { status: "invalid" };
    }
    const name = tagText(xml, "taxpayerShortName") ?? tagText(xml, "taxpayerName");
    const city = tagText(xml, "city");
    const postal = tagText(xml, "postalCode");
    const street = tagText(xml, "streetName");
    const publicPlace = tagText(xml, "publicPlaceCategory");
    const number = tagText(xml, "number");
    const address =
      [postal, city, [street, publicPlace, number].filter(Boolean).join(" ")]
        .filter(Boolean)
        .join(", ") || null;
    return { status: "valid", name: name ?? null, address };
  } catch (e: any) {
    const reason = e?.name === "AbortError" ? "NAV időtúllépés" : (e?.message ?? "NAV hiba");
    return { status: "unknown", reason };
  } finally {
    clearTimeout(timer);
  }
}
