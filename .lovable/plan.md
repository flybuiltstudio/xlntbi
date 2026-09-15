# Termékek megtekintése gomb – görgetés és kategória-villanás

## 1. A gomb görgetése: az üres hely látszódjon felül
A „Termékek megtekintése” gomb jelenleg a `#megrendelheto-termekek`
szakasz tetejére görget (`scrollIntoView block:start`), így a
kategóriakártyák kerülnek a látóteret tetejére, és alig látszik, hogy
kategóriát kell választani.

Cél: a gomb úgy álljon meg, hogy a „Megrendelhető termékek” feletti
üres sáv látszódjon a lap tetején (a fejléc alatt), és alatta jöjjön a
cím, a „Válassz kategóriát…” szöveg, majd a kártyák. Asztalin és
mobilon is.

Megoldás:
- A `megrendelheto-termekek` / `products` szakasz tetejére, a `<h2>`
  elé bekerül egy üres, csak görgetés-célú sentinel elem:
  `<div id="products-top" className="h-[15vh] md:h-[18vh]" aria-hidden />`
  (angol oldalon `id="products-top"` ugyanígy). Ez adja a látható
  üres sávot, függetlenül a képernyőmérettől.
- A gomb `scrollToSection` ezen sentinel id-re gördül
  (`block: "start"`), és a sentinelen `scroll-mt-24` (96px) van, hogy a
  ragadós fejléc (80px) ne takarja el az üres sáv tetejét.
- A korábbi `pt-8` felső térköz marad a cím fölött; az üres sávot a
  sentinel adja, így a nyugalmi elrendezés nem nő meg drasztikusan.

Ez visszaadja azt az üres teret, amit korábban
(csak a cím fölött) csökkentettünk – most gördüléskor láthatóvá válik.

## 2. Kategória-kártyák egyszeri, sorrendben történő felvillanása
A kategória képei a szakasz megjelenésekor (görgetés a látható területre
vagy gombra kattintás) egyszer, sorban villanjanak fel: enyhe
fényerő/skála/ring kiemelés, kártyáról kártyára késleltetve.

Megoldás:
- `src/styles.css`: új `@keyframes category-flash` (rövid, ~600 ms:
  `box-shadow`/`ring` + `scale(1.03)` + enyhe fényerő, majd vissza),
  és `@utility category-flash` osztály; `prefers-reduced-motion` esetén
  kikapcsolva.
- Mindkét termékoldalon (HU `termekeim.tsx`, EN `en.products.tsx`) a
  kategória-kártya `<Link>` kapja a `category-flash` osztályt és egy
  `style={{ animationDelay }}` értéket (`index * 0.12s`), ami csak
  egyszer lefut (`animation-iteration-count: 1`).
- Az animációt egy `IntersectionObserver` (vagy a gomb kattintása)
  aktiválja, amikor a kategória-grid belép a látótérbe; csak egyszer
  fusson. Egyszerűsítve: az osztály alapból rajta van, az
  `animationDelay`-jel sorban lefut, amint a böngésző rendereli
  (görgetésnél a láthatóvá válás pillanatában). Mivel `iteration-count:1`,
  nem ismétlődik.

## Érintett fájlok
- `src/routes/termekeim.tsx` – sentinel + gomb cél + flash osztály
- `src/routes/en.products.tsx` – ugyanaz angolul
- `src/styles.css` – `@keyframes category-flash` + utility, reduced-motion

## Nem változik
- A fejléc, a mobil menü, a kategóriák sorrendje, a termékkártyák,
  a „Mit találsz itt?” lista, a DEMO/pCloud blokkok, az angol oldalak
  tartalma.
