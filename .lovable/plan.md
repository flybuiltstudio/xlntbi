# Napi jelzések – csak új tételekről levél

## Cél
A „Régóta fizetésre vár" (napi 6:00) és a „Számla hiányzik" (napi 6:10) ellenőrzés ugyanarról a megrendelésről csak egyszer küldjön e-mailt. Ha egy rendelés másnap sem javul meg, arról nem megy ismétlő levél — csak azokról, amelyekről korábban még nem küldött a rendszer.

## Megvalósítás

1. **Új tábla: `order_alerts_sent`**
   - Oszlopok: `id`, `order_number` (text), `alert_type` (text: `stale_unpaid` / `missing_invoice`), `sent_at`.
   - Egyedi megszorítás: (`alert_type`, `order_number`) — ugyanarról a rendelésről ugyanolyan típusú jelzés csak egyszer rögzíthető.
   - GRANT: csak `service_role` (a cron szerveroldalon fut); RLS bekapcsolva, policy nélkül — az admin felületen nem jelenik meg.

2. **`src/lib/maintenance.server.ts` – a két napi ellenőrzés módosítása**
   - `runStaleUnpaidCheck()` és `runMissingInvoiceCheck()`: a találatokat összeveti az `order_alerts_sent` táblával az adott `alert_type`-ra, és csak a még nem jelzett rendelésszámok maradnak a levélben.
   - Ha nincs új tétel, nem megy e-mail (a mai napi „0 új" levél sem).
   - Levélküldés után az új rendelésszámok beíródnak a táblába (a levél `key`-je továbbra is napi egyediséget garantál).
   - A levél szövege jelzi, hogy csak új tételeket tartalmaz; a korábban jelzett, de még mindig nyitott tételek száma a levél végén tájékoztató sorban szerepelhet.

3. **Viselkedés élettartamon át**
   - Ha a rendelés kifizetődik / számla készül, természetesen lekerül a listáról; a rögzített jelzés marad, így ha egy későbbi rendelésnél ugyanaz a rendelésszám újra előfordulna (nem reális), akkor sem megy dupla levél.
   - Az admin Megrendelések oldali „Régóta vár (8+ nap)" szűrő és piros blokk változatlan marad (az élő lista, nem e-mail).

## Érintett fájlok
- Új migráció (`order_alerts_sent` tábla + grantek + RLS)
- `src/lib/maintenance.server.ts` (a két napi ellenőrzés)

## Nem változik
- A cron ütemezés (6:00 / 6:10), a levél formátuma, a címzett
- A heti takarítás, havi zárás, katalógus-audit
- Az admin felület bármely része

## Ellenőrzés
- Migráció lefut, tábla létezik.
- Helyben meghívom a két ellenőrzést: első futásra elküldi a meglévőket és rögzíti őket; második futásra (ugyanazon adatokkal) nem küld levelet, mert nincs új tétel.
