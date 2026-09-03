/**
 * Subscriber exports. Beyond the generic CSV/XLSX/XML/PDF table exports, each
 * external provider gets a CSV whose header row matches that provider's own
 * import screen, so the list can be uploaded without any manual mapping.
 */

import type { ListTable } from "./stats-export";

export type ExportSubscriber = {
  lastName: string;
  firstName: string;
  email: string;
  phone: string;
  company: string;
  status: string;
  source: string;
  createdAt: string;
  confirmedAt: string | null;
};

export const STATUS_LABEL: Record<string, string> = {
  pending: "Megerősítésre vár",
  confirmed: "Megerősített",
  unsubscribed: "Leiratkozott",
};

function dateHu(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleString("hu-HU", { timeZone: "Europe/Budapest" });
}

export function subscriberTable(rows: ExportSubscriber[]): ListTable {
  return {
    title: "Hírlevél feliratkozók",
    subtitle: `${rows.length} feliratkozó · letöltve: ${new Date().toLocaleString("hu-HU")}`,
    head: [
      "Vezetéknév",
      "Keresztnév",
      "E-mail",
      "Telefon",
      "Cégnév",
      "Állapot",
      "Forrás",
      "Feliratkozás",
      "Megerősítés",
    ],
    body: rows.map((r) => [
      r.lastName,
      r.firstName,
      r.email,
      r.phone,
      r.company,
      STATUS_LABEL[r.status] ?? r.status,
      r.source,
      dateHu(r.createdAt),
      dateHu(r.confirmedAt),
    ]),
  };
}

type ProviderCsv = {
  id: string;
  label: string;
  /** Provider imports expect comma separated files with these headers. */
  head: string[];
  row: (r: ExportSubscriber) => string[];
};

export const PROVIDER_CSV: ProviderCsv[] = [
  {
    id: "mailerlite",
    label: "MailerLite CSV",
    head: ["email", "name", "last_name", "phone", "company"],
    row: (r) => [r.email, r.firstName, r.lastName, r.phone, r.company],
  },
  {
    id: "emailoctopus",
    label: "EmailOctopus CSV",
    head: ["Email address", "First name", "Last name", "Phone", "Company"],
    row: (r) => [r.email, r.firstName, r.lastName, r.phone, r.company],
  },
  {
    id: "sender",
    label: "Sender CSV",
    head: ["email", "firstname", "lastname", "phone", "company"],
    row: (r) => [r.email, r.firstName, r.lastName, r.phone, r.company],
  },
  {
    id: "sendpulse",
    label: "SendPulse CSV",
    head: ["Email", "Name", "Lastname", "Phone", "Company"],
    row: (r) => [r.email, r.firstName, r.lastName, r.phone, r.company],
  },
  {
    id: "brevo",
    label: "Brevo CSV",
    head: ["EMAIL", "FIRSTNAME", "LASTNAME", "SMS", "COMPANY"],
    row: (r) => [r.email, r.firstName, r.lastName, r.phone, r.company],
  },
];

function csvCell(value: string): string {
  const text = value ?? "";
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/** Provider imports are comma separated UTF-8 files. */
export function exportProviderCsv(providerId: string, rows: ExportSubscriber[]) {
  const provider = PROVIDER_CSV.find((p) => p.id === providerId);
  if (!provider) return;
  const lines = [provider.head.join(",")];
  for (const row of rows) lines.push(provider.row(row).map(csvCell).join(","));
  const blob = new Blob(["\uFEFF" + lines.join("\r\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `hirlevel-${providerId}-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
