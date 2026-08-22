# Hero-háttér, szlogen, gombok és menüsorrend módosítása

## 1. Hero (és lábléc) háttér: keskenyebb zöld sávok
- A jelenlegi `bcg-1.jpg` csíkozása túl széles. A csatolt minta alapján készül egy új háttérkép AI-val: ugyanaz a sötétzöld, függőleges sávozott minta, de a sávok **fele olyan szélesek**, mint most.
- Új fájl: `src/assets/bcg-savok.jpg`.
- Az új képet használja a **főoldali hero** (`src/routes/index.tsx`) ÉS a **lábléc háttere** (`src/components/SiteFooter.tsx`) is, hogy a minta egységes maradjon.

## 2. Hero-felirat: logóval egyező betűtípus és helyes szlogen
- A H1 szövege most „Automated future" — helyette a logón szereplő szlogen kerül be: **„Perfect Solutions. Automated FUTURE."**
- Betűtípus: a logó klasszikus, talpas (serif) betűképe — ehhez a **Playfair Display** betűtípust töltjük be (Google Fonts, `<link>` a `src/routes/__root.tsx`-ben, token a `src/styles.css`-ben), és csak a hero H1 kapja meg.
- A szlogen **egy sorban** jelenik meg asztali nézetben (reszponzív `clamp()` betűmérettel); a kis felirat („EXCELLENT BUSINESS INTELLIGENCE") felette marad.

## 3. Hero-gombok: új „Szolgáltatásaim" gomb
- A gombok sorrendje: **Szolgáltatásaim → Termékeim → Kapcsolat** (az új gomb a Termékeim elé kerül, ugyanolyan stílusban).

## 4. Felső menü: Termékeim és Szolgáltatásaim felcserélve
- Új sorrend (`src/components/SiteHeader.tsx`):
  **Főoldal → Szolgáltatásaim (lenyíló) → Kalkulátorok (lenyíló) → Termékeim → Oktatás → Rólam → Kapcsolat → Konzultációt kérek**
- A mobil lenyíló menü flat listája is ugyanezt a sorrendet követi.

## 5. Lábléc logó: eredeti színekben
- A láblécben a logóról lekerül a fehér sziluett-szűrő (`brightness-0 invert`), az **eredeti színes logó** jelenik meg.
- Mivel a logó sötétzöld elemei a sötétzöld háttéren alig látszanának, a logó egy **diszkrét fehér, lekerekített hátteret** kap (kis padding, finom árnyék nélkül), így olvasható marad és mégis „normál" színekkel jelenik meg.

## 6. Lábléc „Oldalak" lista: ugyanaz a sorrend, mint a főmenü
- `src/components/SiteFooter.tsx` „Oldalak" oszlop új sorrendje:
  Főoldal → **Szolgáltatásaim** → Kalkulátorok → **Termékeim** → Oktatás → Rólam → Kapcsolat → Konzultáció

## Technikai részletek
- Érintett fájlok: `src/routes/index.tsx`, `src/components/SiteHeader.tsx`, `src/components/SiteFooter.tsx`, `src/routes/__root.tsx` (font-link), `src/styles.css` (font-token), új asset `src/assets/bcg-savok.jpg`.
- A régi `bcg-1.jpg` a projektben marad (máshol nem kell cserélni).
- A H1 továbbra is egyetlen marad az oldalon, az SEO-metaadatok nem változnak.
