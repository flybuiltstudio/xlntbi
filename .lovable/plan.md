# Kiegészítések: AI-ikonok és eladást segítő tartalmak

A meglévő szerkezet, szövegek és URL-ek változatlanul maradnak. Csak új, kiegészítő
elemek kerülnek be — semmit nem írok át, nem rövidítek és nem fogalmazok újra.

## 1. AI-generált ikonkészlet

Egységes, lapos, átlátszó hátterű ikonok az arculati sötétzöldben (`#217346`),
a jelenlegi lucide-ikonok mellé / helyett a kártyákon:

- 4 ikon a főoldali pillérekhez (Hatékonyság, Innováció, Komplexitás, Pontosság)
- 8 ikon a „Mit találsz itt?” kártyákhoz (könyvelés, adó, audit, BI, kontrolling,
  termékek, kalkulátor, oktatás)
- 3 ikon a termékoldali „Hogyan működik?” lépésekhez
- 1 ikon az AI-szekcióhoz

Az ikonok CDN-asset pointerként kerülnek be, nem bináris fájlként a repóba.

## 2. Új főoldali szekció: AI-alapú fejlesztés

Új blokk a „Mit találsz itt?” után. Javasolt szöveg (jóváhagyásra):

> **AI-val gyorsított fejlesztés**
> A szoftvereimet és a belső folyamataimat AI-eszközökkel gyorsítom. Ez azt jelenti,
> hogy a termékeim rövidebb ciklusokban fejlődnek: ami korábban hetekbe telt, ma
> napok kérdése — így az ügyfeleim folyamatosan újabb, jobb verziókat kapnak.
> Az AI nálam nem varázsszó, hanem munkaeszköz: a szakmai döntés, az ellenőrzés és
> a felelősség marad az enyém.

Három rövid alpont mellé: gyorsabb fejlesztési ciklus · folyamatos verziófrissítés ·
emberi szakmai ellenőrzés.

## 3. Termékoldalak eladást segítő blokkjai

A meglévő szöveg és funkciólista érintése nélkül, alá:

- **Kinek készült?** – 4 rövid célközönség-kártya ikonnal (könyvelőiroda, egyéni
  könyvelő, pénzügyi csapat, külföldi rendszert használó cég)
- **Hogyan működik?** – 3 lépés (letöltés → adószám/kulcs megadása → Excel kimenet)
- **Mit nyersz vele?** – időmegtakarítás, kevesebb kézi hiba, importálható kimenet
- **GYIK** – 4-5 kérdés (Windows-kompatibilitás, frissítések, számla/áfa,
  hol kapom meg a fájlt) + FAQ JSON-LD a kereső- és AI-láthatóságért
- Ismételt CTA-sáv az oldal alján („Megrendelem – 19 900 Ft”)

A GYIK-válaszokat konkrét, ellenőrizhető adatok nélkül fogalmazom meg ott, ahol nincs
tényadatom — a bizonytalan pontokat (pl. hányszor van frissítés) a jelentésben
külön kilistázom jóváhagyásra.

## 4. Termékeim oldal

- Az AI-szekció rövid változata
- „Miért érdemes tőlem venni?” blokk: saját fejlesztés, könyvelői szakértelem,
  magyar nyelvű támogatás, folyamatos verziófrissítés

## 5. Vizuális kiegészítők

- 1-2 absztrakt, AI-generált illusztráció az AI-szekcióhoz és a termékoldalak
  „Hogyan működik?” blokkjához
- **Nem** generálok kitalált szoftver-képernyőképet: az félrevezető lenne. Ha
  kapok tőled valódi képernyőképet a két programról, azt beteszem a termékoldalakra.

## Technikai megjegyzések

- Minden új tartalom szerveroldalon renderelt (SSR), hogy a Google és az
  AI-crawlerek is lássák; oldalanként továbbra is egy `<h1>`.
- Az ikonok `lovable-assets` CDN-pointerrel, átlátszó PNG-ként kerülnek be.
- A FAQ JSON-LD a meglévő Product JSON-LD mellé kerül a termékoldalakra.
- Nincs adatbázis- vagy backend-változás.

## Amit ez nem tartalmaz

- Meglévő szöveg átírását, oldalak átszervezését, új menüpontot
- Fizetési integrációt (az a következő kör)
- AI-videót (a Termékeim oldalon már van egy) — ha kérsz még egyet, szólj
