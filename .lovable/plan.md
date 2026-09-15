# Termékeim oldal javítások + asztali Termékeim lenyíló menü

## 1. „Termékek megtekintése” gomb működjön
A gomb most ugyanarra az oldalra mutató link, ezért a böngésző nem ugrik le a
szakaszhoz. A gomb kattintásra a „Megrendelhető termékek” szakaszra fog
görgetni (sima, animált görgetés), az URL-ben pedig ott marad a szakasz
azonosítója, hogy megosztható legyen.

## 2. Figyelemfelhívó gomb-animáció
A „Termékek megtekintése” gomb finoman, folyamatosan váltakozik a márka zöld
alapon fehér szöveg és a fehér alapon zöld szöveg között (lassú, ~3 másodperces
átmenet, zöld keret mindkét állapotban). Aki a rendszerében kikapcsolta az
animációkat, annak a gomb változatlanul, zölden áll.

## 3. Kevesebb hely a „Megrendelhető termékek” cím fölött
A szakasz felső térköze a felére csökken (a cím alatti rész marad a mostani).

## 4. „Mit találsz itt?” lista átírása
Új tartalom és sorrend:

1. Bérszámfejtési és könyvelési segédeszközöket
2. Riportkészítési segédeszközöket
3. Beszámolókészítő digitális megoldásokat, akár komplex makrókkal is
4. Adókalkulációs és iparűzési adóhoz kapcsolódó segédprogramokat
5. Bank feldolgozás és utaláshoz kapcsolódó segédeszközöket

Az angol Products oldal ugyanezt a listát kapja angolul, ugyanebben a
sorrendben, hogy a két nyelv ne csússzon el egymástól.

## 5. Asztali „Termékeim” menü két szinten nyíljon
Az asztali fejlécben a Termékeim menüpont a Szolgáltatásaim/Kalkulátorok
menükhöz hasonlóan lenyílik, de két szinten: első szint a termékkategóriák
(legfelül az „Összes termék” link), és egy kategóriára mutatva jobbra kinyílik
a benne lévő termékek listája, ahonnan közvetlenül a termék aloldalára lehet
ugrani. Ugyanaz a tartalom, mint a mobil menüben; a mobil menü nem változik.
Az angol fejlécben ugyanígy működik.

## Technikai részletek
- `src/routes/termekeim.tsx`: `features` tömb átírása; a szakasz `py-16` →
  `pt-8 pb-16`; a gomb `Link` helyett `hash` + `onClick` scroll a
  `#megrendelheto-termekek` elemre (`scrollIntoView({ behavior: "smooth" })`),
  plusz `animate-attention-pulse` osztály.
- `src/routes/en.products.tsx`: az angol „What you'll find here” lista
  frissítése ugyanerre a szerkezetre.
- `src/styles.css`: új `@keyframes` + `@utility animate-attention-pulse`
  (background/text/border színváltás, `prefers-reduced-motion` esetén kikapcsolva),
  design tokenekkel, nem hardcode színnel.
- `src/components/SiteHeader.tsx`: a desktop navban a Termékeim link egy
  `group relative` konténerbe kerül, benne az „Összes termék” link és a
  `productCategories` lista; kategória-soronként beágyazott `group/cat`
  alcsoport `absolute left-full top-0` almenüvel, `categoryProducts(cat)`
  elemekkel, `/termek/$slug` linkekre. Hover és `focus-within` is nyitja,
  billentyűzettel bejárható.
