import {
  Bold,
  Heading2,
  Image as ImageIcon,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Underline,
} from "lucide-react";
import { useEffect, useRef } from "react";

const TEXT_COLORS = [
  { label: "Arculati zöld", value: "#217346" },
  { label: "Sötét szöveg", value: "#16231d" },
  { label: "Halvány szürke", value: "#5b6b63" },
  { label: "Piros kiemelés", value: "#b42318" },
];

const BG_COLORS = [
  { label: "Világos zöld", value: "#f4f8f6" },
  { label: "Sárga kiemelés", value: "#fff3bf" },
  { label: "Arculati zöld", value: "#217346" },
  { label: "Nincs", value: "transparent" },
];

const btn =
  "inline-flex h-9 items-center gap-1.5 rounded-md border border-input bg-background px-2.5 text-xs font-medium text-foreground transition hover:bg-muted";

/**
 * Small contentEditable rich-text editor for the newsletter body: formatting,
 * lists, headings, links, images, text and background colour. The HTML is
 * sanitized again on the server before sending.
 */
export function NewsletterEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (html: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (el && el.innerHTML !== value) el.innerHTML = value;
  }, [value]);

  function exec(command: string, arg?: string) {
    ref.current?.focus();
    document.execCommand("styleWithCSS", false, "true");
    document.execCommand(command, false, arg);
    if (ref.current) onChange(ref.current.innerHTML);
  }

  function insertLink() {
    const url = window.prompt("A link címe (https://...)");
    if (!url) return;
    if (!/^https?:\/\//i.test(url) && !/^mailto:/i.test(url)) {
      window.alert("Csak http, https vagy mailto link szúrható be.");
      return;
    }
    exec("createLink", url);
  }

  function insertImage() {
    const url = window.prompt("A kép teljes címe (https://...)");
    if (!url) return;
    if (!/^https?:\/\//i.test(url)) {
      window.alert("A képnek nyilvánosan elérhető https címen kell lennie.");
      return;
    }
    exec("insertImage", url);
  }

  return (
    <div className="mt-1.5 overflow-hidden rounded-md border border-input">
      <div className="flex flex-wrap items-center gap-1.5 border-b border-input bg-muted/50 p-2">
        <button type="button" className={btn} onClick={() => exec("bold")} title="Félkövér">
          <Bold className="h-4 w-4" />
        </button>
        <button type="button" className={btn} onClick={() => exec("italic")} title="Dőlt">
          <Italic className="h-4 w-4" />
        </button>
        <button type="button" className={btn} onClick={() => exec("underline")} title="Aláhúzott">
          <Underline className="h-4 w-4" />
        </button>
        <button
          type="button"
          className={btn}
          onClick={() => exec("formatBlock", "<h2>")}
          title="Címsor"
        >
          <Heading2 className="h-4 w-4" />
        </button>
        <button
          type="button"
          className={btn}
          onClick={() => exec("insertUnorderedList")}
          title="Felsorolás"
        >
          <List className="h-4 w-4" />
        </button>
        <button
          type="button"
          className={btn}
          onClick={() => exec("insertOrderedList")}
          title="Számozott lista"
        >
          <ListOrdered className="h-4 w-4" />
        </button>
        <button type="button" className={btn} onClick={insertLink} title="Link beszúrása">
          <LinkIcon className="h-4 w-4" />
        </button>
        <button type="button" className={btn} onClick={insertImage} title="Kép beszúrása">
          <ImageIcon className="h-4 w-4" />
        </button>

        <span className="mx-1 h-6 w-px bg-border" aria-hidden />

        <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
          Betűszín
          <input
            type="color"
            className="h-8 w-9 cursor-pointer rounded border border-input bg-background"
            defaultValue="#16231d"
            onChange={(event) => exec("foreColor", event.target.value)}
          />
        </label>
        {TEXT_COLORS.map((color) => (
          <button
            key={color.value}
            type="button"
            title={`Betűszín: ${color.label}`}
            className="h-7 w-7 rounded border border-input"
            style={{ backgroundColor: color.value }}
            onClick={() => exec("foreColor", color.value)}
          />
        ))}

        <span className="mx-1 h-6 w-px bg-border" aria-hidden />

        <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
          Háttér
          <input
            type="color"
            className="h-8 w-9 cursor-pointer rounded border border-input bg-background"
            defaultValue="#ffffff"
            onChange={(event) => exec("hiliteColor", event.target.value)}
          />
        </label>
        {BG_COLORS.map((color) => (
          <button
            key={color.value}
            type="button"
            title={`Háttérszín: ${color.label}`}
            className="h-7 w-7 rounded border border-input"
            style={{
              backgroundColor: color.value === "transparent" ? "#ffffff" : color.value,
            }}
            onClick={() => exec("hiliteColor", color.value)}
          />
        ))}
      </div>

      <div
        ref={ref}
        contentEditable
        role="textbox"
        aria-multiline="true"
        aria-label="A hírlevél szövege"
        suppressContentEditableWarning
        className="min-h-[280px] max-w-none bg-background px-4 py-3 text-sm leading-6 text-foreground outline-none [&_a]:text-primary [&_a]:underline [&_h2]:mb-2 [&_h2]:mt-4 [&_h2]:text-lg [&_h2]:font-bold [&_img]:my-3 [&_img]:max-w-full [&_li]:ml-5 [&_ol]:list-decimal [&_p]:mb-3 [&_ul]:list-disc"
        onInput={(event) => onChange(event.currentTarget.innerHTML)}
        onBlur={(event) => onChange(event.currentTarget.innerHTML)}
      />
    </div>
  );
}
