# 19 új digitális termék, licencszintek, fájlátadás és admin felület

Döntések a kérdéseimre: több licencszint mehet, mindenhol letöltő link (csatolmány nélkül), a Kamatos „hamarosan" állapottal kerül fel.

## 1. Termékek és licencszintek

- A 19 új termék felkerül a leírásokkal (a docx-ekből, változtatás nélkül). A már fent lévő NAV Online Számla letöltő és NAV Pénztárgép letöltő nem duplikálódik.
- Minden terméknél a leírásban szereplő **licencszintek** külön választható opcióként jelennek meg (pl. ÁFA 2665: 34 900 Ft egy cégre / 99 900 Ft korlátlan; Bérszámfejtő: 24 900 / 39 900 / 74 900 Ft).
- A termékoldalon licencszint-választó (rádió-lista), az árat és a megrendelés gombot a választott szint állítja.
- **Kamatos (XLNT Kamatlekérdező):** felkerül a leírással, „Hamarosan" jelzéssel, megrendelés gomb nélkül — a fájlt később pótoljuk.
- Ahol a docx-ben nincs ár, azt a végén tételesen felsorolom és rákérdezek — nem találok ki árat.

## 2. Fájlátadás: mindenhol lejáró letöltő link

- Nincs e-mail csatolmány. Minden termék (xlsm és exe egyaránt) **egyedi, lejáró letöltő linkkel** megy ki: 14 nap érvényesség, korlátozott letöltésszám, rendeléshez kötött token.
- A fájlok védett tárolóban vannak, publikus hozzáférés nélkül.
- **Kártyás fizetés:** a Stripe visszajelzése után a rendelés fizetett lesz, és a letöltő link **automatikusan** kimegy.
- **Utalás:** a rendelés „fizetésre vár" állapotban indul, az e-mail csak az utalási adatokat tartalmazza. A letöltő link akkor megy ki, amikor az admin fizetettre állítja.

## 3. Admin felület

- `/admin` útvonal, belépés e-mail + jelszó; admin jog kizárólag az xllentac@gmail.com fiókhoz, külön szerepkör-táblában.
- Rendeléslista: rendelésszám, dátum, termék + licencszint, vevő, összeg, fizetési mód, státusz.
- Egy kattintás „Fizetettre állítás" → a vevő azonnal megkapja a letöltő linket.
- „Link újraküldése" gomb, duplikáció-védelem (teljesítő e-mail rendelésenként egyszer megy ki automatikusan), és napló arról, ki mikor állította fizetettre.

## 4. Ellenőrzés a munka végén

- Minden terméknél megnézem, hogy a hozzárendelt fájl valóban létezik a tárolóban, és a letöltő link megnyílik (méret- és típusegyezés).
- Végigviszek egy teszt kártyás rendelést (100%-os kuponnal) és egy teszt utalásos rendelést az adminból — mindkettőnél ellenőrzöm a linket.
- Ha egy terméknél nincs fájl, a termék nem lesz megrendelhető, hanem jelzem (Kamatos most ilyen).

## Technikai részletek

- `src/lib/products.ts`: `tiers: { id, label, price, priceId, stripePriceId }[]` szerkezet, `storagePath`, `fileName`, `fileSizeBytes`, `status: "available" | "coming_soon"`. A termékoldal (`src/routes/termek.$slug.tsx`) és a megrendelés (`src/routes/megrendeles.tsx`) a kiválasztott szintet viszi tovább.
- Stripe: minden licencszinthez külön ár `payments--create_product` / `create_price` hívással (egyszeri díj, digitális tax code, quantity 1–1). A meglévő webhook útvonal kezeli az új árakat is; a lookup key azonosítja a terméket és a szintet.
- Adatbázis: `orders` kiegészítése `tier_id`-vel; új `order_downloads` tábla (order_id, product_slug, storage_path, token, expires_at, download_count, max_downloads) RLS-sel és GRANT-okkal; `user_roles` + `has_role()` security definer az adminhoz.
- Letöltés: `/api/public/letoltes/$token` szerver-route, ami token-érvényességet és rendelés-státuszt ellenőriz, majd rövid életű aláírt URL-re irányít. Nyilvános tároló nincs.
- Storage: `termekfajlok` bucket (privát). A 174–175 MB-os exe-k feltöltésénél a méretkorlát szűk keresztmetszet lehet; ha elakad, jelzem és egyeztetünk (szeletelés vagy Drive-link) — nem hallgatom el.
- E-mail: a megrendelés-visszaigazoló és a teljesítő sablon letöltő-link blokkot kap; feladó név „xlntbi", cégadatok a `src/lib/company.ts`-ből.
- Nagy termékszám miatt a felvitel több körben megy: fájlfeltöltés → termékadatok → Stripe árak → letöltő rendszer → admin → tesztek.
