# Admin Statisztika és Fizetés teszt pontosítása

## Statisztika – megrendelt termékek és havi bontás
- A „Megrendelt termékek” és a „Havi bontás” két külön blokk marad.
- A „Megrendelt termékek” cím alatt elsőként a három fő mutató jelenik meg.
- A fő mutatók alatt következik a rájuk és a termékösszesítésre vonatkozó fizetésiállapot-, év- és hónapszűrő, majd az exportgombok és a termékösszesítő táblázat.
- A „Havi bontás” közvetlenül a „Megrendelt termékek” blokk után következik, és saját évválasztót kap, ezért nem kell visszagörgetni. A hónapválasztó is helyben elérhető marad.
- A felső menüben a „Megrendelt termékek” után külön „Havi bontás” ugrógomb marad.
- A fizetési állapot és a tesztrendelések meglévő szabályai változatlanok maradnak.

## Statisztika – termékenkénti konverzió
- A blokk címe egyszerűen „Termékenkénti konverziós arány” lesz.
- Saját év- és hónapválasztót kap közvetlenül a cím alatt.
- A táblázat, az üres állapot, a százalékok és mind a négy export mindig a blokkban kiválasztott időszakot használja.
- Az időszak bekerül az export fájlnevébe és belső címébe, de a látható fejezetcímbe nem.

## Statisztika – oldalletöltések és felső menü
- A „Termék Részletek oldalak letöltései” és a „Szolgáltatás aloldalak letöltései” látható címéből kiveszem az évszámot; az év továbbra is a közvetlenül alattuk lévő választóban látszik.
- Mindkét rész külön horgonyt és külön menügombot kap.
- A felső menüt két kézzel meghatározott hasábra rendezem, a lap tényleges blokksorrendjében:
  - bal oldal: Megrendelt termékek; Havi bontás; Termékenkénti konverziós arány; Megrendelések óránként; Megrendelői és terméklista; DEMO letöltések;
  - jobb oldal: Termék Részletek oldalak letöltései; Szolgáltatás aloldalak letöltései.
- A „Havi bontás” gomb a „Megrendelt termékek” után jelenik meg; a régi gyűjtő „Oldalletöltési statisztika” gomb megszűnik.

## Fizetés teszt
- A felső két ugrógomb és a „Teljes vásárlási teszt” blokk közé jól látható, de visszafogott függőleges térközt teszek.

## Ellenőrzés
- Ellenőrzöm az összes ugrógomb célját és sorrendjét, a helyi év/hónap szűrők működését, valamint hogy az exportok pontosan a kiválasztott konverziós időszakot tartalmazzák.
- Asztali és mobil szélességen ellenőrzöm a két hasáb tördelését és a Fizetés teszt térközét.
- Adatbázist, fizetési folyamatot és más adminoldalt nem módosítok.
