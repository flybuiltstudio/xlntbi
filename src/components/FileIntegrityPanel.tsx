import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";

import { adminLastFileIntegrity, adminRunFileIntegrity } from "@/lib/product-file-integrity.functions";

type Row = { path: string; size: number; ok: boolean; detail: string };
type Report = { ranAt: string; checked: number; broken: Row[]; rows: Row[] };

function mb(size: number) {
  return `${(size / (1024 * 1024)).toFixed(1).replace(".", ",")} MB`;
}
function hu(iso: string) {
  return new Intl.DateTimeFormat("hu-HU", {
    timeZone: "Europe/Budapest",
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(iso));
}

export function FileIntegrityPanel() {
  const run = useServerFn(adminRunFileIntegrity);
  const last = useServerFn(adminLastFileIntegrity);
  const [report, setReport] = useState<Report | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    last()
      .then((r) => setReport(r.report))
      .catch(() => setReport(null));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onRun() {
    setBusy(true);
    setError("");
    try {
      setReport(await run());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Hiba történt.");
    }
    setBusy(false);
  }

  const rows = report ? (showAll ? report.rows : report.broken) : [];

  return (
    <div className="space-y-4 text-sm">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onRun}
          disabled={busy}
          className="rounded-md bg-primary px-4 py-2 font-semibold text-primary-foreground disabled:opacity-60"
        >
          {busy ? "Ellenőrzés folyamatban…" : "Ellenőrzés most"}
        </button>
        {report ? (
          <span className="text-muted-foreground">
            Legutóbbi ellenőrzés: {hu(report.ranAt)} · {report.checked} fájl ·{" "}
            <strong className={report.broken.length ? "text-destructive" : "text-foreground"}>
              {report.broken.length} hibás
            </strong>
          </span>
        ) : (
          <span className="text-muted-foreground">Még nem futott ellenőrzés.</span>
        )}
      </div>
      {error ? <p className="text-destructive">{error}</p> : null}
      {report ? (
        <label className="flex items-center gap-2 text-muted-foreground">
          <input type="checkbox" checked={showAll} onChange={(e) => setShowAll(e.target.checked)} />
          Az ép fájlokat is mutasd
        </label>
      ) : null}
      {report && rows.length === 0 ? (
        <p className="text-foreground">Minden termékfájl ép.</p>
      ) : null}
      {rows.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="py-2 pr-3">Fájl</th>
                <th className="py-2 pr-3">Méret</th>
                <th className="py-2 pr-3">Állapot</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.path} className="border-b border-border">
                  <td className="py-2 pr-3 break-all">{r.path}</td>
                  <td className="py-2 pr-3 whitespace-nowrap">{mb(r.size)}</td>
                  <td className={`py-2 pr-3 ${r.ok ? "text-foreground" : "font-semibold text-destructive"}`}>
                    {r.ok ? "Rendben" : r.detail}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
