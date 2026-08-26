# Oldalletöltési statisztika a termék- és szolgáltatásoldalakhoz

Az Admin → Statisztika oldalon a „Megrendelt termékek” alá két új statisztika kerül:

1. **Termék részletek oldalak letöltései** — minden termék (mind a 30+), év és azon belül hónap bontásban.
2. **Szolgáltatás aloldalak letöltései** — mind a 8 szolgáltatás aloldal, év és hónap bontásban.

Mindkettőnél:
- minden termék/szolgáltatás szerepel, akkor is ha 0 letöltés van,
- ABC (magyar) sorrendben,
- Excel, CSV, XML és PDF export, ugyanazokkal a gombokkal és stílusban, mint a mostani listák.

## Mérés

Jelenleg nincs saját oldalletöltés-mérés (csak Google Analytics, ami az adminban nem kérdezhető le), ezért egy saját, minimális számláló épül:

- Új tábla a letöltések havi összesítésével: oldal típusa (termék / szolgáltatás), az oldal kulcsa (slug vagy útvonal), év, hónap, darabszám. Egyedi kulcs a négy azonosítón, így egy sor = egy oldal egy hónapja.
- A számlálás szerveroldalon, egyetlen atomi növelő adatbázis-függvénnyel történik. A tábla RLS mögött van: olvasni csak admin tud, írni csak a szerver.
- Nem tárolunk IP-t, user agentet, sütit vagy bármilyen személyes adatot — csak összesített darabszámot. Így a mérés nem igényel süti-hozzájárulást, és az adatvédelmi tájékoztatót sem kell módosítani.
- A rögzítés csak a **publikált** felületen fut (a preview és a localhost nem számol), és a robotok/crawlerek kérései kimaradnak.

Ahol a rögzítés bekötésre kerül:
- termékoldalak: a közös `ProductDetail` komponensben, a termék slugjával,
- szolgáltatás aloldalak: a közös `ServicePage` komponensben, az oldal útvonalával.

A régi (korábbi hónapok) letöltései visszamenőleg nem állnak rendelkezésre, a számlálás a bevezetéstől indul.

## Admin megjelenítés

A „Megrendelt termékek” blokk alatt két új szekció, egymás után:
- év-választó (a meglévő szűrők stílusában), alatta táblázat: sorok = termékek / szolgáltatások ABC-ben, oszlopok = a 12 hónap + Összesen, alsó sorban a havi összegek.
- fejlécben a négy export gomb (XLSX, CSV, XML, PDF), a jelenlegi export-gombokkal azonos működéssel.

## Technikai részletek

- Migráció: `page_views` tábla (`page_type text`, `page_key text`, `year int`, `month int`, `views int`), unique index a `(page_type, page_key, year, month)` négyesen, GRANT `authenticated`/`service_role` szerint, RLS + admin SELECT policy (`has_role(auth.uid(),'admin')`), valamint egy `security definer` `increment_page_view(...)` upsert függvény.
- `src/lib/page-views.functions.ts`: `recordPageView` (publikus POST server fn, csak a `page_type`/`page_key` érvényes értékeire) a növelő függvény meghívásával; `src/lib/page-views.server.ts` a tényleges DB-hívás.
- `adminPageViewStats` védett server fn (`admin.functions.ts` + `admin.server.ts`), ami visszaadja a nyers `(page_type, page_key, year, month, views)` sorokat.
- `src/lib/stats-export.ts`: új `pivotByMonth` segédfüggvény, ami a meglévő `ListTable` alakra hozza a hónap-oszlopos táblát — így az export négy formátumban változtatás nélkül működik.
- `admin.statisztika.tsx`: új `PageViewSection` komponens, kétszer felhasználva (termékek: `products` katalógusból a teljes lista; szolgáltatások: a `szolgaltatasaim` oldal `items` listájából kiemelt, közös konstansból).
