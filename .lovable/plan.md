# 100%-os kuponkód a teszt rendeléshez

Cél: valódi, végig lefutó teszt megrendelés fizetés nélkül — a rendelés mentődjön, a fizetés „kifizetve” állapotot kapjon, és a visszaigazoló e-mailek is kimenjenek.

Ehhez a 0 Ft-os külön termék nem jó út (a fizetési rendszer nem indít 0 összegű kártyás munkamenetet, és összekavarná a katalógust). Helyette egy 100%-os kuponkód: a fizetőoldalon beírva a fizetendő 0 Ft lesz, a rendszer kártyaadat nélkül lezárja a fizetést, és pontosan ugyanaz a folyamat fut le, mint egy igazi vásárlásnál.

## Amit építek

1. **Kuponkód létrehozása** a fizetési szolgáltatóban, egyszeri beállító lépéssel (teszt és később éles környezetben is): 100% kedvezmény, kód: `XLNTTESZT100`, legyen többször felhasználható, de bármikor letiltható.
2. **Kuponmező a fizetőűrlapon**: a beágyazott fizetőfelületen megjelenik a „Kuponkód” beviteli lehetőség, így nem kell külön mezőt tenni a megrendelő űrlapra.
3. **Nyugta / visszaigazolás**: 0 Ft-os rendelésnél is lefut a „kifizetve” állapot és mindkét e-mail (neked és a vevőnek), így ellenőrizhető a teljes lánc.
4. **Végigtesztelés** böngészőből: megrendelés leadása → kuponkód beírása → 0 Ft → köszönőoldal → rendelés állapota és e-mailek ellenőrzése. A végén leírom, mit láttam.

## Technikai részletek

- `src/utils/payments.functions.ts`: a checkout session kap `allow_promotion_codes: true`-t. Mivel ez ütközhet a `discounts` paraméterrel, csak a promóciós kód engedélyezését használom.
- Kupon + promóciós kód létrehozása a meglévő `createStripeClient` kliensen keresztül, egyszeri szerveroldali beállító hívással (`coupons.create` percent_off: 100, majd `promotionCodes.create` a `XLNTTESZT100` kóddal). A kupon HUF-független, mert százalékos.
- A 100%-os kedvezménnyel a fizetési rendszer `payment_status: paid` értékkel zárja a munkamenetet, ezért a meglévő webhook (`/api/public/payments/webhook`) és `markOrderPaid` logika változatlanul működik — csak ellenőrzöm, hogy nincs benne olyan feltétel, ami a 0 összegnél kihagyná a feldolgozást.
- Nincs adatbázis-változás, nincs új tábla.

## Fontos

A kuponkód a teszt környezetben azonnal él. Élesítés után a kód az éles fiókban is létrejön — ha nem akarod, hogy élesben bárki használhassa, szólj, és élesben nem hozom létre (vagy azonnal inaktívra állítom).
