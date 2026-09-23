# Admin e-mailek, szűrők, ugrópontok és exportok pontosítása

## 1. Licencigénylő és rendelési e-mailek
- A licencigénylő levél előre kitöltött szövegében a megadott mondatot szó szerint lecserélem az új változatra.
- Az Admin → Megrendelések oldalon az éles rendelés „E-mail a vevőnek” gombjának tárgyába a rendelésszám mellé bekerül a termék neve is.

## 2. Megrendelések szűrője
- A „Régóta fizetésre vár” figyelmeztetésben a „Csak ezeket mutasd” mellé bekerül egy „Összes mutatása” gomb.
- Az új gomb visszaállítja a fizetési szűrőt az összes éles rendelés és DEMO-igénylés megjelenítésére, a többi időszakszűrőt nem módosítja.

## 3. Admin felső menük ugrópontjai
- A Hírlevél, Kuponok és Statisztika felső menüinek célpontjait egységesítem a Termékek és Kalkulátorok oldallal.
- Minden menüpont közvetlenül a hozzá tartozó szakaszcímre ugrik, megfelelő felső eltartással; nem a cím alatti tartalomra.
- A hiányzó vagy külső burkolóelemre tett azonosítókat a tényleges címszakaszokra helyezem.

## 4. Kuponoldali exportok és magyar dátumbevitel
- A Kuponok, Kupon előzmények és Sikertelen kuponkísérletek blokkok mindegyikéhez elkészítem a négy egységes exportot: Excel, CSV, XML és PDF.
- Az exportok az aktuálisan szűrt sorokat tartalmazzák, a képletbiztos cellakezeléssel és magyar dátumokkal.
- A Kupon előzmények és Sikertelen kuponkísérletek „Ettől”/„Eddig” mezőit magyar `2026. 09. 23.` formátumú dátumválasztóra cserélem; a dátumhatárok továbbra is a teljes kezdő- és zárónapot fedik le.

## 5. Statisztika oldal
- A termékenkénti konverziós arány táblázatához hozzáadom az Excel, CSV, XML és PDF exportot; az export ugyanazt az időszakot és sorokat használja, mint a képernyőn látható táblázat, a „—” értéket megtartva megtekintés nélkül.
- A DEMO letöltések blokkot közvetlenül a Megrendelői és terméklista blokk alá helyezem.
- A felső menü sorrendjét is hozzáigazítom az új blokk-sorrendhez.

## 6. Ellenőrzés
- Típusellenőrzés az érintett fájlokra.
- Böngészős próba az Admin Megrendelések, Hírlevél, Kuponok és Statisztika oldalakon: gombok, ugrópontok, magyar dátumbevitel és blokksorrend.
- Mintafájlokkal ellenőrzöm mind a négy kuponexportot és a konverziós exportokat, külön figyelve az ékezetekre, dátumokra és hibás képletek hiányára.

## Technikai részletek
- A meglévő közös táblázatexportáló függvényeket használom, nem készítek új exportmotort.
- A változtatások csak a felsorolt adminfelületeket és az érintett licencigénylő e-mail szövegét érintik; adatbázis- vagy fizetési folyamat nem változik.
