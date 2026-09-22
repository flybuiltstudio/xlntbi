# Mailto licencküldő gomb a licenckérő értesítő e-mailekbe

A licenckérő e-mailek (azok, amiket te kapsz, amikor valaki licencet vár) kapjanak egy kattintható linket, ami megnyit egy e-mailt az igénylő saját címére, előre kitöltött tárggyal és szöveggel — csak a licenszkódot kell beillesztened.

## Érintett e-mailek

1. **Éles rendelés** – „Új megrendelés" belső értesítő (`src/lib/email-templates/belso-rendeles-ertesito.tsx`)
2. **DEMO igénylés** – „CSAK DEMO – DEMO licenc igénylés" e-mail (`src/lib/demo-request.server.ts` ownerHtml/ownerText)

## Módosítás

### 1. Éles értesítő (`belso-rendeles-ertesito.tsx`)

Új `tierLabel?: string` prop (a sablont küldő kód már adja át, ha elérhető — ellenőrzöm `notify.server.ts` / rendelési folyamatban, és ott egészítem ki, ha hiányzik).

A meglévő „Válasz a vevőnek" link mellé/alá egy zöld gomb-stílusú `Link`:

- **Felirat:** „Licenc küldése a vevőnek"
- **href:**
  ```
  mailto:{customerEmail}?subject={ENC(productName – beírandó licenc)}&body={ENC(body)}
  ```
- **Body:**
  ```
  Tisztelt Vásárló!

  Küldöm a licencet az alábbi termékhez:

  Termék: {productName}
  Licenc csomag: {tierLabel vagy „—"}

  Licenszkód:
  ＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿  (IDE ÍRD A LICENSZKÓDOT)

  Üdvözlettel:
  Sarinay Dávid
  XLNT BI
  ```
  (16 darab alulvonás a kód helyén.)

A subject és body `encodeURIComponent`-tel kódolva, ahogy a `letoltes-elerheto.tsx:73` már csinálja.

### 2. DEMO értesítő (`demo-request.server.ts`)

Az `ownerHtml` táblázat utána zöld gomb-link (`<a>`), ugyanazzal a mailto-szerkezettel, a subject végén DEMO jelöléssel:

- **Subject:** `{productName} – DEMO – beírandó licenc`
- **Body:** mint fent, plusz sor: `Típus: DEMO (korlátozott idejű)`
- A plain-text `ownerText` verzióba is bekerül a mailto mint egyszerű sor.

### Preview adatok

- `belso-rendeles-ertesito` `previewData` kiegészül `tierLabel: 'Örökös licenc'`-cel, hogy az admin sablon-előnézetben a gomb helyesen jelenjen meg.

## Ellenőrzés

- `bunx tsgo --noEmit`
- Kódolvasás: a mailto href encode-olása, mindkét e-mailben megvan a link.
