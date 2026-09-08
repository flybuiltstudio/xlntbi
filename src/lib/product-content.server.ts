/**
 * AI-assisted product description generation.
 *
 * An admin uploads a Word document about a product; the text is rewritten in
 * the tone of the existing product pages (sales-oriented, but strictly limited
 * to what the document contains), then translated to English. Nothing is
 * invented: no prices, no references, no features that are not in the source.
 */

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-3.8-flash";

export type ProductDescriptionDraft = {
  intro: string[];
  features: string[];
  why: string;
  summary: string;
  metaTitle: string;
  metaDescription: string;
};

export type DraftResult =
  | { ok: true; draft: ProductDescriptionDraft }
  | { ok: false; error: string };

const HU_SYSTEM = `Magyar szoftvertermékek termékleírásait írod egy könyvelőknek és pénzügyi szakembereknek szóló weboldalra (xlntbi.hu, XLNT termékek).

FELADAT: a megadott Word-dokumentum tartalmából készíts eladást segítő, gördülékeny magyar termékleírást.

SZIGORÚ SZABÁLYOK:
- Csak azt írhatod le, ami a dokumentumban szerepel. Tilos kitalált funkciót, számot, árat, határidőt, referenciát, véleményt vagy statisztikát hozzáadni.
- Árat, összeget, kedvezményt NEM írhatsz a szövegbe.
- Tegező, közvetlen, szakmai hangnem. Nincs üres marketingszöveg, nincs szuperlatívusz-halmozás.
- Magyar helyesírás, hivatalos rövidítések megtartása (NAV, ÁFA, SZJA, ÁNYK, KIVA, TAO, MNB, IFRS).
- Ne írj a leírásba "AAM" vagy áfa-megjegyzést.

KIMENET: kizárólag egy JSON objektum, markdown nélkül, ezekkel a kulcsokkal:
{
  "intro": ["1-3 bekezdés, mindegyik 2-5 mondat"],
  "features": ["6-14 rövid funkciópont, mindegyik egy mondat, ponttal zárva"],
  "why": "1 bekezdés arról, kinek és miért hasznos (3-5 mondat)",
  "summary": "1-3 mondatos rövid összefoglaló a terméklista kártyájához",
  "metaTitle": "max 60 karakter, tartalmazza a termék nevét",
  "metaDescription": "max 160 karakter, beszédes összefoglaló"
}`;

const EN_SYSTEM = `You translate a Hungarian software product description into English for an accounting-software website.

STRICT RULES:
- Translate faithfully; do not add, remove or embellish anything.
- Keep official Hungarian abbreviations understandable: NAV (Hungarian Tax Authority), ÁNYK, ÁFA (VAT), SZJA (personal income tax), MNB (Hungarian central bank), KIVA, TAO.
- Keep "Ft" as the currency unit. Never mention prices that are not in the source.
- Natural business English, direct tone, no marketing fluff.

OUTPUT: a single JSON object only, no markdown, with the same keys as the input:
{ "intro": [...], "features": [...], "why": "...", "summary": "...", "metaTitle": "max 60 chars", "metaDescription": "max 160 chars" }`;

async function readStream(response: Response): Promise<string> {
  const reader = response.body?.getReader();
  if (!reader) return "";
  const decoder = new TextDecoder();
  let buffer = "";
  let out = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;
      const payload = trimmed.slice(5).trim();
      if (!payload || payload === "[DONE]") continue;
      try {
        const parsed = JSON.parse(payload) as {
          choices?: { delta?: { content?: string } }[];
        };
        out += parsed.choices?.[0]?.delta?.content ?? "";
      } catch {
        /* keep-alive frame */
      }
    }
  }
  return out;
}

async function callGateway(system: string, user: string): Promise<{ ok: true; text: string } | { ok: false; error: string }> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) return { ok: false, error: "Az AI nincs beállítva (hiányzó kulcs)." };

  let response: Response;
  try {
    response = await fetch(GATEWAY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Lovable-API-Key": apiKey },
      body: JSON.stringify({
        model: MODEL,
        stream: true,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    });
  } catch {
    return { ok: false, error: "Az AI szolgáltatás nem elérhető. Próbáld újra később." };
  }

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    if (response.status === 402) {
      return {
        ok: false,
        error:
          "Az AI feldolgozás nem futott le: elfogytak az AI kreditek. Töltsd fel a keretet, majd próbáld újra.",
      };
    }
    if (response.status === 429) {
      return {
        ok: false,
        error: "Az AI túl sok kérést kapott. Várj egy kicsit, majd próbáld újra.",
      };
    }
    return {
      ok: false,
      error: `Az AI feldolgozás nem sikerült (hibakód ${response.status}). ${detail.slice(0, 200)}`.trim(),
    };
  }

  return { ok: true, text: await readStream(response) };
}

function parseDraft(raw: string): ProductDescriptionDraft | null {
  let text = raw.trim();
  if (text.startsWith("```")) {
    text = text.replace(/^```[a-zA-Z]*\s*/, "").replace(/```\s*$/, "").trim();
  }
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(text.slice(start, end + 1));
  } catch {
    return null;
  }
  const obj = parsed as Record<string, unknown>;
  const strings = (value: unknown): string[] =>
    Array.isArray(value)
      ? value.filter((v): v is string => typeof v === "string" && v.trim().length > 0).map((v) => v.trim())
      : [];
  const str = (value: unknown): string => (typeof value === "string" ? value.trim() : "");

  const draft: ProductDescriptionDraft = {
    intro: strings(obj["intro"]),
    features: strings(obj["features"]),
    why: str(obj["why"]),
    summary: str(obj["summary"]),
    metaTitle: str(obj["metaTitle"]),
    metaDescription: str(obj["metaDescription"]),
  };
  if (!draft.intro.length || !draft.features.length) return null;
  return draft;
}

/** Rewrites the Word document text into a Hungarian product description. */
export async function draftHungarianDescription(input: {
  productName: string;
  documentText: string;
}): Promise<DraftResult> {
  const user = `TERMÉK NEVE: ${input.productName}

WORD DOKUMENTUM TARTALMA:
${input.documentText.slice(0, 60_000)}`;
  const result = await callGateway(HU_SYSTEM, user);
  if (!result.ok) return result;
  const draft = parseDraft(result.text);
  if (!draft) {
    return { ok: false, error: "Az AI válaszát nem sikerült feldolgozni. Próbáld újra." };
  }
  return { ok: true, draft };
}

/** Translates a Hungarian draft to English. */
export async function translateDescriptionToEnglish(input: {
  productName: string;
  draft: ProductDescriptionDraft;
}): Promise<DraftResult> {
  const user = `PRODUCT NAME: ${input.productName}

HUNGARIAN CONTENT (JSON):
${JSON.stringify(input.draft, null, 2)}`;
  const result = await callGateway(EN_SYSTEM, user);
  if (!result.ok) return result;
  const draft = parseDraft(result.text);
  if (!draft) {
    return { ok: false, error: "Az angol fordítás válaszát nem sikerült feldolgozni." };
  }
  return { ok: true, draft };
}
