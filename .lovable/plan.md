# Admin menü átrendezés + Statisztika blokksorrend

## 1. Kuponok menü Statisztika utánra, `user` szerepkörnek is

- Az admin fejlécben a Kuponok link átkerül a Statisztika **utáni** helyre.
- A `user` szerepkör mostantól két menüpontot lát: Statisztika, majd Kuponok.
- Biztonság: a `user` szerepkör a Kuponok oldalon **csak a előzményeket és a
  sikertelen kísérleteket** látja (olvasás). A kuponlétrehozó és -letiltó blokk
  továbbra is csak `admin` szerepkörnél jelenik meg, mert az Stripe-ban éles
  kedvezményt hoz létre.

Új menüsorrend admin szerepkörnél:

```text
Megrendelések · Friss verzió · Statisztika · Kuponok · Ellenőrzések ▾ · Felhasználók · Kilépés
```

`user` szerepkörnél: Statisztika · Kuponok · Kilépés

## 2. Új „Ellenőrzések” lenyíló menü

A Kuponok után egy „Ellenőrzések” gomb, amire kattintva lenyílik:

- Számlázás (`/admin/szamlazas`)
- Billingo ellenőrzés (`/admin/billingo-ellenorzes`)
- Fizetés teszt (`/admin/fizetes-teszt`)

A három önálló link kikerül a fejléc felső sorából. A lenyíló csak `admin`
szerepkörnél látszik, kívülre kattintásra és Esc-re bezárul, és aktív állapotot
jelez, ha épp valamelyik aloldalán vagy.

## 3. Statisztika: blokksorrend

A „Megrendelői és terméklista” blokk a „Termék Részletek oldalak letöltései”
blokk **fölé** kerül (vagyis a listák előbb jönnek, utána az oldalletöltési
statisztika). A blokkok tartalma és működése változatlan.

## Technikai részletek

- `src/routes/admin.tsx`: a nav linkek átrendezése; új, `useState`-tel kezelt
  dropdown (shadcn `DropdownMenu`) az Ellenőrzések ponthoz; a Kuponok link
  role-feltétele `admin` helyett minden bejelentkezett szerepkör.
- `src/routes/admin.kuponok.tsx`: a létrehozó/letiltó panel (`CouponAdminPanel`)
  csak `role === "admin"` esetén renderel; az `AdminSessionContext`-ből olvassuk
  a szerepkört. A history és attempts panelek mindkét szerepkörnél maradnak.
  Ha a mögöttes szerverfüggvények admin-ellenőrzést tartalmaznak, a listázó
  végpontok engedélye kiterjed a `user` szerepkörre is (csak olvasás).
- `src/routes/admin.statisztika.tsx`: a `<CustomerProductLists rows={rows} />`
  hívás a `<PageViewStats />` elé kerül, változatlan propokkal, úgy, hogy üres
  megrendelési lista esetén is megjelenjen.
