/** Client-safe types for the weekly scheduled catalog audit. */

export type CatalogAuditCronState = {
  /** ISO timestamp of the last scheduled run. */
  lastRunAt: string | null;
  environment: string | null;
  errorCount: number;
  warnCount: number;
  /** True when the owner notification email was sent for that run. */
  notified: boolean;
  /** Set when the run itself failed. */
  error: string | null;
  issues: string[];
};
