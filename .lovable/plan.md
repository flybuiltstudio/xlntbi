# Stripe terméknevek „XLNT ” előtaggal — szinkron és ellenőrzés

## Cél

1. A Stripe-ban tárolt **megjelenítési nevek** is „XLNT ” előtaggal kezdődjenek (ez látszik a fizetőűrlap tétel-sorában és a Stripe-számlákon).
2. Legyen egy ellenőrző felület, ami megmutatja, hol nem stimmel a név, és egy kattintással javítja.
3. Új termék felvitelekor mindenhol automatikusan előtagot kapjon a név, duplázás nélkül.

## Jelenlegi állapot (ellenőrzött)

- `src/lib/product-name.ts` — `withXlntPrefix` idempotens, kis/nagybetű-tűrő; `src/lib/products.ts` exportálás előtt minden terméknevet és meta címet átfut rajta.
- `src/utils/payments.functions.ts` — a Stripe fizetéshez küldött `payment_intent_data.description` már normalizált nevet használ, de a checkout **tétel-neve** a Stripe termékobjektum `name` mezőjéből jön, ami ma még előtag nélküli lehet.
- Admin oldalak: `admin.kuponok`, `admin.szamlazas`, `admin.fizetes-teszt`, `admin.friss-verzio`, `admin.statisztika` — nincs Stripe-katalógus szinkron felület.

## Amit építünk

### 1. Stripe terméknév-szinkron (admin)

Új admin panel: **Stripe terméknevek** (a Számlázás/Ellenőrzések menü alá kerül, csak `admin` szerepkörnek).

- Összeolvassa a helyi katalógust (`products.ts` árazonosítói) és a Stripe termékeket a lookup key-eken keresztül.
- Táblázat: árazonosító · Stripe-ban lévő név · kívánt (előtagos) név · státusz (Rendben / Javítandó).
- „Nevek javítása” gomb: minden eltérő terméknél `products.update` hívás a megosztott gateway-kliensen keresztül, `withXlntPrefix`-szel normalizált névvel. Idempotens — a már jó neveket nem bántja.
- Eredmény-összegzés magyarul (hány javítva, hány kihagyva, hibák tételesen a Stripe hibaüzenetével).
- Sandbox és éles környezet külön; a sandboxban átírt nevek publikáláskor szinkronizálódnak élesbe.

### 2. Checkout-ellenőrzés

A szinkron panelben egy „Checkout-ellenőrzés” blokk: az adott termékre létrehozott ellenőrző lekérés visszaadja a Stripe-tól a tétel-nevet, és jelzi, ha nem előtagos. Így látszik, hogy a fizetőűrlapon tényleg a helyes név jelenik meg — nem csak a fölötte lévő saját fejlécünkben.

### 3. Előtag mindenhol, automatikusan

- Az admin fájlfeltöltő és terméklista felületeken megjelenő nevek is a normalizálón mennek át.
- A rendelésekhez elmentett `product_name` mentéskor normalizálódik (a régi soroknál olvasáskor — ez a rész már kész).
- Új árazonosító létrehozásakor (`create_product` / `create_price`) a Stripe-ban használt terméknév eleve előtagos legyen; a szinkron panel utólag is elkapja, ha kimaradt.
- A tesztkészlet bővül: a katalógus minden terméknevére és a Stripe felé küldött névre ellenőrzés fut (`src/lib/product-name.test.ts`).

## Technikai részletek

- Szerveroldal: `src/lib/stripe-product-names.server.ts` — `listStripeProductNameStatus()` és `syncStripeProductNames()`; `createStripeClient(env)` a `@/lib/stripe.server`-ből, hibák `getStripeErrorMessage`-en át.
- Vékony wrapper `src/lib/stripe-product-names.functions.ts`-ben (`createServerFn`, `requireSupabaseAuth` + admin szerepkör-ellenőrzés a meglévő `src/lib/admin-access.ts` alapján).
- UI: `src/components/StripeProductNamePanel.tsx`, beköve az admin számlázás/ellenőrzés route-ba.
- Stripe-hívások: `prices.list({ lookup_keys })`, `products.retrieve`, `products.update({ name })`. A termék- és árazonosítók (sync key-ek) változatlanok maradnak.

## Amit nem érint

- Termék-ID-k, URL-ek, `storagePath` értékek, árak, kuponok — nem változnak.
- Az élő Stripe katalógus csak akkor módosul, ha az éles környezetben külön futtatod a szinkront (vagy publikálás során szinkronizálódik a sandboxból).
