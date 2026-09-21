# Feliratkozó törlése + feketelista a Hírlevél oldalon

## Mit kap a Hírlevél adminoldal

### 1. Törlés gomb a feliratkozóknál
- A Feliratkozók táblázat minden sorának végén új „Törlés" gomb.
- Kattintásra megerősítő kérdés (név + e-mail megnevezésével), és csak igenre töröl.
- A törlés végleges: a cím kikerül a listából, nem kap több hírlevelet, az exportokban sem szerepel.
- Törlés után a lista és a számlálók (megerősített / várakozó / leiratkozott) azonnal frissülnek.

### 2. Feketelista blokk a Feliratkozók alatt
- Új „Feketelista" blokk: e-mail cím + opcionális megjegyzés (miért került fel), hozzáadás gombbal.
- Táblázat: e-mail, megjegyzés, felvétel dátuma, és minden sor végén „Törlés" gomb (megerősítéssel).
- Ha egy cím feketelistán van, a nyilvános feliratkozó űrlap nem engedi a feliratkozást: rövid magyar hibaüzenetet kap („Ezt a címet nem tudom felvenni a hírlevél listára."). Kívülről nem derül ki, hogy tiltólistás-e a cím — az űrlap nem ad többletinformációt.
- A feketelistázás a kiküldést is védi: ilyen címre teszt- és listás levél sem megy ki.
- Ha egy cím már feliratkozó, és felkerül a feketelistára, a feliratkozása leiratkozottra vált (így biztosan nem kap több levelet).

## Technikai részletek

**Adatbázis** — új `public.newsletter_blocklist` tábla (additív migráció): `id`, `email` (kisbetűsítve, egyedi), `note`, `created_by`, `created_at`. GRANT csak `service_role`-ra (+`authenticated` SELECT nem szükséges, mert minden olvasás szerverfüggvényből, service role-lal történik), RLS bekapcsolva, policy nélkül — így a Data API-n senki nem éri el.

**Szerver** — `src/lib/newsletter-admin.server.ts`: `deleteSubscriber(id)`, `listBlocklist()`, `addToBlocklist(email, note, userId)` (egyben a meglévő feliratkozást `unsubscribed`-re állítja), `removeFromBlocklist(id)`. `src/lib/newsletter-admin.functions.ts`: négy új `createServerFn`, mindegyik `requireSupabaseAuth` + admin `gate`, zod validációval (e-mail formátum, max hossz).

**Feliratkozás-ellenőrzés** — `src/lib/newsletter.server.ts` `subscribe()`: a rate limit után blocklist-lekérdezés (`ilike` a normalizált címre), találat esetén `{ ok: false, error: … }` visszatérés e-mail küldése és mentés nélkül. `sendCampaign()` címzettlistájából és a teszt-küldésből is kiszűrjük a feketelistás címeket.

**UI** — `src/components/NewsletterAdminPanel.tsx`: új „Művelet" oszlop a feliratkozói táblázatban `window.confirm` alapú megerősítéssel, és új `Feketelista` szekció (űrlap + táblázat) a Feliratkozók szekció után, a meglévő `actionBtn` stílusokkal. Az oldal többi része (szerkesztő, módválasztó, exportok, kampánylista) változatlan.
