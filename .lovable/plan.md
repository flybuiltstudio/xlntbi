# E-mail infrastruktúra + rendelési visszaigazolók + Stripe előkészítés

## Amit most tudunk
- A kapcsolat/konzultáció beküldés mentődik az adatbázisba, de az e-mail küldés csak egy Resend-hívás placeholder feladóval (`onboarding@resend.dev`), API-kulcs nélkül — vagyis ma nem megy ki e-mail.
- A rendelés (`megrendeles`) mentődik, de nincs mögötte visszaigazoló e-mail.
- A projekthez nincs beállított küldő domain, ezért semmilyen app e-mail nem tud kimenni.

## 1. Küldő domain beállítása (ez a nulladik lépés)
A saját domain (xlntbi.hu) alatt egy küldő aldomaint állítunk be — így az e-mailek a saját márkáról érkeznek, nem idegen címről. Ehhez a beállító párbeszédpanelt kell egyszer végigkattintani; utána minden küldés a Lovable beépített, kezelt e-mail rendszerén megy (kézbesítés, újrapróbálás, leszokás-kezelés benne van).

## 2. Szép, magyar e-mail sablonok
Négy sablon, mind az oldal arculatában (sötétzöld #217346, Inter, XLNT logó, tiszta fehér háttér):
1. **Kapcsolatfelvétel – visszaigazoló** (a kitöltőnek): köszönjük, összefoglaló a beküldött adatokról, válaszidő, elérhetőség.
2. **Konzultációkérés – visszaigazoló** (a kitöltőnek): a választott kapcsolati mód és időpont visszaidézése.
3. **Belső értesítő** (nekünk, xllentac@gmail.com): minden mező táblázatosan, közvetlen „válasz” linkkel a kitöltő címére.
4. **Megrendelés – visszaigazoló** (a vevőnek): termék, ár, számlázási adatok, a következő lépés leírása. Ehhez párban egy **belső rendelési értesítő** is.

## 3. Küldés bekötése
- A kapcsolat/konzultáció beküldésnél: mentés után kimegy a visszaigazoló a kitöltőnek **és** az értesítő nekünk. A meglévő honeypot + rate limit (3 beküldés / 10 perc / IP) marad.
- A megrendelésnél ugyanez: vevői visszaigazoló + belső értesítő, rendelésazonosítóval.
- A régi, kulcs nélküli Resend-hívást lecseréljük a kezelt küldésre.
- Ha egy címre nem lehet küldeni (korábbi visszapattanás), az nem hiba: a beküldés akkor is mentődik.

## 4. Stripe előkészítés
Stripe API-kulcs **nem kell** — a Lovable beépített fizetési integrációját használjuk, ahol egy rövid űrlap kitöltése után a fizetés kulcsmásolgatás nélkül működik. Ebben a körben csak előkészítünk:
- a rendelés kap egy fizetési státuszt (`pending` / `paid`),
- a megrendelő oldalon a „bankkártyás fizetés hamarosan” szöveg helye előkészítve a Stripe-gombhoz,
- a vevői visszaigazolóban a fizetési blokk feltételes: ha van online fizetés, a fizetés tényét igazolja; ha nincs, az átutalásos/egyeztetett menetet írja.
A tényleges bekötést a következő körben, a te jóváhagyásodkal indítjuk (az integráció bekapcsolása egy űrlap kitöltésével jár).

## Technikai részletek
- `email_domain--scaffold_transactional_email_templates` → React Email sablon-regiszter + szerveroldali `sendTemplateEmail` helper.
- Sablonfájlok: `src/lib/email-templates/*.tsx`, regisztrálva a `registry.ts`-ben.
- `src/lib/contact.server.ts` és `src/lib/order.server.ts`: a `fetch("api.resend.com")` blokk helyére `sendTemplateEmail(...)` hívások, `idempotencyKey`-jel a beküldés/rendelés ID-ból.
- Migráció: `orders` táblához `payment_status text not null default 'pending'` (+ meglévő RLS/GRANT érintése nélkül).
- Nem hozunk létre e-mail sort, suppression- vagy unsubscribe-táblát; ezek a kezelt rendszer részei.

## Amit tőled kérek
A küldő domain beállítását (1. lépés) — a többi ezen múlik.
