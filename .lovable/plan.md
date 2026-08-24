# Admin „Friss verzió feltöltés" oldal — termékfájl és kalkulátor csere

## Cél

Új admin aloldal (`/admin/friss-verzio`, a menüben 2. helyen, „Megrendelések" után), két szekcióval:

1. **Termék új verziója** — legördülőből kiválasztott termékhez .xlsm/.exe fájl feltöltése, amely felülírja a tárolt verziót. A kiválasztott termék határozza meg a célt, nem a feltöltött fájl neve.
2. **Kalkulátor frissítése** — legördülőből kiválasztott kalkulátor felülírása egy új .html fájllal.

Mindkét szekció csak `admin` szerepkörrel érhető el (a `user` szerepkör továbbra is csak a Statisztikát látja — a meglévő átirányítás ezt automatikusan kezeli).

## 1. szekció: Termékfájl csere

- A legördülő a `src/lib/products.ts` `products` tömbjéből épül fel (csak `available` státuszú, `download` útvonallal rendelkező termékek). Mivel a Termékek oldal is innen dolgozik, minden oda felvett új termék automatikusan megjelenik a listában.
- A kiválasztott termék alatt látszik a jelenlegi fájl neve és az utolsó módosítás dátuma (a tároló metaadataiból).
- Fájlválasztó: `.xlsm` és `.exe` kiterjesztés, méretkorlattal (max 50 MB), a kiterjesztésnek egyeznie kell a meglévő fájléval (.xlsm helyére nem megy .exe).
- Feltöltéskor a fájl a `termekfajlok` privát tárolóban a termék **meglévő `storagePath` útvonalára** töltődik felülírással (`upsert`). Így:
  - a korábbi vásárlók letöltő linkjei tovább működnek, és már az új verziót szolgálják ki,
  - a fájlnév és az e-mailekben szereplő név nem változik,
  - nem kell adatbázis-módosítás.
- Sikeres feltöltés után visszajelzés: termék neve, fájlnév, méret, időpont.

## 2. szekció: Kalkulátor frissítése

A kalkulátorok jelenleg a kódba épített modulok (`src/lib/calculators/*.ts`, html + script), ezért a futásidejű cseréhez adatbázis-felülírás kell:

- **Új tábla: `calculator_overrides`** — `key` (elsődleges kulcs), `html`, `script`, `file_name`, `updated_at`, `updated_by`.
- A legördülő az 5 kalkulátort tartalmazza (Számla dátumok, Invoice Dates, Bérteszt, Jövedelemadó, Átalányadó) — közös, bővíthető listából.
- Feltöltéskor a .html fájl tartalma szerveroldalon kettéválik: a `<script>` blokkok a `script` mezőbe, a többi markup a `html` mezőbe, majd felülírás (upsert).
- A kalkulátor-oldalak (`kalkulatorok.*.tsx`) betöltője ezentúl lekérdezi a felülírást: **ha van, azt rendereli; ha nincs, a beépített verzió marad**. A tartalom továbbra is a szerver által adott HTML-ben jelenik meg (SSR megmarad, a keresők láthatósága nem romlik).
- A szekció mutatja, melyik kalkulátor fut felülírt verzióról (fájlnév + dátum), és **„Eredeti visszaállítása"** gombbal törölhető a felülírás.

## Biztonság

- Minden új szerverfüggvény a meglévő admin-kapun (`assertAdmin`) megy át; a tároló- és táblaműveletek szerveroldalon, service role-lel történnek.
- A `calculator_overrides` tábla: RLS bekapcsolva, nyilvános **csak olvasás** (a kalkulátor-oldalak SSR-jéhez), írás kizárólag szerveroldalról. GRANT-ok a migrációban.
- Fájltípus- és méretellenőrzés szerveroldalon is.

## Technikai részletek

- **Migráció:** `calculator_overrides` tábla + GRANT-ok + RLS-policy-k (a típusdefiníciók frissülnek).
- **Új/módosított fájlok:**
  - `src/routes/admin.friss-verzio.tsx` — új aloldal (PageHero, noindex, két szekció)
  - `src/components/admin-panels.tsx` — `ProductVersionPanel` és `CalculatorVersionPanel` komponensek
  - `src/lib/admin.functions.ts` — `adminUploadProductVersion`, `adminListProductFiles`, `adminUploadCalculatorVersion`, `adminListCalculatorOverrides`, `adminDeleteCalculatorOverride` (FormData-alapú feltöltés, admin-gate)
  - `src/lib/admin.server.ts` — tároló-felülírás (`upsert: true`), override upsert/törlés/listázás
  - `src/lib/calculator.functions.ts` (új) — nyilvános `getCalculatorOverride` lekérdezés
  - `src/lib/calculators/registry.ts` (új) — kalkulátor kulcs + megjelenítési név lista
  - `src/lib/calculators/split.ts` (új) — `<script>`-kinyerő segéd (szerveroldali)
  - `src/routes/kalkulatorok.*.tsx` (5 fájl) — loader az override-hoz, fallback a beépített verzióra
  - `src/routes/admin.tsx` — új fül beszúrása 2. helyre (csak admin szerepkörnél)
- **Ellenőrzés:** típusellenőrzés + élő próba: adminként egy .xlsm felülírása és egy kalkulátor-html cseréje/visszaállítása, a letöltő link és a kalkulátor-oldal működésének ellenőrzésével.

## Amit ez NEM tartalmaz

- A termékoldalakon látható szövegek, árak, leírások nem módosulnak — csak a letölthető bináris cserélődik.
- Verziótörténet/archívum nem készül (a régi fájl felülíródik); ha kell, később bővíthető.
