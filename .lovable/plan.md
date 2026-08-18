# xlntbi.hu — 1:1 migráció Lovable-re

Sarinay Dávid (XLNTBI) oldala: pénzügyi/könyvelési szolgáltatások, kalkulátorok,
később online eladott digitális termékek. Elementor-alapú WordPress, 25 publikált
oldal, 70 médiafájl, 2 kalkulátor, 2 űrlap.

## Amit az exportból kiolvastam

- **Tartalom:** 25 publikált `page`, 3 draft (Könyvelés, Privacy Policy, Visszatérítési
  szabályzat), 1 kuka (téma-demó), 1 `post` ("Hello world!" — téma-demó, kimarad).
  Egyedi bejegyzéstípus nincs. WooCommerce oldalak vannak (Shop, Kosár, Pénztár, Fiókom),
  de **egyetlen termék sincs az exportban**.
- **Média:** 527 fájl a ZIP-ben (70 médiatár-elem + generált méretek), köztük a logó
  (`Icon-03.png`) — ez lesz a favicon alapja is.
- **Kalkulátorok:** a Bérteszt teljes önálló HTML+CSS+JS a lap tartalmában (kb. 14 000
  karakter, 30 jogviszonytípus, 2026-os NAV-logika). A Jövedelemadó lap külön.
- **Űrlapok:** Elementor-űrlap a Kapcsolat és a Konzultáció lapon (a Konzultációnál
  ~8 mező, köztük több választó). Nem GoHighLevel, tehát újraépítjük.
- **Mérőkódok:** az élő oldal forrásában **egyetlen mérőkód sincs** — nincs GA4, GTM,
  Ads, Meta Pixel, Clarity, Hotjar, verifikációs meta. Ezt a záró jelentésben is rögzítem.

## Oldalszerkezet (URL-ek 1:1 megtartva)

```text
/                                  Főoldal
/rolam/                            Rólam
/szolgaltatasaim/                  Szolgáltatásaim
/konyveles/  /adotanacsadas/  /konyvvizsgalat/  /kontrolling/
/cegaudit/  /konyveloiroda-audit/  /fintech-es-bi/  /oktatas/
/digitalis-idomegtakaritasi-audit/  /konzultacio/
/termekeim/                        Termékeim
/kalkulatorok/                     Kalkulátorok gyűjtő
/kalkulatorok/berteszt/            Bérteszt
/kalkulatorok/jovedelemado/        Jövedelemadó
/uzlet/  /kosar/  /penztar/  /fiokom/   webshop-váz (üres katalógus)
/kapcsolat/                        Kapcsolat + űrlap
/aszf/  /adatvedelmi-tajekoztato/  /elallas-a-szerzodestol/
+ új: /impresszum/  /cookie-tajekoztato/  /visszateritesi-szabalyzat/
404-es oldal magyarul, az oldal arculatában
```

A `/berteszt` és `/jovedelemado` rövid útvonalak (a régi belső linkek ezekre mutatnak)
átirányítanak a `/kalkulatorok/...` verzióra.

## Média

Minden kép, PDF és médiafájl a ZIP-ből a projekt saját tárolójába kerül
(`lovable-assets`), a `wp-content` hivatkozások helyére. A végén ellenőrzöm, hogy
egyetlen `xlntbi.hu/wp-content/...` hivatkozás sem marad. A logó a fejlécbe kerül,
belőle készül a favicon (16/32/180 + `favicon.ico`), og:image saját képből.

## Kalkulátorok

A Bérteszt logikáját és megjelenését **karakterre pontosan átveszem** React
komponensbe (számítás változatlanul, saját stílus a meglévő zöld színvilággal).
A Jövedelemadó lap ugyanígy, az eredeti tartalma szerint. A "komplexebb kalkulátor"
külön körben, specifikáció alapján jön.

## Űrlapok (Kapcsolat, Konzultáció)

Ugyanazok a mezők, mint az eredetin. Beküldéskor:
1. mentés adatbázis-táblába (RLS-sel, csak szerveroldalról írható/olvasható),
2. értesítő e-mail a tulajdonosnak: **xllentac@gmail.com**,
3. magyar visszaigazoló e-mail a kitöltőnek.
Rejtett honeypot mező + rate limit, látható captcha nélkül. Szerveroldali validáció.

## Fizetésre felkészítés (most nem élesítjük)

Digitális termékek, ezért **nincs szállítási cím, csak számlázási adatok**. Most
elkészül: termék/ár adatmodell, kosár, pénztár-űrlap számlázási adatokkal, rendelés-
tábla (RLS), "fizetés hamarosan" állapot és megrendelőlap. Amikor jönnek a termékek és
eldől a szolgáltató, a bankkártyás fizetés bekötése egy külön kör — a felépítés már
készen fogadja.

## Jogi oldalak

Megvan az exportban: ÁSZF, Adatvédelmi tájékoztató, Elállás a szerződéstől,
Visszatérítési és visszaküldési szabályzat (draft — átveszem).
**Hiányzik és jelzem: Impresszum, Cookie-tájékoztató, Fogyasztóvédelmi/békéltető
testületi tájékoztatás, Szállítási és fizetési feltételek.** Ezekhez vázat készítek,
a cégadatokat neked kell megadnod — kitalált adatot nem írok bele.

## Technikai megjegyzések

- TanStack Start, route-onként külön fájl, minden tartalom szerveroldali HTML-ben (SSR),
  oldalanként egy `<h1>`, egyedi `title`/`description`/`og`.
- `<html lang="hu">`, `robots.txt` az AI-crawlerek (GPTBot, ClaudeBot, PerplexityBot,
  Google-Extended) engedésével, `sitemap.xml` a valós oldalakkal (kosár/pénztár/fiók nélkül).
- Lovable Cloud bekapcsolása: űrlapbeküldések, később rendelések és fiók.
- Arculat: a meglévő zöld (#217346 / #185c37) színvilág és a régi tipográfia alapján.
- Az ügyfél szövegeit szó szerint viszem át, nem fogalmazom át.
- Láblécben rövid jelzés, hogy az oldal AI segítségével készült.
- Több körben dolgozom: (1) alap + design + navigáció + Főoldal, (2) szolgáltatás- és
  tartalomoldalak, (3) kalkulátorok, (4) űrlapok + Cloud, (5) shop-váz + jogi oldalak,
  (6) SEO/SSR/média-ellenőrzés és záró jelentés.

## Amit tőled kérek később

- Cégadatok az Impresszumhoz (név, székhely, adószám, nyilvántartási szám, e-mail, telefon).
- Termékek (név, ár, leírás, letölthető fájl), amikor lesznek.
- A "komplexebb kalkulátor" leírása.
