# Napi biztonsági önellenőrzés e-mail jelzéssel

## Mit kapsz

Minden reggel 6:20-kor (magyar idő) lefut egy biztonsági önellenőrzés a saját adatbázisodon és beállításaidon. Ha **új** problémát talál, egyetlen összegző e-mailt küld a **xllentac@gmail.com** címre. Ugyanarról a problémáról soha nem kap újra levelet — csak akkor, ha egy korábban javított hiba később visszatér.

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
