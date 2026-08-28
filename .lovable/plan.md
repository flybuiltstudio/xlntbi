# Mobil/táblagép menü: kinyitható almenük (Szolgáltatásaim, Kalkulátorok, Termékeim)

## Probléma
A mobil és táblagépes menü (`min-[900px]:hidden`) jelenleg egyetlen lapos listát
rajzol ki ~20 elemmel: Főoldal, Szolgáltatásaim, 8 szolgáltatás-aloldal,
6 kalkulátor, Termékeim, Oktatás, Rólam, Kapcsolat, Konzultáció. Az 8 szolgáltatás
és a 6 kalkulátor külön elválasztás nélkül sorjázik — átláthatatlan.

## Megoldás: harmonika (accordion) almenük
A mobil menüben a `Termékeim`, `Kalkulátorok` és `Szolgáltatásaim` legyen
kinyitható / becsukható blokk, mint a desktopos lenyíló menü, csak érintésre
nyíló variánssal. A többi főmenü link (Főoldal, Oktatás, Rólam, Kapcsolat,
Konzultáció) marad egyszerű link.

### Új mobil menü szerkezete (sorrend)
```
Főoldal                              → link
Szolgáltatásaim   [chevron]         → kinyitható
   Könyvelés, Adótanácsadás, Fintech és BI, Kontrolling, Cégaudit,
   Könyvvizsgálat, Könyvelőiroda audit, Digitális időmegtakarítási audit
Kalkulátorok       [chevron]         → kinyitható
   Összes kalkulátor, Számla dátumok, Invoice Dates (EN),
   Bérteszt, Jövedelemadó, Átalányadó
Termékeim          [chevron]         → kinyitható (1. szint)
   Összes termék                     → link a /termekeim oldalra
   Bérszámfejtés              [chevron] → kinyitható (2. szint: kategória)
      → kategória termékei, egyenként link a /termek/$slug adatlapra
   Számla, nyugta könyvelés   [chevron]
      → termékadatlap-linkek
   Vegyes könyvelés           [chevron]
      → termékadatlap-linkek
   Bank                       [chevron]
      → termékadatlap-linkek
   Riportok és beszámolók     [chevron]
      → termékadatlap-linkek
   Adózás                     [chevron]
      → termékadatlap-linkek
   Egyebek                    [chevron]
      → termékadatlap-linkek
Oktatás                              → link
Rólam                                → link
Kapcsolat                            → link
Konzultáció                          → gomb
```

A sorrend megegyezik a desktop főnavigációval: **Főoldal → Szolgáltatásaim
→ Kalkulátorok → Termékeim → Oktatás → Rólam → Kapcsolat → Konzultáció**.
Szolgáltatás előre, Termékeim utána — ahogy kérted.

### Termékeim: kétszintű kinyíló (kategória → termékadatlap)
- A `Termékeim` fejsor kinyitásakor először egy „Összes termék" link jelenik meg
  (a `/termekeim` oldalra), alatta a 7 kategória sorban.
- Minden kategória sor önállóan kinyitható; a kategórián belül a termékek
  neve link, a `/termek/$slug` részletes adatlapra visz.
- Adatforrás: a meglévő `productCategories` és `categoryProducts` a
  `src/lib/product-categories.ts`-ből — ez statikus, így az SSR HTML-ben is
  megjelenik minden link (keresőknek/AI-crawlereknek látható).
- Megjegyzés: a menü a beépített (alapértelmezett) kategória- és
  terméksorrendet követi. Az adminban drag-and-droppal állított sorrend a
  Termékeim oldalra érvényes; a menü ettől független, stabil sorrendű marad.
  (Ha később szeretnéd, hogy a menü is kövesse az admin sorrendet, az külön
  kör — a fejléc minden oldalon betöltődik, ott nem szeretnénk minden
  oldalletöltéshez adatbázis-lekérdezést.)

### Implementáció (`src/components/SiteHeader.tsx`, csak a mobil menü blokk)
- Bevezetni egy `openSections` állapotot: `useState<Record<string, boolean>>`,
  alapból minden csukva (kulcsok: `termekeim`, `kalkulatorok`,
  `szolgaltatasaim`, valamint kategóriánként `kat-<key>`).
- Kattintható fejsorok (gomb) címkével és jobb oldali `ChevronDown` ikonnal,
  ami `rotate-180`-ra vált nyitott állapotban. `aria-expanded` jelzi az
  állapotot a képernyőolvasóknak.
- Az almenük beágyazott `<ul>`-ek: a kategóriák `pl-3`, a terméklinkek
  további `pl-3` behúzással és kisebb (`text-sm`) betűmérettel jelennek meg,
  hogy a hierarchia vizuálisan is olvasható legyen.
- A fejsorok kattintása váltogatja a nyitottságot; a szakaszok egymástól
  függetlenül nyithatók. Alapból minden csukva indul, hogy a menü ne legyen
  egyből túl hosszú.
- A meglévő `setOpen(false)` (menü bezárása) továbbra is lefut, ha bármely
  végleges linkre (termék, kalkulátor, szolgáltatás, főmenüpont) kattintanak;
  a kinyitható fejsorok kattintása nem zárja be a menüt.

### Érintésbarát részletek
- Minden fejsor `min-h-11` (44px) kattintható terület — touch guideline.
- Az egész fejsor kattintható, nem csak az ikon.
- Sima CSS `transition` a chevron forgására és az almenü megjelenítésére;
  nincs JS animációs könyvtár, nincs új függőség.

## Technikai részletek
- Csak egy fájlt érint: `src/components/SiteHeader.tsx`.
- A desktop navigáció (`min-[900px]:flex`) és a `services` / `calculators` /
  `productCategories` tömbök tartalma nem változik.
- SSR HTML: az almenük `<a href>` linkjei továbbra is a szerver által
  visszaadott HTML-ben szerepelnek (csak CSS-sel rejthetők, nem feltételesen
  renderelve) — a keresők és AI-crawlerek változatlanul látják őket.
