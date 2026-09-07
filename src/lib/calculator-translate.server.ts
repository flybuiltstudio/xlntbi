/**
 * Translates an uploaded Hungarian calculator HTML document into English via
 * the Lovable AI Gateway. Only visible text is translated: markup, element
 * ids/names/classes, attributes, JavaScript logic, numbers and formulas must
 * stay byte-identical so the calculator keeps working.
 *
 * The gateway call is streamed: a large calculator document can take more
 * than a minute, and a buffered request would be severed by the platform.
 */

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-3.8-flash";

const SYSTEM_PROMPT = `You translate a standalone HTML calculator from Hungarian to English.

STRICT RULES:
- Output the complete HTML document only. No markdown fences, no commentary.
- Translate ONLY human-visible text: element text nodes, button labels, headings,
  option labels, placeholder / title / alt / aria-label attribute values, and
  Hungarian string literals inside <script> that are shown to the user
  (messages, labels, table headers, alerts).
- Do NOT change: tag structure, element order, ids, names, classes, data-*
  attributes, CSS, JavaScript logic, variable and function names, object keys,
  numbers, percentages, formulas, date formats, or currency codes.
- Keep Hungarian legal/tax terms understandable: translate them and, where the
  Hungarian abbreviation is the official one (SZJA, TB, KATA, ÁFA, TAO, EKHO),
  keep the abbreviation in parentheses on first use.
- Keep "Ft" as the currency unit.
- Never drop, add or reorder any element.`;

export type TranslateResult =
  | { ok: true; content: string }
  | { ok: false; error: string };

/** Reads the streamed chat-completion response and concatenates the text. */
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
        // Ignore keep-alive / partial frames.
      }
    }
  }
  return out;
}

/** Strips accidental markdown fences from the model output. */
function cleanHtml(raw: string): string {
  let text = raw.trim();
  if (text.startsWith("```")) {
    text = text.replace(/^```[a-zA-Z]*\s*/, "").replace(/```\s*$/, "");
  }
  return text.trim();
}

export async function translateCalculatorHtmlToEnglish(
  huHtml: string,
): Promise<TranslateResult> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) {
    return { ok: false, error: "Az AI fordító nincs beállítva (hiányzó kulcs)." };
  }

  let response: Response;
  try {
    response = await fetch(GATEWAY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": apiKey,
      },
      body: JSON.stringify({
        model: MODEL,
        stream: true,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: huHtml },
        ],
      }),
    });
  } catch {
    return { ok: false, error: "Az AI fordító nem elérhető. Próbáld újra később." };
  }

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    if (response.status === 402) {
      return {
        ok: false,
        error:
          "Az AI fordítás nem futott le: elfogytak az AI kreditek. Töltsd fel a keretet, majd generáld újra az angol változatot.",
      };
    }
    if (response.status === 429) {
      return {
        ok: false,
        error: "Az AI fordító túl sok kérést kapott. Várj egy kicsit, majd próbáld újra.",
      };
    }
    return {
      ok: false,
      error: `Az AI fordítás nem sikerült (hibakód ${response.status}). ${detail.slice(0, 200)}`.trim(),
    };
  }

  const content = cleanHtml(await readStream(response));
  if (!content || !/</.test(content)) {
    return { ok: false, error: "Az AI fordítás üres választ adott." };
  }
  // Basic sanity check: the translated document must be in the same ballpark.
  if (content.length < huHtml.length * 0.4) {
    return {
      ok: false,
      error: "Az AI fordítás hiányosnak tűnik, ezért nem került ki élesbe.",
    };
  }
  return { ok: true, content };
}
