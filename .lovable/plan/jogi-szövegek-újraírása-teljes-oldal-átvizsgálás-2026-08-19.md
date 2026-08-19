# Jogi szövegek újraírása + teljes oldal-átvizsgálás

## Amit az ellenőrzés talált

**Jogi hiányok**
- Az impresszum, az ÁSZF és az adatvédelmi tájékoztató nem tartalmazza a szolgáltató valós adatait ("kitöltésre várnak" szöveg szerepel benne).
- A Fizetési és teljesítési feltételek még azt írja, hogy "bankkártyás online fizetés bevezetése folyamatban van" — pedig a Stripe kártyás fizetés már működik az oldalon.
- Sehol nincs megnevezve a Stripe, a Billingo, a Resend (e-mail) és a Lovable mint adatfeldolgozó — GDPR 13. cikk szerint kötelező.
- Az ÁSZF-ben nincs áfa-státusz feltüntetve (alanyi adómentes), és nincs a kártyás fizetésre vonatkozó rész.
- A Kapcsolat és a Konzultáció űrlapon nincs adatkezelési jelölőmező (a megrendelőlapon van 3 db, az rendben).
- A Fogyasztóvédelmi oldal a székhely szerinti békéltető testületet nem nevezi meg (Budapest → Budapesti Békéltető Testület).
- A cookie-tájékoztató nem említi a Stripe fizetéshez szükséges sütiket.

**Technikai/UX ellenőrzés (lefuttatva mobil 390px, tablet 834px, desktop 1440px)**
- Mind a 12 vizsgált útvonal 200-as választ ad, a nem létező oldal helyesen 404 és magyar.
- Oldalanként pontosan egy `<h1>` van mindenhol.
- Nincs vízszintes túlcsordulás egyik nézetben sem.
- Nincs törött belső link; a lábléc- és menüpontok mind létező oldalra visznek.
- Nincs JS-hiba a konzolban (csak a szándékos 404-teszt).

## Amit megcsinálok

### 1. Jogi szövegek teljes újraírása
A megadott adatokkal minden érintett oldalon:
Sarinay Dávid EV · 1076 Budapest, Péterfy Sándor utca 9. 8/26. · nyilvántartási szám 57905657 · adószám 59861010-1-42 · KSH 59861010-7020-231-01 · alanyi adómentes (AAM).

- **Impresszum** — teljes szolgáltatói adatlap, tárhelyszolgáltató, panaszkezelés, felügyeleti szervek (NAV, kormányhivatal), a placeholder mondat törlése.
- **ÁSZF** — eladó adatai; áfa-státusz ("az árak alanyi adómentes körben, áfa nélkül értendők"); a két fizetési mód (banki átutalás és Stripe bankkártyás fizetés) nevesítése; digitális termék teljesítése; elállás; szavatosság; panaszkezelés; a Ptk., az Ekertv. (2001. évi CVIII.) és a 45/2014. (II. 26.) Korm. rendelet megjelölése.
- **Adatvédelmi tájékoztató** — GDPR 13. cikk szerinti szerkezet: adatkezelő azonosítása, célok/jogalapok/megőrzési idők táblázatos felsorolása (kapcsolatfelvétel, konzultáció, megrendelés, számlázás 8 év, kártyás fizetés), nevesített adatfeldolgozók: Stripe (fizetés), Billingo (számlázás), Resend (e-mail-küldés), Lovable/Supabase (tárhely és adatbázis), harmadik országba történő adattovábbítás jogalapja, érintetti jogok, NAIH elérhetőség, automatizált döntéshozatal kizárása, AI-eszközök használatának megnevezése.
- **Cookie-tájékoztató** — a Stripe fizetéshez tartozó, működéshez szükséges sütik feltüntetése.
- **Fizetési és teljesítési feltételek** — a "folyamatban van" mondat helyett a tényleges két fizetési mód leírása, a Stripe-folyamat lépései, számlázás Billingóval, teljesítési határidő.
- **Elállási tájékoztató** — marad a szerkezet, pontosítás a kártyás fizetés visszatérítésére (ugyanarra a kártyára, 14 napon belül) és a nyilatkozat-jelölőmezőkre.
- **Fogyasztóvédelem** — a Budapesti Békéltető Testület konkrét elérhetősége, a Budapest Főváros Kormányhivatala fogyasztóvédelmi hatáskör, EU online vitarendezés.

### 2. GDPR-jelölőmezők pótlása
A Kapcsolat és a Konzultáció űrlapra bekerül egy kötelező adatkezelési jelölőmező az Adatvédelmi tájékoztatóra mutató linkkel, szerveroldali validációval is (nem csak böngészőben).

### 3. UX-finomítások az átvizsgálás alapján
- A lábléc jogi linklistája mobilon hosszú egybefüggő oszlop — átrendezem, hogy telefonon két hasábban fusson.
- A jogi oldalak sok esetben tömör felsorolások: mobilon nagyobb sorköz és tagoltabb szakaszcímek.
- A megrendelőlap jelölőmezőinél a kattintható felület mobilon kicsi — nagyobb érintőfelület.

## Technikai részletek
- Érintett fájlok: `src/routes/impresszum.tsx`, `aszf.tsx`, `adatvedelmi-tajekoztato.tsx`, `cookie-tajekoztato.tsx`, `fizetes-es-teljesites.tsx`, `elallas-a-szerzodestol.tsx`, `fogyasztovedelem.tsx`, `kapcsolat.tsx`, `konzultacio.tsx`, `src/components/SiteFooter.tsx`, `src/components/LegalPage.tsx`, valamint a kapcsolat/konzultáció szerveroldali validációs sémái.
- A cégadatok egy közös `src/lib/company.ts` modulba kerülnek, hogy egy helyen legyenek karbantarthatók.
- Minden szöveg szerveroldalon renderelt marad (SSR), tehát a keresők és AI-crawlerek látják.

## Amit nem csinálok meg
- Nem írok olyan jogi állítást, amit nem adtál meg (pl. bankszámlaszám az átutaláshoz — ha kell az ÁSZF-be, küldd el).
- Nem nyúlok a fizetési logikához és a Stripe-beállításokhoz, csak a szövegekhez.
- A jogi szövegek nem helyettesítik a jogász ellenőrzését; a szerkezet és a hivatkozások a hatályos magyar és EU-s szabályokat követik.
