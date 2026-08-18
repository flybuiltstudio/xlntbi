# Termékek, megrendelés és e-mail infrastruktúra

## Mit tudok most az élő oldalról

Az élő xlntbi.hu-n pontosan **két** termék van (a Termékeim oldalon és külön termékoldalon):

- `/termek/nav-online-szamla-letolto/` – NAV Online Számla letöltő – 19 900 Ft
- `/termek/nav-penztargep-letolto/` – NAV Pénztárgép letöltő – 19 900 Ft

A két feltöltött képernyőfotó ezeknek a termékoldalaknak a teljes szövegét tartalmazza (leírás, „Fő funkciók" pipás lista, „Miért jó" zöld blokk, ár, kosár). Ezt karakterre másolom át, nem írom át és nem találok ki hozzá tartalmat.

## 1. Termékoldalak (URL-struktúra megtartva)

- `/termek/nav-online-szamla-letolto` és `/termek/nav-penztargep-letolto` – az eredetivel egyező felépítés: zöld fejléc-sáv a termék nevével, leírás, „Fő funkciók" kártyák, „Miért jó" blokk, jobb oldalon termékkép + ár + megrendelés gomb.
- `/termekeim` (már létezik) alá bekerül a két termék kártyája árral, linkkel – ez lesz a terméklista.
- Fejléc/lábléc menübe bekerülnek a termékek, hogy egy oldal se legyen elérhetetlen a navigációból.
- Minden termékoldal SSR-ből jön, egy `<h1>`, saját title/meta/og, és `Product` + `Offer` JSON-LD.

## 2. Megrendelés – most űrlap, később kártyás fizetés

Bankkártyás fizetés még nincs, de a szerkezet már úgy készül, hogy később csak a fizetési lépést kell beékelni:

- „Megrendelem" gomb → `/megrendeles?termek=...` megrendelőlap: mennyiség, **számlázási adatok** (név / cégnév, adószám, ország, postai cím, e-mail, telefon), megjegyzés. Szállítási cím nincs, mert digitális termék.
- Kötelező jelölők: ÁSZF + adatvédelem elfogadása, és a digitális teljesítéshez tartozó elállási-jog nyilatkozat (ez jogszabályi követelmény letölthető terméknél).
- Szerveroldali validáció (Zod), honeypot + IP-alapú rate limit, láthatatlan spamvédelem – captcha nélkül.
- A megrendelés adatbázisba mentődik (`orders` tábla, RLS-sel, csak szerveroldali hozzáférés), rendelésazonosítóval.
- Sikeres beküldés után visszaigazoló oldal a rendelésszámmal és az utalási/fizetési tudnivalókkal.
- Fizetés-előkészítés: a rendelésnek van `payment_status` és `payment_provider` mezője, a szerverfunkció pedig egyetlen ponton hívja a jövőbeli fizetés-indítást, így a kártyás fizetés bekötése egy lépés lesz.

## 3. E-mail infrastruktúra

Ehhez saját küldő domain kell (xlntbi.hu) – ezt a beállító párbeszédben lehet elindítani, DNS-hitelesítés után indul a küldés.

Utána beépítem:
- **Megrendelés – tulajdonosi értesítő** (Sarinay Dávidnak): minden rendelési és számlázási adat.
- **Megrendelés – vásárlói visszaigazoló**: arculatos, magyar levél a rendelésszámmal, termékkel, árral, számlázási adatokkal és a következő lépésekkel.
- **Kapcsolat/Konzultáció**: a jelenlegi Resend-alapú küldés átáll a saját domainre, ugyanaz a két levél (tulajdonos + kitöltő).
- Bounce/panasz/leiratkozás visszajelzések fogadása, hogy a nem létező címek ne rontsák a levelek megbízhatóságát.

## 4. Design, AI képek és videó

- 2 termék-mockup kép (Excel-munkafüzet hangulatú vizuál) a termékoldalakra, arculati zöldben.
- 1 vizuál a `/termekeim` fejlécbe és og:image-ekhez, saját tárolóban (nem Lovable-képernyőkép).
- **AI videó**: egy rövid, 8 másodperces hangulati klip a Termékeim oldal fejlécébe. Ez a legdrágább elem, ezért csak ezt az egyet készítem el – ha nem kell, kihagyom.

## 5. Jogi oldalak, amik a megrendelés miatt kötelezőek

Megrendelhető termék esetén ezek nem maradhatnak ki, és a láblécben már hivatkozva vannak, de még nem léteznek:
Impresszum · Cookie-tájékoztató · Elállási tájékoztató (digitális tartalom!) · Fizetési és teljesítési feltételek · Fogyasztóvédelmi tájékoztatás (békéltető testület).
Ezeket elkészítem a valós cégadatokkal – ahol adat hiányzik (cégnév, székhely, adószám, cégjegyzékszám), ott jelzem, mit kell pótolni, nem találok ki adatot.

Emellett: sitemap.xml, magyar 404-oldal, `<html lang="hu">`.

## Technikai részletek

- Termékadatok egy tipizált modulban (`src/lib/products.ts`), a route-ok ebből SSR-ben renderelnek.
- Megrendelés: `createServerFn` + `.server.ts` (mint a jelenlegi kapcsolatűrlap), `supabaseAdmin` írás, GRANT csak `service_role`-ra, RLS bekapcsolva.
- Migráció: `orders` tábla (rendelésszám, termék, mennyiség, egységár, összeg, számlázási adatok, státusz, fizetési státusz/szolgáltató, IP, user agent, időbélyegek) + rate-limit indexek.
- E-mail: React Email sablonok + szerveroldali küldő segédfüggvény, idempotenciakulcs a rendelésazonosítóból.
- A kosár/pénztár jellegű útvonalak nem kerülnek a sitemapbe.
