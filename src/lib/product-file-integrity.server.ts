/**
 * Product file integrity check for the private `termekfajlok` bucket.
 *
 * Reads only the head and tail of each file with HTTP Range requests (large
 * executables would not fit into worker memory), and detects truncated or
 * half-uploaded files:
 *   - exe: PE sections fit in the file; PyInstaller builds end with the
 *     "MEI\x0c\x0b\x0a\x0b\x0e" cookie near the very end.
 *   - zip / xlsm: end-of-central-directory record, central directory inside
 *     the file, every local header offset valid; xlsm must be a workbook.
 *   - pdf: "%PDF-" header and "%%EOF" trailer.
 */

import { DOWNLOAD_BUCKET } from "./download.server";

export const PRODUCT_FILE_INTEGRITY_KEY = "product_file_integrity";
const CHECKED_EXTS = ["exe", "zip", "xlsm", "pdf"];
const PYI_COOKIE = [0x4d, 0x45, 0x49, 0x0c, 0x0b, 0x0a, 0x0b, 0x0e];

export type FileCheckRow = { path: string; size: number; ok: boolean; detail: string };
export type FileIntegrityReport = {
  ranAt: string;
  checked: number;
  broken: FileCheckRow[];
  rows: FileCheckRow[];
};

async function listObjects(prefix = "", depth = 0): Promise<Array<{ path: string; size: number }>> {
  if (depth > 6) return [];
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const out: Array<{ path: string; size: number }> = [];
  let offset = 0;
  for (;;) {
    const { data, error } = await supabaseAdmin.storage
      .from(DOWNLOAD_BUCKET)
      .list(prefix, { limit: 100, offset });
    if (error || !data || data.length === 0) break;
    for (const entry of data) {
      const path = prefix ? `${prefix}/${entry.name}` : entry.name;
      if (entry.id === null) out.push(...(await listObjects(path, depth + 1)));
      else out.push({ path, size: Number((entry.metadata as any)?.size ?? 0) });
    }
    if (data.length < 100) break;
    offset += 100;
  }
  return out;
}

function ext(path: string): string {
  return path.split(".").pop()?.toLowerCase() ?? "";
}

async function signedUrl(path: string): Promise<string> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin.storage
    .from(DOWNLOAD_BUCKET)
    .createSignedUrl(path, 600);
  if (error || !data?.signedUrl) throw new Error("Nem sikerült hozzáférni a fájlhoz.");
  return data.signedUrl;
}

async function readRange(url: string, start: number, end: number): Promise<Uint8Array> {
  const res = await fetch(url, { headers: { Range: `bytes=${start}-${end}` } });
  if (!res.ok && res.status !== 206) throw new Error(`Olvasási hiba (${res.status}).`);
  const buf = new Uint8Array(await res.arrayBuffer());
  // A 200 means the server ignored Range — slice defensively.
  return res.status === 206 ? buf : buf.slice(start, end + 1);
}

function u16(b: Uint8Array, o: number) {
  return b[o]! | (b[o + 1]! << 8);
}
function u32(b: Uint8Array, o: number) {
  return (b[o]! | (b[o + 1]! << 8) | (b[o + 2]! << 16) | (b[o + 3]! << 24)) >>> 0;
}
function lastIndexOf(b: Uint8Array, pat: number[]): number {
  outer: for (let i = b.length - pat.length; i >= 0; i--) {
    for (let j = 0; j < pat.length; j++) if (b[i + j] !== pat[j]) continue outer;
    return i;
  }
  return -1;
}
function ascii(b: Uint8Array): string {
  let s = "";
  for (const c of b) s += String.fromCharCode(c);
  return s;
}

async function checkExe(url: string, size: number): Promise<string | null> {
  const head = await readRange(url, 0, Math.min(size, 8192) - 1);
  if (head[0] !== 0x4d || head[1] !== 0x5a) return "Nem Windows program (hibás fájleleje).";
  const pe = u32(head, 60);
  if (pe + 24 > head.length || u32(head, pe) !== 0x4550) return "Sérült programfejléc.";
  const sections = u16(head, pe + 6);
  const sh = pe + 24 + u16(head, pe + 20);
  let peEnd = 0;
  for (let i = 0; i < sections; i++) {
    const o = sh + i * 40;
    if (o + 24 > head.length) break;
    peEnd = Math.max(peEnd, u32(head, o + 20) + u32(head, o + 16));
  }
  if (peEnd > size) return "Csonka: a program része hiányzik a fájl végéről.";
  const overlay = size - peEnd;
  if (overlay < 1024 * 1024) return null;
  const tail = await readRange(url, Math.max(0, size - 4096), size - 1);
  const c = lastIndexOf(tail, PYI_COOKIE);
  if (c < 0 || tail.length - c > 200) {
    return "Csonka: hiányzik a fájl vége (a program nem fog elindulni).";
  }
  return null;
}

async function checkZip(url: string, size: number, workbook: boolean): Promise<string | null> {
  const head = await readRange(url, 0, 3);
  if (u32(head, 0) !== 0x04034b50) return "Nem zip-formátumú (hibás fájleleje).";
  const tailLen = Math.min(size, 66000);
  const tail = await readRange(url, size - tailLen, size - 1);
  const e = lastIndexOf(tail, [0x50, 0x4b, 0x05, 0x06]);
  if (e < 0) return "Csonka: hiányzik a tartalomjegyzék a fájl végéről.";
  const count = u16(tail, e + 10);
  const cdSize = u32(tail, e + 12);
  const cdOffset = u32(tail, e + 16);
  const eocdAbs = size - tailLen + e;
  if (cdOffset + cdSize > eocdAbs) return "Sérült tartalomjegyzék.";
  const cd = await readRange(url, cdOffset, cdOffset + cdSize - 1);
  let p = 0;
  const names: string[] = [];
  for (let i = 0; i < count; i++) {
    if (u32(cd, p) !== 0x02014b50) return "Sérült tartalomjegyzék-bejegyzés.";
    const nLen = u16(cd, p + 28);
    const xLen = u16(cd, p + 30);
    const cLen = u16(cd, p + 32);
    const local = u32(cd, p + 42);
    const comp = u32(cd, p + 20);
    if (local + comp > cdOffset) return "Csonka: egy becsomagolt fájl hiányos.";
    names.push(ascii(cd.subarray(p + 46, p + 46 + nLen)));
    p += 46 + nLen + xLen + cLen;
  }
  if (workbook && !names.includes("xl/workbook.xml")) return "Nem Excel-munkafüzet.";
  if (workbook && !names.includes("xl/vbaProject.bin")) return "Hiányoznak a makrók.";
  return null;
}

async function checkPdf(url: string, size: number): Promise<string | null> {
  const head = await readRange(url, 0, 4);
  if (ascii(head) !== "%PDF-") return "Nem pdf (hibás fájleleje).";
  const tail = ascii(await readRange(url, Math.max(0, size - 2048), size - 1));
  if (!tail.includes("%%EOF")) return "Csonka: hiányzik a pdf vége.";
  return null;
}

/** Checks one stored file. */
export async function checkProductFile(path: string, size: number): Promise<FileCheckRow> {
  try {
    if (size <= 0) return { path, size, ok: false, detail: "Üres fájl." };
    const url = await signedUrl(path);
    const e = ext(path);
    const problem =
      e === "exe" ? await checkExe(url, size)
      : e === "pdf" ? await checkPdf(url, size)
      : await checkZip(url, size, e === "xlsm");
    return { path, size, ok: !problem, detail: problem ?? "Rendben." };
  } catch (error) {
    return {
      path,
      size,
      ok: false,
      detail: error instanceof Error ? error.message : String(error),
    };
  }
}

/** Checks one stored path by looking up its size first. */
export async function checkStoredPath(path: string): Promise<FileCheckRow> {
  const folder = path.includes("/") ? path.slice(0, path.lastIndexOf("/")) : "";
  const found = (await listObjects(folder, 6)).find((o) => o.path === path);
  if (!found) return { path, size: 0, ok: false, detail: "A fájl nincs a tárolóban." };
  return checkProductFile(found.path, found.size);
}

/** Checks every exe / zip / xlsm / pdf in the bucket and stores the report. */
export async function runProductFileIntegrity(): Promise<FileIntegrityReport> {
  const objects = (await listObjects()).filter((o) => CHECKED_EXTS.includes(ext(o.path)));
  const rows: FileCheckRow[] = [];
  for (const o of objects) rows.push(await checkProductFile(o.path, o.size));
  rows.sort((a, b) => a.path.localeCompare(b.path));
  const report: FileIntegrityReport = {
    ranAt: new Date().toISOString(),
    checked: rows.length,
    broken: rows.filter((r) => !r.ok),
    rows,
  };
  try {
    const { setSetting } = await import("./app-settings.server");
    await setSetting(PRODUCT_FILE_INTEGRITY_KEY, report as unknown as Record<string, any>);
  } catch (error) {
    console.error("File integrity report save failed:", error);
  }
  return report;
}
