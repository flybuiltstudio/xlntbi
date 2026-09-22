# DEMO igények a Megrendelések oldalon, kuponszöveg, admin menük

## 1. DEMO igények a Megrendelések oldalon

A DEMO folyamat továbbra is teljesen külön marad (nincs számla, nincs Stripe, nem
kerül a vásárlási statisztikába). Csak az admin Megrendelések oldalon jelennek meg
a DEMO igények, saját megjelenésű kártyákon:

- Sárga/jelzett fejléc „DEMO” címkével, rendelésszám helyett „DEMO”.
- Adatok: termék, igénylő neve, e-mail, telefon, cégnév, adószám, gépazonosító,
  kért tesztidő, igénylés dátuma, link lejárata, letöltések száma (x / max).
- Gombok: **Letöltési link újraküldése**, **Licenc küldése**, **E-mail a vevőnek**,
  valamint a jobb szélen **Törlés** megerősítéssel.
- Ami NEM jelenik meg: számlázás, számla adatai, számla megnyitása, sztornó,
  utalás jóváhagyása.

Működés:
- **Letöltési link újraküldése**: a régi token lejár, új 7 napos / 5 letöltéses
  link készül, és ugyanaz a DEMO letöltő levél megy ki, mint igényléskor.
- **Licenc küldése**: a megszokott licenckód-mező nyílik, a levél a meglévő
  licenckód-sablonnal megy a DEMO jelöléssel (rendelésszám helyén „DEMO”,
  licencszint „DEMO”), másolatban a belső címre.
- **Törlés**: nem törli a nyilvántartást, csak lezárja — a letöltőlink azonnal
  érvénytelen lesz, a tétel a DEMO statisztikában marad (a heti takarítással
  megegyező viselkedés). A gomb felirata ezért „DEMO lezárása”, magyarázó
  szöveggel a megerősítő kérdésben.

Szűrés: a felső szűrőblokk „Fizetés” sorába bekerül egy **DEMO** opció, és az
„Összes” a rendeléseket és a DEMO igényeket is mutatja (dátum szerint egy
sorrendben). A többi szűrő (fizetési mód, számlázva) DEMO-nál nem értelmezett,
ilyen szűrés esetén a DEMO tételek kimaradnak. Az év/hónap szűrő a DEMO
igénylés dátumára is érvényes.

## 2. Kuponoldali szöveg javítása

A „Kuponvédelem éles környezetben” blokk szövege ma lejárt kódot is
„engedélyezett”-ként sorol fel. Új szöveg:

- Ha a kód még érvényes: „Jelenleg engedélyezett éles kódok: XLNTTESZT100
  (érvényes 2026. 08. 31. 23:59:59-ig).”
- Ha lejárt: a kód átkerül egy külön mondatba: „Lejárt, már nem engedélyezett
  kódok: XLNTTESZT100 (lejárt: …).”
- Ha nincs érvényes kód: „Jelenleg nincs engedélyezett éles kuponkód.”

## 3. Kuponvédelem időzítése

Ma csak éles fizetés indításakor fut le (legfeljebb 6 óránként), illetve kézzel.
A vasárnap 2:00-kor futó heti takarítás mostantól lefuttatja az éles
kuponellenőrzést is, és az eredménye bekerül a karbantartási levélbe. A panel
„Utolsó ellenőrzés” adata így hetente frissül.

## 4. Gombmenü a Hírlevél, Kuponok és Statisztika oldalak tetejére

A Termékek és Kalkulátorok oldalon lévő gombokból álló tartalomjegyzék
általánosított változata kerül a három oldal tetejére (két hasáb, ugyanaz a
gombstílus), a blokkokhoz horgonyokkal, és minden blokk alján a megszokott
„↑ Tetejére” gomb.

- **Hírlevél**: Feliratkozók · Feketelista · Külső rendszer összekötése ·
  Levélküldő · Korábbi kiküldések (a tényleges blokkok sorrendjében).
- **Kuponok**: Új kupon · Kuponok listája · Kupon előzmények · Sikertelen
  kísérletek · Kuponvédelem éles környezetben.
- **Statisztika**: a meglévő blokkok címei (összesítés, havi bontás,
  konverzió, megrendelések óránként, megrendelői és terméklista, DEMO
  letöltések stb.).

Csak admin számára látható blokkok linkjei nem jelennek meg a „user”
szerepkörnek.

## Technikai részletek

- `src/lib/admin.server.ts`: új `listDemoRequests()` (admin lista adatokkal),
  `resendDemoDownload(id)` (token csere + DEMO letöltő levél a
  `letoltes-elerheto` sablonnal, `isDemo: true`), `sendDemoLicense(id, key)`
  (`licensz-kod` sablon, orderNumber „DEMO”, tierLabel „DEMO”, belső másolat),
  `closeDemoRequest(id)` (`closed_at` + `expires_at` lejáratás).
- `src/lib/admin.functions.ts`: a négy megfelelő `createServerFn` wrapper a
  meglévő admin-gate mintát követve.
- `src/components/admin-panels.tsx`: a DEMO tételek a rendelésekkel egy
  időrendi listába kerülnek (diszkriminált unió: `kind: "order" | "demo"`),
  külön kártyakomponens a DEMO-hoz; `payFilter` új `"demo"` értéke.
- `src/components/LiveCouponGuardPanel.tsx`: érvényes/lejárt kódok szétválasztva.
- `src/lib/maintenance.server.ts`: a heti futás meghívja
  `sweepLivePromotionCodes()`-t, az eredmény a jelentésbe kerül.
- `src/components/admin-toc.tsx`: általános `AdminSectionNav({ columns })`
  komponens; a meglévő `AdminToc` erre épül, hogy a Termékek oldal ne változzon.
  A három oldal blokkjai `id` + `scroll-mt-24` horgonyt kapnak.
- Nem módosul: számlázás, Stripe, `orders` tábla, DEMO igénylő űrlap és a
  publikus DEMO folyamat.
