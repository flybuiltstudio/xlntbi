# Termékkategóriák a Termékeim oldalon

A „Megrendelhető termékek" szekció mappa-szerű kategóriaválasztót kap. Első nézetben csak a 7 kategória kis képe látszik, a kép alatt a kategória nevével. Egy kategóriára kattintva megnyílik, és alatta a mostani termékkártyák jelennek meg — de csak az adott kategória termékei, a megadott sorrendben.

## Kategóriák és sorrend

1. Bérszámfejtés — Bérszámfejtő 2026
2. Számla, nyugta könyvelés — NAV Online Számla letöltő, NAV Pénztárgép letöltő, RLB Bejövő Külföldi Számla Import, PÉNZSZÁM Bejövő Külföldi Számla Import
3. Adózás — 2665 ÁFA-bevallás ÁNYK XML-generáló, 26A60 összesítő nyilatkozat XML-generáló, XLNT Adófolyószámla egyeztető
4. Bank — RLB Bank Konverter, RLB Bank Konverter PRO, Univerzális bankkivonat-konverter, Utalási Csomag Készítő Excelhez
5. Vegyes könyvelés — XLNT Telefonszámla Könyvelő, Útnyilvántartás és Kiküldetési rendelvény, XLNT Kamatlekérdező és Pótlékszámító
6. Riportok és beszámolók — XLNT Havi Riport, XLNT Monthly Report (English), XLNT Beszámoló 2025, XLNT Számviteli Konszolidáló, XLNT IFRS Konszolidáló
7. Egyebek — Ügyfélkapu+ TOTP Manager, Cégkivonat → Excel konverter, PDF → Excel konverter, NAV Törzsszám- és Partnerellenőrző

A katalógusban lévő mind a 25 termék bekerül valamelyik kategóriába, kimaradó nincs.

## Megjelenés

- 7 kategóriakártya rácsban: mobilon 2, tableten 3-4, desktopon 7 egy sorban (kis, négyzetes képek), így egy 15"-os kijelzőn a teljes választó legörgetés nélkül látszik.
- A kép alatt a kategória neve, mellette a termékek száma.
- Kattintásra a kártya „nyitott" állapotba kerül (kiemelt keret), és a rács alatt jelennek meg az adott kategória termékkártyái — pontosan a mai kinézettel (kép, név, ár, „Részletek" / „Megrendelem").
- Egyszerre egy kategória van nyitva; újbóli kattintás bezárja. Az állapot az URL-ben is megjelenik (`?kategoria=bank`), így megosztható és SSR-ben is a helyes kategória nyílik ki.
- Kereső- és AI-láthatóság: a nyitott kategória tartalma szerveroldalon renderelődik; a nem nyitott kategóriák termékei továbbra is elérhetők a saját termékoldalukon és a sitemapból, tehát nem esik ki indexelt tartalom.
- Címhierarchia marad: oldalanként egy `h1`, a kategórianevek `h2`, a termékek `h3`.

## Kategóriaképek

7 új, generált kép a jelenlegi sötétzöld arculatban, egységes lapos/line-art stílusban (ugyanaz a nyelv, mint a meglévő ikonoknál): bérszámfejtés, számla/nyugta, adózás, bank, vegyes könyvelés, riportok, egyebek. A projekt saját tárolójába kerülnek, nem külső hivatkozásként.

## Új termék felvételekor

Ezentúl minden új termék feltöltése előtt rákérdezek, melyik kategóriába kerüljön. Ezt a szabályt a projekt memóriájába is elmentem, hogy később se maradjon ki.

## Technikai részletek

- `src/lib/products.ts`: `Product` típus új `category` mezője, valamint egy `PRODUCT_CATEGORIES` lista (kulcs, cím, kép, sorrend) és a kategóriánkénti sorrendezett termékeket adó segédfüggvény. A meglévő termékadatok, árak, fájlok, Stripe-azonosítók változatlanok.
- `src/routes/termekeim.tsx`: `validateSearch` a `kategoria` paraméterre, kategóriarács + a nyitott kategória termékrácsa. A kártyák markupja a mai marad.
- A kategóriaképek `src/assets/kategoriak/` alá kerülnek CDN-pointerként.
- Nincs adatbázis-, séma-, fizetés- vagy e-mail-változás.
