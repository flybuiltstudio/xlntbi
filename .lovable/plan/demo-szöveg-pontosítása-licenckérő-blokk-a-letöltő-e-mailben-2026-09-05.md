# DEMO-szöveg pontosítása + licenckérő blokk a letöltő e-mailben

## 1. Termékek oldal DEMO-szövegének cseréje
- `src/routes/termekeim.tsx:138-143`: a narancssárga DEMO-szöveg kicserélése pontosan erre:
  „Bármelyik termékből kérhető DEMO. Ehhez nézd meg az alábbi programmal a géped azonosítóját. És ezt az azonosítót, a kipróbálni vágyott termék nevét, valamint hogy hány napra van szükséged a teszteléshez, írd meg nekem a Konzultációt kérek oldal segítségével. A DEMO-k teljes verziók, csak a használati idő van lekorlátozva."
- `src/routes/en.products.tsx:90-95`: természetes angol fordítás:
  „A DEMO can be requested for any product. Use the program below to find your machine's identifier. Then send me this identifier, the name of the product you would like to try, and how many days you need for testing via the Request a consultation page. DEMOs are full versions; only the usage period is limited."
- A HWID-gomb és a piros szöveg változatlan marad.

## 2. Licenckérő blokk a „Letöltés elérhető" e-mailben
Célfájl: `src/lib/email-templates/letoltes-elerheto.tsx`. A blokk a letöltőgombos `Section` (sor 71) és a `DataTable` (sor 72) közé kerül — pontosan a képen „HERE" jelölte helyre.

### Új Props
- `tierLabel?: string` — a licenc csomag típusa (pl. „Örökös licenc").
- A `productName` prop a tiszta terméknév marad; a kombinált címke (termék – licenc) külön áll össze, ahol kell.

### Adatátadás a feladóból
- `src/lib/download.server.ts:138-152`: a `data` blokkba bekerül `tierLabel: order.tier_label` és a `productName` értéke a tiszta `productName` (nem a `productLabel`) legyen, hogy a mailto subjectben a termék neve tiszta legyen. A `rows` és a doboz címsora használhatja továbbra is a `productLabel`-t; ehhez a sablon külön `productLabel` propot kap, vagy a doboz címsorát belsően összerakja. Egyszerűbb: új prop `productLabel` (a kombinált címke a dobozhoz), `productName` (tiszta név a mailto-hoz), `tierLabel`.

### Megjelenítés
- Narancssárga bevezető szöveg (`BRAND` narancs szín, `Text`):
  „A letöltés után indítsd el / nyisd meg a megvásárolt terméket, és a megjelenő HWID-t küldd el a megvásárolt termék nevével és licensz típusával együtt az info@xlntbi.hu emailcímre."
- `Button` (mailto link, zöld gomb), címkéje „Licenszet kérek e-mailben":
  - `href` = `mailto:info@xlntbi.hu?subject=…&body=…`
  - Subject: `{name} – {productName} – {tierLabel} – LICENSZET KÉREK`
  - Body (URL-encoded, egyszerű szöveges „táblázat" soronként):
    ```
    Tisztelt Sarinay Dávid!

    Az alábbi termékre licenszkódot kérek:

    Vásárló neve:  {name}
    Termék:        {productName}
    Licenc csomag: {tierLabel}
    >> HWID: ＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿  (KITÖLTENDŐ!) <<
    ```
    A HWID sornál 16 darab alulvonás (a minta HWID `13B9D1D807614D61` = 16 karakter), és `KITÖLTENDŐ!` kiemelve.
  - Megjegyzés: a `mailto` link csak egyszerű szöveget tud a levéltörzsbe tenni, a sárga háttér az e-mail-kliensben nem megvalósítható; ezért a HWID sort `>> … (KITÖLTENDŐ!) <<` kiemelés jelöli.

### Preview adatok
- `template.previewData` kiegészül `tierLabel: 'Örökös licenc'` értékkel, és a `productName` tiszta névre áll (pl. „XLNT NAV Online Számla letöltő"), a `productLabel` a kombinált címke lesz — hogy az admin sablon-előnézetben a mailto link is helyesen jelenjen meg.

## 3. Ellenőrzés
- `bunx tsgo --noEmit` típusellenőrzés.
- A `mailto` href URL-encodolt subject/body helyességének kód-ellenőrzése (encodeURIComponent).
- Termékeim oldal megtekintése a preview-ban; letöltő e-mail sablon admin előnézet (ha elérhető) vagy kódolvasás alapján a blokk helye.
