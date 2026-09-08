import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";

import {
  adminDeleteProductDescription,
  adminGenerateProductDescription,
  adminListProductDescriptions,
  adminListProductPrices,
  adminPublishProductDescription,
  adminRegenerateProductEnglish,
  adminResetProductPrice,
  adminSaveProductEnglish,
  adminSaveProductPrice,
} from "@/lib/product-admin.functions";
import type { ProductContentInfo } from "@/lib/product-content-admin.server";
import type { PriceSyncRow, PriceTierRow } from "@/lib/product-prices.server";
import { formatPrice, products } from "@/lib/products";

type Draft = {
  intro: string[];
  features: string[];
  why: string;
  summary: string;
  metaTitle: string;
  metaDescription: string;
};

const MAX_DOCX_BYTES = 10 * 1024 * 1024;

const linesOf = (value: string): string[] =>
  value
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

const textOf = (values: string[]): string => values.join("\n");

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("A fájlt nem sikerült beolvasni."));
    reader.onload = () => {
      const result = String(reader.result ?? "");
      resolve(result.includes(",") ? (result.split(",").pop() as string) : result);
    };
    reader.readAsDataURL(file);
  });
}

function formatDate(value: string): string {
  return new Date(value).toLocaleString("hu-HU", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const inputClass =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground";

/** One editable draft (Hungarian or English) inside the preview. */
function DraftEditor({
  title,
  hint,
  draft,
  onChange,
}: {
  title: string;
  hint: string;
  draft: Draft;
  onChange: (next: Draft) => void;
}) {
  return (
    <div className="rounded-lg border border-border bg-background p-4">
      <h4 className="text-sm font-bold text-foreground">{title}</h4>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      <div className="mt-3 space-y-3">
        <label className="block text-xs font-semibold text-foreground">
          Bevezető bekezdések (egy bekezdés egy sor)
          <textarea
            className={`${inputClass} mt-1 min-h-28`}
            value={textOf(draft.intro)}
            onChange={(e) => onChange({ ...draft, intro: linesOf(e.target.value) })}
          />
        </label>
        <label className="block text-xs font-semibold text-foreground">
          Funkciók (egy funkció egy sor)
          <textarea
            className={`${inputClass} mt-1 min-h-40`}
            value={textOf(draft.features)}
            onChange={(e) => onChange({ ...draft, features: linesOf(e.target.value) })}
          />
        </label>
        <label className="block text-xs font-semibold text-foreground">
          Kinek és miért hasznos
          <textarea
            className={`${inputClass} mt-1 min-h-24`}
            value={draft.why}
            onChange={(e) => onChange({ ...draft, why: e.target.value })}
          />
        </label>
        <label className="block text-xs font-semibold text-foreground">
          Rövid összefoglaló (terméklista kártya)
          <textarea
            className={`${inputClass} mt-1 min-h-16`}
            value={draft.summary}
            onChange={(e) => onChange({ ...draft, summary: e.target.value })}
          />
        </label>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="block text-xs font-semibold text-foreground">
            Oldalcím ({draft.metaTitle.length} karakter)
            <input
              className={`${inputClass} mt-1`}
              value={draft.metaTitle}
              onChange={(e) => onChange({ ...draft, metaTitle: e.target.value })}
            />
          </label>
          <label className="block text-xs font-semibold text-foreground">
            Meta leírás ({draft.metaDescription.length} karakter)
            <input
              className={`${inputClass} mt-1`}
              value={draft.metaDescription}
              onChange={(e) => onChange({ ...draft, metaDescription: e.target.value })}
            />
          </label>
        </div>
      </div>
    </div>
  );
}

/**
 * Word document -> AI-rewritten product description (Hungarian + English),
 * reviewed and edited before it goes live.
 */
export function ProductDescriptionPanel() {
  const loadOverrides = useServerFn(adminListProductDescriptions);
  const generate = useServerFn(adminGenerateProductDescription);
  const publish = useServerFn(adminPublishProductDescription);
  const regenerateEn = useServerFn(adminRegenerateProductEnglish);
  const saveEn = useServerFn(adminSaveProductEnglish);
  const remove = useServerFn(adminDeleteProductDescription);

  const [slug, setSlug] = useState(products[0]?.slug ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [inputKey, setInputKey] = useState(0);
  const [overrides, setOverrides] = useState<ProductContentInfo[] | null>(null);
  const [hu, setHu] = useState<Draft | null>(null);
  const [en, setEn] = useState<Draft | null>(null);
  const [busy, setBusy] = useState(false);
  const [enBusy, setEnBusy] = useState(false);
  const [saveBusy, setSaveBusy] = useState(false);
  const [restoreBusy, setRestoreBusy] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [warning, setWarning] = useState("");
  const [error, setError] = useState("");

  async function refresh() {
    try {
      const result = await loadOverrides();
      setOverrides(result.overrides);
    } catch {
      setOverrides([]);
    }
  }

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const productName = useMemo(
    () => products.find((p) => p.slug === slug)?.name ?? slug,
    [slug],
  );

  function reset() {
    setMessage("");
    setWarning("");
    setError("");
  }

  async function onGenerate() {
    if (!file || busy) return;
    setBusy(true);
    reset();
    try {
      if (file.size > MAX_DOCX_BYTES) {
        throw new Error("A fájl legfeljebb 10 MB lehet.");
      }
      if (!file.name.toLowerCase().endsWith(".docx")) {
        throw new Error(`Word (.docx) fájlt vártunk, a kiválasztott fájl: ${file.name}.`);
      }
      const fileBase64 = await fileToBase64(file);
      const result = await generate({
        data: { slug, fileName: file.name, fileBase64 },
      });
      if (!result.ok) throw new Error(result.error);
      setHu(result.draft.hu);
      setEn(result.draft.en);
      setWarning(result.draft.enError ?? "");
      setMessage(
        `${productName}: az AI elkészítette a leírást a Word dokumentum alapján (${result.documentChars.toLocaleString("hu-HU")} karakter). Nézd át, javítsd, majd tedd közzé.`,
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Hiba történt.");
    }
    setBusy(false);
  }

  async function onPublish() {
    if (!hu || saveBusy) return;
    setSaveBusy(true);
    reset();
    try {
      const result = await publish({
        data: { slug, fileName: file?.name ?? "kézi szerkesztés", hu, en },
      });
      if (!result.ok) throw new Error(result.error);
      setMessage(
        `${productName}: az új leírás élesben van a magyar${en ? " és az angol" : ""} oldalon.`,
      );
      setFile(null);
      setInputKey((k) => k + 1);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Hiba történt.");
    }
    setSaveBusy(false);
  }

  async function onSaveEnglishOnly() {
    if (!en || saveBusy) return;
    setSaveBusy(true);
    reset();
    try {
      const result = await saveEn({ data: { slug, en } });
      if (!result.ok) throw new Error(result.error);
      setMessage(`${productName}: csak az angol leírás frissült.`);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Hiba történt.");
    }
    setSaveBusy(false);
  }

  async function onRegenerateEnglish() {
    if (enBusy) return;
    setEnBusy(true);
    reset();
    try {
      const result = await regenerateEn({ data: { slug } });
      if (!result.ok) throw new Error(result.error);
      setEn(result.draft);
      setMessage(
        `${productName}: az angol változat újra elkészült a mentett magyar leírásból. Nézd át, majd mentsd.`,
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Hiba történt.");
    }
    setEnBusy(false);
  }

  async function onRestore(target: string) {
    if (restoreBusy) return;
    setRestoreBusy(target);
    reset();
    try {
      await remove({ data: { slug: target } });
      setMessage("A beépített, eredeti leírás állt vissza.");
      if (target === slug) {
        setHu(null);
        setEn(null);
      }
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Hiba történt.");
    }
    setRestoreBusy(null);
  }

  return (
    <section className="mt-10 rounded-xl border border-border bg-card p-6">
      <h2 className="text-xl font-bold text-foreground">Termékleírás frissítése Wordből</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Töltsd fel a termékről szóló Word dokumentumot. Az AI átnézi és a
        termékoldal hangvételéhez igazítva írja meg a leírást – csak abból, ami a
        dokumentumban szerepel, kitalált adat nélkül. Az angol változat
        automatikusan elkészül, de külön is újrafordíttatható és menthető.
        Közzététel előtt minden szövegbe bele tudsz javítani.
      </p>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <label className="block text-sm font-semibold text-foreground">
          Termék
          <select
            className={`${inputClass} mt-1`}
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value);
              setHu(null);
              setEn(null);
              reset();
            }}
          >
            {products.map((product) => (
              <option key={product.slug} value={product.slug}>
                {product.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-semibold text-foreground">
          Word dokumentum (.docx, max. 10 MB)
          <input
            key={inputKey}
            className={`${inputClass} mt-1`}
            type="file"
            accept=".docx"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </label>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
          disabled={!file || busy}
          onClick={() => void onGenerate()}
        >
          {busy ? "Az AI dolgozik…" : "Leírás készítése AI-val"}
        </button>
        <button
          type="button"
          className="rounded-md border border-border px-4 py-2 text-sm font-semibold text-foreground disabled:opacity-50"
          disabled={enBusy}
          onClick={() => void onRegenerateEnglish()}
        >
          {enBusy ? "Fordítás…" : "Csak az angol újrafordítása"}
        </button>
      </div>

      {message ? (
        <p className="mt-4 rounded-md bg-primary/10 px-3 py-2 text-sm text-foreground">
          {message}
        </p>
      ) : null}
      {warning ? (
        <p className="mt-3 rounded-md bg-amber-500/15 px-3 py-2 text-sm text-foreground">
          {warning}
        </p>
      ) : null}
      {error ? (
        <p className="mt-3 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      {hu ? (
        <div className="mt-6 space-y-4">
          <DraftEditor
            title="Magyar leírás – előnézet"
            hint="Ez kerül a magyar termékoldalra és a terméklista kártyájára."
            draft={hu}
            onChange={setHu}
          />
          {en ? (
            <DraftEditor
              title="Angol leírás – előnézet"
              hint="Ez kerül az angol termékoldalra."
              draft={en}
              onChange={setEn}
            />
          ) : null}
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
              disabled={saveBusy}
              onClick={() => void onPublish()}
            >
              {saveBusy ? "Mentés…" : "Közzététel (magyar + angol)"}
            </button>
            <button
              type="button"
              className="rounded-md border border-border px-4 py-2 text-sm font-semibold text-foreground disabled:opacity-50"
              disabled={saveBusy || !en}
              onClick={() => void onSaveEnglishOnly()}
            >
              Csak az angol mentése
            </button>
            <button
              type="button"
              className="rounded-md border border-border px-4 py-2 text-sm font-semibold text-muted-foreground"
              onClick={() => {
                setHu(null);
                setEn(null);
                reset();
              }}
            >
              Elvetés
            </button>
          </div>
        </div>
      ) : null}

      <div className="mt-8">
        <h3 className="text-sm font-bold text-foreground">
          Feltöltött leírással futó termékek
        </h3>
        {overrides === null ? (
          <p className="mt-2 text-sm text-muted-foreground">Betöltés…</p>
        ) : overrides.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">
            Még nincs feltöltött leírás: minden termék a beépített szöveget mutatja.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {overrides.map((row) => (
              <li
                key={row.slug}
                className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border px-3 py-2 text-sm"
              >
                <span className="text-foreground">
                  <strong>{row.productName}</strong> · {row.fileName} ·{" "}
                  {formatDate(row.updatedAt)} ·{" "}
                  {row.hasEnglish ? "angol is kész" : "angol nélkül"}
                </span>
                <button
                  type="button"
                  className="rounded-md border border-border px-3 py-1 text-xs font-semibold text-foreground disabled:opacity-50"
                  disabled={restoreBusy === row.slug}
                  onClick={() => void onRestore(row.slug)}
                >
                  {restoreBusy === row.slug ? "Visszaállítás…" : "Eredeti visszaállítása"}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

/** Per-license price editing with Stripe sync. */
export function ProductPricePanel() {
  const loadPrices = useServerFn(adminListProductPrices);
  const savePrice = useServerFn(adminSaveProductPrice);
  const resetPrice = useServerFn(adminResetProductPrice);

  const [rows, setRows] = useState<PriceTierRow[] | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [sync, setSync] = useState<PriceSyncRow[]>([]);
  const [error, setError] = useState("");

  async function refresh() {
    try {
      const result = await loadPrices();
      setRows(result.rows);
      setValues(
        Object.fromEntries(
          result.rows.map((row) => [`${row.slug}::${row.tierId}`, String(row.currentPrice)]),
        ),
      );
    } catch {
      setRows([]);
    }
  }

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const grouped = useMemo(() => {
    const map = new Map<string, PriceTierRow[]>();
    for (const row of rows ?? []) {
      const list = map.get(row.slug) ?? [];
      list.push(row);
      map.set(row.slug, list);
    }
    return [...map.entries()];
  }, [rows]);

  async function onSave(row: PriceTierRow) {
    const key = `${row.slug}::${row.tierId}`;
    if (busyKey) return;
    setBusyKey(key);
    setMessage("");
    setError("");
    setSync([]);
    try {
      const price = Number((values[key] ?? "").replace(/\s/g, ""));
      if (!Number.isInteger(price) || price <= 0) {
        throw new Error("Az ár csak pozitív, egész forintösszeg lehet.");
      }
      const result = await savePrice({ data: { slug: row.slug, tierId: row.tierId, price } });
      setSync(result.sync);
      if (!result.ok) throw new Error(result.error ?? "A mentés nem sikerült.");
      setMessage(
        `${row.productName} – ${row.tierLabel}: az új ár ${formatPrice(price)}. Az oldalon és a fizetésnél is ez érvényes.`,
      );
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Hiba történt.");
    }
    setBusyKey(null);
  }

  async function onReset(row: PriceTierRow) {
    const key = `${row.slug}::${row.tierId}`;
    if (busyKey) return;
    setBusyKey(key);
    setMessage("");
    setError("");
    setSync([]);
    try {
      const result = await resetPrice({ data: { slug: row.slug, tierId: row.tierId } });
      setSync(result.sync);
      if (!result.ok) throw new Error(result.error ?? "A visszaállítás nem sikerült.");
      setMessage(
        `${row.productName} – ${row.tierLabel}: visszaállt az eredeti ár (${formatPrice(row.catalogPrice)}).`,
      );
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Hiba történt.");
    }
    setBusyKey(null);
  }

  return (
    <section className="mt-10 rounded-xl border border-border bg-card p-6">
      <h2 className="text-xl font-bold text-foreground">Termékárak frissítése</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Licenccsomagonként állíthatod az árat. A mentés az oldalra, a
        megrendelőlapra és a bankkártyás fizetésre egyszerre érvényes: az új ár a
        fizetési szolgáltatóba is átkerül (teszt és éles környezetbe is), a
        korábbi ár helyére. Az árak véglegesek, ÁFA nem kerül rájuk.
      </p>

      {message ? (
        <p className="mt-4 rounded-md bg-primary/10 px-3 py-2 text-sm text-foreground">
          {message}
        </p>
      ) : null}
      {error ? (
        <p className="mt-3 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}
      {sync.length ? (
        <ul className="mt-3 space-y-1 text-xs">
          {sync.map((row) => (
            <li
              key={`${row.priceId}-${row.environment}`}
              className={row.ok ? "text-muted-foreground" : "text-destructive"}
            >
              {row.environment === "live" ? "Éles fizetés" : "Teszt fizetés"}: {row.message}
            </li>
          ))}
        </ul>
      ) : null}

      {rows === null ? (
        <p className="mt-4 text-sm text-muted-foreground">Betöltés…</p>
      ) : (
        <div className="mt-6 space-y-6">
          {grouped.map(([groupSlug, tierRows]) => (
            <div key={groupSlug} className="rounded-lg border border-border p-4">
              <h3 className="text-sm font-bold text-foreground">
                {tierRows[0]?.productName}
              </h3>
              <div className="mt-3 space-y-3">
                {tierRows.map((row) => {
                  const key = `${row.slug}::${row.tierId}`;
                  return (
                    <div
                      key={key}
                      className="flex flex-wrap items-end justify-between gap-3 border-t border-border pt-3 first:border-t-0 first:pt-0"
                    >
                      <div className="min-w-48">
                        <p className="text-sm font-semibold text-foreground">
                          {row.tierLabel}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Eredeti ár: {formatPrice(row.catalogPrice)}
                          {row.overridden ? " · módosított" : ""}
                        </p>
                        {row.stripeError ? (
                          <p className="text-xs text-destructive">{row.stripeError}</p>
                        ) : null}
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          className="w-32 rounded-md border border-input bg-background px-3 py-2 text-right text-sm text-foreground"
                          inputMode="numeric"
                          value={values[key] ?? ""}
                          onChange={(e) =>
                            setValues((prev) => ({ ...prev, [key]: e.target.value }))
                          }
                        />
                        <span className="text-sm text-muted-foreground">Ft</span>
                        <button
                          type="button"
                          className="rounded-md bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground disabled:opacity-50"
                          disabled={busyKey === key}
                          onClick={() => void onSave(row)}
                        >
                          {busyKey === key ? "Mentés…" : "Mentés"}
                        </button>
                        {row.overridden ? (
                          <button
                            type="button"
                            className="rounded-md border border-border px-3 py-2 text-xs font-semibold text-foreground disabled:opacity-50"
                            disabled={busyKey === key}
                            onClick={() => void onReset(row)}
                          >
                            Eredeti ár
                          </button>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
