# Ingyenes termék a katalógus-ellenőrzésben + két új levélgomb

## 1. Ingyenes termék ne legyen hiba a katalógus-ellenőrzésben

Az ingyenes csomagokat (0 Ft, pl. `ingyenes_e_nyugta_utmutato`) a tételsoroknál már kihagyja az ellenőrzés, de a hiba máshonnan is jöhet (pl. a termék saját árazonosítója vagy a Stripe-névellenőrzés). Első lépés: lefuttatom az ellenőrzést, és megnézem, pontosan melyik sor jelzi hibának. Utána ott is kihagyom:

- minden 0 Ft-os termék / csomag Stripe-ellenőrzését (lookup key, aktív ár, összeg, terméknév),
- a kézi futtatásnál (Admin → Ellenőrzések → Katalógus ellenőrzés), a heti vasárnapi futásnál és a heti levélben is,
- a Stripe terméknevek panelen sem kerül „Javítandó” közé.

A letöltési fájl ellenőrzése ingyenes terméknél is megmarad (az kell).

## 2. „Visszajelzés kérés” gomb — csak DEMO igénylőknél

Admin → Megrendelések, DEMO kártyák: az „E-mail a vevőnek” gomb elé kerül. Kattintásra megnyílik a leveleződ előre kitöltve: címzett az igénylő, tárgy „Visszajelzés kérés – {termék neve}”, a törzs pontosan a megadott szöveg (változtatás nélkül). Éles rendeléseknél nem jelenik meg.

## 3. „Fizetési emlékeztető” gomb — csak fizetésre váró rendeléseknél

Ugyanott, az éles rendelés-kártyákon, csak ha a rendelés fizetésre vár. Előre kitöltött levél: címzett a vevő, tárgy „Fizetési emlékeztető – {rendelésszám}”, törzs a megadott szöveg, ahol az „IDE A TERMÉK NEVE, LICENC TÍPUSA ÉS ÁRA ÍRD BE.” sor helyére automatikusan bekerül pl.:
„XLNT … – Teljes csomag – 74 900 Ft”. A szöveg többi része szó szerint marad (a dupla szóköz „Igényeltél  terméket” javítása egyszeres szóközre — szólj, ha maradjon).

Mivel előre kitöltött levél nyílik, küldés előtt még átírhatod, és a saját fiókodból megy ki, így a válasz közvetlenül hozzád érkezik.

## Technikai részletek

- `src/lib/catalog-audit.server.ts` (+ `catalog-fix.server.ts`, `stripe-product-names.server.ts`): `price === 0` csomagok / termékek kiszűrése a lookup key-ellenőrzésből és a névszinkronból; heti cron ugyanezt a függvényt hívja.
- `src/components/admin-panels.tsx`: két `mailto:` gomb (`encodeURIComponent` csak subject/body-n, a cím nyersen — a korábbi Gmail-hibát elkerülve); szövegek egy kis konstans modulban (`src/lib/admin-mail-templates.ts`) + teszt a placeholder-cserére.
- Nincs új tábla, nincs szerveroldali levélküldés.
