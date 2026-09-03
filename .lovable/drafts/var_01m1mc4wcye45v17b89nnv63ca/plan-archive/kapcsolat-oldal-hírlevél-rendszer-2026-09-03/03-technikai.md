## Technikai részletek

**Kapcsolat oldal**
- `src/routes/kapcsolat.tsx`: bevezető bekezdés áthelyezése a jobb hasábba az
  „Írj nekem" cím fölé; bal oldalon új „Hírlevél feliratkozás" gomb.
- Új `src/components/NewsletterSignup.tsx`: modális űrlap + zod validáció
  (`src/lib/newsletter-schema.ts`), honeypot mező.
- `src/lib/newsletter.functions.ts` (`createServerFn`) – publikus feliratkozás:
  szerveroldali zod validáció, egyszerű rate limit IP + e-mail alapon,
  megerősítő e-mail küldése tokennel; `/hirlevel-megerosites` route a
  megerősítéshez, `/leiratkozas` a leiratkozáshoz.

**Adatbázis (additív migráció, a draft elfogadásakor lép életbe)**
- `newsletter_subscribers`: id, last_name, first_name, email (unique),
  phone, company, status (pending/confirmed/unsubscribed), confirm_token,
  confirmed_at, unsubscribed_at, source, ip_address, user_agent, created_at.
  GRANT: `authenticated` SELECT/UPDATE, `service_role` ALL; RLS bekapcsolva,
  olvasás csak `has_role(auth.uid(),'admin')`. Publikus beszúrás nem a Data
  API-n, hanem szerverfüggvényből, service role-lal.
- `newsletter_campaigns`: id, subject, body, sent_at, sent_count, created_by
  (admin olvasás, service_role write).
- `app_settings` meglévő tábla: `newsletter` kulcs tárolja a választott módot és
  a szolgáltató nem titkos beállításait (pl. lista-azonosító).

**API-kulcsok**
Az admin felületen megadott kulcsok nem kerülnek az adatbázisba: a secret
tárolóba mennek (`MAILERLITE_API_KEY`, `EMAILOCTOPUS_API_KEY`,
`SENDER_API_KEY`, `SENDPULSE_CLIENT_ID` + `SENDPULSE_CLIENT_SECRET`,
`BREVO_API_KEY`), és csak szerveroldalon olvashatók. Az oldal csak azt jelzi,
hogy be van-e állítva. Brevónál a beépített Brevo-összekötés is használható.

**Admin oldal**
- `src/routes/admin.hirlevel.tsx` + `src/components/NewsletterAdminPanel.tsx`.
- `src/lib/newsletter-admin.functions.ts` / `.server.ts`: lista, mód mentése,
  szolgáltató-teszt (kulcs érvényességének ellenőrzése), szinkronizálás,
  kampány küldése adagolva a meglévő `send-email.ts` réteggel, új
  `src/lib/email-templates/hirlevel.tsx` és `hirlevel-megerosites.tsx`
  sablonokkal. Minden szerverfüggvény `requireSupabaseAuth` + admin `gate`.
- Szerkesztő: könnyű rich-text szerkesztő (`contentEditable` alapú, félkövér /
  dőlt / lista / címsor / link / kép / betűszín / háttérszín), a kimenet
  e-mail-biztos HTML-re tisztítva (inline stílusok, táblázatos elrendezés,
  sanitizálás — csak engedélyezett tagek és `color` / `background-color`
  stílusok maradnak). Kép feltöltés a meglévő védett tárolóba, aláírt vagy
  publikus olvasási útvonallal a levél számára.
- Export: a meglévő `src/lib/stats-export.ts` mintájára CSV/XLSX/XML/PDF, plusz
  öt szolgáltató-specifikus CSV fejléckészlet.
- `src/lib/admin-access.ts`: `{ prefix: "/admin/hirlevel", roles: ["admin"] }`.
- `src/routes/admin.tsx`: „Hírlevél" fül csak admin szerepkörnek.
- `src/components/admin-panels.tsx` (UsersPanel): szerepkör-leírások frissítése.

**Jogi / megfelelés**
Az Adatvédelmi tájékoztatóba bekerül a hírlevél-adatkezelés (kezelt adatok, cél:
marketing hozzájárulás alapján, megőrzés a leiratkozásig, adatfeldolgozó a
választott hírlevélküldő).
