# Fejléc „paletta-dominó" betöltési animáció — csak a Főoldalon

## Cél
A főoldal betöltésekor a fejléc hátterében függőleges színpaletta-oszlopok nyílnak ki balról jobbra dominószerűen (felülről lefelé kibomlanak), majd ugyanilyen sorrendben becsukódnak, és alattuk bukkan elő a megszokott fejléc-háttér.

## Hogyan fog kinézni
- A fejléc teljes szélességében **14–16 függőleges oszlop**, mindegyik a márka sötétzöld színskálájának egy árnyalata (a legsötétebbtől a világosabb zöld felé, mint egy színpaletta).
- Betöltéskor az oszlopok **balról jobbra, egymást követően nyílnak ki** (felülről nőnek le, kb. 60 ms léptékben), majd rövid tartás után **uganabban a sorrendben csukódnak be** (alulról felfelé tűnnek el).
- A logó és a menü végig látható marad felette; az animáció tiszta háttér-jelenség, nem takarja a szöveget.
- Teljes időtartam kb. 1,8–2 másodperc, utána a fejléc a megszokott fehér/felmosott hátteret mutatja.

## Szabályok
- **Csak a Főoldalon (`/`)** jelenik meg, oldalbetöltéskor **egyszer** — oldalon belüli navigáció (pl. visszalépés a főoldalra a menüből) nem indítja újra.
- `prefers-reduced-motion` esetén az animáció kimarad (akadálymentesség).
- Nem érinti a sticky viselkedést, a mobil menüt és az admin felületet; más oldalakon semmi nem változik.

## Technikai részletek
- Új, kis komponens: `src/components/HeaderIntro.tsx` — az oszlopokat rendereli, CSS keyframes-szel (külön animációs könyvtár nem kell), a végén eltávolítja magát a DOM-ból.
- `src/components/SiteHeader.tsx`: a fejlécbe ágyazva, csak ha az aktuális útvonal `/` (a meglévő router-state alapján), modul-szintű jelzővel, hogy egy oldalbetöltés alatt csak egyszer fusson.
- `src/styles.css`: a keyframes (kinyílás/becsukódás `scaleY`-nal, `transform-origin` váltással) és a reduced-motion kikapcsolás.
- Ellenőrzés: böngészőben felvétel/képernyőképek a lefutásról, valamint hogy más oldalon (pl. /termekeim) nem jelenik meg.
