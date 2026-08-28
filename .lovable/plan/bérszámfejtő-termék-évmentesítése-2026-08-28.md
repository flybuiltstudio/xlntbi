# Bérszámfejtő termék évmentesítése

A Beszámolónál elvégzett teljes éves-kezelést átvezetjük a Bérszámfejtő terméken: eltávolítjuk a „2026" évszámot a névből, azonosítókból és útvonalakból, év-függetlenítjük a leírást, és hozzáadjuk azt a megjegyzést, hogy a vásárlás az adott évi verzióra szól, tehát évente új verziót kell vásárolni. A licenccsomagok száma (3 db) nem változik — az a Beszámolónál egy külön kérés volt, ide nem tartozik.

## Érintett fájlok

- `src/lib/products.ts` — a bérszámfejtő termék blokkja
- `src/lib/product-categories.ts` — slug hivatkozás
- `src/routes/termek.berszamfejto-2026.tsx` → átnevezve `src/routes/termek.berszamfejto.tsx`
- `public/sitemap.xml` — URL frissítés
- Stripe (a payments eszközön keresztül) — új, év nélküli termék + árak

## Változások részletei

### Azonosítók (slug / priceId / útvonal)
- slug: `berszamfejto-2026` → `berszamfejto`
- név: `Bérszámfejtő 2026` → `Bérszámfejtő`
- alap priceId: `berszamfejto_2026_alap` → `berszamfejto_alap`
- tier priceId-k: `berszamfejto_alap`, `berszamfejto_standard`, `berszamfejto_konyveloi`
- útvonal: `/termek/berszamfejto-2026` → `/termek/berszamfejto`
- canonical / og:url: `https://xlntbi.hu/termek/berszamfejto`
- sitemap.xml: a régi URL helyett az új

### Leírás év-függetlenítése
- intro: „A Bérszámfejtő 2026 mindkét lépést..." → „A Bérszámfejtő mindkét lépést..."
- feature: „a 2026-os értékhatárokkal" → „az aktuális évi értékhatárokkal"
- metaTitle: `Bérszámfejtő 2026 | EXCELlent` → `Bérszámfejtő | EXCELlent`
- JSON-LD (route): név és leírás év nélkül, url frissítve; breadcrumb név frissítve

### Éves verzióra vonatkozó megjegyzés (mint a Beszámolónál)
- intro végére új bekezdés: a megvásárolt licenc a megrendelés évére érvényes verzióra szól; mivel a hatályos szabályok és az ÁNYK űrlapok évente változhatnak, minden évben frissített verzió készül, az új évi bérszámfejtéshez az aktuális évhez tartozó verziót külön meg kell vásárolni.
- mindhárom tier `note` mezőjéhez: „A vásárlás az adott évi verzióra szól."

### Letöltés
- fileName: `Berszamfejto_2026.xlsm` → `Berszamfejto.xlsm`
- storagePath: változatlan marad (`berszamfejto-2026/Berszamfejto_2026.xlsm`) — ez a ténylegesen feltöltött fájl belső elérési útja, a Beszámolónál is így maradt.

### Stripe
- Új termék: `berszamfejto`
- Új one-time árak (fillérben, HUF × 100), `quantity_min=1, quantity_max=1`:
  - `berszamfejto_alap` — 2 490 000 (24 900 Ft)
  - `berszamfejto_standard` — 3 990 000 (39 900 Ft)
  - `berszamfejto_konyveloi` — 7 490 000 (74 900 Ft)

## Nem változik
- 3 licenccsomag megmarad (Alap / Standard / Könyvelői)
- Árak összege nem változik
- A Bérteszt ingyenes kalkulátor oldalt nem érintjük (az a 2026-os szabályokra hivatkozik, külön termék)
- Letöltő fájl tényleges tartalma a tárolóban változatlan

## Ellenőrzés a végén
- `grep -r "berszamfejto-2026\|berszamfejto_2026\|Bérszámfejtő 2026"` nem ad találatot a src/-ben és sitemapben
- routeTree.gen.ts automatikusan regenerálódik a build során
- termékladlap /termek/berszamfejto betölt és a megrendelés link a megfelelő slugot viszi
