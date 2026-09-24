import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";

import {
  adminClearSecurityDecision,
  adminRunSecurityCheck,
  adminSecurityAutofix,
  adminSecurityFindings,
} from "@/lib/security-admin.functions";

type Finding = { finding_key: string; finding_type: string; detail: string };
type Decision = {
  finding_key: string;
  finding_type: string;
  decision: "keep" | "fix";
  detail: string | null;
  decided_at: string;
};
type Snapshot = { findings: Finding[]; decisions: Decision[]; ranAt: string };

type Choice = { value: "keep" | "fix"; label: string };

/** Human-readable meaning of every finding type, in Hungarian. */
const TYPE_INFO: Record<
  string,
  { title: string; auto: boolean; help: string; choices?: Choice[]; defaultChoice?: "keep" | "fix" }
> = {
  no_rls: {
    title: "Nincs bekapcsolva a soralapú védelem",
    auto: true,
    help: "A tábla védelme kikapcsolt állapotban van. A javítás bekapcsolja — ez önmagában nem szűkíti az oldal működését.",
  },
  func_search_path: {
    title: "Kiemelt jogú függvény fix útvonal nélkül",
    auto: true,
    help: "A függvény kiemelt joggal fut, de nincs fixálva, hol keresi a táblákat. A javítás beállítja a fix útvonalat.",
  },
  public_bucket: {
    title: "Nyilvános tároló",
    auto: true,
    help: "A tároló fájljai címmel bárki számára elérhetők. A javítás priváttá teszi.",
  },
  anon_policy: {
    title: "Bejelentkezés nélkül olvasható tábla",
    auto: false,
    defaultChoice: "keep",
    help: "Kívülről, a weboldal használata nélkül is olvasható. Ha szándékosan nyilvános (pl. termékkatalógus), hagyd így. A megszüntetés után az oldal és az Admin felület továbbra is olvassa.",
    choices: [
      { value: "keep", label: "Maradjon így — szándékosan nyilvános" },
      { value: "fix", label: "Nyilvános olvasás megszüntetése" },
    ],
  },
  anon_write: {
    title: "Bejelentkezés nélkül írható tábla",
    auto: false,
    defaultChoice: "fix",
    help: "Kívülről közvetlenül is lehet bele adatot írni. Az írás megszüntetése a javasolt: az űrlapok és az Admin műveletek változatlanul működnek.",
    choices: [
      { value: "fix", label: "Írás megszüntetése (javasolt)" },
      { value: "keep", label: "Maradjon így" },
    ],
  },
  cron_no_secret: {
    title: "Időzített feladat hitelesítés nélkül",
    auto: false,
    defaultChoice: "keep",
    help: "Az időzített feladat hitelesítő érték nélkül hívja a végpontot. A javítás a biztonságos tárolóból olvasott titokkal hívja tovább.",
    choices: [
      { value: "keep", label: "Maradjon így" },
      { value: "fix", label: "Hitelesítés bekapcsolása" },
    ],
  },
};

function infoFor(type: string) {
  return (
    TYPE_INFO[type] ?? {
      title: type,
      auto: false,
      help: "Ismeretlen találattípus — kézi átnézést igényel.",
      defaultChoice: "keep" as const,
    }
  );
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

export function SecurityCheckPanel() {
  const loadFindings = useServerFn(adminSecurityFindings);
  const runCheck = useServerFn(adminRunSecurityCheck);
  const autofix = useServerFn(adminSecurityAutofix);
  const clearDecision = useServerFn(adminClearSecurityDecision);

  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [choices, setChoices] = useState<Record<string, "keep" | "fix">>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [details, setDetails] = useState<string[]>([]);

  function applySnapshot(next: Snapshot) {
    setSnapshot(next);
    const defaults: Record<string, "keep" | "fix"> = {};
    for (const finding of next.findings) {
      const info = infoFor(finding.finding_type);
      if (!info.auto) defaults[finding.finding_key] = info.defaultChoice ?? "keep";
    }
    setChoices(defaults);
  }

  useEffect(() => {
    void (async () => {
      setBusy("load");
      try {
        applySnapshot((await loadFindings()) as Snapshot);
      } catch (e) {
        setMessage(e instanceof Error ? e.message : "Hiba történt.");
      }
      setBusy(null);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onRun() {
    setBusy("run");
    setMessage("");
    setDetails([]);
    try {
      const next = (await runCheck()) as Snapshot;
      applySnapshot(next);
      setMessage(
        next.findings.length === 0
          ? "Nincs kijavítatlan biztonsági találat."
          : `${next.findings.length} kijavítatlan találat.`,
      );
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Hiba történt.");
    }
    setBusy(null);
  }

  const findings = snapshot?.findings ?? [];
  const autoFindings = findings.filter((f) => infoFor(f.finding_type).auto);
  const choiceFindings = findings.filter((f) => !infoFor(f.finding_type).auto);
  const chosenFixes = choiceFindings.filter((f) => choices[f.finding_key] === "fix");
  const fixCount = autoFindings.length + chosenFixes.length;

  async function onFixAll() {
    if (findings.length === 0) return;
    if (
      chosenFixes.length > 0 &&
      !window.confirm(
        `Biztosan javítod? ${chosenFixes.length} olyan tétel is szerepel, ahol szabályt törlünk vagy hitelesítést kapcsolunk be. Ez nem visszavonható egy kattintással.`,
      )
    )
      return;
    setBusy("fix");
    setMessage("");
    setDetails([]);
    try {
      const result = (await autofix({ data: { decisions: choices } })) as {
        fixed: string[];
        skipped: string[];
        errors: string[];
        remaining: number;
      };
      setDetails([
        ...result.fixed.map((row) => `Javítva — ${row}`),
        ...result.skipped.map((row) => `Kihagyva — ${row}`),
        ...result.errors.map((row) => `Hiba — ${row}`),
      ]);
      setMessage(
        `${result.fixed.length} javítás lefutott. Kijavítatlan találat: ${result.remaining}.` +
          (result.errors.length > 0 ? ` ${result.errors.length} hiba történt.` : ""),
      );
      applySnapshot((await loadFindings()) as Snapshot);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Hiba történt.");
    }
    setBusy(null);
  }

  async function onClear(key: string) {
    if (!window.confirm("Visszavonod ezt a döntést? A következő ellenőrzésnél újra rákérdez.")) return;
    setBusy(`clear-${key}`);
    try {
      applySnapshot((await clearDecision({ data: { findingKey: key } })) as Snapshot);
      setMessage("A döntés visszavonva.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Hiba történt.");
    }
    setBusy(null);
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => void onRun()}
          disabled={busy !== null}
          className="rounded-md border border-input px-4 py-2 text-sm font-semibold text-foreground hover:bg-accent disabled:opacity-50"
        >
          {busy === "run" ? "Ellenőrzés…" : "Ellenőrzés futtatása most"}
        </button>
        <button
          type="button"
          onClick={() => void onFixAll()}
          disabled={busy !== null || fixCount === 0}
          className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
        >
          {busy === "fix" ? "Javítás…" : `Javítsd mindet (${fixCount})`}
        </button>
        {snapshot ? (
          <span className="text-sm text-muted-foreground">
            Ellenőrizve: {formatDate(snapshot.ranAt)} · {findings.length} kijavítatlan találat
          </span>
        ) : null}
      </div>

      {message ? (
        <p className="rounded-md border border-border bg-muted px-4 py-3 text-sm text-foreground">
          {message}
        </p>
      ) : null}

      {details.length > 0 ? (
        <ul className="space-y-1 rounded-md border border-border bg-card px-4 py-3 text-sm">
          {details.map((row) => (
            <li key={row}>{row}</li>
          ))}
        </ul>
      ) : null}

      {busy === "load" ? <p className="text-sm text-muted-foreground">Betöltés…</p> : null}

      {snapshot && findings.length === 0 && busy !== "load" ? (
        <p className="rounded-md border border-border bg-card px-4 py-3 text-sm text-foreground">
          Nincs kijavítatlan biztonsági találat.
        </p>
      ) : null}

      {autoFindings.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">
            Automatikusan javítható ({autoFindings.length})
          </h2>
          <ul className="space-y-3">
            {autoFindings.map((finding) => {
              const info = infoFor(finding.finding_type);
              return (
                <li
                  key={finding.finding_key}
                  className="rounded-xl border border-border bg-card px-4 py-3"
                >
                  <p className="font-semibold text-foreground">{info.title}</p>
                  <p className="mt-1 text-sm text-foreground">{finding.detail}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{info.help}</p>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      {choiceFindings.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">
            Itt te választasz ({choiceFindings.length})
          </h2>
          <p className="text-sm text-muted-foreground">
            A választásod eltárolódik, így a következő ellenőrzésnél ezekre már nem kérdez rá.
          </p>
          <ul className="space-y-3">
            {choiceFindings.map((finding) => {
              const info = infoFor(finding.finding_type);
              const current = choices[finding.finding_key] ?? info.defaultChoice ?? "keep";
              return (
                <li
                  key={finding.finding_key}
                  className="rounded-xl border border-border bg-card px-4 py-3"
                >
                  <p className="font-semibold text-foreground">{info.title}</p>
                  <p className="mt-1 text-sm text-foreground">{finding.detail}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{info.help}</p>
                  <div className="mt-3 space-y-2">
                    {(info.choices ?? [{ value: "keep", label: "Maradjon így" }]).map((choice) => (
                      <label
                        key={choice.value}
                        className="flex items-center gap-2 text-sm text-foreground"
                      >
                        <input
                          type="radio"
                          name={finding.finding_key}
                          value={choice.value}
                          checked={current === choice.value}
                          onChange={() =>
                            setChoices((prev) => ({
                              ...prev,
                              [finding.finding_key]: choice.value,
                            }))
                          }
                        />
                        {choice.label}
                      </label>
                    ))}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      {snapshot && snapshot.decisions.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">
            Elfogadott döntések ({snapshot.decisions.length})
          </h2>
          <p className="text-sm text-muted-foreground">
            Ezekre az ellenőrzés nem kérdez rá újra, és e-mailt sem küld róluk.
          </p>
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-3 py-2">Találat</th>
                  <th className="px-3 py-2">Döntés</th>
                  <th className="px-3 py-2">Mikor</th>
                  <th className="px-3 py-2">Művelet</th>
                </tr>
              </thead>
              <tbody>
                {snapshot.decisions.map((row) => (
                  <tr key={row.finding_key} className="border-t border-border">
                    <td className="px-3 py-2">
                      <span className="block text-foreground">
                        {row.detail ?? infoFor(row.finding_type).title}
                      </span>
                      <span className="block font-mono text-xs text-muted-foreground">
                        {row.finding_key}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      {row.decision === "fix" ? "Javítva / lezárva" : "Maradjon így"}
                    </td>
                    <td className="px-3 py-2">{formatDate(row.decided_at)}</td>
                    <td className="px-3 py-2">
                      <button
                        type="button"
                        onClick={() => void onClear(row.finding_key)}
                        disabled={busy !== null}
                        className="rounded-md border border-input px-3 py-1.5 text-sm text-foreground hover:bg-accent disabled:opacity-50"
                      >
                        Döntés visszavonása
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
    </div>
  );
}
