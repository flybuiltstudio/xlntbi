# Terv: Főoldal "Mit találsz itt?" eltávolítása + lábléc egyszerűsítése + logó csere

## 1. Főoldal — "Mit találsz itt?" szekció eltávolítása

**Fájl:** `src/routes/index.tsx`

- Törlöm a "Mit találsz itt?" szekciót (kb. 223–266. sor) — a `<section className="border-t border-border bg-secondary/60">` blokkot a "Kapcsolat" gombbal együtt.
- Törlöm a `offerings` tömböt (61–74. sor), mert csak ez a szekció használta.
- Törlöm a 8 már nem használt ikon-importot: `icKonyveles`, `icAdo`, `icAudit`, `icBi`, `icKontrolling`, `icTermekek`, `icKalkulator`, `icOktatas`.
- A `pillars` és AI szekció ikonjai (`icHatekonysag`, `icInnovacio`, `icKomplexitas`, `icPontossag`, `icAi`, `aiIllustration`) bennmaradnak.

## 2. Lábléc navigáció egyszerűsítése

**Fájl:** `src/components/SiteFooter.tsx`

**Eltávolítás:**
- A "Szolgáltatások" oszlop (8 egyedi szolgáltatás-link) — egész nav blokk törlése.
- A konkrét termékek linkjei (`NAV Online Számla letöltő`, `NAV Pénztárgép letöltő`) — sok termék van, nem férnek el.
- `Kalkulátorok` és `Oktatás` linkek is kikerülnek a láblécből (a felső menüben maradnak).

**Új "Oldalak" oszlop — pontosan 5 link, ebben a sorrendben:**
1. Termékeim → `/termekeim`
2. Szolgáltatásaim → `/szolgaltatasaim`
3. Rólam → `/rolam`
4. Konzultáció → `/konzultacio`
5. Kapcsolat → `/kapcsolat`

**Jogi információk oszlop:** változatlan marad ("elég ennyi").

**Rács elrendezés:** `md:grid-cols-4` → `md:grid-cols-3` (logo + nav + elérhetőség/jogi), mert eggyel kevesebb oszlop marad.

## 3. Lábléc logó cseréje

**Fájl:** `src/components/SiteFooter.tsx`

- Import: `xlnt-logo-white.png` (régi, 1,5 MB fehér verzió) → `xlntbi-logo.png.asset.json` (új HD logó, a fejléccel megegyező).
- Megjelenítés: `h-20 w-20` négyzet → `h-16 w-auto` (a fejléc stílusához igazodva, arányosabb).
- A logó a sötétzöld láblécen jelenik meg; az új logó zöld-fehér elemeket tartalmaz transzparens háttérrel, így látható marad.

## Változatlan marad
- Fejléc (SiteHeader) — nem módosul.
- Jogi oldalak tartalma — nem módosul.
- Hero szekció, AI szekció, pillars — nem módosulnak.
