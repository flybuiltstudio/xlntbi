# Kuponok admin oldal — listázás, szűrés és új kupon létrehozása

## Mit kapsz

A menüben a **Kuponok** a 2. pont lesz (a Friss verzió után, a Statisztika előtt). Az oldal három részből áll:

**1. Új kupon létrehozása (fent, nyitható űrlap)**
- Kuponkód (pl. `NYAR2026`) — nagybetűsítve, ütközés-ellenőrzéssel
- Kedvezmény: százalék (%) **vagy** fix összeg (Ft) — választható
- Érvényesség vége: dátum + idő (budapesti időben), a Stripe is elutasítja utána
- Környezet: teszt vagy éles
- Termékek: alapból „Minden termékre" pipa; kikapcsolva megjelenik a termékek listája kategóriánként, checkboxokkal
- Beváltási limit: „Korlátlan" pipa (alap), vagy megadott maximum szám
- Minimum rendelési összeg: „Nincs minimum" pipa (alap), vagy megadott Ft összeg

Létrehozás után a kód azonnal használható a pénztárban a kuponkód mezőben.

**2. Szűrők**
- Környezet: teszt / éles
- Állapot: érvényes / érvénytelen (lejárt vagy kikapcsolt) / összes
- Kódra kereső mező

**3. Kuponlista**
Minden eddigi kupon a választott környezetből, oszlopok: kód, kedvezmény, állapot, meddig érvényes (érvényes kuponnál) vagy mikor járt le / mikor kapcsolták ki, beváltások száma / limit, minimum összeg, érintett termékek („Minden termék" vagy a nevek). Soronként **Kikapcsolás** gomb, és CSV export.

## Fontos működési részlet

Élesben ma egy védőmechanizmus automatikusan kikapcsol minden olyan kupont, ami nincs a kódba írt engedélylistán. Az itt létrehozott éles kuponok bekerülnek egy adatbázisos engedélylistába, így a lejáratukig érintetlenül működnek, utána a védelem automatikusan kikapcsolja őket. A `XLNTTESZT100` viselkedése nem változik.

## Technikai megvalósítás

- **Migráció**: új `public.admin_coupons` tábla (`code`, `environment`, `expires_at`, `discount_type`, `percent_off`, `amount_off`, `currency`, `product_slugs text[]`, `max_redemptions`, `min_amount`, `stripe_coupon_id`, `stripe_promotion_code_id`, `created_by`, `created_at`, `disabled_at`). RLS: csak `authenticated` + `has_role(auth.uid(),'admin')` SELECT; írás kizárólag service role-lal szerverfunkcióból. GRANT: `SELECT` → `authenticated`, `ALL` → `service_role`.
- **`src/lib/coupons-admin.server.ts`** (új):
  - `listAdminCoupons(environment)` — a Stripe `promotionCodes.list` + `coupons.retrieve` adatokból állítja össze a listát, és összefűzi a `admin_coupons` sorok metaadataival (termékek, létrehozó).
  - `createAdminCoupon(input)` — `stripe.coupons.create` (`percent_off` vagy `amount_off`+`currency: 'huf'`, `applies_to.products` ha nem minden termék), majd `stripe.promotionCodes.create` (`code`, `expires_at`, `max_redemptions`, `restrictions.minimum_amount`), végül DB-be mentés. Termék-hozzárendelés: a kiválasztott termék `priceId` lookup key-eiből `prices.list` → Stripe `product` id.
  - `disableAdminCoupon(code, environment)` — promóciós kód `active: false` + `disabled_at` mentése.
- **`src/lib/coupon-guard.server.ts`**: az engedélylista kiegészül a `admin_coupons` élő (nem lejárt, nem kikapcsolt) éles kódjaival, így a sweep nem kapcsolja ki őket.
- **`src/lib/admin.functions.ts`**: `adminListCoupons`, `adminCreateCoupon`, `adminDisableCoupon` szerverfunkciók `requireSupabaseAuth` + admin gate-tel, Zod validációval (kód formátum, százalék 1–100, összeg > 0, jövőbeli lejárat).
- **UI**: `src/components/CouponAdminPanel.tsx` (űrlap + szűrők + táblázat) a meglévő admin panel stílusban; beépítve a `src/routes/admin.kuponok.tsx` oldalra a meglévő előzmény- és hibás-kísérlet panelek fölé. A menüpont sorrendjét és címkéjét a `src/routes/admin.tsx` fájlban rendezem.
