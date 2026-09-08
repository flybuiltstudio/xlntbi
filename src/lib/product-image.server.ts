/**
 * AI illustration for admin-created products.
 *
 * When the admin does not upload a product image, we generate one with the
 * Lovable AI Gateway and store it next to the product file in private storage.
 * The category image is intentionally NOT used as a fallback: every product
 * gets its own picture.
 */

const BUCKET = "termekfajlok";

function buildPrompt(name: string, summary: string): string {
  const subject = summary.trim() || name;
  return [
    `Professional, clean illustration for a Hungarian business software product called "${name}".`,
    `What the product does: ${subject}`,
    "Style: modern flat-vector business illustration with subtle depth, dark green and warm neutral palette,",
    "spreadsheet / accounting / reporting motifs (tables, charts, documents), no photorealistic people,",
    "no text, no letters, no numbers, no logos, no watermark. Wide 3:2 composition with calm background.",
  ].join(" ");
}

/**
 * Generates a product illustration and uploads it as PNG.
 * Returns the storage path, or null when generation is unavailable — the
 * product itself must never fail because of a missing picture.
 */
export async function generateProductImage(input: {
  slug: string;
  name: string;
  summary: string;
  folder: string;
}): Promise<string | null> {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) return null;

  try {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/images/generations", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-pro-image",
        messages: [{ role: "user", content: buildPrompt(input.name, input.summary) }],
        modalities: ["image", "text"],
      }),
    });
    if (!response.ok) {
      console.error("[product-image] gateway error", response.status, await response.text());
      return null;
    }
    const json = (await response.json()) as { data?: { b64_json?: string }[] };
    const b64 = json.data?.[0]?.b64_json;
    if (!b64) {
      console.error("[product-image] gateway returned no image");
      return null;
    }

    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);

    const path = `${input.folder}/kep-${input.slug}.png`;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(path, bytes, { contentType: "image/png", upsert: true });
    if (error) {
      console.error("[product-image] upload failed", error.message);
      return null;
    }
    return path;
  } catch (e) {
    console.error("[product-image] generation failed", e);
    return null;
  }
}
