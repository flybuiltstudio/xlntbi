/**
 * Minimal .docx text extractor.
 *
 * A .docx file is a ZIP package; the visible text lives in `word/document.xml`.
 * The Worker runtime has no ZIP library, so the archive is read directly and
 * deflate-compressed entries are inflated with `DecompressionStream`. No native
 * dependency, no filesystem access.
 */

const decoder = new TextDecoder();

function readU16(bytes: Uint8Array, at: number): number {
  return bytes[at]! | (bytes[at + 1]! << 8);
}

function readU32(bytes: Uint8Array, at: number): number {
  return (
    (bytes[at]! | (bytes[at + 1]! << 8) | (bytes[at + 2]! << 16) | (bytes[at + 3]! << 24)) >>> 0
  );
}

async function inflateRaw(data: Uint8Array): Promise<Uint8Array> {
  const stream = new Blob([data as unknown as BlobPart])
    .stream()
    .pipeThrough(new DecompressionStream("deflate-raw"));
  const buffer = await new Response(stream).arrayBuffer();
  return new Uint8Array(buffer);
}

/** Returns the raw bytes of one entry of a ZIP archive, or null. */
async function readZipEntry(zip: Uint8Array, name: string): Promise<Uint8Array | null> {
  // Walk the local file headers (PK\x03\x04) — enough for docx packages.
  let at = 0;
  while (at + 30 <= zip.length) {
    if (readU32(zip, at) !== 0x04034b50) break;
    const method = readU16(zip, at + 8);
    const compressedSize = readU32(zip, at + 18);
    const nameLength = readU16(zip, at + 26);
    const extraLength = readU16(zip, at + 28);
    const nameStart = at + 30;
    const entryName = decoder.decode(zip.subarray(nameStart, nameStart + nameLength));
    const dataStart = nameStart + nameLength + extraLength;
    if (entryName === name) {
      const body = zip.subarray(dataStart, dataStart + compressedSize);
      if (method === 0) return body;
      if (method === 8) return inflateRaw(body);
      return null;
    }
    at = dataStart + compressedSize;
  }
  return null;
}

function unescapeXml(value: string): string {
  return value
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex: string) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec: string) => String.fromCodePoint(Number(dec)))
    .replace(/&amp;/g, "&");
}

/** Turns WordprocessingML into plain text, one line per paragraph. */
function documentXmlToText(xml: string): string {
  const lines: string[] = [];
  const paragraphs = xml.split(/<w:p[ >]/).slice(1);
  for (const rawParagraph of paragraphs) {
    const paragraph = rawParagraph.split("</w:p>")[0] ?? "";
    const isListItem = /<w:numPr[ />]/.test(paragraph);
    let text = "";
    for (const match of paragraph.matchAll(/<w:t(?:\s[^>]*)?>([\s\S]*?)<\/w:t>/g)) {
      text += unescapeXml(match[1] ?? "");
    }
    text = text.replace(/\s+/g, " ").trim();
    if (!text) {
      if (lines.length && lines[lines.length - 1] !== "") lines.push("");
      continue;
    }
    lines.push(isListItem ? `- ${text}` : text);
  }
  return lines.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

export type DocxTextResult = { ok: true; text: string } | { ok: false; error: string };

export async function extractDocxText(bytes: Uint8Array): Promise<DocxTextResult> {
  if (bytes.length < 4 || readU32(bytes, 0) !== 0x04034b50) {
    return {
      ok: false,
      error: "Ez nem érvényes .docx fájl. Mentsd el Wordből .docx formátumban.",
    };
  }
  let entry: Uint8Array | null;
  try {
    entry = await readZipEntry(bytes, "word/document.xml");
  } catch {
    return { ok: false, error: "A Word fájlt nem sikerült beolvasni." };
  }
  if (!entry) {
    return { ok: false, error: "A Word fájlban nem található szöveges tartalom." };
  }
  const text = documentXmlToText(decoder.decode(entry));
  if (text.length < 40) {
    return { ok: false, error: "A Word fájl túl kevés szöveget tartalmaz." };
  }
  return { ok: true, text };
}
