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

## 4. Önálló angol termékoldal

Minden terméknek lesz saját angol aloldala (`/en/product/…`), a magyar oldal felépítésével: bevezető, funkciólista, „Why it helps", licenc-blokk árakkal, megrendelés-hivatkozás. Ide kerül a **teljes** angol AI-fordítás (nem csak a rövid összefoglaló) — mind az új terméknél, mind a leírásfrissítőnél. Az angol Termékek oldal kártyái erre az oldalra mutatnak, a magyar és angol oldal `hreflang`-gel hivatkozik egymásra, saját angol oldalcímmel, meta leírással és sitemap-bejegyzéssel. Azoknál a régi termékeknél, ahol még nincs feltöltött angol leírás, egy gombbal legenerálható az admin panelből (a jelenlegi magyar szövegből), addig az összefoglaló látszik.

## 5. Kategória létrehozása és átnevezése

Új blokk (vagy a rendezés melletti kiegészítés) az adminban: új kategória felvétele (magyar és angol név, kategóriakép AI-val vagy a semleges „Egyebek" kép), meglévő kategória átnevezése magyarul és angolul, sorrendjének módosítása. Az URL-kulcs a névből képződik, és később nem változik, hogy a linkek ne törjenek. Kategória csak akkor törölhető, ha nincs benne termék.

## Technikai részletek

- **Migráció:** `custom_products` tábla (`slug` PK, `name`, `tagline`, `status`, `category_key`, `position`, `image_path`, `meta_title`/`meta_description` + `_en`, `intro`, `features`, `why`, `summary` + `_en` párok, `tiers` jsonb: `{id,label,price,priceId}`, `download_file_name`, `download_storage_path`, `stripe_product_id_sandbox/live`, `stripe_error`, `created_by`, timestamps) és `custom_categories` tábla (`key` PK, `title`, `title_en`, `image_path`, `sort_order`, `bundled` jelző az átnevezett beépített kategóriákhoz). RLS: `SELECT` `anon`/`authenticated`, írás csak service role; GRANT-ok a migrációban.
- **Runtime katalógus:** a `product-overrides.ts` réteg kiegészül a DB-ből jövő termékek beszúrásával a `products` tömbbe, valamint a kategórianevek/új kategóriák alkalmazásával a `product-categories.ts` listájára, így a `getProduct`, `getTier`, `priceFrom`, `ProductDetail`, `termekeim.tsx`, `en.products.tsx`, a megrendelés és a letöltés változtatás nélkül látja őket, SSR-ben is (a gyökér betöltő tölti be).
- **Angol termékoldal:** új `src/routes/en.product.$slug.tsx` route, az angol tartalmat a `product_content_overrides` `_en` mezőiből (`englishProductContent`) és a `custom_products` `_en` mezőiből olvassa, a `ProductDetail` komponens nyelvi paraméterrel újrahasznosítva; a magyar route `hreflang` linket kap.
- **Új szerverfájlok:** `custom-products.server.ts` (validálás, kép- és fájlfeltöltés, Stripe `products.create` + `prices.create` lookup key-jel mindkét környezetben, upsert/törlés), `custom-categories.server.ts`, a hozzá tartozó admin-kapus `*.functions.ts` fájlok, kép AI-generálás a Lovable AI Gateway `google/gemini-3-pro-image` modelljével.
- **Ár-logika:** a `product-prices.server.ts` `saveProductPrice`/`resetProductPrice` sorrendje Stripe → adatbázis lesz, éles hiba esetén rollbackkel; a mentés visszaadja a Stripe-ból visszaolvasott összeget.
- **Leírásoknál:** a `products.ts` és `products-en.ts` szövegeiből az árak törlése, valamint a `product-content.server.ts` promptjának szigorítása (összeg tilos).
- **Admin UI:** `admin-product-panels.tsx` bővül a `NewProductPanel`-lel és a kategóriakezelővel, a `admin.friss-verzio.tsx` a kért sorrendben rendereli.
- **Ellenőrzés:** típusellenőrzés, majd élő próba: egy valós Word + fájl feltöltés, kép, licencárak, Stripe teszt/éles ellenőrzés, SSR-ben a magyar és angol termékoldal, a kategórialista, végül a hibás éles ár esetének kipróbálása.

## Amit ez nem tartalmaz

- Korábbi rendelések, számlák árának módosítása.
- Beépített kategóriák URL-kulcsának megváltoztatása (átnevezés igen, kulcscsere nem — a linkek és a keresőhelyezések miatt).

