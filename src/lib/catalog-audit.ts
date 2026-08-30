/**
 * Shared types for the catalog self-check (Stripe prices + download files).
 *
 * Client-safe: no server imports here, so the admin panel can import the
 * types without pulling server-only modules into the browser bundle.
 */

export type AuditStatus = "ok" | "warn" | "error";

export type TierAuditRow = {
  slug: string;
  productName: string;
  tierId: string;
  tierLabel: string;
  /** Stripe price lookup key from the catalog. */
  priceId: string;
  /** Catalog price in HUF. */
  expectedPrice: number;
  /** Stripe unit amount converted back to HUF (null when the price is missing). */
  stripePrice: number | null;
  stripePriceId: string | null;
  stripeCurrency: string | null;
  stripeActive: boolean | null;
  stripeProductName: string | null;
  status: AuditStatus;
  issues: string[];
};

export type DownloadAuditRow = {
  slug: string;
  productName: string;
  /** Object path inside the private storage bucket. */
  storagePath: string | null;
  /** File name the buyer sees (admin upload wins over the catalog name). */
  fileName: string | null;
  fileSize: number | null;
  /** Issued download tokens for this product. */
  tokenCount: number;
  /** Tokens whose stored path differs from the current product path. */
  staleTokenCount: number;
  status: AuditStatus;
  issues: string[];
};

export type CatalogAuditReport = {
  environment: "sandbox" | "live";
  ranAt: string;
  tiers: TierAuditRow[];
  downloads: DownloadAuditRow[];
  summary: {
    tierCount: number;
    tierOk: number;
    tierWarn: number;
    tierError: number;
    productCount: number;
    downloadOk: number;
    downloadWarn: number;
    downloadError: number;
  };
  /** Set when the whole Stripe read failed (then `tiers` carries the error). */
  stripeError?: string;
};

export const AUDIT_STATUS_LABEL: Record<AuditStatus, string> = {
  ok: "Rendben",
  warn: "Figyelmeztetés",
  error: "Hiba",
};

/** CSV export of the full report (both tables, one after the other). */
export function auditReportToCsv(report: CatalogAuditReport): string {
  const esc = (value: unknown) => `"${String(value ?? "").replace(/"/g, '""')}"`;
  const lines: string[] = [];
  lines.push(
    [
      "tipus",
      "termek_slug",
      "termek_nev",
      "licensz_id",
      "licensz_nev",
      "lookup_key",
      "katalogus_ar_ft",
      "stripe_ar_ft",
      "stripe_aktiv",
      "statusz",
      "eszrevetelek",
    ]
      .map(esc)
      .join(";"),
  );

  for (const row of report.tiers) {
    lines.push(
      [
        "stripe",
        row.slug,
        row.productName,
        row.tierId,
        row.tierLabel,
        row.priceId,
        row.expectedPrice,
        row.stripePrice ?? "",
        row.stripeActive === null ? "" : row.stripeActive ? "igen" : "nem",
        AUDIT_STATUS_LABEL[row.status],
        row.issues.join(" | "),
      ]
        .map(esc)
        .join(";"),
    );
  }

  for (const row of report.downloads) {
    lines.push(
      [
        "letoltes",
        row.slug,
        row.productName,
        "",
        row.fileName ?? "",
        row.storagePath ?? "",
        "",
        row.fileSize ?? "",
        `tokenek: ${row.tokenCount} (elavult: ${row.staleTokenCount})`,
        AUDIT_STATUS_LABEL[row.status],
        row.issues.join(" | "),
      ]
        .map(esc)
        .join(";"),
    );
  }

  return `\uFEFF${lines.join("\r\n")}\r\n`;
}
