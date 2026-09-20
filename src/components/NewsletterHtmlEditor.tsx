import { Code2, Eye, EyeOff, Upload } from "lucide-react";
import { useRef, useState } from "react";

/**
 * Raw HTML mode for the newsletter body: paste a complete HTML email, upload an
 * .html file, and preview it in an isolated iframe. The markup is sanitized on
 * the server before sending (src/lib/newsletter-html.ts).
 */
export function NewsletterHtmlEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (html: string) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState(false);
  const [note, setNote] = useState("");

  async function handleFile(file: File | undefined) {
    if (!file) return;
    if (!/\.html?$/i.test(file.name)) {
      setNote("Csak .html vagy .htm fájlt tudok beolvasni.");
      return;
    }
    const text = await file.text();
    onChange(text);
    setNote(`Beolvasva: ${file.name} (${Math.round(text.length / 1024)} kB)`);
    setPreview(true);
  }

  const btn =
    "inline-flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm font-medium text-foreground transition hover:bg-muted";

  return (
    <div className="mt-1.5 space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" className={btn} onClick={() => fileRef.current?.click()}>
          <Upload className="h-4 w-4" /> HTML fájl feltöltése
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".html,.htm,text/html"
          className="hidden"
          onChange={(event) => {
            void handleFile(event.target.files?.[0]);
            event.target.value = "";
          }}
        />
        <button type="button" className={btn} onClick={() => setPreview((p) => !p)}>
          {preview ?
            <>
              <EyeOff className="h-4 w-4" /> Előnézet elrejtése
            </>
          : <>
              <Eye className="h-4 w-4" /> Előnézet megjelenítése
            </>
          }
        </button>
        <span className="text-xs text-muted-foreground">{note}</span>
      </div>

      <label className="block">
        <span className="sr-only">HTML forráskód</span>
        <textarea
          className="min-h-[320px] w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-xs leading-5 text-foreground outline-none focus:ring-2 focus:ring-ring"
          spellCheck={false}
          value={value}
          placeholder="<!DOCTYPE html> … ide illeszd be a teljes HTML-hírlevelet"
          onChange={(event) => onChange(event.target.value)}
        />
      </label>

      <p className="flex items-start gap-2 text-xs text-muted-foreground">
        <Code2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        A formázás, színek, táblázatok, képek és linkek változatlanul kimennek. A leiratkozó link
        helyére írhatod a <code className="font-mono">{"{{unsubscribe}}"}</code> jelölést – ha nincs
        benne, a levél végére automatikusan bekerül egy leiratkozó sor.
      </p>

      {preview ? (
        <div className="overflow-hidden rounded-md border border-border">
          <div className="border-b border-border bg-muted/50 px-3 py-2 text-xs font-medium text-muted-foreground">
            Előnézet
          </div>
          <iframe
            title="Hírlevél előnézet"
            className="h-[560px] w-full bg-white"
            sandbox=""
            srcDoc={value}
          />
        </div>
      ) : null}
    </div>
  );
}
