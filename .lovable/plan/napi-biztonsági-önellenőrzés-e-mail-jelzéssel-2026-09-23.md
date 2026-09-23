# Napi biztonsági önellenőrzés e-mail jelzéssel

## Mit kapsz

Minden reggel 6:20-kor (magyar idő) lefut egy biztonsági önellenőrzés a saját adatbázisodon és beállításaidon. Ha **új** problémát talál, egyetlen összegző e-mailt küld a **[xllentac@gmail.com](mailto:xllentac@gmail.com)** címre. Ugyanarról a problémáról soha nem kap újra levelet — csak akkor, ha egy korábban javított hiba később visszatér.

Ha nincs új találat, nem megy levél.

## Amit az ellenőrzés megvizsgál

- Olyan adatbázistábla, amin nincs bekapcsolva a soralapú védelem (RLS)
- Olyan tábla, ahol a védelem be van kapcsolva, de nincs hozzá egyetlen szabály sem (így senki nem éri el — vagy épp fordítva: felügyelet nélkül maradt)
- Táblák, amiket bejelentkezés nélküli látogató is olvashat, holott nem nyilvános adatot tartalmaznak
- Nyilvános (publikus) tárolók megjelenése — ilyen nem lehet a projektben
- Biztonsági szempontból kockázatos adatbázis-függvények (nem fixált `search_path`)
- Olyan időzített feladat, ami hitelesítés nélküli végpontot hív

## Amit fontos tudni (korlát)

A platform saját **mély kódelemzését** nem tudom időzítve elindítani — azt a rendszer a saját ütemezésében futtatja, nincs hozzá indítható felület az alkalmazásból. A napi ellenőrzés ezért nem a mély kódelemzés másolata, hanem az adatbázis- és beállítás-oldali hibákat fogja, vagyis azt a típust, ami éles adatszivárgáshoz vezethet. Ezt a levél szövege is kiírja, hogy ne érezd teljesebbnek, mint amilyen.

## Technikai részletek

- Új tábla: `security_alerts_sent` (`finding_key` egyedi, `finding_type`, `detail`, `first_seen_at`, `last_seen_at`, `resolved_at`), RLS bekapcsolva, GRANT csak `service_role` — a `order_alerts_sent` mintájára.
- Új végpont: `src/routes/api/public/biztonsagi-ellenorzes/cron.ts`, `cronAuthorized()` + `cronJson()` a meglévő `src/lib/cron-auth.server.ts`-ből, ugyanazzal a `MAINTENANCE_CRON_TOKEN` titokkal, mint a többi öt cron.
- Logika: `src/lib/security-selfcheck.server.ts` — a fenti ellenőrzések `pg_catalog` / `pg_policies` / `storage.buckets` / `information_schema` lekérdezésekkel, `supabaseAdmin`-nal. Minden találat stabil `finding_key`-t kap (típus + objektumnév), így az ismétlés kiszűrhető.
- E-mail: új React Email sablon `src/lib/email-templates/belso-biztonsagi-jelzes.tsx`, regisztrálva a `registry.ts`-ben, küldés a meglévő `sendTemplateEmail` helperrel, `idempotencyKey` a futás dátumából.
- Csak az új találatok kerülnek a levélbe; a már jelzett kulcsok `last_seen_at`-je frissül. Ha egy találat eltűnik, `resolved_at` beíródik — visszatéréskor újra jelzendőnek számít.
- Cron: `cron.schedule('daily-security-selfcheck', '20 4 * * *', ...)` (4:20 UTC = 6:20 Budapest), `net.http_post` a stabil `project--…lovable.app` címre, `x-cron-secret` fejléccel. Napi egy futás, elhanyagolható terhelés.
- A végpont lefutását helyben ellenőrzöm, és a nyitott találatok listáját visszaírom neked.

## Amit nem érint

Megrendelések, Fizetés, Számlázás, Kuponok, Statisztika, Hírlevél oldalak és a meglévő öt időzített feladat változatlan.

## A meglévő időzített feladatok (pontos idők)

Az időzítés UTC szerint tárolódik, ezért magyar idő = +2 óra.


| Feladat                                                                      | Beírt idő (UTC) | Magyar idő    | Gyakoriság |
| ---------------------------------------------------------------------------- | --------------- | ------------- | ---------- |
| Heti takarítás (lejárt DEMO/letöltő linkek, lejárt kuponok, tároló-jelentés) | `0 2 * * 0`     | vasárnap 4:00 | heti       |
| Heti katalógus-audit                                                         | `0 3 * * 0`     | vasárnap 5:00 | heti       |
| Havi statisztika-zárás                                                       | `30 2 1 * *`    | 1-jén 4:30    | havi       |
| Napi jelzés: régóta fizetésre vár                                            | `0 6 * * *`     | naponta 8:00  | napi       |
| Napi jelzés: kifizetve, de nincs számla                                      | `10 6 * * *`    | naponta 8:10  | napi       |


Vagyis a korábban „hajnali 2 / 3 / 6 óra"-ként említett idők valójában magyar idő szerint 4 / 5 / 8 órakor futnak.

## Javasolt csoportosítás, sorrend, gyakoriság

Három csoport, mindig ebben a logikai sorrendben: **takarítás → ellenőrzés → jelzés**. Így az ellenőrzés már a megtisztított állapotot látja, és a levél a végleges helyzetet jelenti.

**1. Napi műszaki blokk — hajnal**

- 04:00 magyar (02:00 UTC): biztonsági önellenőrzés (új). Korán fut, hogy egy éles hiba még a nap kezdete előtt jelzésre kerüljön.

**2. Napi üzleti blokk — reggel, egy levélben**

- 07:00 magyar (05:00 UTC): a „régóta fizetésre vár" és a „kifizetve, de nincs számla" ellenőrzés **egy futásba és egy e-mailbe** vonva, két szakasszal. Így nem kapsz két külön levelet ugyanazon reggel, és a 8:10-es külön futás megszűnik. Gyakoriság marad napi — mindkettő pénzügyi következményű.

**3. Heti blokk — vasárnap**

- 03:00 magyar: heti takarítás (marad)
- 03:30 magyar: katalógus-audit (marad) — a takarítás után helyes, mert a törölt/lezárt linkek után ellenőriz

**4. Havi blokk**

- Hónap 1-je 04:30 magyar: statisztika-zárás (marad). Vasárnapra eső 1-jén sincs ütközés, mert a takarítás 3:00-kor már lefutott.

Ha a napi két üzleti jelzés egyesítését nem szeretnéd, hagyhatjuk két külön futásnak; ez a terv további részét nem befolyásolja.