import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";

import {
  adminCreateCategory,
  adminDeleteCategory,
  adminDeleteCustomProduct,
  adminListCategories,
  adminListCustomProducts,
  adminPrepareCustomProduct,
  adminPublishCustomProduct,
  adminRenameCategory,
} from "@/lib/custom-products.functions";
import type { CategoryAdminRow } from "@/lib/custom-categories.server";
import type { CustomProductInfo } from "@/lib/custom-products.server";
import { formatPrice } from "@/lib/products";

type Draft = {
  intro: string[];
  features: string[];
  why: string;
  summary: string;
  metaTitle: string;
  metaDescription: string;
};

type TierInput = { id: string; label: string; price: string; note: string };

const BUCKET = "termekfajlok";
const inputClass =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground";

// Raw lines while typing (empty lines kept), cleaned only on save — otherwise
// the controlled textarea would swallow a pressed Enter.
const linesOf = (value: string): string[] => value.split("\n");

const textOf = (values: string[]): string => values.join("\n");

const cleanLines = (values: string[]): string[] =>
  values.map((line) => line.trim()).filter((line) => line.length > 0);

const cleanDraft = (draft: Draft): Draft => ({
  ...draft,
  intro: cleanLines(draft.intro),
  features: cleanLines(draft.features),
  why: draft.why.trim(),
  summary: draft.summary.trim(),
  metaTitle: draft.metaTitle.trim(),
  metaDescription: draft.metaDescription.trim(),
});

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

/** Uploads a file to a signed storage URL, reporting progress. */
function uploadSigned(
  path: string,
  token: string,
  file: File,
  onProgress: (percent: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const baseUrl = import.meta.env["VITE_SUPABASE_URL"] as string;
    const url =
      `${baseUrl}/storage/v1/object/upload/sign/${BUCKET}/${path}` +
      `?token=${encodeURIComponent(token)}`;
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.setRequestHeader("x-upsert", "true");
    xhr.setRequestHeader("apikey", import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"] as string);
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && event.total > 0) {
        onProgress(Math.min(99, Math.round((event.loaded / event.total) * 100)));
      }
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress(100);
        resolve();
      } else {
        reject(new Error(`A feltöltés nem sikerült (HTTP ${xhr.status}).`));
      }
    };
    xhr.onerror = () => reject(new Error("A feltöltés megszakadt."));
    xhr.send(file);
  });
}

function DraftFields({
  title,
  draft,
  onChange,
}: {
  title: string;
  draft: Draft;
  onChange: (next: Draft) => void;
}) {
  return (
    <div className="rounded-lg border border-border bg-background p-4">
      <h4 className="text-sm font-bold text-foreground">{title}</h4>
      <div className="mt-3 space-y-3">
        <label className="block text-xs font-semibold text-foreground">
          Bevezető bekezdések (egy bekezdés egy sor)
          <textarea
            className={`${inputClass} mt-1 min-h-24`}
            value={textOf(draft.intro)}
            onChange={(e) => onChange({ ...draft, intro: linesOf(e.target.value) })}
          />
        </label>
        <label className="block text-xs font-semibold text-foreground">
          Funkciók (egy funkció egy sor)
          <textarea
            className={`${inputClass} mt-1 min-h-32`}
            value={textOf(draft.features)}
            onChange={(e) => onChange({ ...draft, features: linesOf(e.target.value) })}
          />
        </label>
        <label className="block text-xs font-semibold text-foreground">
          Kinek és miért hasznos
          <textarea
            className={`${inputClass} mt-1 min-h-20`}
            value={draft.why}
            onChange={(e) => onChange({ ...draft, why: e.target.value })}
          />
        </label>
        <label className="block text-xs font-semibold text-foreground">
          Rövid összefoglaló (kártya)
          <textarea
            className={`${inputClass} mt-1 min-h-16`}
            value={draft.summary}
            onChange={(e) => onChange({ ...draft, summary: e.target.value })}
          />
        </label>
        <label className="block text-xs font-semibold text-foreground">
          Oldalcím (meta title)
          <input
            className={`${inputClass} mt-1`}
            value={draft.metaTitle}
            onChange={(e) => onChange({ ...draft, metaTitle: e.target.value })}
          />
        </label>
        <label className="block text-xs font-semibold text-foreground">
          Meta leírás
          <textarea
            className={`${inputClass} mt-1 min-h-16`}
            value={draft.metaDescription}
            onChange={(e) => onChange({ ...draft, metaDescription: e.target.value })}
          />
        </label>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------ new product */

export function NewProductPanel() {
  const listProducts = useServerFn(adminListCustomProducts);
  const listCategories = useServerFn(adminListCategories);
  const prepare = useServerFn(adminPrepareCustomProduct);
  const publish = useServerFn(adminPublishCustomProduct);
  const remove = useServerFn(adminDeleteCustomProduct);

  const [rows, setRows] = useState<CustomProductInfo[]>([]);
  const [categories, setCategories] = useState<CategoryAdminRow[]>([]);
  const [name, setName] = useState("");
  const [categoryKey, setCategoryKey] = useState("");
  const [position, setPosition] = useState("1");
  const [tiers, setTiers] = useState<TierInput[]>([
    { id: "licenc", label: "Alapverzió licenc", price: "", note: "" },
  ]);
  const [docx, setDocx] = useState<File | null>(null);
  const [productFile, setProductFile] = useState<File | null>(null);
  const [image, setImage] = useState<File | null>(null);
  const [hu, setHu] = useState<Draft | null>(null);
  const [en, setEn] = useState<Draft | null>(null);
  const [slug, setSlug] = useState("");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [inputKey, setInputKey] = useState(0);

  const refresh = async () => {
    const [p, c] = await Promise.all([listProducts(), listCategories()]);
    setRows(p.products);
    setCategories(c.categories);
    setCategoryKey((current) => current || (c.categories[0]?.key ?? ""));
  };

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const reset = () => {
    setHu(null);
    setEn(null);
    setSlug("");
    setName("");
    setTiers([{ id: "licenc", label: "Alapverzió licenc", price: "", note: "" }]);
    setDocx(null);
    setProductFile(null);
    setImage(null);
    setPosition("1");
    setInputKey((k) => k + 1);
  };

  const runPrepare = async () => {
    setError(null);
    setMessage(null);
    if (!docx) {
      setError("Töltsd fel a leírást tartalmazó Word dokumentumot.");
      return;
    }
    setBusy(true);
    try {
      const result = await prepare({
        data: { name, fileName: docx.name, fileBase64: await fileToBase64(docx) },
      });
      if (!result.ok) throw new Error(result.error);
      setHu(result.hu);
      setEn(result.en);
      setSlug(result.slug);
      setMessage(
        result.en
          ? "Az AI elkészítette a magyar és az angol leírást. Nézd át, javíts bele, majd tedd közzé."
          : `A magyar leírás elkészült, az angol fordítás nem sikerült: ${result.enError ?? ""}`,
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Hiba történt.");
    }
    setBusy(false);
  };

  const runPublish = async () => {
    setError(null);
    setMessage(null);
    if (!hu) return;
    if (!productFile) {
      setError("Töltsd fel a terméket (xlsm, exe, zip vagy pdf).");
      return;
    }
    const parsedTiers = tiers.map((tier) => ({
      id: tier.id.trim(),
      label: tier.label.trim(),
      price: Number.parseInt(tier.price.replace(/\s/g, ""), 10),
      note: tier.note.trim() ? tier.note.trim() : null,
    }));
    if (parsedTiers.some((tier) => !Number.isInteger(tier.price))) {
      setError("Az árakat egész forintban add meg.");
      return;
    }
    setBusy(true);
    setProgress(0);
    try {
      const result = await publish({
        data: {
          slug,
          name,
          categoryKey,
          position: Math.max(0, Number.parseInt(position, 10) - 1 || 0),
          tiers: parsedTiers,
          hu: cleanDraft(hu),
          en: en ? cleanDraft(en) : null,
          fileName: productFile.name,
          fileSize: productFile.size,
          imageName: image?.name ?? null,
        },
      });
      if (!result.ok) throw new Error(result.error);
      await uploadSigned(result.fileUpload.path, result.fileUpload.token, productFile, setProgress);
      if (result.imageUpload && image) {
        await uploadSigned(result.imageUpload.path, result.imageUpload.token, image, () => {});
      }
      setMessage(
        `Kész: a termék elérhető a /termek/${result.slug} és a /en/product/${result.slug} oldalon, ` +
          "a Stripe termék és minden licencár létrejött a teszt és az éles környezetben is.",
      );
      reset();
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Hiba történt.");
    }
    setProgress(null);
    setBusy(false);
  };

  const runDelete = async (row: CustomProductInfo) => {
    if (!window.confirm(`Biztosan törlöd: ${row.name}?`)) return;
    setBusy(true);
    setError(null);
    const result = await remove({ data: { slug: row.slug } });
    if (!result.ok) setError(result.error ?? "A törlés nem sikerült.");
    else setMessage(`${row.name} törölve.`);
    await refresh();
    setBusy(false);
  };

  return (
    <section className="mt-10 rounded-xl border border-border bg-secondary/40 p-6">
      <h2 className="text-xl font-bold text-foreground">Új termék feltöltése</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        A termékfájl (xlsm, exe, zip vagy pdf) és a Word leírás feltöltése után az AI
        elkészíti a magyar leírást és az angol fordítást. Közzététel előtt bele tudsz
        javítani. A Stripe termék és minden licencár automatikusan létrejön a teszt és
        az éles környezetben is; ha az éles nem fogadja el, semmi nem jelenik meg az
        oldalon.
      </p>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <label className="block text-xs font-semibold text-foreground">
          Termék neve (az „XLNT” előtag automatikus)
          <input
            className={`${inputClass} mt-1`}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Például: Készletértékelő"
          />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block text-xs font-semibold text-foreground">
            Kategória
            <select
              className={`${inputClass} mt-1`}
              value={categoryKey}
              onChange={(e) => setCategoryKey(e.target.value)}
            >
              {categories.map((category) => (
                <option key={category.key} value={category.key}>
                  {category.title}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-xs font-semibold text-foreground">
            Hányadik a kategóriában
            <input
              className={`${inputClass} mt-1`}
              value={position}
              inputMode="numeric"
              onChange={(e) => setPosition(e.target.value)}
            />
          </label>
        </div>
      </div>

      <div className="mt-5">
        <p className="text-xs font-semibold text-foreground">Licenc típusok és árak (Ft)</p>
        <div className="mt-2 space-y-2">
          {tiers.map((tier, index) => (
            <div key={index} className="grid gap-2 md:grid-cols-[1fr_1.4fr_0.8fr_1.6fr_auto]">
              <input
                className={inputClass}
                value={tier.id}
                placeholder="azonosito"
                onChange={(e) =>
                  setTiers((list) =>
                    list.map((item, i) =>
                      i === index ? { ...item, id: e.target.value } : item,
                    ),
                  )
                }
              />
              <input
                className={inputClass}
                value={tier.label}
                placeholder="Megnevezés"
                onChange={(e) =>
                  setTiers((list) =>
                    list.map((item, i) =>
                      i === index ? { ...item, label: e.target.value } : item,
                    ),
                  )
                }
              />
              <input
                className={inputClass}
                value={tier.price}
                inputMode="numeric"
                placeholder="Ft"
                onChange={(e) =>
                  setTiers((list) =>
                    list.map((item, i) =>
                      i === index ? { ...item, price: e.target.value } : item,
                    ),
                  )
                }
              />
              <input
                className={inputClass}
                value={tier.note}
                placeholder="Megjegyzés (nem kötelező)"
                onChange={(e) =>
                  setTiers((list) =>
                    list.map((item, i) =>
                      i === index ? { ...item, note: e.target.value } : item,
                    ),
                  )
                }
              />
              {tiers.length > 1 ? (
                <button
                  type="button"
                  className="rounded-md border border-border px-3 text-xs font-semibold text-foreground"
                  onClick={() => setTiers((list) => list.filter((_, i) => i !== index))}
                >
                  Törlés
                </button>
              ) : (
                <span />
              )}
            </div>
          ))}
        </div>
        <button
          type="button"
          className="mt-2 rounded-md border border-border px-3 py-1.5 text-xs font-semibold text-foreground"
          onClick={() =>
            setTiers((list) => [...list, { id: "", label: "", price: "", note: "" }])
          }
        >
          + Licenc hozzáadása
        </button>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-3">
        <label className="block text-xs font-semibold text-foreground">
          Termékfájl (xlsm / exe / zip / pdf, max. 300 MB)
          <input
            key={`file-${inputKey}`}
            type="file"
            accept=".xlsm,.exe,.zip,.pdf"
            className={`${inputClass} mt-1`}
            onChange={(e) => setProductFile(e.target.files?.[0] ?? null)}
          />
        </label>
        <label className="block text-xs font-semibold text-foreground">
          Leírás (Word .docx)
          <input
            key={`docx-${inputKey}`}
            type="file"
            accept=".docx"
            className={`${inputClass} mt-1`}
            onChange={(e) => setDocx(e.target.files?.[0] ?? null)}
          />
        </label>
        <label className="block text-xs font-semibold text-foreground">
          Termékkép (nem kötelező: jpg / png / webp – ha üresen hagyod, AI generál egyet)
          <input
            key={`img-${inputKey}`}
            type="file"
            accept=".jpg,.jpeg,.png,.webp"
            className={`${inputClass} mt-1`}
            onChange={(e) => setImage(e.target.files?.[0] ?? null)}
          />
        </label>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          disabled={busy || !name || !docx}
          onClick={() => void runPrepare()}
          className="rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50"
        >
          {busy && !hu ? "Leírás készítése…" : "Leírás elkészítése AI-val"}
        </button>
        {hu ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => void runPublish()}
            className="rounded-md bg-brand-dark px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50"
          >
            {busy ? "Közzététel…" : "Termék közzététele"}
          </button>
        ) : null}
        {hu ? (
          <button
            type="button"
            disabled={busy}
            onClick={reset}
            className="rounded-md border border-border px-5 py-2.5 text-sm font-semibold text-foreground"
          >
            Elvetés
          </button>
        ) : null}
      </div>

      {progress !== null ? (
        <p className="mt-3 text-sm text-muted-foreground">Feltöltés: {progress}%</p>
      ) : null}
      {error ? <p className="mt-3 text-sm font-semibold text-destructive">{error}</p> : null}
      {message ? <p className="mt-3 text-sm text-foreground">{message}</p> : null}

      {hu ? (
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <DraftFields title="Magyar leírás" draft={hu} onChange={setHu} />
          {en ? (
            <DraftFields title="Angol leírás" draft={en} onChange={setEn} />
          ) : (
            <div className="rounded-lg border border-border bg-background p-4 text-sm text-muted-foreground">
              Angol fordítás nem készült. A termék közzétehető, az angol oldal ilyenkor a
              magyar oldalra irányít tovább a részletekért.
            </div>
          )}
        </div>
      ) : null}

      {rows.length ? (
        <div className="mt-8">
          <h3 className="text-sm font-bold text-foreground">Saját feltöltésű termékek</h3>
          <ul className="mt-3 space-y-2">
            {rows.map((row) => (
              <li
                key={row.slug}
                className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-background px-4 py-3 text-sm"
              >
                <span>
                  <strong className="text-foreground">{row.name}</strong>{" "}
                  <span className="text-muted-foreground">
                    /termek/{row.slug} ·{" "}
                    {row.tiers.map((tier) => formatPrice(tier.price)).join(" · ")} ·{" "}
                    {row.hasEnglish ? "angol leírás kész" : "nincs angol leírás"}
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
    </section>
  );
}

/* -------------------------------------------------------------- categories */

export function CategoryPanel() {
  const list = useServerFn(adminListCategories);
  const create = useServerFn(adminCreateCategory);
  const rename = useServerFn(adminRenameCategory);
  const remove = useServerFn(adminDeleteCategory);

  const [rows, setRows] = useState<CategoryAdminRow[]>([]);
  const [title, setTitle] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const refresh = async () => setRows((await list()).categories);

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const runCreate = async () => {
    setError(null);
    setMessage(null);
    setBusy(true);
    const result = await create({ data: { title, titleEn } });
    if (!result.ok) setError(result.error ?? "A létrehozás nem sikerült.");
    else {
      setMessage(`Kategória létrehozva: ${title}`);
      setTitle("");
      setTitleEn("");
    }
    await refresh();
    setBusy(false);
  };

  const runRename = async (row: CategoryAdminRow, next: string, nextEn: string) => {
    setError(null);
    setMessage(null);
    setBusy(true);
    const result = await rename({ data: { key: row.key, title: next, titleEn: nextEn } });
    if (!result.ok) setError(result.error ?? "Az átnevezés nem sikerült.");
    else setMessage(`Átnevezve: ${next}`);
    await refresh();
    setBusy(false);
  };

  const runDelete = async (row: CategoryAdminRow) => {
    if (!window.confirm(`Törlöd a kategóriát: ${row.title}?`)) return;
    setBusy(true);
    const result = await remove({ data: { key: row.key } });
    if (!result.ok) setError(result.error ?? "A törlés nem sikerült.");
    await refresh();
    setBusy(false);
  };

  return (
    <section className="mt-10 rounded-xl border border-border bg-secondary/40 p-6">
      <h2 className="text-xl font-bold text-foreground">Termékkategóriák</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Új kategória létrehozása és a meglévők átnevezése. Átnevezésnél az URL-kulcs nem
        változik, így egyetlen link sem törik el. Csak üres, itt létrehozott kategória
        törölhető.
      </p>

      <div className="mt-4 grid gap-3 md:grid-cols-[1fr_1fr_auto]">
        <input
          className={inputClass}
          value={title}
          placeholder="Új kategória magyar neve"
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          className={inputClass}
          value={titleEn}
          placeholder="Angol neve (nem kötelező)"
          onChange={(e) => setTitleEn(e.target.value)}
        />
        <button
          type="button"
          disabled={busy || title.trim().length < 3}
          onClick={() => void runCreate()}
          className="rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50"
        >
          Létrehozás
        </button>
      </div>

      {error ? <p className="mt-3 text-sm font-semibold text-destructive">{error}</p> : null}
      {message ? <p className="mt-3 text-sm text-foreground">{message}</p> : null}

      <ul className="mt-5 space-y-2">
        {rows.map((row) => (
          <CategoryRow
            key={row.key}
            row={row}
            busy={busy}
            onRename={runRename}
            onDelete={runDelete}
          />
        ))}
      </ul>
    </section>
  );
}

function CategoryRow({
  row,
  busy,
  onRename,
  onDelete,
}: {
  row: CategoryAdminRow;
  busy: boolean;
  onRename: (row: CategoryAdminRow, title: string, titleEn: string) => Promise<void>;
  onDelete: (row: CategoryAdminRow) => Promise<void>;
}) {
  const [title, setTitle] = useState(row.title);
  const [titleEn, setTitleEn] = useState(row.titleEn);

  useEffect(() => {
    setTitle(row.title);
    setTitleEn(row.titleEn);
  }, [row.title, row.titleEn]);

  const dirty = title !== row.title || titleEn !== row.titleEn;

  return (
    <li className="grid gap-2 rounded-md border border-border bg-background px-4 py-3 md:grid-cols-[1fr_1fr_auto_auto]">
      <input className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} />
      <input
        className={inputClass}
        value={titleEn}
        onChange={(e) => setTitleEn(e.target.value)}
      />
      <button
        type="button"
        disabled={busy || !dirty}
        onClick={() => void onRename(row, title, titleEn)}
        className="rounded-md bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground disabled:opacity-50"
      >
        Mentés
      </button>
      <button
        type="button"
        disabled={busy || row.bundled || row.productCount > 0}
        onClick={() => void onDelete(row)}
        className="rounded-md border border-destructive px-4 py-2 text-xs font-semibold text-destructive disabled:opacity-40"
        title={
          row.bundled
            ? "Beépített kategória"
            : row.productCount > 0
              ? "Csak üres kategória törölhető"
              : "Törlés"
        }
      >
        Törlés ({row.productCount})
      </button>
    </li>
  );
}
