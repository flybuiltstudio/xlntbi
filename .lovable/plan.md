# Új termék: MNB ERA Jelentésgenerátor (R09 és R12)

A csatolt ajánló és a két Excel-sablon alapján új termék kerül a katalógusba, a Riportok és beszámolók kategória 4. helyére.

## Termékadatok

- Név: MNB ERA Jelentésgenerátor (R09 és R12)
- Rövid alcím: Jegybanki adatszolgáltatások beküldhető XML/CSV fájlja Excelből, egy gombnyomással
- Ár: egyetlen licenc, 29 900 Ft (AAM, végösszeg, ÁFA nem kerül rá). Nincs bevezető ár és nincs táblastruktúra-beállítási szolgáltatás.
- Letölthető fájl: a két sablon egy csomagban (MNB_ERA.zip – MNB_ERA_R12.xlsm és MNB_ERA_R09.xlsm), védett tárolóba.
- Állapot: elérhető, azonnal megrendelhető.

## Tartalom a termékoldalon

Az ajánló szövegét használjuk fel, R12/R09-re élezve, kitalált tartalom nélkül:

- Bevezető: az ERA/STEFI beküldés szigorú formátumszabályai, a kézi összeállítás hibalehetőségei, és hogy a sablon+makró a STEFI kézikönyv szerinti fájlt állítja elő.
- Fő funkciók: XML és sorkódos CSV kimenet, előírás szerinti automatikus fájlnév (pl. R09/R12 + ÉÉHH + törzsszám), bizonylatjelleg-kezelés (E/M/N, táblánkénti nemleges), táblánként egy munkalap sorkódos adatbevitellel, windows-1250 CSV CRLF-fel, dátumformátumok, @ sorkód-előtag, beépített magyar hibaüzenetek.
- Előnyök: időmegtakarítás, kevesebb visszautasított beküldés, megszokott Excel-környezet, STEFI „Ellenőrzés” funkcióval előzetesen validálható.
- Tudnivalók: Excel (Windows, 32/64 bit) makróengedéllyel; a tábla- és sorkódokat az MNB szabálycsomagja határozza meg; az éles beküldéshez ERA-regisztráció kell.

## Megjelenés és SEO

- Fotórealisztikus termékkép a többi termékkép stílusában (`src/assets` + `public/og`), a sötétzöld arculathoz illően.
- Saját termékroute `/termek/mnb-era-jelentesgenerator` egyedi, kiírt title/description/canonical/OG blokkal és JSON-LD-vel, a meglévő termékroute-ok mintájára.
- Bejegyzés a `public/sitemap.xml` fájlba.

## Technikai részletek

- `src/lib/products.ts`: új termékbejegyzés egyetlen tierrel (`priceId: mnb_era_licenc`, 29 900 Ft), `download` a feltöltött zip tárolási útvonalára.
- `src/lib/product-categories.ts`: a `riportok-beszamolok` kategória `slugs` listájában a 4. pozícióra kerül az új slug.
- Stripe: egy termék + egy ár létrehozása a teszt környezetben (a publikálás szinkronizálja élesre).
- A zip a privát `termekfajlok` tárolóba kerül; nyilvános tároló nem készül.
- Nincs séma-, e-mail- vagy fizetési logikai változás.
