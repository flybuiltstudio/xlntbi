# Admin „Friss verzió” oldal: termékleírás-frissítő Word-ből és ár-frissítő Stripe-szinkronnal

Két új blokk kerül az admin **Friss verzió feltöltés** oldalra, a „Kalkulátor frissítése” blokk **fölé** és **alá**:

1. **Termékleírás frissítése Word dokumentumból** (a Kalkulátor blokk fölött)
2. **Termékárak frissítése** licencszintenként, Stripe-szinkronnal (a Kalkulátor blokk alatt)

Mindkettő csak `admin` szerepkörrel érhető el, a meglévő admin-kapun keresztül.

## 1. Termékleírás frissítése Word-ből

- Legördülőből kiválasztod a terméket (a katalógusból, kategória szerint rendezve), majd feltöltesz egy `.docx` fájlt (max 10 MB). A célt a kiválasztott termék határozza meg, nem a fájl neve.
- A szerver kinyeri a Word szöveges tartalmát (címsorok, bekezdések, felsorolások megtartásával), majd AI-val **eladást segítő stílusban átfogalmazza** a jelenlegi termékoldalak hangvételére. Az AI nem tehet bele semmit, ami nem szerepel a dokumentumban: nincs kitalált funkció, ár, referencia vagy határidő.
- Az AI a következőket állítja elő magyarul:
  - bevezető bekezdés(ek),
  - funkciólista,
  - „Miért jó neked?” blokk,
  - rövid összefoglaló a Termékek oldal kártyájához,
  - oldalcím (max 60 karakter) és meta leírás (max 160 karakter).
- Ezután **automatikusan elkészül az angol változat is** (ugyanezek a mezők), és azonnal élesbe kerül. Ha a fordítás nem sikerül, a magyar akkor is mentődik, és a panel hibát jelez.
- Külön gomb: **„Angol leírás újragenerálása”** — a már mentett magyar leírásból újrafordít, Word-feltöltés nélkül.
- Mentés előtt **előnézet**: a panel megmutatja a generált magyar (és angol) szöveget, és csak a „Közzététel” gombra kerül élesbe. Így egy félresikerült átfogalmazás nem jelenik meg a nyilvános oldalon.
- A panel mutatja, melyik termék fut felülírt leírásról (fájlnév + dátum), és **„Eredeti visszaállítása”** gombbal törölhető a felülírás — ekkor újra a kódban lévő szöveg jelenik meg.

## 2. Termékárak frissítése

- Legördülőből termék, alatta **minden licencszint külön beviteli mezővel** (jelenlegi ár előre kitöltve, licenc neve és Stripe-árazonosító látszik).
- Mentéskor:
  - az új ár rögtön megjelenik a termékoldalon, a Termékek listán, a megrendelőlapon és az ár struktúrált adatában (Google-ban látszó ár) is,
  - a **Stripe-ban is átáll**: a teszt és az éles környezetben egyszerre, új ár jön létre ugyanazzal az árazonosítóval (a lookup key átkerül az új árra), a régi ár inaktívvá válik. A korábbi rendelések és számlák érintetlenek maradnak.
  - Ha az éles Stripe még nincs beállítva, a teszt frissül, és a panel egy sorban jelzi, hogy az éles kimaradt.
- A panel visszaigazolást ad tételesen: licenc neve, régi ár → új ár, teszt/éles állapot, hibák a Stripe hibaüzenetével.
- Ellenőrző lista a blokk alján: hol tér el a helyi ár a Stripe-ban lévőtől, egy kattintással szinkronizálható.
- „Eredeti ár visszaállítása” gomb licencszintenként (a kódban lévő árra állít vissza, és a Stripe-ot is visszaírja).

## Biztonság és jog

- Új táblák RLS-sel: nyilvános **csak olvasás** (hogy a leírás és az ár a szerver által adott HTML-ben, keresőknek is látszódjon), írás kizárólag szerveroldalról, admin ellenőrzés után. GRANT-ok a migrációban.
- Az AI-kulcs és a Stripe-hívások szerveroldalon maradnak.
- Fájltípus- és méretellenőrzés szerveroldalon is.

## Technikai részletek

- **Migráció:**
  - `product_content_overrides` — `slug` (PK), `intro`, `features`, `why`, `summary`, `meta_title`, `meta_description`, ugyanezek `*_en` párja, `source_file_name`, `updated_at`, `updated_by`.
  - `product_price_overrides` — `slug` + `tier_id` (összetett PK), `price`, `stripe_price_id`, `synced_sandbox_at`, `synced_live_at`, `updated_at`, `updated_by`.
  - RLS: `SELECT` az `anon`/`authenticated` rolenak; írás nincs (service role végzi). GRANT-ok külön sorban.
- **Új fájlok:**
  - `src/lib/docx-text.server.ts` — `.docx` szövegkinyerés tiszta JS-sel (ZIP + `word/document.xml`), natív függőség nélkül (Worker-kompatibilis).
  - `src/lib/product-content.server.ts` — AI-átfogalmazás és angol fordítás a Lovable AI Gateway-en (streamelt hívás, a `calculator-translate.server.ts` mintájára), strukturált (JSON séma) kimenettel; upsert/törlés/listázás.
  - `src/lib/product-content.functions.ts` — admin server function-ök: `adminGenerateProductDescription` (előnézet), `adminPublishProductDescription`, `adminRegenerateProductDescriptionEn`, `adminListProductContentOverrides`, `adminDeleteProductContentOverride`.
  - `src/lib/product-overrides.functions.ts` — nyilvános, csak olvasó lekérdezés (leírás + ár) az oldalak SSR-jéhez.
  - `src/lib/product-prices.server.ts` — ár-upsert, Stripe `prices.create({ lookup_key, transfer_lookup_key: true })` + régi ár deaktiválása mindkét környezetben, `createStripeClient` és `getStripeErrorMessage` használatával; eltérés-riport.
  - `src/lib/product-prices.functions.ts` — admin server function-ök (lista, mentés, szinkron, visszaállítás).
  - `src/components/admin-panels.tsx` — `ProductDescriptionPanel` és `ProductPricePanel`; beköve a `src/routes/admin.friss-verzio.tsx`-be a kért sorrendben.
- **Ár- és leírás-érvényesítés az oldalakon:** a felülírásokat egyszer, a gyökér betöltője kéri le és teszi a router kontextusába, így a termékoldal, a Termékek lista, a megrendelőlap és az ár-metaadat mind ugyanazt a friss értéket használja, a szerver által adott HTML-ben (SSR megmarad). A `src/lib/products.ts` és `products-en.ts` marad az alapérték; a felülírás csak felette rétegződik.
- **Ellenőrzés:** típusellenőrzés, majd élő próba adminként — egy Word-feltöltés előnézettel és közzététellel, angol újragenerálás, egy licencár átírása és a Stripe-ár visszaellenőrzése, végül visszaállítás.

## Amit ez nem tartalmaz

- Verziótörténet a leírásokból (a legutóbbi felülírás él; a kódban lévő eredeti mindig visszaállítható).
- Termékkép, letölthető fájl, kategória vagy licencszint-struktúra módosítása — csak szöveg és ár.
- Korábbi rendelések, számlák, kuponok árának módosítása.
