# Kapcsolat oldal + Hírlevél rendszer

## 1. Kapcsolat oldal átrendezése

- A bekarikázott bevezető szöveg („Írj bátran… / Töltsd ki az űrlapot…") átkerül a
  jobb hasábba, közvetlenül az **Írj nekem** cím fölé.
- A szöveg így módosul: „Írj bátran, ha kérdésed van a **szolgáltatásaimmal vagy
  termékeimmel** kapcsolatban."
- A felszabaduló helyre (a hero alá, bal oldalra) egy **Hírlevél feliratkozás**
  gomb kerül, a „Termékek megtekintése" gombbal egyező primary stílusban.
- A gomb egy felugró (modális) űrlapot nyit: Vezetéknév*, Keresztnév*, E-mail*,
  Telefon, Cégnév, adatkezelési jelölő, rejtett honeypot mező.

## 2. Hírlevél feliratkozás — hogyan szokás?

A bevett gyakorlat: az űrlap adatai a saját adatbázisba mennek, a feliratkozó
**dupla opt-in** megerősítő levelet kap (erre a magyar és EU-s szabályozás miatt
is szükség van), és minden kiküldött levélben van **leiratkozó link**. A
kiküldést vagy saját rendszerből, vagy külső hírlevélküldőből (MailerLite,
EmailOctopus, Sender, SendPulse, Brevo) végzik.

A kérésnek megfelelően **mindkettő elkészül**: az adat mindig nálad marad
(exportálható), és az adminban választható, hogy melyik szolgáltatóba menjen át.

## 3. Admin → Hírlevél oldal

Új, **csak admin** szerepkörrel elérhető oldal (`/admin/hirlevel`). A tetején
rádiógombos módválasztó:

| # | Mód | Mit ad |
|---|-----|--------|
| 1 | Saját lista + admin levélküldő | Lista kezelése, export, levélküldő a beépített e-mail-rendszerrel |
| 2 | MailerLite | API-kulcs megadása, feliratkozók átadása |
| 3 | EmailOctopus | API-kulcs + lista-azonosító |
| 4 | Sender | API-kulcs megadása |
| 5 | SendPulse | API azonosító + titkos kulcs |
| 6 | Brevo | API-kulcs (vagy a beépített Brevo-összekötés) |

A választott mód mentődik, és mindig az érvényes: a feliratkozás minden esetben
a saját listába kerül, és a 2–6. módban a szolgáltatóba is átmegy.

### Lista és export

Táblázat: név, e-mail, telefon, cégnév, feliratkozás dátuma, megerősítve,
leiratkozva. Keresés és szűrés. Export: **CSV, XLSX, XML, PDF**, plusz mind az
**öt külső rendszer** (MailerLite, EmailOctopus, Sender, SendPulse, Brevo)
importformátumához illeszkedő, a saját fejléceikre szabott CSV.

### Levélküldő (1. mód)

Formázható szerkesztő: félkövér, dőlt, aláhúzás, felsorolás, címsorok,
**betűszín és háttérszín** (színválasztóval, az arculati színekkel gyorsgombként),
**link beszúrása** és **kép beillesztése** (a kép a projekt saját tárolójába
kerül, a levélben teljes URL-lel hivatkozva — így minden levelezőben látszik).
Előnézet, teszt-küldés magadnak, majd kiküldés a megerősített, nem leiratkozott
feliratkozóknak — adagolva, hogy ne fusson időtúllépésbe. Minden levél alján
leiratkozó link.

## 4. Felhasználók oldal

A szerepkör-leírások frissülnek: az **admin** szerepkörnél megjelenik a Hírlevél
oldal (lista, export, levélküldő, szolgáltató-összekötés) is; a **felhasználó**
szerepkör leírása változatlanul csak Statisztika + Kuponok (olvasás).
