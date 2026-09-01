# Instagram és LinkedIn elérhetőségek hozzáadása a Facebook mellé

## Cél
A Facebook link mellé (vagy alá) mindenhol bekerüljön az Instagram és a LinkedIn elérhetőség is:
- Instagram: https://www.instagram.com/xlntbi/
- LinkedIn: https://www.linkedin.com/company/xlntbi/

## Jelenlegi állapot
- A Facebook link csak két helyen szerepel: `src/lib/company.ts` (`COMPANY.facebook`) és `src/components/SiteFooter.tsx` „Elérhetőség" blokkjában.
- A `src/routes/kapcsolat.tsx` elérhetőségi listája csak telefont és e-mailt tartalmaz, social nincs.

## Módosítások

### 1. `src/lib/company.ts`
Két új mező a `COMPANY` objektumban a `facebook` mellé:
- `instagram: "https://www.instagram.com/xlntbi/"`
- `linkedin: "https://www.linkedin.com/company/xlntbi/"`

### 2. `src/components/SiteFooter.tsx` — „Elérhetőség" blokk
A meglévő Facebook sor alá két új sor kerül, ugyanazzal az elrendezéssel (Lucide ikon + link):
- `Instagram` ikon + `https://www.instagram.com/xlntbi/` (új ablak, `noopener noreferrer`)
- `Linkedin` ikon + `https://www.linkedin.com/company/xlntbi/` (új ablak, `noopener noreferrer`)

Import bővítése: `import { Facebook, Mail, Phone, Instagram, Linkedin } from "lucide-react";`

### 3. `src/routes/kapcsolat.tsx` — elérhetőségek lista
Az „Elérhetőségeim" listába (telefon és e-mail alá) bekerül a három social link együtt:
- Facebook, Instagram, LinkedIn — soronként ikonnal, új ablakos megnyitással.
Így a Kapcsolat oldal is tartalmazza a social elérhetőségeket, nemcsak a lábléc.

## Technikai részletek
- Mindhárom social link `target="_blank"` + `rel="noopener noreferrer"` attribútumot kap.
- A Lucide ikonok (`Instagram`, `Linkedin`, `Facebook`) inline SVG-ként renderelődnek, SSR-ben is látszanak — nem befolyásolják a kereső/AI láthatóságot.
- Nem érintjük a jogi oldalakat (impresszum, ÁSZF stb.) — ott csak e-mail/telefon szerepel a szöveges elérhetőségként, ahogy eddig.

## Ellenőrzés
- Build lefut hibátlanul.
- A láblécben és a Kapcsolat oldalon is látszik mindhárom social link, ikonnal.
