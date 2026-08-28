# Mobil/táblagép menü: kinyitható almenük a Szolgáltatásokhoz és Kalkulátorokhoz

## Probléma
A mobil és táblagépes menü (`min-[900px]:hidden`) jelenleg egyetlen lapos listát
rajzol ki ~20 elemmel: Főoldal, Szolgáltatásaim, 8 szolgáltatás-aloldal,
6 kalkulátor, Termékeim, Oktatás, Rólam, Kapcsolat, Konzultáció. Az 8 szolgáltatás
és a 6 kalkulátor külön elválasztás nélkül sorjázik — átláthatatlan.

## Megoldás: harmonika (accordion) almenük
A mobil menüben a `Szolgáltatásaim` és `Kalkulátorok` legyen kinyitható /
becsukható blokk, mint a desktopos lenyíló menü, csak érintésre nyíló
variánssal. A többi főmenü link (Főoldal, Termékeim, Oktatás, Rólam,
Kapcsolat, Konzultáció) marad egyszerű link.

### Új mobil menü szerkezete (sorrend)
```
Főoldal                              → link
Termékeim                            → link
Kalkulátorok        [chevron]        → kinyitható
   Összes kalkulátor
   Számla dátumok
   Invoice Dates (EN)
   Bérteszt
   Jövedelemadó
   Átalányadó
Szolgáltatásaim    [chevron]         → kinyitható
   Könyvelés
   Adótanácsadás
   Fintech és BI
   Kontrolling
   Cégaudit
   Könyvvizsgálat
   Könyvelőiroda audit
   Digitális időmegtakarítási audit
Oktatás                              → link
Rólam                                → link
Kapcsolat                            → link
Konzultáció                          → gomb
```

A sorrend megegyezik a desktop főnavigációval (a korábban jóváhagyott terv
szerint: Főoldal → Termékeim → Kalkulátorok → Szolgáltatásaim → …).

### Implementáció (`src/components/SiteHeader.tsx`, csak a mobil menü blokk)
- Bevezetni egy `openSections` állapotot: `useState<Record<string, boolean>>`,
  alapból minden csukva (vagy csak `kalkulatorok`/`szolgaltatasaim` kulcsok).
- Két kattintható fejsor (gomb) a `Kalkulátorok` és `Szolgáltatásaim`
  címkékkel, jobb oldalon `ChevronDown` ikonnal, ami `rotate-180`-ra vált,
  ha nyitva van. `aria-expanded` jelzi az állapotot a képernyőolvasóknak.
- A lenyíló listaelemek beágyazott `<ul>`-be kerülnek, `pl-3` behúzással és
  kisebb (`text-sm`) betűmérettel, hogy vizuálisan almenneként jelenjenek meg.
- Kattintás a fejsoron váltogatja a nyitottságot; nem zárja be a másikat
  (több nyitott szakasz is lehet), de alapból csukva indulnak, hogy a menü
  ne legyen egyből túl hosszú.
- A meglévő `setOpen(false)` (menü bezárása) továbbra is lefut, ha egy almenü
  linkjére kattintanak.

### Érintésbarát részletek
- A fejsor `min-h-11` (44px) kattintható terület — Apple/Google touch guideline.
- Az egész fejsor kattintható, nem csak az ikon.
- Sima CSS `transition` a chevron forgására és az almenü megjelenítésére;
  nincs JS animációs könyvtár, nincs új függőség.

## Technikai részletek
- Csak egy fájlt érint: `src/components/SiteHeader.tsx`.
- A desktop navigáció (`min-[900px]:flex`) és a `services` / `calculators`
  tömbök tartalma nem változik.
- SSR HTML: az almenük `<a href>` linkjei továbbra is a szerver által
  visszaadott HTML-ben szerepelnek (csak CSS-sel rejthetők, nem feltételesen
  renderelve) — a keresők és AI-crawlerek változatlanul látják őket.
