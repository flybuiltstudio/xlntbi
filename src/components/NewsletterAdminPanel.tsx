import { useServerFn } from "@tanstack/react-start";
import {
  Download,
  Loader2,
  Mail,
  MailCheck,
  PlugZap,
  RefreshCw,
  Send,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { NewsletterEditor } from "@/components/NewsletterEditor";
import { inputClass } from "@/components/admin-panels";
import {
  getNewsletterSettings,
  listNewsletterCampaigns,
  listNewsletterSubscribers,
  saveNewsletterSettings,
  sendNewsletterCampaign,
  sendNewsletterTestEmail,
  syncNewsletterSubscribers,
  testNewsletterConnection,
} from "@/lib/newsletter-admin.functions";
import { NEWSLETTER_MODES, type NewsletterMode } from "@/lib/newsletter-schema";
import {
  PROVIDER_CSV,
  STATUS_LABEL,
  exportProviderCsv,
  subscriberTable,
  type ExportSubscriber,
} from "@/lib/newsletter-export";
import {
  exportTableCsv,
  exportTablePdf,
  exportTableXlsx,
  exportTableXml,
} from "@/lib/stats-export";

type Subscriber = Awaited<ReturnType<typeof listNewsletterSubscribers>>[number];
type Campaign = Awaited<ReturnType<typeof listNewsletterCampaigns>>[number];
type Settings = Awaited<ReturnType<typeof getNewsletterSettings>>;

const STATUS_CLASS: Record<string, string> = {
  confirmed: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  pending: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  unsubscribed: "bg-muted text-muted-foreground",
};

function dateHu(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("hu-HU", { timeZone: "Europe/Budapest" });
}

const actionBtn =
  "inline-flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm font-medium text-foreground transition hover:bg-muted disabled:opacity-50";
const primaryBtn =
  "inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50";

export function NewsletterAdminPanel() {
  const loadSubscribers = useServerFn(listNewsletterSubscribers);
  const loadSettings = useServerFn(getNewsletterSettings);
  const loadCampaigns = useServerFn(listNewsletterCampaigns);
  const saveSettings = useServerFn(saveNewsletterSettings);
  const testConnection = useServerFn(testNewsletterConnection);
  const syncNow = useServerFn(syncNewsletterSubscribers);
  const sendCampaign = useServerFn(sendNewsletterCampaign);
  const sendTestEmail = useServerFn(sendNewsletterTestEmail);

  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [mode, setMode] = useState<NewsletterMode>("own");
  const [fields, setFields] = useState<Record<string, string>>({});
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string>("");
  const [message, setMessage] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const [subject, setSubject] = useState("");
  const [html, setHtml] = useState("<p>Kedves Olvasó!</p><p></p>");
  const [testEmail, setTestEmail] = useState("");
  const [deliveryEmail, setDeliveryEmail] = useState("");

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const [subs, conf, camps] = await Promise.all([
        loadSubscribers(),
        loadSettings(),
        loadCampaigns(),
      ]);
      setSubscribers(subs);
      setSettings(conf);
      setMode(conf.mode);
      setCampaigns(camps);
    } catch (error) {
      setMessage({
        kind: "err",
        text: error instanceof Error ? error.message : "A hírlevél adatok betöltése nem sikerült.",
      });
    } finally {
      setLoading(false);
    }
  }, [loadCampaigns, loadSettings, loadSubscribers]);

  useEffect(() => {
    void reload();
  }, [reload]);

  // Non-secret provider values follow the selected mode.
  useEffect(() => {
    if (!settings) return;
    setFields({ ...(settings.providers[mode]?.values ?? {}) });
  }, [mode, settings]);

  const filtered = useMemo(
    () =>
      statusFilter === "all" ?
        subscribers
      : subscribers.filter((s) => s.status === statusFilter),
    [statusFilter, subscribers],
  );

  const exportRows: ExportSubscriber[] = useMemo(
    () =>
      filtered.map((s) => ({
        lastName: s.lastName,
        firstName: s.firstName,
        email: s.email,
        phone: s.phone,
        company: s.company,
        status: s.status,
        source: s.source,
        createdAt: s.createdAt,
        confirmedAt: s.confirmedAt,
      })),
    [filtered],
  );

  const counts = useMemo(
    () => ({
      confirmed: subscribers.filter((s) => s.status === "confirmed").length,
      pending: subscribers.filter((s) => s.status === "pending").length,
      unsubscribed: subscribers.filter((s) => s.status === "unsubscribed").length,
    }),
    [subscribers],
  );

  const modeEntry = NEWSLETTER_MODES.find((m) => m.id === mode)!;
  const stamp = new Date().toISOString().slice(0, 10);

  async function run(key: string, action: () => Promise<void>) {
    setBusy(key);
    setMessage(null);
    try {
      await action();
    } catch (error) {
      setMessage({
        kind: "err",
        text: error instanceof Error ? error.message : "A művelet nem sikerült.",
      });
    } finally {
      setBusy("");
    }
  }

  return (
    <div className="space-y-14">
      {message ? (
        <p
          className={
            message.kind === "ok" ?
              "rounded-md bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-400"
            : "rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive"
          }
        >
          {message.text}
        </p>
      ) : null}

      {/* ---------------- Mode ---------------- */}
      <section>
        <h2 className="flex items-center gap-2 text-xl font-bold text-foreground">
          <PlugZap className="h-5 w-5 text-primary" /> Hírlevél kezelése
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Válaszd ki, hogyan kezeled a feliratkozókat. A feliratkozók minden esetben a saját
          adatbázisodban is megmaradnak – külső rendszer választása esetén a megerősített
          feliratkozók oda is átkerülnek.
        </p>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <div className="space-y-3">
            {NEWSLETTER_MODES.map((entry, index) => (
              <label
                key={entry.id}
                className={`flex cursor-pointer gap-3 rounded-lg border p-4 transition ${
                  mode === entry.id ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"
                }`}
              >
                <input
                  type="radio"
                  name="newsletter-mode"
                  className="mt-1"
                  checked={mode === entry.id}
                  onChange={() => setMode(entry.id)}
                />
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-foreground">
                    {index + 1}) {entry.label}
                  </span>
                  <span className="mt-0.5 block text-sm text-muted-foreground">{entry.hint}</span>
                  {entry.id !== "own" && settings?.providers[entry.id] ? (
                    <span className="mt-1.5 block text-xs font-medium text-muted-foreground">
                      {settings.providers[entry.id]!.configured ?
                        "API-kulcs beállítva"
                      : "API-kulcs még nincs megadva"}
                    </span>
                  ) : null}
                </span>
              </label>
            ))}
          </div>

          <div className="space-y-4">
            {modeEntry.fields.length > 0 ? (
              <div className="grid gap-4 rounded-lg border border-border p-4 sm:grid-cols-2">
                {modeEntry.fields.map((field) => (
                  <label key={field.key} className="block text-sm">
                    <span className="font-medium text-foreground">{field.label}</span>
                    <input
                      type={field.secret ? "password" : "text"}
                      autoComplete="off"
                      className={inputClass}
                      placeholder={
                        field.secret ?
                          settings?.providers[mode]?.configured ?
                            "Beállítva – csak felülíráshoz írd be újra"
                          : "Ide illeszd be az API-kulcsot"
                        : ""
                      }
                      value={fields[field.key] ?? ""}
                      onChange={(event) =>
                        setFields((prev) => ({ ...prev, [field.key]: event.target.value }))
                      }
                    />
                  </label>
                ))}
                <p className="text-xs text-muted-foreground sm:col-span-2">
                  Az API-kulcsokat csak a szerver olvassa, a felületre soha nem kerülnek vissza.
                </p>
              </div>
            ) : null}

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                className={primaryBtn}
                disabled={busy === "save"}
                onClick={() =>
                  run("save", async () => {
                    const next = await saveSettings({ data: { mode, fields } });
                    setSettings(next);
                    setMessage({ kind: "ok", text: "A hírlevél beállítás mentva." });
                  })
                }
              >
                {busy === "save" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Beállítás mentése
              </button>

              {mode !== "own" ? (
                <>
                  <button
                    type="button"
                    className={actionBtn}
                    disabled={busy === "test"}
                    onClick={() =>
                      run("test", async () => {
                        const result = await testConnection({ data: { mode } });
                        setMessage(
                          result.ok ?
                            { kind: "ok", text: "A kapcsolat működik." }
                          : { kind: "err", text: `Nem sikerült a kapcsolat: ${result.error}` },
                        );
                      })
                    }
                  >
                    {busy === "test" ?
                      <Loader2 className="h-4 w-4 animate-spin" />
                    : <PlugZap className="h-4 w-4" />}
                    Kapcsolat tesztelése
                  </button>
                  <button
                    type="button"
                    className={actionBtn}
                    disabled={busy === "sync"}
                    onClick={() =>
                      run("sync", async () => {
                        const result = await syncNow();
                        if (!result.ok) {
                          setMessage({ kind: "err", text: result.error });
                          return;
                        }
                        setMessage({
                          kind: "ok",
                          text: `Szinkronizálva: ${result.synced} feliratkozó, hibás: ${result.failed}.${
                            result.lastError ? ` Utolsó hiba: ${result.lastError}` : ""
                          }`,
                        });
                        await reload();
                      })
                    }
                  >
                    {busy === "sync" ?
                      <Loader2 className="h-4 w-4 animate-spin" />
                    : <RefreshCw className="h-4 w-4" />}
                    Lista szinkronizálása
                  </button>
                </>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- Campaign (Levélküldő) ---------------- */}
      <section>
        <h2 className="flex items-center gap-2 text-xl font-bold text-foreground">
          <Mail className="h-5 w-5 text-primary" /> Levélküldő
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          A levél a beépített e-mail-rendszerrel megy ki a megerősített feliratkozóknak, automatikus
          leiratkozó linkkel. Küldés előtt érdemes tesztlevelet kérni magadnak.
        </p>

        <label className="mt-6 block text-sm">
          <span className="font-medium text-foreground">Tárgy</span>
          <input
            className={inputClass}
            value={subject}
            maxLength={160}
            onChange={(event) => setSubject(event.target.value)}
            placeholder="Például: Új Excel-eszközök és határidők"
          />
        </label>

        <div className="mt-4 text-sm">
          <span className="font-medium text-foreground">A levél szövege</span>
          <NewsletterEditor value={html} onChange={setHtml} />
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="font-medium text-foreground">Teszt e-mail cím</span>
            <input
              className={inputClass}
              value={testEmail}
              onChange={(event) => setTestEmail(event.target.value)}
              placeholder="sajat@cimem.hu"
            />
          </label>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            className={actionBtn}
            disabled={busy === "test-send"}
            onClick={() =>
              run("test-send", async () => {
                const result = await sendCampaign({
                  data: { subject, html, testEmail, testOnly: true },
                });
                setMessage(
                  result.ok ?
                    { kind: "ok", text: "A tesztlevél elment." }
                  : { kind: "err", text: result.error },
                );
              })
            }
          >
            {busy === "test-send" ?
              <Loader2 className="h-4 w-4 animate-spin" />
            : <Send className="h-4 w-4" />}
            Tesztlevél küldése
          </button>
          <button
            type="button"
            className={primaryBtn}
            disabled={busy === "send"}
            onClick={() =>
              run("send", async () => {
                if (
                  !window.confirm(
                    `Kiküldöm a levelet ${counts.confirmed} megerősített feliratkozónak. Folytatom?`,
                  )
                ) {
                  return;
                }
                const result = await sendCampaign({
                  data: { subject, html, testEmail, testOnly: false },
                });
                if (!result.ok) {
                  setMessage({ kind: "err", text: result.error });
                  return;
                }
                setMessage({
                  kind: "ok",
                  text: `Kiküldve: ${result.sent} levél, hibás: ${result.failed}.`,
                });
                setCampaigns(await loadCampaigns());
              })
            }
          >
            {busy === "send" ?
              <Loader2 className="h-4 w-4 animate-spin" />
            : <Send className="h-4 w-4" />}
            Kiküldés a listára
          </button>
        </div>

        <div className="mt-6 rounded-lg border border-border bg-muted/30 p-4">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <MailCheck className="h-4 w-4" />
            Kézbesítési teszt
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Küldj egy próbalevelet bármelyik sablonnal a megadott címre, és nézd meg,
            hogy a beérkező üzenetek közé vagy a Levélszemétbe kerül-e. Feladó:{" "}
            <span className="font-medium text-foreground">noreply@notify.xlntbi.hu</span>
          </p>
          <label className="mt-3 block text-sm sm:max-w-sm">
            <span className="font-medium text-foreground">Címzett e-mail cím</span>
            <input
              className={inputClass}
              value={deliveryEmail}
              onChange={(event) => setDeliveryEmail(event.target.value)}
              placeholder="sajat@cimem.hu"
            />
          </label>
          <div className="mt-3 flex flex-wrap gap-3">
            {(
              [
                { key: "hirlevel-megerosites", label: "Megerősítő sablon küldése" },
                { key: "hirlevel", label: "Hírlevél sablon küldése" },
              ] as const
            ).map((item) => (
              <button
                key={item.key}
                type="button"
                className={actionBtn}
                disabled={busy === `delivery-${item.key}`}
                onClick={() =>
                  run(`delivery-${item.key}`, async () => {
                    const to = deliveryEmail.trim();
                    if (!to) {
                      setMessage({ kind: "err", text: "Adj meg egy címzett e-mail címet." });
                      return;
                    }
                    const result = await sendTestEmail({ data: { template: item.key, to } });
                    setMessage(
                      result.ok ?
                        {
                          kind: "ok",
                          text: `Teszt levél elküldve a ${result.to} címre (feladó: ${result.from}). Ha nem látod, nézd meg a Levélszemét mappát is.`,
                        }
                      : { kind: "err", text: result.error },
                    );
                  })
                }
              >
                {busy === `delivery-${item.key}` ?
                  <Loader2 className="h-4 w-4 animate-spin" />
                : <MailCheck className="h-4 w-4" />}
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- Subscribers (Feliratkozók) ---------------- */}
      <section>
        <h2 className="flex items-center gap-2 text-xl font-bold text-foreground">
          <Users className="h-5 w-5 text-primary" /> Feliratkozók
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Megerősített: {counts.confirmed} · Megerősítésre vár: {counts.pending} · Leiratkozott:{" "}
          {counts.unsubscribed}
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <select
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="all">Minden állapot</option>
            <option value="confirmed">Megerősített</option>
            <option value="pending">Megerősítésre vár</option>
            <option value="unsubscribed">Leiratkozott</option>
          </select>
          <button type="button" className={actionBtn} onClick={() => void reload()}>
            <RefreshCw className="h-4 w-4" /> Frissítés
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            className={actionBtn}
            onClick={() => exportTableCsv(`hirlevel-${stamp}.csv`, subscriberTable(exportRows))}
          >
            <Download className="h-4 w-4" /> CSV
          </button>
          <button
            type="button"
            className={actionBtn}
            onClick={() =>
              void exportTableXlsx(
                `hirlevel-${stamp}.xlsx`,
                "Feliratkozók",
                subscriberTable(exportRows),
              )
            }
          >
            <Download className="h-4 w-4" /> Excel
          </button>
          <button
            type="button"
            className={actionBtn}
            onClick={() => exportTableXml(`hirlevel-${stamp}.xml`, subscriberTable(exportRows))}
          >
            <Download className="h-4 w-4" /> XML
          </button>
          <button
            type="button"
            className={actionBtn}
            onClick={() => void exportTablePdf(`hirlevel-${stamp}.pdf`, subscriberTable(exportRows))}
          >
            <Download className="h-4 w-4" /> PDF
          </button>
          {PROVIDER_CSV.map((provider) => (
            <button
              key={provider.id}
              type="button"
              className={actionBtn}
              onClick={() => exportProviderCsv(provider.id, exportRows)}
            >
              <Download className="h-4 w-4" /> {provider.label}
            </button>
          ))}
        </div>

        <div className="mt-5 overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/60 text-left">
              <tr>
                <th className="px-3 py-2 font-semibold">Név</th>
                <th className="px-3 py-2 font-semibold">E-mail</th>
                <th className="px-3 py-2 font-semibold">Telefon</th>
                <th className="px-3 py-2 font-semibold">Cégnév</th>
                <th className="px-3 py-2 font-semibold">Állapot</th>
                <th className="px-3 py-2 font-semibold">Feliratkozás</th>
                <th className="px-3 py-2 font-semibold">Külső rendszer</th>
              </tr>
            </thead>
            <tbody>
              {loading ?
                <tr>
                  <td className="px-3 py-6 text-muted-foreground" colSpan={7}>
                    Betöltés…
                  </td>
                </tr>
              : filtered.length === 0 ?
                <tr>
                  <td className="px-3 py-6 text-muted-foreground" colSpan={7}>
                    Még nincs feliratkozó ebben az állapotban.
                  </td>
                </tr>
              : filtered.map((s) => (
                  <tr key={s.id} className="border-t border-border">
                    <td className="px-3 py-2">
                      {s.lastName} {s.firstName}
                    </td>
                    <td className="px-3 py-2">{s.email}</td>
                    <td className="px-3 py-2">{s.phone || "—"}</td>
                    <td className="px-3 py-2">{s.company || "—"}</td>
                    <td className="px-3 py-2">
                      <span
                        className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${
                          STATUS_CLASS[s.status] ?? "bg-muted text-muted-foreground"
                        }`}
                      >
                        {STATUS_LABEL[s.status] ?? s.status}
                      </span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">{dateHu(s.createdAt)}</td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">
                      {s.providerError ?
                        `Hiba: ${s.providerError}`
                      : s.providerSyncedAt ?
                        `${s.providerName} · ${dateHu(s.providerSyncedAt)}`
                      : "—"}
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </section>

      {/* ---------------- Sent campaigns (Elküldött hírlevelek) ---------------- */}
      <section>
        <h2 className="flex items-center gap-2 text-xl font-bold text-foreground">
          <Send className="h-5 w-5 text-primary" /> Elküldött hírlevelek
        </h2>
        <div className="mt-5 overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/60 text-left">
              <tr>
                <th className="px-3 py-2 font-semibold">Kiküldés</th>
                <th className="px-3 py-2 font-semibold">Tárgy</th>
                <th className="px-3 py-2 font-semibold">Címzett</th>
                <th className="px-3 py-2 font-semibold">Sikeres</th>
                <th className="px-3 py-2 font-semibold">Hibás</th>
                <th className="px-3 py-2 font-semibold">Küldte</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.length === 0 ?
                <tr>
                  <td className="px-3 py-6 text-muted-foreground" colSpan={6}>
                    Még nem küldtél hírlevelet.
                  </td>
                </tr>
              : campaigns.map((c) => (
                  <tr key={c.id} className="border-t border-border">
                    <td className="px-3 py-2 whitespace-nowrap">{dateHu(c.sentAt)}</td>
                    <td className="px-3 py-2">{c.subject}</td>
                    <td className="px-3 py-2">{c.recipients}</td>
                    <td className="px-3 py-2">{c.sentCount}</td>
                    <td className="px-3 py-2">{c.failedCount}</td>
                    <td className="px-3 py-2 text-muted-foreground">{c.createdByEmail ?? "—"}</td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
