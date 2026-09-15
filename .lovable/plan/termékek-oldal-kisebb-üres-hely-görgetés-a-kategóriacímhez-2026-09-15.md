# Termékek oldal: kisebb üres hely + görgetés a kategóriacímhez

## Változások

1. **„Megrendelhető termékek" feletti üres hely csökkentése**
   - A `#products-top` sentinel magassága `15vh`/`18vh` helyett `h-6`/`md:h-10` lesz — a címhez görgetéskor is csak kis hely marad felette.

2. **Kategóriakattintás: görgetés a kategóriacímhez, nem a termékképekhez**
   - A görgetési cél `kategoria-termeklista` (a termékgrid) helyett `kategoria-termekek` (a megnyíló szakasz fejléce, a kategória nevével).
   - A `useEffect` görgetés és a kategóriakártya `hash` értéke is erre vált.
   - A grid `mt-6`-ja így a cím alatt marad, a cím látszik a képernyő tetején.

3. Ugyanaz az angol oldalon (`src/routes/en.products.tsx`) is.

## Érintett fájlok
- `src/routes/termekeim.tsx`
- `src/routes/en.products.tsx`

## Ellenőrzés
- Typecheck + Playwright (mobil és asztal): gombkattintás után kis sáv + cím látszik; kategórianyitás után a kategórianév a képernyő tetején.
