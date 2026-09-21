# Heti takarítás + rendelés törlése

## 1. Heti karbantartás — vasárnap hajnali 2:00

Egyetlen időzített feladat fut (nem négy külön), és egy összefoglaló e-mailt küld a tulajdonosnak arról, mit talált és mit tett. Négy részből áll:

**Lejárt DEMO-linkek takarítása**
A lejárt vagy kimerült DEMO-igénylések lezárása, hogy a nyilvántartás ne hízzon feleslegesen. A DEMO statisztika összesítői nem változnak, csak a már használhatatlan hozzáférések kerülnek ki.

**Lejárt éles letöltési linkek takarítása**
A megrendelésekhez tartozó, lejárt vagy kimerült letöltési linkek, valamint a lejárt ingyenes (Tudástár) letöltési linkek lezárása. A megrendelés adata és a bevételi statisztika érintetlen — csak a link veszti érvényét, ami egyébként is lejárt.

**Lejárt kuponok automatikus letiltása**
Amelyik kupon lejárt, de a fizetési rendszerben még aktív, azt a feladat letiltja ott és a saját nyilvántartásban is, majd jelenti, melyeket tiltotta le.

**Tároló-takarítás — csak jelentés**
Összegyűjti azokat a feltöltött fájlokat, amelyekre egyetlen termék, DEMO- vagy ingyenes letöltés sem hivatkozik. Semmit nem töröl. A lista bekerül az admin **Ellenőrzések** menü új **Tároló-takarítás** aloldalára, ahol fájlonként kijelölhető, mit akarsz törölni, és egy törlő gombbal törölhetők a kijelöltek (megerősítő kérdéssel). A termékekhez rendelt fájlok nem jelennek meg a listában.

## 1b. A három javasolt időzítés is elkészül

- **Havi statisztika-zárás** — minden hónap első napján hajnali 2:30: a lezárt hónap termékmegtekintési és rendelési összesítőjének lefixálása, hogy a régi hónapok adatai később ne mozduljanak el.
- **Napi „fizetésre vár túl régóta" jelzés** — hajnali 6:00: ha egy átutalásos rendelés 8 napnál régebben vár fizetésre, e-mailben szól.
- **Napi Billingo-hiányjelzés** — hajnali 6:10: ha van kifizetett rendelés számla nélkül, aznap jelez, nem kell a heti auditra várni.

## 2. Megrendelés törlése (admin Megrendelések oldal)

A **fizetésre váró** tételeknél a gombsor jobb szélén új, piros **Megrendelés törlése** gomb. Kifizetett rendelésnél nem jelenik meg.

Kattintásra megerősítést kér („Biztosan törlöd a(z) … megrendelést? Ez nem visszavonható."), és csak jóváhagyás után töröl. A törlés:

- eltünteti a rendelést a Megrendelések listából,
- kiveszi a Statisztika oldal minden összesítőjéből és exportjából,
- törli a hozzá tartozó letöltési linkeket,
- **naplóz** egy rövid belső nyomot: rendelésszám, termék, összeg, dátum, a törlés ideje és ki törölte. Ez a napló nem számít bele a bevételbe és a statisztikába.

Csak fizetésre váró rendelés törölhető; kifizetettet a rendszer elutasít (azt továbbra is a sztornós úton kell kezelni).

**Régóta fizetésre várók azonnal láthatók.** Nem kell a napi e-mailre vagy a heti takarításra várni: a Megrendelések oldal tetejére kerül egy „8 napnál régebben fizetésre vár" blokk, amely felsorolja az érintett tételeket, és mindegyiknél ott van ugyanaz a törlő gomb (megerősítéssel). A szűrőpanelen külön szűrés is lesz rá.

## Technikai részletek

- Új `src/routes/api/public/heti-takaritas/cron.ts` végpont a `katalogus-audit/cron.ts` mintájára: `x-cron-secret` / `?secret=` időzáró-mentes összehasonlítással, új `WEEKLY_CLEANUP_CRON_SECRET` titok. Logika: `src/lib/weekly-cleanup.server.ts`, e-mail a meglévő `notify.server.ts`-en.
- pg_cron feladatok (mind `net.http_post`-tal, saját titokkal): `weekly-cleanup` `0 2 * * 0`; `monthly-stats-close` `30 2 1 * *`; `daily-stale-unpaid` `0 6 * * *`; `daily-missing-invoice` `10 6 * * *`. A meglévő `weekly-catalog-audit` (`0 3 * * 0`) változatlan. Végpontok: `heti-takaritas/cron`, `havi-statisztika-zaras/cron`, `fizetesre-varo-jelzes/cron`, `szamla-hiany-jelzes/cron`; közös secret-ellenőrző és e-mail-küldő helper. Cadence: napi 2 + hetente 1 + havonta 1 futás — minimális adatbázis-terhelés, a napi jelzések maximum 1 nap csúszást engednek.
- Migráció: `demo_requests` / `order_downloads` / `free_download_requests` bővítése `closed_at timestamptz` oszloppal (additív, nullable); új `deleted_orders` napló tábla (`order_number`, `product_name`, `total_price`, `created_at`, `deleted_at`, `deleted_by`) RLS-sel + `service_role` granttal, admin-olvasással.
- Tároló-takarítás: `termekfajlok` bucket listázása, összevetés `custom_products.download_storage_path`, `product_file_versions`, `order_downloads`, `free_download_requests`, `demo_requests` hivatkozásokkal. Új route `src/routes/admin.tarolo-takaritas.tsx`, panel + `storage-cleanup.functions.ts` / `.server.ts`, admin-gate-elt törlés; link a `checksLinks` listába (`src/routes/admin.tsx`).
- Rendelés törlése: `deleteUnpaidOrder(orderId, adminUserId)` a `admin.server.ts`-ben (ellenőrzi `payment_status !== 'paid'`, naplóz, törli `order_downloads` sorokat, majd az `orders` sort), `adminDeleteUnpaidOrder` szerverfunkció admin-gate-tel; gomb + `window.confirm` a `src/components/admin-panels.tsx` rendelés-kártyáján (a „Beérkezett az utalás" ág mellett, a gombsor végén). `deleteTestOrder` érintetlen.
- Statisztika: a `orders` táblából való törlés miatt külön változtatás nem kell, az összesítők élőben onnan számolnak.
