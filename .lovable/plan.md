# pCloud ajánló blokkok a Termékeim és Konzultációt kérek oldalra

## Cél
A Termékeim oldal jobb oszlopába, a "Miért jók ezek?" blokk alá kerül egy pCloud ajánló blokk. A Konzultációt kérek oldalon az űrlap bal oldalára kerül a Hírlevél feliratkozás blokk, alá pedig egy pCloud ajánló blokk. Mindkét oldal meglévő tartalma és elrendezése változatlan marad.

## Lépések

### 1. pCloud logó feltöltése CDN assetként
- Forrás: `/mnt/user-uploads/pCloud_logo.jpg` (303×110 px, sötétszürke háttér)
- `lovable-assets create --file /mnt/user-uploads/pCloud_logo.jpg --filename pcloud-logo.jpg > src/assets/pcloud-logo.jpg.asset.json`
- A `src/assets/pcloud-logo.jpg.asset.json` pointer importálása mindkét route-ban

### 2. Termékeim oldal (`src/routes/termekeim.tsx`)
A jobb oszlop (`<div>` a videó és "Miért jók ezek?" blokk) végére, a "Miért jók ezek?" div után, még a oszlop `<div>`-jén belül új blokk:

```text
💰 A legjobb felhőalapú tárhely befektetés: Egyszeri díj, élethosszig tartó tárhely!
A pCloud pár év alatt behozza az árát a GDrive-val, az iCloud-dal és a OneDrive-val szemben.
Svájci biztonság, szigorú GDPR-védelem. Én már csak ezt használom, szívből ajánlom:
```
Alatta a pCloud logó, kattintható linkként a `https://partner.pcloud.com/r/157444` URL-re (`target="_blank"`, `rel="noopener noreferrer"`).

Stílus: `rounded-2xl border border-border/60 bg-muted/40 p-5` — a Kapcsolat oldali blokkokhoz hasonlóan.

### 3. Konzultációt kérek oldal (`src/routes/konzultacio.tsx`)
A jelenlegi `max-w-4xl` egynoszlopos elrendezést szélesíteni kell, hogy balra elférjen a hírlevél + pCloud blokk. A meglévő szöveg és űrlap a helyén marad, csak a konténer szélesebb lesz és két oszloposra vált (`lg:grid-cols-[1fr_1.4fr]` — a Kapcsolat oldal mintájára).

**Bal oszlop:**
1. Hírlevél blokk — ugyanaz a doboz, mint a Kapcsolat oldalon (`rounded-2xl border border-border/60 bg-muted/40 p-5`, "Hírlevél" címmel, leírással és `<NewsletterSignup />` komponenssel)
2. pCloud blokk (külön blokk a hírlevél alatt):
```text
🔐 Felejtsd el a havi előfizetéseket! A pCloud életre szóló tárhelye már 2-3 év alatt
megtérül – fényévekkel jobban megéri, mint a Google Drive, az iCloud vagy a OneDrive.
Svájci adatvédelem, 100% GDPR-megfelelőség és maximális biztonság. Én már csak ezt
használom, szívből ajánlom:
```
Alatta a pCloud logó, link a `https://partner.pcloud.com/r/157443` URL-re.

**Jobb oszlop:** a meglévő "Töltsd ki az űrlapot..." szöveg + `<ContactForm />` változatlanul.

Új importok: `NewsletterSignup` a `@/components/NewsletterSignup`-ból, pCloud logó asset.

### 4. Angol oldalak (kérdés — lásd lent)
Az `en.products.tsx`-en "Why are they good?" blokk, az `en.consultation.tsx`-en szintén van űrlap. A projekt kétnyelvű. Ha a felhasználó kéri, az angol oldalakra is kerülhet pCloud blokk (angolra fordított szöveggel).

## Technikai részletek
- pCloud logó: `import pcloudLogo from "@/assets/pcloud-logo.jpg.asset.json"` → `pcloudLogo.url`
- A logó sötét háttérű (#2a2b2d), a projekt sötétzöld arculatába illik; világos módban is látható marad, mert a blokk háttérszíne `bg-muted/40`
- Linkek: `target="_blank" rel="noopener noreferrer"`, logó `alt="pCloud – Svájci felhőalapú tárhely"`
- SSR: minden tartalom szerveroldalon renderelődik (statikus JSX, nincs kliensoldali feltétel)
- Typecheck: `bunx tsgo --noEmit` a végén

## Ellenőrzés
- Böngészős vizuális ellenőrzés mindkét oldalon
- Typecheck
- SSR: a pCloud szöveg és logó linkek megjelennek a nyers HTML-ben
