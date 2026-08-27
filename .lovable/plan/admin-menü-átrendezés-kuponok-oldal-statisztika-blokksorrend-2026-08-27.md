# Admin menü átrendezés + Kuponok oldal + Statisztika blokksorrend

## 1. Menüsorrend

Admin szerepkör:

```text
Megrendelések · Kuponok · Statisztika · Friss verzió · Ellenőrzések ▾ · Felhasználók · Kilépés
```

`user` szerepkör:

```text
Statisztika · Kuponok · Kilépés
```

- A `user` szerepkör mostantól a Kuponok menüt is látja (a Statisztika után).
- A Kuponok link mindkét szerepkör számára látható (eddig csak `admin`-é volt).

## 2. Kuponok oldal felépítése (`/admin/kuponok`)

Felülről lefelé:

1. **Kuponlétrehozó és -letiltó blokk** (`CouponAdminPanel`) — csak `admin`
   szerepkörnél jelenik meg. A `user` szerepkör ezt nem látja, mert az Stripe-ban
   éles kedvezményt hoz létre / tilt le.
2. **Kupon előzmények** (`CouponUsagePanel`) — mindkét szerepkör számára olvasható.
3. **Hibás kísérletek** (`CouponAttemptsPanel`) — mindkét szerepkör számára olvasható.

Biztonság: a létrehozó/letiltó szerverfüggvények (`adminCreateCoupon`,
`adminDisableCoupon`) továbbra is `admin` gate-tel rendelkeznek. A listázó
végpontok, amik a `CouponUsagePanel` / `CouponAttemptsPanel` táplálják, már
most `admin`-ra szűrnek — ezeket ki kell terjeszteni a `user` szerepkörre is
(csak olvasás), különben a `user` üres listát kap. RLS-szabályok (pl.
`coupon_attempts`, `orders` select) jelenleg `has_role(..., 'admin')`-hez
kötöttek; a `user` szerepkör olvasását egy új `has_role(..., 'user')` SELECT
policyvel engedélyezzük ezeknél a tábláknál.

## 3. Új „Ellenőrzések” lenyíló menü

A Kuponok után egy „Ellenőrzések” gomb, amire kattintva lenyílik:

- Számlázás (`/admin/szamlazas`)
- Billingo ellenőrzés (`/admin/billingo-ellenorzes`)
- Fizetés teszt (`/admin/fizetes-teszt`)

A három önálló link kikerül a fejléc felső sorából, a lenyílóba kerül. A
lenyíló csak `admin` szerepkörnél látszik. Kívülre kattintásra és Esc-re
bezárul. Aktív állapotot jelez, ha épp valamelyik aloldalán vagy (az `Ellenőrzések`
gomb kiemelve, ha a pathname valamelyik úttal kezdődik).

## 4. Statisztika: blokksorrend

A „Megrendelői és terméklista” blokk (`CustomerProductLists`) a „Termék Részletek
oldalak letöltései” blokk (`PageViewStats`) **fölé** kerül. A blokkok tartalma és
működése változatlan; a `CustomerProductLists rows={rows}` hívás a `<PageViewStats />`
 elé kerül, úgy, hogy üres megrendelési lista esetén is megjelenjen.

## Technikai részletek

- `src/routes/admin.tsx`: nav linkek átrendezése az új sorrendre; új, `useState`-tel
  kezelt dropdown az Ellenőrzések ponthoz (kattintás/kívül-katt/Esc); a Kuponok
  link feltétele `role === "admin"` helyett minden bejelentkezett szerepkör
  (admin + user).
- `src/routes/admin.kuponok.tsx`: a `CouponAdminPanel` renderelése
  `role === "admin"` feltételhez kötött; a history/attempts panelek mindkét
  szerepkörnél maradnak. A `role` értéket az `AdminSessionContext`-ből olvassuk
  (már elérhető a Provideren át).
- `src/lib/admin.functions.ts` és a listázó szerverfüggvények: a `user`
  szerepkör is lekérheti a kupon-előzmények és hibás kísérletek listáját
  (csak olvasás). A létrehozó/letiltó függvények `admin` gate-e változatlan.
- RLS: `coupon_attempts`, `orders` (és a `CouponUsagePanel` által olvasott
  táblák) SELECT policy-jét kiterjesztjük a `user` szerepkörre is
  (`has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'user')`), írás
  továbbra is csak `admin`/service role.
- `src/routes/admin.statisztika.tsx`: `<CustomerProductLists rows={rows} />`
  áthelyezése a `<PageViewStats />` elé.
