# Ingyenes termék a katalógus-ellenőrzésben + két új levélgomb

## 1. Ingyenes termék ne legyen hiba a katalógus-ellenőrzésben

Az ingyenes csomagokat (0 Ft, pl. `ingyenes_e_nyugta_utmutato`) a tételsoroknál már kihagyja az ellenőrzés, de a hiba máshonnan is jöhet (pl. a termék saját árazonosítója vagy a Stripe-névellenőrzés). Első lépés: lefuttatom az ellenőrzést, és megnézem, pontosan melyik sor jelzi hibának. Utána ott is kihagyom:

- minden 0 Ft-os termék / csomag Stripe-ellenőrzését (lookup key, aktív ár, összeg, terméknév),
- a kézi futtatásnál (Admin → Ellenőrzések → Katalógus ellenőrzés), a heti vasárnapi futásnál és a heti levélben is,
- a Stripe terméknevek panelen sem kerül „Javítandó” közé.

A letöltési fájl ellenőrzése ingyenes terméknél is megmarad (az kell).

## 2. „Visszajelzés kérés” gomb — csak DEMO igénylőknél

Admin → Megrendelések, DEMO kártyák: az „E-mail a vevőnek” gomb elé kerül. Éles rendeléseknél nem jelenik meg.

Kattintásra felugró ablak nyílik: címzett (az igénylő e-mail címe), tárgy („Visszajelzés kérés – {termék neve}”) és a teljes levélszöveg pontosan úgy, ahogy megadtad. Két gomb: „Igen, küldés” és „Mégsem”. Igen után a rendszer kiküldi a levelet, ugyanúgy, mint a licenclevelet (XLNT BI feladónévvel, a megszokott levélarculatban), és zöld visszajelzést kapsz.

## 3. „Fizetési emlékeztető” gomb — csak fizetésre váró rendeléseknél

Ugyanott, az éles rendelés-kártyákon, csak ha a rendelés fizetésre vár. Ugyanilyen megerősítő ablak: címzett (a vevő), tárgy („Fizetési emlékeztető – {rendelésszám}”) és a levél szövege. Az „IDE A TERMÉK NEVE, LICENC TÍPUSA ÉS ÁRA ÍRD BE.” sor helyére automatikusan a rendelés adatai kerülnek, három külön sorban:

```text
Termék: XLNT …
Licenc típusa: Teljes csomag
Ár: 74 900 Ft
```

A szöveg többi része szó szerint marad (a „Igényeltél  terméket” dupla szóközét egyre javítom).

Mindkét levélnél a válasz-cím a te címed, így ha a vevő a „Válasz” gombra kattint, hozzád érkezik. A levelekből belső másolat is megy a megszokott belső címre, és a kártyán látszik, mikor küldted utoljára (hogy ne menjen ki véletlenül kétszer).

## Technikai részletek

- `src/lib/catalog-audit.server.ts` (+ `catalog-fix.server.ts`, `stripe-product-names.server.ts`): `price === 0` csomagok / termékek kiszűrése a lookup key-ellenőrzésből és a névszinkronból; heti cron ugyanezt a függvényt hívja.
- Két új React Email sablon (`demo-visszajelzes-keres.tsx`, `fizetesi-emlekezteto.tsx`) a registryben; küldés a meglévő `sendTemplateEmail` helperrel, `replyTo` a tulajdonos címe, idempotencia-kulcs id + dátum.
- `src/lib/admin.server.ts` + `admin.functions.ts`: `sendDemoFeedbackRequest(id)`, `sendPaymentReminder(orderId)` admin-gate mögött; a címzett és adatok szerveroldalon a rekordból jönnek (böngészőből nem adható meg cím). A fizetési emlékeztető elutasít, ha a rendelés már nem fizetésre váró.
- `src/components/admin-panels.tsx`: két gomb + közös megerősítő dialógus előnézettel; utolsó küldés időpontja `app_settings`-ben vagy meglévő mezőben tárolva (új tábla nincs).
- Szövegépítő tiszta függvény + teszt a placeholder-cserére.
