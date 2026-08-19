# 20 új digitális termék feltöltése + fájlátadás fizetés után

## 1. Amit a ZIP-ekben találtam (mappánként 1 termék)

Már a rendszerben van, NEM viszem fel újra:
- NAV Online Számla letöltő
- NAV Pénztárgép letöltő

Új termékek — leírás (docx/html) + letölthető állomány:

| Termék | Letölthető fájl | Méret | Átadás |
|---|---|---|---|
| Banki utalási csomag készítő | Utalasi_csomag_keszito.xlsm | 0,5 MB | csatolva |
| Adófolyószámla egyeztető | XLNT_Adofolyoszamla_egyezteto.xlsm | 0,2 MB | csatolva |
| ÁFA 2665 XML generáló | 2665_XML-07-től.xlsm | 2 MB | csatolva |
| Adószám ellenőrző | Adószám_ellenörzö.xlsm | 0,2 MB | csatolva |
| 26A60 XML | 26A60_XML.xlsm | 1,9 MB | csatolva |
| Bérszámfejtő 2026 | Berszamfejto_2026.xlsm | 0,4 MB | csatolva |
| Havi riport készítő | HaviRiport_alap.xlsm | 0,9 MB | csatolva |
| Kiküldetési rendelvény + útnyilvántartás | Utnyilvantartas_es_Kikuldetesi_rendelveny_XLNTBI.xlsm | 0,4 MB | csatolva |
| Konszolidáló | XLNT_Konszolidalo_v1.5.xlsm | 0,4 MB | csatolva |
| Pénzszám számla import | Penzszam_Szamla_Import.xlsm | 0,2 MB | csatolva |
| RLB számla import | RLB_Szamla_Import.xlsm | 0,3 MB | csatolva |
| ÜgyfélkapuTOTP | ÜkapuP.xlsm | 0,2 MB | csatolva |
| Beszámoló 2025 | CÉGNÉV-Beszámoló-2025-re.xlsm | 14 MB | link |
| RLB Bank konvertáló | RLB_Konverter.exe | 35 MB | link |
| RLB Bank konvertáló PRO | RLB_Konverter_PRO.exe | 64 MB | link |
| Telefon könyvelő | telefon_konyvelo.exe | 79 MB | link |
| PDF Excel átalakító | pdf2excel.exe | 174 MB | link |
| Cégkivonat Excel átalakító | cegkivonat.exe | 174 MB | link |
| Univerzális bank átalakító | bankkivonat.exe | 175 MB | link |

⚠️ **Kamatos (XLNT Kamatlekérdező)** — csak az ajánló docx van a mappában, program-fájl NINCS. Ezt a terméket felviszem, de „hamarosan" jelzéssel megrendelés nélkül, vagy megvárom, míg elküldöd a fájlt — írd meg, melyiket.

A 6. ZIP kalkulátorai (Bérteszt, Jövedelemadó, Átalányadó, Számla dátumok HU/EN) nem termékek. A Bérteszt és a Jövedelemadó már fent van; az **Átalányadó** és a **Számla dátumok** kalkulátor még nincs — ezeket külön körben tudom felvinni ingyenes kalkulátorként (most nem része ennek a munkának).

Árak: a docx-ekből olvasom ki. Amelyikben nincs ár, a végén tételesen felsorolom és megkérdezem.

## 2. Fájlátadás — hogyan kapja meg a vásárló

- **Kis fájlok (max 15 MB, xlsm-ek):** a visszaigazoló e-mail **csatolmányként** tartalmazza a fájlt.
- **Nagy fájlok (exe-k, Beszámoló):** az e-mailben **egyedi, lejáró letöltő link** (14 nap, korlátozott letöltésszám). A fájlok védett (nem publikus) tárolóban vannak, a link tokenje a rendeléshez kötött.
- Bankkártyás fizetés: a Stripe webhook `paid` állapotra állítja a rendelést → az e-mail a fájllal/linkkel **automatikusan** kimegy.
- Utalás: a rendelés `pending`, e-mailben az utalási adatok mennek ki, fájl nem. A fájl akkor megy ki, amikor az admin fizetettre állítja.
- A letöltő link akkor is működik, ha a csatolmányt a vásárló levelezője levágja — minden e-mailben ott lesz a „Letöltés" gomb is.

## 3. Admin felület (utalásos rendelésekhez)

- `/admin` útvonal, belépés e-mail + jelszó. Admin jog **kizárólag** az xllentac@gmail.com fiókhoz, külön szerepkör-táblában (nem a profilban).
- Lista: rendelésszám, dátum, termék, vevő, összeg, fizetési mód, státusz.
- Egy kattintás: **„Fizetettre állítás"** → a rendelés `paid` lesz, és a vásárló azonnal megkapja a fájlt/letöltő linket ugyanazon az úton, mint a kártyás fizetőknél.
- Duplikáció-védelem: egy rendelésre a teljesítő e-mail csak egyszer megy ki; szükség esetén külön „Újraküldés" gomb.
- Naplózás: ki, mikor állította fizetettre.

## 4. Ellenőrzés, amit elvégzek

- Minden terméknél megnézem, hogy a hozzárendelt fájl valóban létezik a tárolóban és letölthető (méret és típus egyezés).
- Végigviszek egy teszt kártyás rendelést (100%-os kuponnal) és egy teszt utalásos rendelést az admin felületről — mindkettőnél leellenőrzöm, hogy a fájl/link megérkezik és megnyílik.
- Ha egy terméknél nincs fájl, a termék nem lesz megrendelhető, hanem jelzem.

## Technikai részletek

- Védett Cloud storage bucket (`termekfajlok`), publikus hozzáférés nélkül; RLS-ben csak a service role olvashat, a letöltés szerver oldali aláírt URL-lel megy.
- Új tábla: `order_downloads` (order_id, product_slug, storage_path, token, expires_at, download_count) RLS-sel + GRANT-okkal; token alapú letöltés a `/api/public/letoltes/$token` végponton, ami rendelés-státuszt ellenőriz.
- `user_roles` tábla + `has_role()` security definer függvény az admin joghoz; admin route `_authenticated` gate alatt.
- `src/lib/products.ts` kibővítése: `fileName`, `fileSizeBytes`, `deliveryMode: "attachment" | "link"`, `storagePath`.
- Stripe: `payments--batch_create_product` a 19 új termékre (egyszeri díj, digitális adókód), majd a meglévő webhook fut rájuk is.
- E-mail: a `megrendeles-visszaigazolas` sablon kap csatolmány- és letöltő link blokkot; Resend csatolmány-limit miatt 15 MB a határ.
- ⚠️ A 174–175 MB-os exe-knél a tároló feltöltési korlátja lehet szűk keresztmetszet. Ha a feltöltés elakad, jelzem, és a megoldást (fájl szeletelés vagy Drive-link) egyeztetem veled — nem hallgatom el.
