# Tudástár-kép és lábléc javítása, DEMO-folyamat megvalósíthatósága

## 1. Tudástár kategóriakép színének pontosítása
- A Tudástár jelenlegi háttere mérhetően sötétebb: a domináns háttérszíne körülbelül RGB `(5, 64, 36)`, míg az Adózás referencia-képé RGB `(7, 67, 39)`.
- A Tudástár meglévő könyv–irat–villanykörte rajza megmarad.
- A képet determinisztikus színkorrekcióval igazítom az Adózás kategóriakép pontos háttér- és világoszöld vonalszíneihez, nem új, bizonytalan árnyalatú generálással.
- Ellenőrzöm a kép sarkainak, domináns hátterének és ikonvonalainak színét, valamint a megjelenést a Termékek oldalon.

## 2. EV Könyvelés és Oktatás a lábléc Szolgáltatások listájában
- Az **EV Könyvelés** link bekerül a láblécbe közvetlenül a **Könyvelési szolgáltatások** után, ugyanoda, ahol a felső menüben szerepel.
- Az **Oktatás** is bekerül ugyanebbe a láblécoszlopba, a szolgáltatási aloldalak után.
- A meglévő fordítást használom, ezért az angol láblécben **Sole trader bookkeeping** néven, a megfelelő angol oldallal jelenik meg.
- Az Oktatás az angol láblécben a meglévő angol felirattal és angol céloldallal jelenik meg.
- A többi lábléclink sorrendje és megjelenése nem változik.

## 3. DEMO licenc – csak megvalósíthatósági javaslat, most nem készül el
Igen, megoldható. A biztonságos kialakítás egy külön **DEMO** licenctípus és külön szerveroldali folyamat lenne:

1. A vásárló kiválasztja a DEMO csomagot, és kitölti a szükséges adatokat.
2. A rendszer nem hoz létre Stripe-fizetést és nem hívja a Billingót.
3. A DEMO-igény nem kerül a normál vásárlások közé, ezért az admin vásárlási statisztikát sem növeli.
4. Külön DEMO-azonosítóval és külön, RLS-védett nyilvántartással kezelhető, így ellenőrizhető és korlátozható marad anélkül, hogy valódi rendelésnek számítana.
5. A DEMO-letöltés és a gépazonosító/licenckérés a jelenlegi védett letöltési és e-mail-folyamat külön ágát használhatja.
6. Honeypot, gyakorisági korlát és e-mail-címenkénti/gépenkénti korlátozás védené a visszaéléstől.
7. Az admin **Statisztika** oldalon az éles vásárlások blokkja alatt külön **DEMO letöltések** blokk jelenhet meg, hasonló termék-, időszak- és darabszám-összesítéssel. Ez kizárólag a DEMO-nyilvántartásból számolna, így a vásárlási bevételt, rendelésdarabszámot és exportokat nem módosítaná.
8. A tulajdonosnak érkező licenckérő e-mail tárgya hangsúlyosan a **CSAK DEMO** jelöléssel kezdődne. Az e-mail törzsének legelső sora szintén jól látható, piros figyelmeztetés lenne: **CSAK DEMO LICENCET KAPHAT!** Így a DEMO-kérés nem téveszthető össze fizetett licenccel.

A DEMO-részhez ebben a munkában nem módosítok sem oldalt, sem adatbázist, sem fizetési vagy számlázási folyamatot.

## Ellenőrzés
- Tudástár és Adózás referencia-kép színértékeinek összehasonlítása.
- Az EV Könyvelés és az Oktatás magyar és angol lábléclinkjének, sorrendjének és céloldalának ellenőrzése asztali és mobil nézetben.
- A DEMO-folyamat változatlan marad; csak a megvalósíthatóságát dokumentálom.
