import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";

import {
  adminDeleteStorageFiles,
  adminLastStorageReport,
  adminScanStorage,
} from "@/lib/storage-cleanup.functions";

type OrphanRow = { path: string; size: number | null; updatedAt: string | null };
type Report = {
  ranAt?: string;
  totalObjects?: number;
  referenced?: number;
  freshSkipped?: number;
  orphans?: OrphanRow[];
};

function formatSize(size: number | null): string {
  if (size === null) return "—";
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  const stamp = Date.parse(value);
  if (Number.isNaN(stamp)) return "—";
  return new Intl.DateTimeFormat("hu-HU", {
    timeZone: "Europe/Budapest",
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(stamp));
}

export function StorageCleanupPanel() {
  const scan = useServerFn(adminScanStorage);
  const lastReport = useServerFn(adminLastStorageReport);
  const deleteFiles = useServerFn(adminDeleteStorageFiles);

  const [report, setReport] = useState<Report | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    void (async () => {
      try {
        const result = await lastReport();
        if (result.report) setReport(result.report as Report);
      } catch {
        /* first load without a stored report is fine */
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onScan() {
    setBusy("scan");
    setMessage("");
    try {
      const result = await scan();
      setReport(result as Report);
      setSelected([]);
      setMessage(
        result.orphans.length === 0
          ? "Nincs hivatkozás nélküli fájl a tárolóban."
          : `${result.orphans.length} hivatkozás nélküli fájl.`,
      );
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Hiba történt.");
    }
    setBusy(null);
  }

  async function onDelete() {
    if (selected.length === 0) return;
    if (
      !window.confirm(
        `Biztosan véglegesen törlöd a kijelölt ${selected.length} fájlt a tárolóból? Ez nem visszavonható.`,
      )
    )
      return;
    setBusy("delete");
    setMessage("");
    try {
      const result = await deleteFiles({ data: { paths: selected } });
      if (!result.ok) {
        setMessage(result.error ?? "A törlés nem sikerült.");
      } else {
        setMessage(
          `${result.deleted.length} fájl törölve${
            result.skipped.length > 0
              ? `, ${result.skipped.length} kihagyva (időközben hivatkozás került rá)`
              : ""
          }.`,
        );
        setReport((prev) =>
          prev
            ? {
                ...prev,
                orphans: (prev.orphans ?? []).filter((row) => !result.deleted.includes(row.path)),
              }
            : prev,
        );
        setSelected([]);
      }
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Hiba történt.");
    }
    setBusy(null);
  }

  const orphans = report?.orphans ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => void onScan()}
          disabled={busy !== null}
          className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
        >
          {busy === "scan" ? "Ellenőrzés…" : "Ellenőrzés indítása"}
        </button>
        {report ? (
          <span className="text-sm text-muted-foreground">
            Utolsó futás: {formatDate(report.ranAt)} · {report.totalObjects ?? 0} fájl ·{" "}
            {report.referenced ?? 0} hivatkozott · {report.freshSkipped ?? 0} friss (kihagyva)
          </span>
        ) : null}
      </div>

      {message ? (
        <p className="rounded-md border border-border bg-muted px-4 py-3 text-sm text-foreground">
          {message}
        </p>
      ) : null}

      {orphans.length > 0 ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setSelected(orphans.map((row) => row.path))}
              className="rounded-md border border-input px-3 py-1.5 text-sm text-foreground hover:bg-accent"
            >
              Mind kijelöl
            </button>
            <button
              type="button"
              onClick={() => setSelected([])}
              className="rounded-md border border-input px-3 py-1.5 text-sm text-foreground hover:bg-accent"
            >
              Kijelölés törlése
            </button>
            <button
              type="button"
              onClick={() => void onDelete()}
              disabled={selected.length === 0 || busy !== null}
              className="rounded-md bg-destructive px-4 py-2 text-sm font-semibold text-destructive-foreground hover:opacity-90 disabled:opacity-50"
            >
              {busy === "delete" ? "Törlés…" : `Kijelöltek törlése (${selected.length})`}
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-3 py-2">Kijelöl</th>
                  <th className="px-3 py-2">Fájl útvonala</th>
                  <th className="px-3 py-2">Méret</th>
                  <th className="px-3 py-2">Módosítva</th>
                </tr>
              </thead>
              <tbody>
                {orphans.map((row) => (
                  <tr key={row.path} className="border-t border-border">
                    <td className="px-3 py-2">
                      <input
                        type="checkbox"
                        checked={selected.includes(row.path)}
                        onChange={(e) =>
                          setSelected((prev) =>
                            e.target.checked
                              ? [...prev, row.path]
                              : prev.filter((p) => p !== row.path),
                          )
                        }
                        aria-label={`${row.path} kijelölése`}
                      />
                    </td>
                    <td className="px-3 py-2 font-mono text-xs">{row.path}</td>
                    <td className="px-3 py-2">{formatSize(row.size)}</td>
                    <td className="px-3 py-2">{formatDate(row.updatedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : report ? (
        <p className="text-sm text-muted-foreground">
          Nincs hivatkozás nélküli fájl — a tárolóban minden fájlra mutat élő hivatkozás.
        </p>
      ) : (
        <p className="text-sm text-muted-foreground">
          Indítsd el az ellenőrzést, vagy nézd meg a heti karbantartás legutóbbi jelentését.
        </p>
      )}
    </div>
  );
}
