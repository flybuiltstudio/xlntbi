# Hero háttér: deszka-oszlopok animáció + fejléc animáció törlése

## Mit csinálunk

### 1. Fejléc „paletta-dominó" animáció teljes törlése
- `src/components/HeaderIntro.tsx` fájl törlése.
- `src/components/SiteHeader.tsx`: a `HeaderIntro` import és a `{pathname === "/" ? <HeaderIntro /> : null}` sor eltávolítása (a header ettől függetlenül változatlan marad).
- `src/styles.css`: a `@keyframes header-palette`, a `.header-intro-col` szabály és a hozzá tartozó `prefers-reduced-motion` blokk törlése.

### 2. Deszka-oszlopok a Főoldali hero hátterében
A bekarikázott hero-háttér csíkozása helyett CSS-ből generált, deszkaszerű függőleges oszlopok kerülnek, amelyek folyamatosan, finoman nyílnak-csukódnak a háttérben (mint egy lamellafal / vertikális reluxa).

- Új komponens: `src/components/HeroPlanks.tsx`
  - ~14–18 függőleges „deszka" oszlop, egymástól apró résekkel elválasztva (széle, árnyékja van, mint egy padlódeszkának/lamellának).
  - A márkazöld színskála halvány árnyalatai váltakoznak rajtuk, hogy az eddigi sötétzöld hangulat megmaradjon.
  - Minden deszka egy új `@keyframes hero-planks` animációval nyílik-csukódik (`scaleY` vagy `translateY` + enyhe fényárnyalat-váltás), eltolt késleltetéssel, folyamatos, vég nélküli hurkokban — visszafogott, nem zavaró mozgás.
  - `pointer-events-none`, `aria-hidden` — csak díszítő réteg.
- `src/routes/index.tsx` hero szekció:
  - A `bcg-savok.jpg` háttérkép **csak a főoldali heroból** kerül le, helyére a `HeroPlanks` réteg lép (a többi oldal `PageHero`-ja és a lábléc változatlanul a meglévő képet használja).
  - A meglévő sötétzöld átmenet (`bg-gradient-to-r from-brand-dark/90 ...`) a deszkák fölött marad, így a szöveg olvashatósága nem romlik.
- `src/styles.css`: új `hero-planks` keyframes + `prefers-reduced-motion: reduce` esetén az animáció kikapcsolva (statikus deszkák maradnak).

## Technikai részletek
- Törlendő: `src/components/HeaderIntro.tsx`; `styles.css` `header-palette` szakasz.
- Módosul: `src/components/SiteHeader.tsx`, `src/routes/index.tsx`, `src/styles.css`.
- Új: `src/components/HeroPlanks.tsx`.
- Sem adatbázis, sem backend változás nincs.
- Ellenőrzés: build + előnézetben a főoldali hero vizuális átnézése, fejléc animációmentességének és a hidratációs hiba megszűnésének ellenőrzése (a HeaderIntro okozta a jelenlegi hydration mismatch hibát is).
