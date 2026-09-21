# DEMO licencfolyamat terve

> Jóváhagyva 2026-09-20. **NEM kezdjük el jelzés nélkül.** Ez csak a terv;
> a megvalósítást külön rábólintásra indítjuk.

## Cél

A vásárló fizetés nélkül kipróbálhasson bármelyik szoftverterméket korlátozott
ideig. A DEMO teljes verzió, csak a használati idő van lekorlátozva. A folyamat
teljesen elkülönül a normál vásárlási láncolattól, így nem befolyásolja a
bevételt, rendelésszámot, számlázást, kuponokat vagy statisztikát.

## Mely termékekhez

- Minden **jelenlegi, nem Tudástár kategóriájú** termékhez elérhető lesz.
- Minden **jövőben felvett, nem Tudástár** termék automatikusan kap
  DEMO-lehetőséget.
- A **Tudástár** kategória jelenlegi és jövőbeli termékei **kivételt képeznek**:
  ezekhez nem készül DEMO-licenc, és nem jelenik meg DEMO-választás.

## Folyamat

1. A vásárló a termékoldalon kiválasztja a **DEMO** csomagot, és kitölti a
   szükséges adatokat (kapcsolattartási adatok, gépazonosító később).
2. A rendszer **nem hoz létre Stripe-fizetést** és **nem hívja a Billingót**.
3. A DEMO-igény **nem kerül a normál `orders` táblába**, így az admin
   vásárlási statisztikát és a „rendeléshez még nincs Billingo számla” számlálót
   nem növeli.
4. Külön **RLS-védett nyilvántartás** (új tábla, nem `orders`) tárolja a
   DEMO-igényeket — ellenőrizhető és korlátozható marad, valódi rendelésnek
   nem számít.
5. Sikeres igénylés után fizetés nélkül azonnal lefut: a meglévő védett,
   lejáró letöltőlinkes folyamat létrehoz egy korlátozott, lejáró, aláírt
   letöltő URL-t, és elküldi a kitöltő e-mail-címére. Letöltéshez nem kell
   Stripe-munkamenet vagy Billingo-számla.
6. A gépazonosító/licenckérés a jelenlegi védett e-mail-folyamat külön
   **DEMO ágát** használja.
7. Visszaélésvédelem: **honeypot**, **gyakorisági korlát**, és
   **e-mail-címenkénti/gépenkénti korlátozás** (hogy ne lehessen végtelen
   DEMO-licencet kérni).

## Admin / Statisztika

- Az admin **Statisztika** oldalon az éles vásárlások blokkja **alatt** külön
  **„DEMO letöltések”** blokk jelenik meg, hasonló termék-, időszak- és
  darabszám-összesítéssel.
- Ez **kizárólag a DEMO-nyilvántartásból** számol — a vásárlási bevételt,
  rendelésdarabszámot és exportokat nem módosítja.

## E-mailek (licenckérő)

- A tulajdonosnak érkező licenckérő e-mail **tárgya** hangsúlyosan a
  **CSAK DEMO** jelöléssel kezdődik.
- Az e-mail **törzsének legelső sora** jól látható, **piros** figyelmeztetés:
  **CSAK DEMO LICENCET KAPHAT!**
- Így a DEMO-kérés nem téveszthető össze fizetett licenccel.

## Elkülönítés a meglévő rendszertől (biztonsági háló)

- DEMO sosem megy Stripe-hoz, Billingóhoz vagy normál vásárlási statisztikába.
- A „rendeléshez még nincs Billingo számla” számláló automatikusan kihagyja
  a 0 Ft-os / DEMO igényeket.
- A heti katalógus-audit a 0 Ft-os csomagokat átugorja
  („Ingyenes csomag – Stripe-ellenőrzés kihagyva”), a letöltési fájl
  meglétét továbbra is ellenőrzi.
- A kuponok és havi értesítésekhez a fizetésmentes DEMO nem nyúl hozzá.

## Technikai megjegyzések

- Új RLS-védett tábla a DEMO-igényeknek (minta: a meglévő
  `free_download_requests` tábla, amit az ingyenes E-nyugta útmutató használ).
- A védett, lejáró letöltőlink a meglévő privát terméktárhelyre és aláírt
  URL-es letöltő végpontra épül.
- Nincs adatbázis-változás a meglévő táblákon, nincs módosítás a normál
  vásárlási, fizetési, számlázási, kupon- vagy statisztikafolyamatokon.

## Állapot

- **Terv rögzítve, megvalósítás NEM kezdődött el.**
- A felhasználó jelzésére indul csak.
