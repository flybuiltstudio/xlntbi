# Biztonsági jelzések javítása az admin felületről

## Mit kapsz

Az Admin → **Ellenőrzések** menübe új pont kerül: **Biztonsági ellenőrzés**.
Az oldalon:

1. **Nyitott hibák listája** — csak azok, amik még nincsenek kijavítva. Minden
   sornál magyar leírás: mi a probléma, mi a következménye, és hogy gépileg
   javítható-e.
2. **„Ellenőrzés futtatása most"** gomb — azonnal újrafut a vizsgálat (nem kell
   a hajnali futásra várni), és frissül a lista.
3. **„Javítsd mindet" gomb** — egy kattintással elvégzi a biztonságosan
   automatizálható javításokat, majd újraellenőriz, és kiírja, mit javított.
4. Ami **nem javítható automatikusan**, ott minden sornál **választható
   lehetőségek** vannak (rádiógombok). Alapértelmezés mindig a „Maradjon így
   (nem javítom)". Amint választasz valamit, a „Javítsd mindet" gomb ezeket is
   elvégzi a választásod szerint. Kitalált „kész" állapotot nem mutat.

## Mit javít a gomb magától

| Hibatípus | Automatikus javítás |
| --- | --- |
| Táblán nincs bekapcsolva a soralapú védelem (RLS) | bekapcsolja |
| Kiemelt jogú adatbázis-függvény fixált útvonal nélkül | beállítja a fix útvonalat |
| Nyilvános tároló | priváttá teszi |

## Ahol te választasz

Ezeknél egy szabály törlése kiütheti a nyilvános oldal működését (pl.
termékkatalógus), ezért döntés kell hozzá. Minden sornál ott a tábla/szabály
neve, és ezek közül választhatsz:

- **Bejelentkezés nélkül olvasható tábla**
  - Maradjon így — szándékosan nyilvános (alapértelmezett)
  - Nyilvános olvasás megszüntetése — a szabály törlődik, a tábla csak
    bejelentkezve vagy szerveroldalról olvasható
- **Bejelentkezés nélkül írható tábla**
  - Maradjon így (alapértelmezett)
  - Írás megszüntetése — az írási szabály törlődik, írni csak szerveroldalról
    lehet (űrlapoknál ez a javasolt)
- **Időzített feladat hitelesítő fejléc nélkül**
  - Maradjon így (alapértelmezett)
  - Hitelesítés bekapcsolása — a feladat hívása a biztonságos tárolóból olvasott
    titokkal, `x-cron-secret` fejléccel fut tovább

Választás után a gomb felirata megmutatja, hány tételt fog javítani, és a
futás után tételesen kiírja, mit javított és mit hagyott érintetlenül. Minden
ilyen javítás előtt még egy megerősítő kérdés jön.


## Technikai részletek

- Új SQL függvény `public.security_autofix(_decisions jsonb DEFAULT '{}')`
  (SECURITY DEFINER, fix `search_path`, csak `service_role`-nak GRANT-olva).
  Végignézi a `security_selfcheck()` találatait:
  - automatikus típusok: `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`,
    `ALTER FUNCTION ... SET search_path = public`,
    `UPDATE storage.buckets SET public = false`;
  - döntéses típusok (`anon_policy`, `anon_write`, `cron_no_secret`) csak akkor,
    ha a `_decisions` objektumban az adott `finding_key`-hez `"fix"` érték
    tartozik — `anon_policy`/`anon_write`: a konkrét policy `DROP POLICY`-ja
    (dinamikus SQL, `quote_ident`-tel, kizárólag az adott policy nevére);
    `cron_no_secret`: a job command újraírása `cron.alter_job`-bal, a vault-ból
    olvasott `maintenance_cron_token` titokkal, `x-cron-secret` fejléccel.
  Minden mást érintetlenül hagy, és jsonb-ben adja vissza, mit javított, mit
  hagyott ki, és hol hibázott.
- `src/lib/security-selfcheck.server.ts`: új `listOpenFindings()` (a
  `security_alerts_sent` `resolved_at IS NULL` sorai), és
  `runSecurityAutofix(decisions)` — `security_autofix()` hívás, majd
  `runSecuritySelfCheck()` újrafutás, hogy a megjavított sorok `resolved_at`-et
  kapjanak. Az e-mail logika változatlan: egy találatról csak egyszer megy
  levél.
- Új `src/lib/security-admin.functions.ts`: `adminSecurityFindings`,
  `adminRunSecurityCheck`, `adminSecurityAutofix` (bemenet: `finding_key` →
  `"keep" | "fix"` map, zod-validálva) — a `storage-cleanup` szerverfunkciók
  admin-ellenőrzési mintája szerint, `supabaseAdmin` csak a handler belsejében
  importálva.
- Új `src/components/SecurityCheckPanel.tsx` + új route
  `src/routes/admin.biztonsagi-ellenorzes.tsx` a `admin.tarolo-takaritas.tsx`
  mintájára (`PageHero`, `AdminBlock`, noindex meta, egyedi title/description).
  A panel a döntéseket helyi állapotban tartja (alapérték mindenhol `keep`),
  a gomb feliratában mutatja a javítandó tételszámot, és `window.confirm`
  megerősítést kér, ha döntéses javítás is van.
- `src/routes/admin.tsx`: a `checksLinks` listába bekerül az új pont.
- A hibatípus-kódokhoz (`no_rls`, `anon_policy`, `anon_write`,
  `public_bucket`, `func_search_path`, `cron_no_secret`) magyar magyarázat és
  „automatikus / választható" jelölés a panelben.


## Amihez nem nyúlok

Megrendelések, Fizetés, Számlázás, Kuponok, Statisztika, Hírlevél oldalak, a
napi cron ütemezések és az e-mail sablonok változatlanok. A platform saját mély
kódelemzését továbbra sem lehet innen indítani — ez az oldal az adatbázis- és
beállításoldali találatokat kezeli.
