# Angol EV oldal árlista frissítése

## Mit csinálunk
A `src/routes/se-bookkeeping.tsx` árlistájában frissítjük a megjelenített árakat:
- **KATA bookkeeping**: `10,000 HUF / month` → `15,000 HUF / month`
- **Bookkeeping for a flat-rate self-employed entrepreneur**: `from 50,000 HUF / quarter` → `from 60,000 HUF / quarter`
- A havi bontás: `(less than 17,000 HUF per month)` → `(20,000 HUF per month)`

## Érintett tartalom
A `<section>` árlista blokk (199–211. sor) tartalmazza a táblázatot. Csak ezeket a szöveges cellákat írjuk át. A táblázat struktúrája, az alatti "The flat-rate fee may vary..." megjegyzés és minden más rész változatlan marad.

## Megjegyzés
Ez csak a megjelenített árlista szövege — nincs Stripe-termék vagy backend-logika az angol EV könyvelési szolgáltatáshoz (ez egy információs szolgáltatásoldal, nem vásárolható termék), így csak a szöveget kell módosítani.
