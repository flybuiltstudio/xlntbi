# ÉVA60 összesítő nyilatkozat XML-generáló — évmentesítés

Ugyanaz a kezelés, mint az ÉV65-nél és a Bérszámfejtőnél: a termék neve és szövegei ne kötődjenek konkrét évhez, és mindenhol jelenjen meg, hogy a licenc az adott évre szól.

## Mi változik

1. **Terméknév:** „26A60 összesítő nyilatkozat XML-generáló” → **„ÉVA60 összesítő nyilatkozat XML-generáló”**.
2. **Leírás:** a bevezető szövegben a „26A60 XML” hivatkozás évsemleges lesz („ÉVA60 XML”). Az A60 nyomtatvány mint fogalom marad, azt nem írom át.
3. **Éves licenc-megjegyzés** – a többi évmentesített termékkel szó szerint egyező szöveg bekerül a bevezetőbe és mindkét licenccsomag megjegyzésébe:
   „A megvásárolt licenc a megrendelés évére érvényes – a szabályok évi változása miatt évente új verziót kell vásárolni.”
4. **Meta és strukturált adatok:** oldalcím, meta leírás, H1, JSON-LD (SoftwareApplication + morzsa) az új néven.
5. **Sitemap-hiba javítása:** a sitemap.xml-ben jelenleg hibás cím szerepel ehhez a termékhez (`/termek/n-osszesito-nyilatkozat-xml`), a helyes `/termek/a60-osszesito-nyilatkozat-xml` helyett. Ezt kijavítom.

## Mi NEM változik

- **Az URL marad** `/termek/a60-osszesito-nyilatkozat-xml` — nincs benne évszám, így nincs átirányítás és nem sérül a Google-helyezés.
- **Az árak maradnak** (1 cég 24 900 Ft, könyvelőiroda/korlátlan 59 900 Ft), és a fizetési azonosítók is évsemlegesek, ezért új Stripe-terméket nem kell létrehozni.
- **A fájlnév marad** `26A60_XML.xlsm`. A feltöltés a termékhez van kötve, így 2027-ben elég az új fájlt feltölteni az adminban, automatikusan felülírja a mostanit, és a vevők már az új néven kapják.

## Technikai részletek

- `src/lib/products.ts` – az `a60-osszesito-nyilatkozat-xml` bejegyzés `name`, `metaTitle`, `metaDescription`, `intro`, `tiers[].note` mezői.
- `src/routes/termek.a60-osszesito-nyilatkozat-xml.tsx` – `TITLE`, `DESCRIPTION`, `H1`, JSON-LD nevek.
- `public/sitemap.xml` – a hibás `n-osszesito-nyilatkozat-xml` sor javítása.
- A kategória-hozzárendelés (`src/lib/product-categories.ts`) slug alapján működik, így érintetlen marad.
