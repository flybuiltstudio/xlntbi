# Ár-visszaállítás hiba esetén, ártalan leírások és új termék feltöltő

Három dolog készül el, mind az admin **Friss verzió** oldalon (a Kalkulátor frissítő blokk fölött), illetve a termékleírásokban.

## 1. Éles Stripe-hiba esetén marad a régi ár

Ma a mentés akkor is elmenti az új árat az oldalra, ha a Stripe frissítése nem sikerült. Ezt megfordítjuk:

- Mentéskor először a Stripe frissül (teszt és éles), és **csak akkor** kerül az új ár az oldalra, ha az **éles** környezetben sikeres volt.
- Ha az éles sikertelen: az oldalon és a megrendelőlapon a **régi ár marad**, a teszt oldali változást visszaállítjuk az előző értékre, és a panel piros sorban kiírja a Stripe hibaüzenetét. Így soha nem fordulhat elő, hogy az oldalon más ár szerepel, mint amit a vásárló fizet.
- Ha az éles Stripe egyáltalán nincs beállítva (nincs kulcs), a panel ezt külön, érthető szöveggel jelzi, és az árat nem írja át.
- Ugyanez érvényes az „Eredeti ár visszaállítása" gombra is.

Az összeg-átszámítást (forint → fillér) ellenőrzöm valós Stripe-adaton: kiolvassuk egy meglévő licenc jelenlegi Stripe-összegét, és összevetjük a katalógusárral, hogy a 100-as szorzó biztosan helyes-e. Ha nem, a szorzót a valós adathoz igazítom, és a panel a Stripe-ból visszaolvasott összeget is kiírja megerősítésként.

## 2. Az árak kikerülnek a leírásokból

Minden termék magyar és angol szövegéből törlöm az összegeket (pl. „Ár: 24 900 Ft-tól.", „Egyetlen licenc, 39 900 Ft AAM.") — meta leírásból, bevezetőből és összefoglalókból egyaránt. A mondatok nyelvtanilag helyesek maradnak, más szöveget nem írok át. Az ár továbbra is ott jelenik meg, ahol adatként szerepel: a licenc-blokkban, a kártyákon, a megrendelőlapon és a keresőknek szóló ár-adatban.

Az AI leírásgenerátor promptja is megkapja, hogy összeget soha ne írjon a szövegbe.

## 3. Új termék feltöltő blokk

Új blokk a most elkészült kettő alatt, a Kalkulátor frissítő fölött. Egy űrlapon megadható minden, ami egy új termékhez kell:

- **Terméknév** (az „XLNT " előtag automatikusan kerül rá) és rövid alcím.
- **Termékfájl**: `.xlsm`, `.exe`, `.zip` vagy `.pdf`, legfeljebb 300 MB (a felső, verziófrissítő blokk már ma is elfogadja a PDF-et).
- **Leírás Word fájlból** (`.docx`, max. 10 MB) — ugyanaz az AI-átfogalmazás, mint a leírásfrissítőnél, **szerkeszthető előnézettel**, és **automatikus angol változattal**.
- **Kategória** legördülőből, és **sorszám a kategórián belül** (hova kerüljön a listában).
- **Licenc típusok**: soronként név + ár egész forintban, tetszőleges számú sor, hozzáadás/törlés gombbal. Az első sor ára lesz a kártyán mutatott „-tól" ár.
- **Termékkép**: AI generálja a leírás alapján, előnézettel; ha nem tetszik, egy gombbal újragenerálható a közzététel előtt.

Közzétételkor:

- létrejön a termék, azonnal él a magyar termékoldal (`/termek/…`) és megjelenik a Termékek oldalon a választott kategóriában, a megadott sorszámon;
- megjelenik az angol Termékek oldalon az angol összefoglalóval;
- a termékfájl a védett tárolóba kerül, a vásárlás utáni letöltés ugyanúgy működik, mint a többi terméknél;
- a Stripe-ban **automatikusan** létrejön a termék és minden licencár — teszt és éles környezetben is. Ha az éles nem sikerül, a termék `hamarosan` állapotban jön létre (nem megvásárolható), és a panel jelzi, mit kell javítani; egy gombbal újrapróbálható;
- a sitemapbe is bekerül az új oldal.

A blokk alatt lista a felvett termékekről, szerkesztés (név, alcím, kategória, sorszám, státusz) és törlés lehetőséggel. A törlés csak akkor engedett, ha még nem volt rá rendelés.

## Technikai részletek

- **Migráció:** `custom_products` tábla (`slug` PK, `name`, `tagline`, `status`, `category_key`, `position`, `image_path`, `meta_title`/`meta_description` + `_en`, `intro`, `features`, `why`, `summary` + `_en` párok, `tiers` jsonb: `{id,label,price,priceId}`, `download_file_name`, `download_storage_path`, `stripe_product_id_sandbox/live`, `stripe_error`, `created_by`, timestamps). RLS: `SELECT` `anon`/`authenticated`, írás csak service role; GRANT-ok a migrációban. Termékkép a meglévő privát bucketben, publikus kiszolgálás a meglévő aláírt-URL mintával (`/api/public/…`).
- **Runtime katalógus:** a `product-overrides.ts` réteg kiegészül a DB-ből jövő termékek beszúrásával a `products` tömbbe és a kategórialistába (`productCategories`), így a `getProduct`, `getTier`, `priceFrom`, `ProductDetail`, `termekeim.tsx`, `en.products.tsx`, a megrendelés és a letöltés változtatás nélkül látja őket, SSR-ben is (a gyökér betöltő tölti be).
- **Új szerverfájlok:** `custom-products.server.ts` (validálás, kép- és fájlfeltöltés, Stripe `products.create` + `prices.create` lookup key-jel mindkét környezetben, upsert/törlés), `custom-products.functions.ts` (admin-kapus szerverfüggvények), kép AI-generálás a Lovable AI Gateway `google/gemini-3-pro-image` modelljével.
- **Ár-logika:** a `product-prices.server.ts` `saveProductPrice`/`resetProductPrice` sorrendje Stripe → adatbázis lesz, éles hiba esetén rollbackkel; a mentés visszaadja a Stripe-ból visszaolvasott összeget.
- **Leírásoknál:** a `products.ts` és `products-en.ts` szövegeiből az árak törlése, valamint a `product-content.server.ts` promptjának szigorítása.
- **Admin UI:** `admin-product-panels.tsx` bővül a `NewProductPanel`-lel, a `admin.friss-verzio.tsx` a kért sorrendben rendereli.
- **Ellenőrzés:** típusellenőrzés, majd élő próba: egy valós Word + fájl feltöltés, kép, licencárak, Stripe teszt/éles ellenőrzés, SSR-ben a termékoldal és a kategórialista, végül a hibás éles ár esetének kipróbálása.

## Amit ez nem tartalmaz

- Angol önálló termék-aloldal (ma sincs; az angol oldalon listakártya + összefoglaló jelenik meg).
- Korábbi rendelések, számlák árának módosítása.
- Kategória létrehozása vagy átnevezése — csak a meglévők közül választható.
