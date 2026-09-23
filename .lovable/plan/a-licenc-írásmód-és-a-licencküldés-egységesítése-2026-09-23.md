# A „licenc” írásmód és a licencküldés egységesítése

## Cél

Minden felhasználó és admin számára látható magyar szövegben kizárólag a helyes **licenc** alak szerepeljen. A DEMO licencküldés kinézete és kezelése egyezzen meg az éles megrendelés licencküldésével.

## Módosítások

### 1. DEMO licenckérő értesítő e-mail

- Ha a HWID nincs megadva, a „nem megadott” szöveg normál betűtípussal jelenik meg, ugyanúgy, mint például a cégnév; tényleges HWID esetén megmaradhat a jól olvasható egyenletes szélességű betű.
- A „Licenc küldése az igénylőnek” gomb által megnyitott levél megszólítása: **„Tisztelt DEMO-igénylő!”**
- A levél tárgyában és szövegében minden „licenszkód” alak **„licenckód”** lesz, beleértve a kód helyét jelölő utasítást is.

### 2. Megrendelések oldalról küldött licenckód e-mail

- A tárgy, előnézeti sor, fejléc, cím, magyarázat és mezőfelirat mindenhol a helyes **licenckód / licenc típusa** alakot használja.
- A licenckód egyetlen, törés nélküli sorban jelenik meg; keskeny képernyőn sem törik több sorra.
- Közvetlenül mellette/alatta egyértelmű utasítás jelenik meg: **„A licenckódot egyben másold be a programba.”**
- Ugyanez a sablon szolgálja ki az éles és a DEMO licencküldést, ezért mindkét levél egységesen javul.

### 3. DEMO licencküldés az Admin → Megrendelések oldalon

- A DEMO „Licenc küldése” gomb ugyanazt a zöld kiemelést, nyitott állapotú feliratot és külön, alatta megjelenő beviteli panelt kapja, mint az éles rendelésnél.
- A panel felépítése is egyezik: „Licenckód” címke, teljes szélességű egy soros mező, magyarázó szöveg, „Licenckód elküldése” és „Mégsem” gomb.
- A DEMO-jelölés és a külön DEMO-folyamat megmarad; számlázási művelet továbbra sem kerül a DEMO-kártyára.

### 4. Teljes látható szövegellenőrzés

A projekt összes magyar, képernyőn vagy e-mailben megjelenő „licensz” alakja „licenc” alakra változik, többek között:

- letöltési és licenckérő e-mailek;
- DEMO-igénylő oldal;
- megrendelési űrlap;
- Admin → Megrendelések;
- katalógus-ellenőrzés és tesztvásárlási felület;
- kapcsolódó hiba- és visszajelző üzenetek.

A nem látható technikai azonosítók (például meglévő sablonkulcsok, fájlnevek és importnevek) változatlanok maradnak, hogy a működő e-mail-küldés és korábbi hivatkozások ne törjenek el.

## Ellenőrzés

- Projekt-szintű keresés igazolja, hogy felhasználó felé látható „licensz” alak nem maradt.
- Típusellenőrzés lefut.
- Az Admin → Megrendelések oldalon az éles és DEMO licencküldő felületet asztali és keskeny nézetben összehasonlítjuk.
- Az e-mail-előnézetben ellenőrizzük a DEMO megszólítást, a HWID betűtípusát, a helyes tárgyat és a licenckód egysoros megjelenését.
