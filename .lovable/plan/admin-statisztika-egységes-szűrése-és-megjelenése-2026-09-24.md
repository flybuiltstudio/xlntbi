# Admin Statisztika egységes szűrése és megjelenése

## Közös, Power BI-szerű időszakszűrés
- Egy közös év- és hónapválasztást vezetek be az összes időszakos blokkhoz: Megrendelt termékek, Havi bontás, Termékenkénti konverziós arány, Megrendelések óránként, DEMO letöltések, Termék Részletek oldalak letöltései és Szolgáltatás aloldalak letöltései.
- A szűrősáv minden érintett blokkban helyben megmarad. Bármelyik példányban módosított év vagy hónap azonnal frissíti az összes többi kapcsolt blokk szűrőjét is.
- Az „Összes év” és egy kiválasztott hónap együtt minden év adott hónapját összesíti. Ez a Havi bontásban is működik, nem kér kötelezően konkrét évet.
- Minden szűrősáv fölött röviden, név szerint feltüntetem, mely blokkokra hat. A csak egy blokkra érvényes választóknál ezt külön jelzem.
- A fizetésiállapot-szűrő csak a rendelési alapú Megrendelt termékek és Havi bontás blokkokra hat; a konverzió továbbra is szakmailag helyesen csak kifizetett vásárlásokkal számol.
- A TESZT-rendelések kapcsolójának feliratában egyértelműen felsorolom az érintett rendelési riportokat; DEMO- és oldalletöltési adatokra nem hat.

## Top 5 rangsorok
- A Megrendelt termékek blokk Top 5 részt kap, választható „Árbevétel” és „Mennyiség” alappal; alapértelmezés az Árbevétel.
- A Havi bontás blokk Top 5 termékrangsort kap ugyanilyen választóval; alapértelmezés az Árbevétel.
- A DEMO letöltések blokk Top 5 termékrangsort kap, választható „Tényleges letöltések” és „Igénylések” alappal; alapértelmezés a Tényleges letöltések.
- A Top 5 listák mindig a közös év–hónap szűrés aktuális eredményéből készülnek, és üres időszaknál nem mutatnak kitalált értéket.

## Blokkok egységes sorrendje
- A Megrendelt termékek sorrendje: három fő mutató, szűrők, Top 5, exportálás, táblázat.
- A Havi bontás sorrendje: szűrők, Top 5, grafikon, exportálás, táblázat.
- A DEMO sorrendje: három, a szűrt időszakot mutató fő kártya, szűrők, Top 5, exportálás, táblázat.
- A többi blokkban a meglévő elemeket ugyanebben a logikai rendben tartom: szűrők, rangsor vagy grafikon, exportálás, táblázat — csak azok az elemek jelennek meg, amelyek az adott riporthoz tartoznak.
- A meglévő oldalletöltési Top listák és grafikonok sorrendjét is ehhez igazítom.

## Adatok és megnevezések
- A Havi bontás számítását úgy alakítom át, hogy konkrét évnél az adott év, „Összes év” esetén pedig az összes év hónaponként összevont adatai jelenjenek meg; a hónapválasztás a rangsort, grafikont, exportot és táblázatot egyaránt szűri.
- A konverziós táblában a régi `beszamolo-2025` azonosítót a jelenlegi termékhez oldom fel, ezért a helyes „XLNT Beszámoló” név jelenik meg. Ugyanezt a régi–új termékazonosító-feloldást a konverzió mindkét adatoldalán alkalmazom, hogy a megtekintések és vásárlások ugyanahhoz a termékhez kerüljenek.
- A DEMO export és táblázat kizárólag a közös időszakszűrés szerinti sorokat tartalmazza.

## Színek, gombok és tipográfia
- A Havi bontás grafikon jelenlegi, egymáshoz közeli zöld árnyalatait jól elkülönülő, kontrasztos kategóriaszínekre cserélem, és ugyanazokat a színeket használom az oszlopokban és a jelmagyarázatban.
- A „Megrendelt termékek” Excel gombjáról eltávolítom az „(.xlsx)” feliratot.
- A Statisztika oldal összes exportgombját ugyanarra a meglévő gombkomponensre, méretre, ikonméretre és „Excel / CSV / XML / PDF” feliratra egységesítem.
- Egységesítem a fejezetcímek, leírások, szűrőcímkék, szűrőgombok, Top-választók, táblázatok és fő mutatók betűméreteit, miközben a jelenlegi sötétzöld arculat megmarad.

## Technikai megoldás
- A közös év–hónap állapot a Statisztika oldal közös szülőszintjére kerül, az érintett blokkok ugyanazt az értéket és módosító műveletet kapják meg.
- A rendelési, DEMO- és oldalletöltési adatok saját adatforrásukban maradnak; csak az időszakválasztás közös. Nem keverem össze az eltérő jelentésű adatokat.
- A speciális exportok működése és fájlformátuma megmarad, de a látható vezérlők egységesek lesznek.
- Adatbázist, fizetési folyamatot és más adminoldalt nem módosítok.

## Ellenőrzés
- Ellenőrzöm, hogy bármely blokk év- vagy hónapgombja minden összekötött blokkot frissít, beleértve az „Összes év + kiválasztott hónap” esetet.
- Ellenőrzöm a három Top 5 alapértelmezését és váltását, a szűrt exportok tartalmát, a `beszamolo-2025` helyes nevét, valamint a grafikon színeinek megkülönböztethetőségét.
- Asztali és mobil szélességen ellenőrzöm a blokkok sorrendjét, a gombok és feliratok egységességét, valamint hogy semmi nem lóg ki vagy fed át más elemet.
