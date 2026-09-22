# Napi jelzések egyszeri levele + teszt rendelések törlése

## 1. Napi jelzések: ugyanarról csak egyszer levél

A „Régóta fizetésre vár" (6:00) és a „Számla hiányzik" (6:10) ellenőrzés ugyanarról a megrendelésről csak egyszer küldjön e-mailt. Ha másnap sem javult meg, arról nincs újabb levél — csak a korábban még nem jelzett tételekről.

- Új tábla `order_alerts_sent`: `id`, `order_number`, `alert_type` (`stale_unpaid` / `missing_invoice`), `sent_at`; egyedi (típus, rendelésszám) párosítás. Csak szerveroldali hozzáférés, RLS bekapcsolva, policy nélkül.
- `src/lib/maintenance.server.ts`: a két napi ellenőrzés kiszűri a már jelzett rendelésszámokat. Ha nincs új tétel, nem megy e-mail. Küldés után az új rendelésszámok bekerülnek a táblába.
- A levél végén tájékoztató sor: hány korábban jelzett tétel van még nyitva (levél nélkül).
- Az admin Megrendelések oldali „Régóta vár (8+ nap)" blokk és szűrő változatlan.

## 2. Augusztusi statisztika-zárás feloldása

- A 2026. augusztusi zárt statisztika-pillanatképek (11 sor) törlése, hogy az augusztus újra nyitott legyen és a rendelések törlése után helyes adatot adjon.
- A zárás később bármikor újra lefuttatható.

## 3. Teszt rendelések törlése az admin Megrendelések oldalról

Jelenleg 4 rendelés van (1 fizetésre vár, 1 sikertelen, 2 kifizetett) — mind teszt.

- A „Megrendelés törlése" gomb a kifizetett rendelésekhez is megjelenik, **két lépésben megerősítve** (első kattintás figyelmeztet, hogy kifizetett rendelést törölsz, második hajtja végre). A fizetésre váróknál marad az eddigi egyszeres megerősítés.
- Kifizetett rendelés törlésekor, ha van hozzá Billingo számla (itt: SDB-2026-36), a rendszer először **sztornó bizonylatot készít a Billingóban** a már meglévő sztornó funkcióval. Ha a sztornó nem sikerül, a törlés leáll, és a hibát kiírja — nem törlünk számlázatlan nyomot maga után.
- A törlés továbbra is naplózódik (`deleted_orders`), a letöltési linkek és számla-pillanatképek is törlődnek, a rendelés eltűnik a listákból és a statisztikákból.

## Érintett fájlok
- Új migráció: `order_alerts_sent` tábla
- `src/lib/maintenance.server.ts` — napi jelzések szűrése
- `src/lib/admin.server.ts` — törlés kifizetett rendelésre + Billingo sztornó
- `src/lib/admin.functions.ts`, `src/components/admin-panels.tsx` — gomb a kifizetetteknél, dupla megerősítés
- Augusztusi statisztika-pillanatképek törlése adatműveletként

## Nem változik
- Cron ütemezések, levélformátum, címzett
- Heti takarítás, katalógus-audit, kuponok, hírlevél, fizetés
- A statisztika oldal felépítése

## Ellenőrzés
- A napi ellenőrzés kétszeri lefuttatása: másodszorra nem küld levelet.
- Augusztus után újra nyitott időszakként jelenik meg a statisztikában.
- A törlés gomb kifizetett rendelésnél is működik, a Billingo sztornó naplózva.
