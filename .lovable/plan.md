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
  - Nyilvános olvasás megszüntetése — kívülről, a weboldal használata nélkül
    senki nem tud belenézni; az oldal és az Admin felület továbbra is olvassa
- **Bejelentkezés nélkül írható tábla**
  - **Írás megszüntetése (alapértelmezett, javasolt)** — kívülről nem lehet
    közvetlenül adatot beírni; az űrlapok és az Admin műveletek változatlanul
    működnek
  - Maradjon így
- **Időzített feladat hitelesítő fejléc nélkül**
  - Maradjon így (alapértelmezett)
  - Hitelesítés bekapcsolása — a feladat hívása a biztonságos tárolóból olvasott
    titokkal, `x-cron-secret` fejléccel fut tovább

Fontos: a „megszüntetés" a közvetlen, oldalon kívüli hozzáférést zárja be. Az
oldal működése, az Admin felület és a fejlesztői felület mindkét esetben végig
elérhető marad, mert azok a kérések a weboldal háttérfolyamatain futnak.

## Döntéseid megjegyzése

Amint egy táblánál döntesz (akár „maradjon így", akár „megszüntetés"), a
rendszer eltárolja. A következő futtatásoknál az a tábla **nem kérdez rá újra**:
a nyitott hibák közül kimarad, és lekerül az oldal legaljára egy
**„Elfogadott döntések"** listába (tábla, mit döntöttél, mikor). Ott bármikor
visszavonhatod egy „Döntés visszavonása" gombbal — akkor a következő
ellenőrzésnél újra rákérdez. A napi e-mailes jelzés is kihagyja az eldöntött
tételeket.



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
- Új tábla `public.security_decisions` (`finding_key` PK, `finding_type`,
  `decision` `keep`/`fix`, `decided_at`, `decided_by`), RLS be, csak
  `service_role` GRANT — ez tárolja a döntéseidet.
- `src/lib/security-selfcheck.server.ts`: új `listOpenFindings()` (a
  `security_alerts_sent` `resolved_at IS NULL` sorai, a
  `security_decisions`-ben szereplő kulcsok kiszűrve), `listDecisions()`,
  `clearDecision(key)`, és `runSecurityAutofix(decisions)` —
  `security_autofix()` hívás, a döntések mentése, majd `runSecuritySelfCheck()`
  újrafutás, hogy a megjavított sorok `resolved_at`-et kapjanak. A napi e-mail
  is kihagyja az eldöntött kulcsokat; egy találatról továbbra is csak egyszer
  megy levél.
- Új `src/lib/security-admin.functions.ts`: `adminSecurityFindings` (nyitott
  hibák + eldöntött lista), `adminRunSecurityCheck`, `adminSecurityAutofix`
  (bemenet: `finding_key` → `"keep" | "fix"` map, zod-validálva),
  `adminClearSecurityDecision` — a `storage-cleanup` szerverfunkciók
  admin-ellenőrzési mintája szerint, `supabaseAdmin` csak a handler belsejében
  importálva.
- Új `src/components/SecurityCheckPanel.tsx` + új route
  `src/routes/admin.biztonsagi-ellenorzes.tsx` a `admin.tarolo-takaritas.tsx`
  mintájára (`PageHero`, `AdminBlock`, noindex meta, egyedi title/description).
  A panel a döntéseket helyi állapotban tartja (alapérték: `anon_write` →
  `fix`, minden más → `keep`), a gomb feliratában mutatja a javítandó
  tételszámot, `window.confirm` megerősítést kér, ha döntéses javítás is van,
  és legalul kilistázza az „Elfogadott döntések"-et visszavonó gombbal.

- `src/routes/admin.tsx`: a `checksLinks` listába bekerül az új pont.
- A hibatípus-kódokhoz (`no_rls`, `anon_policy`, `anon_write`,
  `public_bucket`, `func_search_path`, `cron_no_secret`) magyar magyarázat és
  „automatikus / választható" jelölés a panelben.


## Amihez nem nyúlok

Megrendelések, Fizetés, Számlázás, Kuponok, Statisztika, Hírlevél oldalak, a
napi cron ütemezések és az e-mail sablonok változatlanok. A platform saját mély
kódelemzését továbbra sem lehet innen indítani — ez az oldal az adatbázis- és
beállításoldali találatokat kezeli.
