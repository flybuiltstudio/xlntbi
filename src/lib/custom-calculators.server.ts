/**
 * Server-side storage and AI preparation of admin-uploaded calculators.
 * Rows live in `custom_calculators`; card images in the private
 * `termekfajlok` bucket under sajat-kalkulatorok/<slug>/.
 */
import {
  MAX_CALCULATOR_HTML_BYTES,
  customCalculatorFolder,
  slugifyCalculator,
  type CustomCalculatorDraft,
} from "./custom-calculators";

const BUCKET = "termekfajlok";
const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-3.8-flash";

type Result<T> = (T & { ok: true }) | { ok: false; error: string };

export type CustomCalculatorAdminRow = {
  slug: string;
  nameHu: string;
  nameEn: string;
  position: number;
  hasImageHu: boolean;
  hasImageEn: boolean;
  updatedAt: string;
};

/** Admin list of all uploaded custom calculators. */
export async function listCustomCalculators(): Promise<CustomCalculatorAdminRow[]> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("custom_calculators")
    .select("slug, name_hu, name_en, position, image_hu_path, image_en_path, updated_at")
    .order("position", { ascending: true })
    .order("slug", { ascending: true });
  if (error || !data) return [];
  return data.map((row) => ({
    slug: row.slug,
    nameHu: row.name_hu,
    nameEn: row.name_en,
    position: row.position,
    hasImageHu: Boolean(row.image_hu_path),
    hasImageEn: Boolean(row.image_en_path),
    updatedAt: row.updated_at,
  }));
}

/** Public card list for the calculator index pages. */
export async function listCustomCalculatorCards(
  lang: "hu" | "en",
): Promise<{ slug: string; name: string; position: number }[]> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("custom_calculators")
    .select("slug, name_hu, name_en, position")
    .order("position", { ascending: true })
    .order("slug", { ascending: true });
  if (error || !data) return [];
  return data.map((row) => ({
    slug: row.slug,
    name: lang === "en" ? row.name_en : row.name_hu,
    position: row.position,
  }));
}

/** Public full read of one calculator in one language. */
export async function getCustomCalculator(
  slug: string,
  lang: "hu" | "en",
): Promise<{
  slug: string;
  name: string;
  intro: string;
  metaTitle: string;
  metaDescription: string;
  html: string;
  script: string;
  updatedAt: string;
} | null> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("custom_calculators")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error || !data) return null;
  return {
    slug: data.slug,
    name: lang === "en" ? data.name_en : data.name_hu,
    intro: lang === "en" ? data.intro_en : data.intro_hu,
    metaTitle: lang === "en" ? data.meta_title_en : data.meta_title_hu,
    metaDescription: lang === "en" ? data.meta_description_en : data.meta_description_hu,
    html: lang === "en" ? data.html_en : data.html_hu,
    script: lang === "en" ? data.script_en : data.script_hu,
    updatedAt: data.updated_at,
  };
}

type AiMeta = {
  nameEn: string;
  introHu: string;
  introEn: string;
  metaTitleHu: string;
  metaDescriptionHu: string;
  metaTitleEn: string;
  metaDescriptionEn: string;
};

/**
 * Asks the AI for the English calculator name plus short HU/EN intro and
 * search metadata, based on the Hungarian name and the document's text.
 */
async function describeCalculator(nameHu: string, huHtml: string): Promise<AiMeta | null> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) return null;
  const plainText = huHtml
    .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 4000);
  try {
    const response = await fetch(GATEWAY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Lovable-API-Key": apiKey },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: "system",
            content:
              "You describe a Hungarian online calculator for a website. " +
              "Reply with a single JSON object only, no markdown, with exactly these keys: " +
              "nameEn (English calculator name, max 60 chars), " +
              "introHu (1-2 Hungarian sentences summarising what it computes, max 200 chars), " +
              "introEn (the same in English, max 200 chars), " +
              "metaTitleHu (Hungarian SEO title, max 60 chars), " +
              "metaDescriptionHu (Hungarian SEO description, max 155 chars), " +
              "metaTitleEn (English SEO title, max 60 chars), " +
              "metaDescriptionEn (English SEO description, max 155 chars).",
          },
          {
            role: "user",
            content: `Calculator name: ${nameHu}\n\nVisible text:\n${plainText}`,
          },
        ],
      }),
    });
    if (!response.ok) return null;
    const payload = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    let text = payload.choices?.[0]?.message?.content?.trim() ?? "";
    if (text.startsWith("```")) {
      text = text.replace(/^```[a-zA-Z]*\s*/, "").replace(/```\s*$/, "").trim();
    }
    const parsed = JSON.parse(text) as Partial<AiMeta>;
    if (typeof parsed.nameEn !== "string" || !parsed.nameEn.trim()) return null;
    const str = (value: unknown, fallback: string) =>
      typeof value === "string" && value.trim() ? value.trim() : fallback;
    return {
      nameEn: parsed.nameEn.trim(),
      introHu: str(parsed.introHu, ""),
      introEn: str(parsed.introEn, ""),
      metaTitleHu: str(parsed.metaTitleHu, ""),
      metaDescriptionHu: str(parsed.metaDescriptionHu, ""),
      metaTitleEn: str(parsed.metaTitleEn, ""),
      metaDescriptionEn: str(parsed.metaDescriptionEn, ""),
    };
  } catch {
    return null;
  }
}

/**
 * Validates the uploaded Hungarian calculator HTML and prepares the draft:
 * split HU markup/script, AI English translation, AI names/intros/metadata.
 */
export async function prepareCustomCalculator(input: {
  name: string;
  fileName: string;
  content: string;
}): Promise<Result<{ draft: CustomCalculatorDraft }>> {
  const nameHu = input.name.trim();
  if (nameHu.length < 3) return { ok: false, error: "Add meg a kalkulátor magyar nevét." };
  if (!input.fileName.toLowerCase().endsWith(".html")) {
    return { ok: false, error: "Csak .html fájl tölthető fel." };
  }
  const byteLength = new TextEncoder().encode(input.content).length;
  if (byteLength === 0 || byteLength > MAX_CALCULATOR_HTML_BYTES) {
    return { ok: false, error: "A fájl mérete legfeljebb 5 MB lehet." };
  }

  const slug = slugifyCalculator(nameHu);
  if (!slug) return { ok: false, error: "A névből nem készíthető URL-részlet." };

  const { isCalculatorKey } = await import("@/lib/calculators/registry");
  if (isCalculatorKey(slug)) {
    return {
      ok: false,
      error: `Ez az URL-részlet már foglalt egy beépített kalkulátor által: ${slug}`,
    };
  }
  const existing = await getCustomCalculator(slug, "hu");
  if (existing) {
    return { ok: false, error: `Már létezik feltöltött kalkulátor ezzel az URL-lel: ${slug}` };
  }

  const { splitCalculatorHtml } = await import("@/lib/calculators/split");
  const hu = splitCalculatorHtml(input.content);
  if (!hu.html) {
    return { ok: false, error: "A fájl nem tartalmaz megjeleníthető tartalmat." };
  }

  const { translateCalculatorHtmlToEnglish } = await import(
    "./calculator-translate.server"
  );
  const translated = await translateCalculatorHtmlToEnglish(input.content);
  if (!translated.ok) return { ok: false, error: translated.error };
  const en = splitCalculatorHtml(translated.content);
  if (!en.html) {
    return { ok: false, error: "Az angol fordítás nem tartalmaz megjeleníthető tartalmat." };
  }

  const meta = await describeCalculator(nameHu, input.content);
  const suffix = " | EXCELlent Business Intelligence";

  return {
    ok: true,
    draft: {
      slug,
      nameHu,
      nameEn: meta?.nameEn ?? nameHu,
      introHu: meta?.introHu ?? "",
      introEn: meta?.introEn ?? "",
      metaTitleHu: (meta?.metaTitleHu ?? nameHu) + (meta?.metaTitleHu ? "" : suffix),
      metaDescriptionHu: meta?.metaDescriptionHu ?? meta?.introHu ?? "",
      metaTitleEn: (meta?.metaTitleEn ?? meta?.nameEn ?? nameHu) +
        (meta?.metaTitleEn ? "" : suffix),
      metaDescriptionEn: meta?.metaDescriptionEn ?? meta?.introEn ?? "",
      htmlHu: hu.html,
      scriptHu: hu.script,
      htmlEn: en.html,
      scriptEn: en.script,
    },
  };
}

/**
 * Persists the reviewed draft and returns signed upload URLs for the two
 * card images the admin captured in the browser.
 */
export async function publishCustomCalculator(input: {
  draft: CustomCalculatorDraft;
  position: number;
  updatedBy: string;
}): Promise<
  Result<{
    slug: string;
    imageUploadHu: { path: string; token: string };
    imageUploadEn: { path: string; token: string };
  }>
> {
  const d = input.draft;
  const slug = slugifyCalculator(d.slug || d.nameHu);
  if (!slug) return { ok: false, error: "Hibás URL-részlet." };
  if (!d.nameHu.trim() || !d.nameEn.trim()) {
    return { ok: false, error: "A magyar és az angol név is kötelező." };
  }
  if (!d.htmlHu.trim() || !d.htmlEn.trim()) {
    return { ok: false, error: "A magyar és az angol kalkulátor-tartalom is kötelező." };
  }

  const folder = customCalculatorFolder(slug);
  const imageHuPath = `${folder}/kartya-hu.jpg`;
  const imageEnPath = `${folder}/kartya-en.jpg`;

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const now = new Date().toISOString();
  const { error } = await supabaseAdmin.from("custom_calculators").upsert(
    {
      slug,
      name_hu: d.nameHu.trim(),
      name_en: d.nameEn.trim(),
      intro_hu: d.introHu.trim(),
      intro_en: d.introEn.trim(),
      meta_title_hu: d.metaTitleHu.trim(),
      meta_description_hu: d.metaDescriptionHu.trim(),
      meta_title_en: d.metaTitleEn.trim(),
      meta_description_en: d.metaDescriptionEn.trim(),
      html_hu: d.htmlHu,
      script_hu: d.scriptHu,
      html_en: d.htmlEn,
      script_en: d.scriptEn,
      image_hu_path: imageHuPath,
      image_en_path: imageEnPath,
      position: Math.max(0, input.position),
      created_by: input.updatedBy,
      updated_at: now,
    },
    { onConflict: "slug" },
  );
  if (error) return { ok: false, error: `A mentés nem sikerült: ${error.message}` };

  const urlHu = await supabaseAdmin.storage
    .from(BUCKET)
    .createSignedUploadUrl(imageHuPath, { upsert: true });
  const urlEn = await supabaseAdmin.storage
    .from(BUCKET)
    .createSignedUploadUrl(imageEnPath, { upsert: true });
  if (urlHu.error || !urlHu.data || urlEn.error || !urlEn.data) {
    return { ok: false, error: "A képfeltöltési linkek létrehozása nem sikerült." };
  }

  return {
    ok: true,
    slug,
    imageUploadHu: { path: urlHu.data.path, token: urlHu.data.token },
    imageUploadEn: { path: urlEn.data.path, token: urlEn.data.token },
  };
}

/** Removes a custom calculator and its stored card images. */
export async function deleteCustomCalculator(
  slug: string,
): Promise<{ ok: boolean; error?: string }> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { error } = await supabaseAdmin.from("custom_calculators").delete().eq("slug", slug);
  if (error) return { ok: false, error: "A törlés nem sikerült." };
  const folder = customCalculatorFolder(slug);
  await supabaseAdmin.storage
    .from(BUCKET)
    .remove([`${folder}/kartya-hu.jpg`, `${folder}/kartya-en.jpg`]);
  return { ok: true };
}

/** Persists a new position order for the custom calculators. */
export async function saveCalculatorOrder(
  order: { slug: string; position: number }[],
): Promise<{ ok: boolean; error?: string }> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  for (const item of order) {
    const { error } = await supabaseAdmin
      .from("custom_calculators")
      .update({ position: item.position })
      .eq("slug", item.slug);
    if (error) return { ok: false, error: "A sorrend mentése nem sikerült." };
  }
  return { ok: true };
}
