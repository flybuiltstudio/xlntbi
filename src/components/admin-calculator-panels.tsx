import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";

import { BackToTop } from "@/components/admin-toc";
import { EmbeddedCalculator } from "@/components/EmbeddedCalculator";
import {
  MAX_CALCULATOR_HTML_BYTES,
  type CustomCalculatorDraft,
} from "@/lib/custom-calculators";
import {
  adminDeleteCustomCalculator,
  adminListCustomCalculators,
  adminPrepareCustomCalculator,
  adminPublishCustomCalculator,
  adminSaveCalculatorOrder,
} from "@/lib/custom-calculators.functions";

type AdminRow = Awaited<
  ReturnType<typeof adminListCustomCalculators>
>["calculators"][number];

const inputClass =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground";

const CARD_WIDTH = 1200;
const CARD_HEIGHT = 480;

/**
 * Renders the calculator into an offscreen container, lets its script run,
 * then captures a card-sized screenshot of the top of the rendered page.
 */
async function captureCardImage(html: string, script: string): Promise<Blob> {
  const host = document.createElement("div");
  host.style.cssText = `position:fixed;left:-20000px;top:0;width:${CARD_WIDTH}px;background:#ffffff;z-index:-1;`;
  const inner = document.createElement("div");
  inner.innerHTML = html;
  host.appendChild(inner);
  document.body.appendChild(host);
  if (script) {
    const el = document.createElement("script");
    el.type = "text/javascript";
    el.text = script;
    host.appendChild(el);
  }
  // Give the calculator's own script time to initialise and render.
  await new Promise((resolve) => setTimeout(resolve, 1200));
  try {
    const html2canvas = (await import("html2canvas")).default;
    const canvas = await html2canvas(host, {
      backgroundColor: "#ffffff",
      scale: 1,
      logging: false,
    });
    if (canvas.width === 0 || canvas.height === 0) {
      throw new Error("üres kép");
    }
    const target = document.createElement("canvas");
    target.width = CARD_WIDTH;
    target.height = CARD_HEIGHT;
    const ctx = target.getContext("2d");
    if (!ctx) throw new Error("vászon nem elérhető");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);
    const ratio = CARD_WIDTH / canvas.width;
    const srcHeight = Math.min(canvas.height, CARD_HEIGHT / ratio);
    ctx.drawImage(canvas, 0, 0, canvas.width, srcHeight, 0, 0, CARD_WIDTH, srcHeight * ratio);
    const blob = await new Promise<Blob | null>((resolve) =>
      target.toBlob(resolve, "image/jpeg", 0.85),
    );
    if (!blob) throw new Error("a kép nem állítható elő");
    return blob;
  } finally {
    host.remove();
  }
}

/** Uploads a JPEG blob to a signed storage URL. */
function uploadBlob(path: string, token: string, blob: Blob): Promise<void> {
  return new Promise((resolve, reject) => {
    const baseUrl = import.meta.env["VITE_SUPABASE_URL"] as string;
    const url =
      `${baseUrl}/storage/v1/object/upload/sign/termekfajlok/${path}` +
      `?token=${encodeURIComponent(token)}`;
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.setRequestHeader("x-upsert", "true");
    xhr.setRequestHeader("Content-Type", "image/jpeg");
    xhr.setRequestHeader(
      "apikey",
      import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"] as string,
    );
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error(`A kép feltöltése nem sikerült (hibakód ${xhr.status}).`));
    };
    xhr.onerror = () => reject(new Error("A kép feltöltése megszakadt."));
    xhr.send(blob);
  });
}

function readFileText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("A fájl beolvasása nem sikerült."));
    reader.readAsText(file);
  });
}

/** One language's editable metadata in the preview step. */
function CalcDraftFields({
  title,
  name,
  intro,
  metaTitle,
  metaDescription,
  onName,
  onIntro,
  onMetaTitle,
  onMetaDescription,
}: {
  title: string;
  name: string;
  intro: string;
  metaTitle: string;
  metaDescription: string;
  onName: (value: string) => void;
  onIntro: (value: string) => void;
  onMetaTitle: (value: string) => void;
  onMetaDescription: (value: string) => void;
}) {
  return (
    <div className="rounded-lg border border-border bg-background p-4">
      <h4 className="text-sm font-bold text-foreground">{title}</h4>
      <div className="mt-3 space-y-3">
        <label className="block text-xs font-semibold text-foreground">
          Név
          <input
            className={`${inputClass} mt-1`}
            value={name}
            onChange={(e) => onName(e.target.value)}
          />
        </label>
        <label className="block text-xs font-semibold text-foreground">
          Rövid leírás (az oldal tetején jelenik meg)
          <textarea
            className={`${inputClass} mt-1 min-h-16`}
            value={intro}
            onChange={(e) => onIntro(e.target.value)}
          />
        </label>
        <label className="block text-xs font-semibold text-foreground">
          Oldalcím ({metaTitle.length} karakter)
          <input
            className={`${inputClass} mt-1`}
            value={metaTitle}
            onChange={(e) => onMetaTitle(e.target.value)}
          />
        </label>
        <label className="block text-xs font-semibold text-foreground">
          Meta leírás ({metaDescription.length} karakter)
          <input
            className={`${inputClass} mt-1`}
            value={metaDescription}
            onChange={(e) => onMetaDescription(e.target.value)}
          />
        </label>
      </div>
    </div>
  );
}

/**
 * Uploads a brand-new Hungarian calculator HTML, lets the admin review and
 * edit the AI-made English version and metadata, captures the card images
 * from the rendered calculators, and publishes both language versions.
 */
export function CalculatorUploadPanel() {
  const list = useServerFn(adminListCustomCalculators);
  const prepare = useServerFn(adminPrepareCustomCalculator);
  const publish = useServerFn(adminPublishCustomCalculator);
  const remove = useServerFn(adminDeleteCustomCalculator);

  const [rows, setRows] = useState<AdminRow[]>([]);
  const [name, setName] = useState("");
  const [position, setPosition] = useState("1");
  const [file, setFile] = useState<File | null>(null);
  const [inputKey, setInputKey] = useState(0);
  const [draft, setDraft] = useState<CustomCalculatorDraft | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const refresh = async () => setRows((await list()).calculators);

  useEffect(() => {
    void (async () => {
      const result = await list();
      setRows(result.calculators);
      const next = result.calculators.reduce((max, row) => Math.max(max, row.position), 0) + 1;
      setPosition(String(next));
    })().catch(() => setRows([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const reset = () => {
    setDraft(null);
    setName("");
    setFile(null);
    setInputKey((k) => k + 1);
  };

  const runPrepare = async () => {
    setError(null);
    setMessage(null);
    if (!file) {
      setError("Töltsd fel a kalkulátor magyar .html fájlját.");
      return;
    }
    if (file.size > MAX_CALCULATOR_HTML_BYTES) {
      setError("A fájl legfeljebb 5 MB lehet.");
      return;
    }
    setBusy(true);
    try {
      const result = await prepare({
        data: { name, fileName: file.name, content: await readFileText(file) },
      });
      if (!result.ok) throw new Error(result.error);
      setDraft(result.draft);
      setMessage(
        "Az AI elkészítette az angol változatot és a leírásokat. Nézd át, javíts bele, majd tedd közzé.",
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Hiba történt.");
    }
    setBusy(false);
  };

  const runPublish = async () => {
    if (!draft || busy) return;
    setError(null);
    setMessage(null);
    setBusy(true);
    try {
      // The card images are captured from the rendered calculators BEFORE
      // anything is published; a failed capture stops the whole publish.
      let imageHu: Blob;
      let imageEn: Blob;
      try {
        imageHu = await captureCardImage(draft.htmlHu, draft.scriptHu);
        imageEn = await captureCardImage(draft.htmlEn, draft.scriptEn);
      } catch {
        throw new Error(
          "A kártyakép készítése nem sikerült, ezért a kalkulátor nem került közzétételre. Próbáld újra.",
        );
      }
      const result = await publish({
        data: { draft, position: Math.max(0, Number.parseInt(position, 10) - 1 || 0) },
      });
      if (!result.ok) throw new Error(result.error);
      await uploadBlob(result.imageUploadHu.path, result.imageUploadHu.token, imageHu);
      await uploadBlob(result.imageUploadEn.path, result.imageUploadEn.token, imageEn);
      setMessage(
        `Kész: a kalkulátor elérhető a /kalkulatorok/${result.slug} és a ` +
          `/en/calculators/${result.slug} oldalon, mindkét nyelv listájában és a sitemapben.`,
      );
      reset();
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Hiba történt.");
    }
    setBusy(false);
  };

  const runDelete = async (row: AdminRow) => {
    if (!window.confirm(`Biztosan törlöd a kalkulátort: ${row.nameHu}?`)) return;
    setBusy(true);
    setError(null);
    const result = await remove({ data: { slug: row.slug } });
    if (!result.ok) setError(result.error ?? "A törlés nem sikerült.");
    else setMessage(`${row.nameHu} törölve.`);
    await refresh();
    setBusy(false);
  };

  return (
    <section
      id="uj-kalkulator"
      className="mt-10 scroll-mt-24 rounded-xl border border-border bg-secondary/40 p-6"
    >
      <h2 className="text-xl font-bold text-foreground">Új kalkulátor feltöltése</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Töltsd fel a kalkulátor magyar .html fájlját: az AI elkészíti az angol
        változatot és a leírásokat, közzététel előtt mindkettőbe bele tudsz
        javítani. A kártyakép a feltöltött kalkulátorról készül (az angol
        kártya az angol változatból), és az oldal mindkét nyelven bekerül a
        kalkulátorlistába és a sitemapbe.
      </p>

      <div className="mt-5 grid gap-4 md:grid-cols-[2fr_1fr]">
        <label className="block text-xs font-semibold text-foreground">
          Kalkulátor magyar neve
          <input
            className={`${inputClass} mt-1`}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Például: Kamatkalkulátor"
          />
        </label>
        <label className="block text-xs font-semibold text-foreground">
          Sorszám a Kalkulátorok oldalon
          <input
            className={`${inputClass} mt-1`}
            value={position}
            inputMode="numeric"
            onChange={(e) => setPosition(e.target.value)}
          />
        </label>
      </div>

      <div className="mt-4 max-w-md">
        <label className="block text-xs font-semibold text-foreground">
          Kalkulátor fájlja (.html, max. 5 MB)
          <input
            key={inputKey}
            type="file"
            accept=".html"
            className={`${inputClass} mt-1`}
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </label>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          disabled={busy || name.trim().length < 3 || !file}
          onClick={() => void runPrepare()}
          className="rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50"
        >
          {busy && !draft ? "Előnézet készítése…" : "Előnézet készítése AI-val"}
        </button>
        {draft ? (
          <>
            <button
              type="button"
              disabled={busy}
              onClick={() => void runPublish()}
              className="rounded-md bg-brand-dark px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50"
            >
              {busy ? "Közzététel…" : "Kalkulátor közzététele"}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={reset}
              className="rounded-md border border-border px-5 py-2.5 text-sm font-semibold text-foreground"
            >
              Elvetés
            </button>
          </>
        ) : null}
      </div>

      {error ? <p className="mt-3 text-sm font-semibold text-destructive">{error}</p> : null}
      {message ? <p className="mt-3 text-sm text-foreground">{message}</p> : null}

      {draft ? (
        <div className="mt-6 space-y-4">
          <p className="text-sm text-muted-foreground">
            URL: <span className="font-mono">/kalkulatorok/{draft.slug}</span> és{" "}
            <span className="font-mono">/en/calculators/{draft.slug}</span>
          </p>
          <div className="grid gap-4 lg:grid-cols-2">
            <CalcDraftFields
              title="Magyar adatok"
              name={draft.nameHu}
              intro={draft.introHu}
              metaTitle={draft.metaTitleHu}
              metaDescription={draft.metaDescriptionHu}
              onName={(v) => setDraft({ ...draft, nameHu: v })}
              onIntro={(v) => setDraft({ ...draft, introHu: v })}
              onMetaTitle={(v) => setDraft({ ...draft, metaTitleHu: v })}
              onMetaDescription={(v) => setDraft({ ...draft, metaDescriptionHu: v })}
            />
            <CalcDraftFields
              title="Angol adatok"
              name={draft.nameEn}
              intro={draft.introEn}
              metaTitle={draft.metaTitleEn}
              metaDescription={draft.metaDescriptionEn}
              onName={(v) => setDraft({ ...draft, nameEn: v })}
              onIntro={(v) => setDraft({ ...draft, introEn: v })}
              onMetaTitle={(v) => setDraft({ ...draft, metaTitleEn: v })}
              onMetaDescription={(v) => setDraft({ ...draft, metaDescriptionEn: v })}
            />
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <div>
              <h4 className="mb-2 text-sm font-bold text-foreground">Magyar előnézet</h4>
              <div className="max-h-96 overflow-auto rounded-lg border border-border bg-background p-3">
                <EmbeddedCalculator html={draft.htmlHu} script={draft.scriptHu} />
              </div>
            </div>
            <div>
              <h4 className="mb-2 text-sm font-bold text-foreground">Angol előnézet</h4>
              <div className="max-h-96 overflow-auto rounded-lg border border-border bg-background p-3">
                <EmbeddedCalculator html={draft.htmlEn} script={draft.scriptEn} />
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {rows.length ? (
        <div className="mt-8">
          <h3 className="text-sm font-bold text-foreground">Feltöltött egyedi kalkulátorok</h3>
          <ul className="mt-3 space-y-2">
            {rows.map((row) => (
              <li
                key={row.slug}
                className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-background px-4 py-3 text-sm"
              >
                <span>
                  <strong className="text-foreground">{row.nameHu}</strong>{" "}
                  <span className="text-muted-foreground">
                    /kalkulatorok/{row.slug} · angol: {row.nameEn} ·{" "}
                    {row.hasImageHu && row.hasImageEn
                      ? "kártyaképek készen"
                      : "hiányzó kártyakép"}
                  </span>
                </span>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void runDelete(row)}
                  className="rounded-md border border-destructive px-3 py-1.5 text-xs font-semibold text-destructive disabled:opacity-50"
                >
                  Törlés
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <BackToTop />
    </section>
  );
}

/** Kalkulátorok sorrendje: fel/le gombokkal átrendezhető egyedi kalkulátorlista. */
type OrderRow = Awaited<ReturnType<typeof adminListCalculatorOrder>>["rows"][number];

export function CalculatorOrderPanel() {
  const list = useServerFn(adminListCalculatorOrder);
  const saveOrder = useServerFn(adminSaveCalculatorOrder);

  const [rows, setRows] = useState<OrderRow[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => setRows((await list()).rows))().catch(() => setRows([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function move(index: number, delta: number) {
    const target = index + delta;
    if (target < 0 || target >= rows.length || busy) return;
    const next = [...rows];
    const [item] = next.splice(index, 1);
    next.splice(target, 0, item!);
    setRows(next);
    setMessage(null);
    setError(null);
  }

  async function save() {
    if (busy) return;
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const ids = rows.map((row) => row.id);
      const result = await saveOrder({ data: { ids } });
      if (!result.ok) throw new Error(result.error);
      setMessage("A kalkulátorok sorrendje mentve (magyar és angol oldalon egyaránt).");
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Hiba történt.");
    }
    setBusy(false);
  }

  async function refresh() {
    setRows((await list()).rows);
  }

  return (
    <section
      id="kalkulator-sorrend"
      className="mt-10 scroll-mt-24 rounded-xl border border-border bg-secondary/40 p-6"
    >
      <h2 className="text-xl font-bold text-foreground">Kalkulátorok sorrendje</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        A feltöltött egyedi kalkulátorok sorrendje a Kalkulátorok oldalon. A fel/le
        gombokkal rendezd át, majd mentsd el.
      </p>

      {rows.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">
          Még nincs feltöltött egyedi kalkulátor.
        </p>
      ) : (
        <ol className="mt-4 space-y-2">
          {rows.map((row, index) => (
            <li
              key={row.slug}
              className="flex items-center justify-between gap-3 rounded-md border border-border bg-background px-4 py-3 text-sm"
            >
              <span className="flex items-center gap-3">
                <span className="text-muted-foreground tabular-nums">{index + 1}.</span>
                <strong className="text-foreground">{row.nameHu}</strong>
                <span className="text-muted-foreground">/ {row.nameEn}</span>
              </span>
              <span className="flex gap-1">
                <button
                  type="button"
                  disabled={busy || index === 0}
                  onClick={() => void move(index, -1)}
                  className="rounded-md border border-border px-2 py-1 text-xs font-semibold text-foreground hover:bg-accent disabled:opacity-40"
                  aria-label="Fel"
                >
                  ↑
                </button>
                <button
                  type="button"
                  disabled={busy || index === rows.length - 1}
                  onClick={() => void move(index, 1)}
                  className="rounded-md border border-border px-2 py-1 text-xs font-semibold text-foreground hover:bg-accent disabled:opacity-40"
                  aria-label="Le"
                >
                  ↓
                </button>
              </span>
            </li>
          ))}
        </ol>
      )}

      {rows.length > 0 ? (
        <div className="mt-5">
          <button
            type="button"
            disabled={busy}
            onClick={() => void save()}
            className="rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            {busy ? "Mentés…" : "Sorrend mentése"}
          </button>
        </div>
      ) : null}

      {error ? <p className="mt-3 text-sm font-semibold text-destructive">{error}</p> : null}
      {message ? <p className="mt-3 text-sm text-foreground">{message}</p> : null}

      <BackToTop />
    </section>
  );
}
