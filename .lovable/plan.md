# DEMO-szöveg pontosítása + licenckérő blokk a letöltő e-mailben

## 1. Termékek oldal DEMO-szövegének cseréje
- `src/routes/termekeim.tsx`: a narancssárga DEMO-szöveg kicserélése pontosan erre:
  „Bármelyik termékből kérhető DEMO. Ehhez nézd meg az alábbi programmal a géped azonosítóját. És ezt az azonosítót, a kipróbálni vágyott termék nevét, valamint hogy hány napra van szükséged a teszteléshez, írd meg nekem a Konzultációt kérek oldal segítségével. A DEMO-k teljes verziók, csak a használati idő van lekorlátozva."
- `src/routes/en.products.tsx`: ugyanott természetes angol fordítás:
  „A DEMO can be requested for any product. Use the program below to find your machine's identifier. Then send me this identifier, the name of the product you would like to try, and how many days you need for testing via the Request a consultation page. DEMOs are full versions; only the usage period is limited."
- A HWID-gomb és a piros szöveg változatlan marad.

## 2. Licenckérő blokk a „Letöltés elérhető" e-mailben
- `src/lib/email-templates/letoltes-elerheto.tsx`: a letöltőgombos doboz és a rendelési adattábla KÖZÉ (a képen pirossal jelölt helyre) új blokk:
  - Narancssárga szöveg: „A letöltés után indítsd el / nyisd meg a megvásárolt terméket, és a megjelenő HWID-t küldd el a megvásárolt termék nevével és licensz típusával együtt az info@xlntbi.hu emailcímre."
  - Alatta kattintható `mailto:info@xlntbi.hu` link:
    - Subject: `{vásárló neve} – {termék neve} – {licenc csomag} – LICENSZET KÉREK`
    - Body: sablon levél egyszerű szöveges „táblázattal" sorokban: Vásárló neve / Termék / Licenc csomag / HWID: ______ (KITÖLTENDŐ!)
    - Megjegyzés: a `mailto` link csak egyszerű szöveget tud a levéltörzsbe tenni, a sárga háttér e-mail-kliensből nem megoldható — ezért a HWID sor `>> HWID: ______ (KITÖLTENDŐ!) <<` kiemelést kap, hogy egyértelmű legyen.
  - A `Button`-t `mailto` URL-lel, címkéje pl. „Licenszet kérek e-mailben".
- A sablon preview adatai is bővülnek, hogy az admin sablon-előnézetben látható legyen.

## 3. Ellenőrzés
- Típusellenőrzés (`tsgo`), majd a Termékeim oldal megtekintése a preview-ban.
- A letöltő e-mail sablon az admin e-mail előnézetben ellenőrizhető; a mailto link URL-encodolt subject/body helyessége kód-ellenőrzéssel.
