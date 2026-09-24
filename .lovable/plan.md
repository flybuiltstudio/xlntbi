# Admin felületek pontosítása

## Cél
Az érintett adminoldalak navigációjának, adatbevitelének, exportjainak és visszajelzéseinek egységesítése a már jól működő „Termékek és Kalkulátorok” oldal mintájára.

## Megvalósítás

### 1. Felső gombos menük és ugrópontok
- A Hírlevél, Kuponok és Statisztika oldalon az ugrópontokat ugyanarra a szerkezeti elemre teszem, mint a „Termékek és Kalkulátorok” oldalon, megfelelő felső eltartással.
- A Statisztika menübe a „Termékenkénti konverziós arány” külön pontként, a megrendelt termékek után kerül.
- A Számlázás és számlaellenőrzés oldalon menü készül a négy fő fejezethez: Számlázási napló, Billingo-ellenőrzés, Rendelési audit, NAV Online Számla állapot.
- A Katalógus ellenőrzés oldalon menü készül az árak/letöltések és a Stripe-terméknevek fejezetekhez.
- A Fizetés teszt oldalon pontosan két, egymás melletti menüpont lesz: „Teljes vásárlási teszt” és „Korábbi teszt megrendelések”. A köztes lépések ugyanazon első fejezet részei maradnak.

### 2. Megrendelések és felhasználók
- A Megrendelések bevezető szövegét a kért mondatra cserélem, a licencek kiküldését is megnevezve.
- A Felhasználók listájában csak a bejelentkezett felhasználó saját sorában jelenik meg a „Jelszóváltoztatás” gomb, közvetlenül a „Jelszó e-mail” előtt.
- A gomb a már meglévő, biztonságos saját jelszóbeállító oldalra visz; más felhasználó jelszava továbbra sem módosítható innen.

### 3. Hírlevél és kuponok
- A vizuális hírlevélszerkesztőben 10 Excel-alapszín lesz betűszínként és ugyanaz a 10 szín háttérszínként, jól azonosítható színmintákkal.
- Az Új kupon lejárati mezője magyar dátumválasztót és külön időmezőt kap; a megjelenés `ÉÉÉÉ. HH. NN.` és `ÓÓ:PP`, a mentett érték változatlanul pontos dátum-idő marad.

### 4. Statisztika
- A „Termékenkénti konverziós arány – …” önálló, az „Megrendelések óránként” címmel azonos méretű fejezetcím lesz.
- A képernyőn és a szöveges exportokban a százalék két tizedesjeggyel és tizedesvesszővel jelenik meg; az Excel-exportban valódi százalékérték és magyar Excelben helyesen formázott százalékcella lesz.
- A Megrendelői és terméklista két „Összes” jelölője Excel-szerűen vált: bekapcsolva minden elemet kijelöl, újbóli kattintásra mindet kijelöli helyett mindet kikapcsolja. Az üres kijelöléshez üres eredmény tartozik.
- Mindkét oldalletöltési blokk Excel gombjáról lekerül a „(.xlsx)” felirat.

### 5. Magyar fájlválasztók
- Közös magyar fájlválasztó készül „Fájl kiválasztása” és „Nincs fájl kiválasztva” feliratokkal.
- Ezt kapja az Új termék feltöltése, Termék új verziója, Termékleírás frissítése Wordből, Új kalkulátor feltöltése és Kalkulátor frissítése blokk valamennyi látható fájlmezője.
- A meglévő fájltípus-, méret-, feltöltési és törlési működés nem változik.

### 6. Tároló-takarítás
- A jelentésben szereplő két fájl régi útvonalon van: `banki-utalasi-csomag-keszito/...` helyett a katalógus jelenleg `utalasi-csomag-keszito/...`, illetve `rlb-bank-konvertalo/...` helyett `rlb-bank-konverter/...` útvonalra hivatkozik.
- A tároló közvetlen ellenőrzése igazolta, hogy mindkét új útvonalon megvan a fájl, és a régi–új példányok mérete és fájl-azonosítója páronként pontosan egyezik.
- Emiatt áthelyezésre nincs szükség: a két régi, hivatkozás nélküli példányt törlöm. Utána friss tárolóvizsgálattal ellenőrzöm, hogy csak az új, katalógusban hivatkozott példányok maradtak meg.
- A heti folyamat továbbra is csak jelentést készít; automatikus fájltörlést nem vezetek be.

### 7. Biztonsági ellenőrzés időpontja
- Az „Ellenőrizve” mező többé nem az oldal megnyitásának idejét mutatja.
- A rendszer a tényleges legutóbbi kézi vagy időzített biztonsági ellenőrzés időpontját menti és ezt jeleníti meg magyar idő szerint.
- A lista egyszerű újratöltése nem írja át ezt az időpontot.

## Technikai részletek
- A meglévő admin-jogosultságok és szerveroldali ellenőrzések megmaradnak.
- A közös navigációs és fájlválasztó megoldások újrafelhasználhatók lesznek, nem oldalankénti másolatok.
- A biztonsági ellenőrzés időpontja a meglévő alkalmazásbeállítások között tárolható, új nyitott adatbázistábla nélkül.
- Az exportok képletvédelme és a korábbi telefonszám-kezelés változatlan marad.

## Ellenőrzés
- Kódellenőrzés az összes érintett fájlra.
- Adminoldalanként ellenőrzöm a menügombok célhelyét, a magyar dátum- és fájlmezőket, a jelszógomb láthatóságát, az összes-kijelölés váltását és az exportfeliratokat.
- Ellenőrzöm a konverziós CSV/XML/PDF/Excel kimenetek tizedesvesszőjét és Excel-százalékformátumát.
- A két régi fájl törlése után friss tárolóvizsgálattal ellenőrzöm az új példányok meglétét és a régi utak eltűnését; automatikus törlést nem vezetek be.
