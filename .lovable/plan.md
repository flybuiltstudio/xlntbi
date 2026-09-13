# Termékek és Kalkulátorok adminoldal átrendezése és új kalkulátor feltöltése

## Cél

Az admin `/admin/friss-verzio` oldala áttekinthető, oldalon belül navigálható „Termékek és Kalkulátorok” felület lesz. Az eddigi funkciók megmaradnak, és új, teljes kalkulátorfeltöltési folyamat készül magyar–angol változattal és saját képernyőképpel.

## 1. Elnevezés és oldalsorrend

- Az admin menü „Friss verzió” pontja „Termékek és Kalkulátorok” névre változik.
- Az oldal H1 címe, böngészőcíme és admin metaadatai ugyanezt az elnevezést kapják.
- A blokkok sorrendje:
  1. Új termék feltöltése
  2. Kategóriák kezelése
  3. Termék új verziója
  4. Termékleírás frissítése
  5. Termékárak frissítése
  6. Termékek sorrendje és kategóriája
  7. Új kalkulátor feltöltése
  8. Kalkulátor frissítése

## 2. Kattintható tartalomjegyzék

- Az „Új termék feltöltése” blokk elé kerül, külön cím és magyarázó szöveg nélkül.
- Két hasábban csak kattintható gombokat tartalmaz:
  - bal oldalt minden termékhez kapcsolódó blokk,
  - jobb oldalt az „Új kalkulátor feltöltése” és a „Kalkulátor frissítése”.
- Minden blokk stabil oldalon belüli célpontot kap.
- Minden blokk alatt lesz egy „Tetejére” gomb, amely visszavisz a tartalomjegyzékhez.
- Mobilon a két hasáb egymás alá rendeződik.

## 3. Új termék feltöltő javításai

- A terméknév minden ponton egységesen normalizálódik: ha az admin már beírta az „XLNT” előtagot, nem kerül elé még egyszer; kis- és nagybetűs, valamint többszörös szóközös változatnál is pontosan egy „XLNT” marad.
- Ez a név kerül az oldalra, az adatbázisba, az angol változathoz, az URL-képzéshez és a Stripe-termékhez is.
- A „Termékkép…” mező felirata és fájlválasztója a másik két fájlmezővel azonos függőleges helyzetbe kerül; a hosszú súgószöveg nem tolja le a vezérlőt.

## 4. Új kalkulátor feltöltése

Az új blokk a „Kalkulátor frissítése” előtt jelenik meg, és az alábbiakat kéri:

- magyar kalkulátornév,
- magyar HTML-fájl,
- magyar URL-részlet automatikus képzéssel,
- sorrend a Kalkulátorok oldalon.

Feltöltéskor:

- a HTML méretét és típusát a böngésző és a szerver is ellenőrzi;
- az AI elkészíti a kalkulátor angol változatát, az angol nevet és a keresőkhöz szükséges magyar–angol rövid adatokat;
- mentés előtt szerkeszthető előnézet jelenik meg a magyar és angol névvel, URL-lel és szövegekkel;
- az admin javíthat az előnézeten, majd egyetlen közzététellel létrejön mindkét nyelvi oldal;
- a magyar oldal a `/kalkulatorok/<slug>`, az angol a `/en/calculators/<slug>` címen lesz elérhető;
- mindkét változat bekerül a megfelelő kalkulátorlistába, nyelvváltásba és a sitemapbe;
- a tartalom szerveroldali HTML-ként jelenik meg, így keresők és AI-crawlerek számára is olvasható marad.

## 5. Automatikus kalkulátorképek

- A feltöltött magyar kalkulátorból böngészőoldali, izolált előnézet készül demo/alapértelmezett adatokkal.
- Ebből egységes, kártyaméretű kivágás készül és kerül a magyar kalkulátorkártyára.
- Az AI-val elkészített angol kalkulátorból külön angol képernyőkép készül az angol kártyára.
- A képek védett tárhelyre kerülnek, és a nyilvános oldalak kontrollált képkiszolgálón keresztül használják őket.
- Ha a képkészítés nem sikerül, a közzététel megáll és egyértelmű hibát mutat; nem kerül ki hibás vagy idegen kép.

## 6. Adatkezelés és biztonság

- Új `custom_calculators` tábla tárolja a két nyelv nevét, URL-részletét, HTML/script tartalmát, metaadatait, képeit, sorrendjét és frissítési adatait.
- A migráció tartalmazza a szükséges GRANT-okat, bekapcsolt RLS-t és csak olvasási nyilvános szabályt; létrehozás és módosítás kizárólag ellenőrzött adminművelettel történik.
- A szerver minden feltöltést, URL-részletet és tartalmi méretet újra ellenőriz.
- A meglévő beépített és felülírt kalkulátorok változatlanul működnek.

## 7. Ellenőrzés

- Admin menü és új oldalcím ellenőrzése.
- Tartalomjegyzék, minden célgomb és minden „Tetejére” gomb próbája asztali és mobil szélességen.
- „XLNT” előtag tesztje előtag nélküli, előtagos és eltérő kis-/nagybetűs névvel.
- A három újtermék-fájlmező egyvonalúságának vizuális ellenőrzése.
- Egy próba magyar kalkulátor feltöltése, szerkeszthető előnézete, magyar–angol közzététele és két külön kártyaképe.
- Magyar és angol listaoldal, részletoldal, nyelvváltás, sitemap és JavaScript nélküli szerveroldali tartalom ellenőrzése.
- Jogosultság, fájltípus-, méret- és hibakezelési próbák.
