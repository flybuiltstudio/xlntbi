# DEMO licencfolyamat terve

> Jóváhagyva 2026-09-20, bővítve 2026-09-21. **NEM kezdjük el jelzés
> nélkül.** Ez csak a terv; a megvalósítást külön rábólintásra indítjuk.

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

## DEMO-igénylő űrlap

A vásárló a termékoldalon kiválasztja a **DEMO** csomagot, és kitölti a
DEMO-igénylő űrlapot. Kötelező mezők: név, e-mail, telefonszám, adatvédelmi
jóváhagyás. Honeypot és gyakorisági korlát véd.

### Gépazonosító (HWID) mező — opcionális

- A DEMO űrlapon van egy **„Gépazonosító (HWID)"** beviteli mező, nem kötelező.
- A mező címkéje fölé húzva a kurzort (hover / tooltip) rövid súgó jelenik
  meg: letöltse és futtassa a gépazonosító-mutató programot, majd a kapott
  azonosítót másolja be ide. (Ugyanaz a program, ami a Termékeim oldalon
  letölthető — `/api/public/hwid-download`.)
- A beviteli mező **mellett** (ugyanabban a sorban, a mező jobb oldalán) egy
  **„Gépazonosító letöltése"** gomb található, amely a meglévő
  `/api/public/hwid-download` végpontról indítja a letöltést. Mobilon (768 px
  alatt) a gomb kattintása a meglévő figyelmeztető toastot mutatja (csak
  asztali Windows gépen futtatható), a letöltést nem indítja.
- A mező értéke a DEMO-nyilvántartásba kerül mentésre (ha megadták).

### Tesztidő — opcionális dátum

- A DEMO űrlapon van egy **„Meddig van szükséged a tesztelésre?"** dátummező,
  nem kötelező.
- Konkrét dátum választható (Shadcn Datepicker, magyar formátummal).
- A kiválasztott dátum a DEMO-nyilvántartásba kerül mentésre (ha megadták);
- a letöltőlink lejárati idejét ez nem befolyásolja (az fix, korlátozott
  idejű).

### Mezők sorrendje a DEMO űrlapon

1. Név * → 2. E-mail * → 3. Telefonszám * → 4. Gépazonosító (HWID) – opcionális,
   letöltőgombbal és tooltip-súgóval → 5. Tesztidő dátum – opcionális →
   6. Adatvédelmi jóváhagyás * → 7. Küldés gomb.

## Éles megrendelő űrlap — gépazonosító a számlázási adatoknál

Ugyanez a gépazonosítós rész beépül az éles megrendelő űrlapra
(`/megrendeles`) is, a **számlázási adatok** blokkba, az e-mail és telefonszám
mezők után, a „Megjegyzés" mező előtt.

- **„Gépazonosító (HWID)"** beviteli mező, nem kötelező.
- Hover/tooltip súgó ugyanaz: letöltse a gépazonosító-mutató programot, futtassa,
  másolja be az azonosítót.
- A mező mellett **„Gépazonosító letöltése"** gomb (`/api/public/hwid-download`).
- A mező értéke az `orders` táblába kerül mentésre (új, opcionális oszlop:
  `hwid text`), és megjelenik a tulajdonosnak küldött belső rendelés-értesítő
  e-mailben, ha megadták.
- Az éles űrlapon **nincs** tesztidő-dátum mező (az csak a DEMO-nál van
  értelme).
- A meglévő számlázási adatok, fizetés, számlázás és egyéb funkciók nem
  változnak — a gépazonosító tiszta kiegészítő adat.

## Folyamat (DEMO)

1. A vásárló a termékoldalon kiválasztja a **DEMO** csomagot, és kitölti a
   DEMO-igénylő űrlapot (név, e-mail, telefon kötelező; gépazonosító és
   tesztidő opcionális).
2. A rendszer **nem hoz létre Stripe-fizetést** és **nem hívja a Billingót**.
3. A DEMO-igény **nem kerül a normál `orders` táblába**, így az admin
   vásárlási statisztikát és a „rendeléshez még nincs Billingo számla” számlálót
   nem növeli.
4. Külön **RLS-védett nyilvántartás** (új tábla, nem `orders`) tárolja a
   DEMO-igényeket — beleértve a megadott gépazonosítót és tesztidőt is.
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
- Ha a DEMO-igénylő megadta a gépazonosítót, az szerepel a licenckérő e-mailben
  (a „Gépazonosító (HWID)" sornál). Ha nem adta meg, a sor üresen vagy
  „nem megadott" jelzéssel jelenik meg.
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
  `free_download_requests` tábla). Oszlopok: termék, név, e-mail, telefon,
  gépazonosító (opcionális), tesztidő dátum (opcionális), token, letöltési
  adatok, IP, user-agent, timestamp.
- Az éles `orders` táblához új, opcionális `hwid text` oszlop kerül
  (visszamenőleg kompatibilis, DEFAULT NULL).
- A védett, lejáró letöltőlink a meglévő privát terméktárhelyre és aláírt
  URL-es letöltő végpontra épül.
- A gépazonosító-letöltő gomb a meglévő `/api/public/hwid-download`
  végpontot és `handleHwidDownload` helper-t használja (mobil figyelmeztetéssel).
- A tooltip a meglévő arculatban, a shadcn Tooltip komponenssel jelenik meg.
- A dátummező a Shadcn Datepicker komponenst használja, `pointer-events-auto`
  wrapper-rel, magyar dátumformátummal.
- A meglévő fizetési, számlázási, kupon- és statisztikafolyamatok nem módosulnak.

## Állapot

- **Terv rögzítve, megvalósítás NEM kezdődött el.**
- A felhasználó jelzésére indul csak.
