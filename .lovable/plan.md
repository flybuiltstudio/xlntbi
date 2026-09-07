# Kalkulátor frissítése: nyelvek szétválasztása és automatikus angol fordítás

## Amit most találtam

A feltöltő lista összemossa a két nyelvet, és emiatt van egy valódi hiba is:

- Az angol Bérteszt, Jövedelemadó és Átalányadó oldal ugyanarra a bejegyzésre hivatkozik, mint a magyar. Ha ma magyar verziót töltesz fel, az angol oldalon is a magyar tartalom jelenik meg.
- Az angol Invoice Dates oldal olyan bejegyzést keres, ami a listában nem is szerepel, így oda felöltés soha nem érvényesül.
- A listában „Invoice Dates (EN)” a magyarok között van.

## Amit építek

### 1. Nyelvek szétválasztása

A kalkulátor-nyilvántartás nyelvet és párosítást is tárol:

| Magyar | Angol pár |
| --- | --- |
| Számla dátumok | Invoice Dates |
| Bérteszt | Salary Test |
| Jövedelemadó | Income Tax |
| Átalányadó | Átalányadó (Flat-rate tax) |

Az admin felület két külön csoportot mutat: „Magyar kalkulátorok” és „Angol kalkulátorok” (a legördülőben csoportosítva, mindegyiknél látszik, eredeti vagy feltöltött verzió fut-e). Az angol oldalak ezután a saját angol bejegyzésüket használják, tehát a magyar feltöltés nem szivárog át.

### 2. Automatikus angol frissítés

Magyar kalkulátor feltöltésekor a rendszer ugyanabban a lépésben elkészíti az angol változatot és azonnal élesíti:

- a feltöltött HTML látható szövegeit (feliratok, gombok, címek, súgók, hibaüzenetek, a kódban lévő szöveges kiírások) a beépített AI lefordítja angolra,
- a számítási logika, a formázás, a szerkezet, az azonosítók és a stílus érintetlenül maradnak — csak szöveg cserélődik,
- mindkét bejegyzés (magyar és angol) egyszerre íródik ki, így a magyar és az angol oldal ugyanazt a verziót futtatja,
- ha a fordítás bármiért nem sikerül, a magyar frissítés akkor is megtörténik, és a felület egyértelműen jelzi, hogy az angol változat nem frissült — ilyenkor újra lehet próbálni egy külön „Angol változat újragenerálása” gombbal,
- a visszajelzésben látszik, melyik angol kalkulátor frissült és mikor.

Az angol kalkulátort ettől függetlenül továbbra is fel tudod tölteni kézzel, ha felül akarod írni a fordítást.

## Technikai részletek

- `src/lib/calculators/registry.ts`: `CALCULATORS` bejegyzések `lang: "hu" | "en"` és `enKey` mezővel; új angol kulcsok (`invoice-dates-en`, `berteszt-en`, `jovedelemado-en`, `atalanyado-en`), plusz csoportosított listát adó segédfüggvények. A meglévő `invoice-dates` kulcs megmarad kompatibilitási okból, de nem szerepel a felületen.
- `src/routes/en.calculators.*.tsx`: a `getCalculatorOverride` hívások az angol kulcsokra állnak át (`berteszt-en`, `jovedelemado-en`, `atalanyado-en`, `invoice-dates-en`). Az SSR-es megjelenítés és a beépített változatra visszaesés változatlan.
- Új `src/lib/calculator-translate.server.ts`: Lovable AI Gateway hívás az AI SDK-n keresztül (`@/lib/ai-gateway.server` helper vagy létrehozása, ha még nincs), `streamText` + `await result.text`, hosszabb futásra is biztonságosan; szigorú system prompt: csak a látható szöveg fordul, HTML-szerkezet, attribútumok, JS-logika és számok maradnak.
- `src/lib/admin.server.ts` `uploadCalculatorVersion`: magyar kulcs esetén a mentés után elkészíti és upsertálja az `enKey` bejegyzést is; visszatérési értékben `enUpdated` / `enError`. `src/lib/admin.functions.ts` új `adminRegenerateCalculatorEnglish` szerverfüggvény ugyanazon admin-kapuval.
- `src/components/admin-panels.tsx` `CalculatorVersionPanel`: `optgroup`-os választó, nyelvjelölés, angol frissítés státusza, „Angol változat újragenerálása” gomb. Csak a panel szövege és szerkezete változik.
- Adatbázis-módosítás nem kell: a `calculator_overrides` tábla kulcs szerint tárol, az angol kulcsok új sorok. Az AI-kulcs szerveroldalon marad.
- Ellenőrzés: típusellenőrzés, majd élő próba adminként — egy magyar kalkulátor feltöltése, a magyar és az angol oldal ellenőrzése, végül az eredeti visszaállítása.

## Amit ez nem tartalmaz

- A kalkulátorok számítási logikája és a dizájn nem változik.
- A termékfájl-feltöltő szekció érintetlen.
- Verziótörténet továbbra sem készül (a feltöltés felülír).
