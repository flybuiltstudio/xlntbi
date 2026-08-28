# ÁFA-bevallás XML-generáló — évmentesítés

Ugyanaz a kezelés, mint a Bérszámfejtőnél és a Beszámolónál: évszám ki a névből, azonosítókból, útvonalból és szövegekből, plusz az évenkénti újravásárlásra vonatkozó egységes megjegyzés.

## Terméknév és azonosítók

- Név: **ÉV65 ÁFA-bevallás ÁNYK XML-generáló**
- Slug / útvonal: `afa-ev65-xml-generalo` → `/termek/afa-ev65-xml-generalo`
- Ár-azonosítók: `afa_ev65_xml_generalo_1_ceg`, `afa_ev65_xml_generalo_korlatlan`
- Stripe termék-ID: `afa_ev65_xml_generalo`

## Mit módosítunk

1. `src/lib/products.ts` — név, slug, metaTitle, metaDescription, priceId-k, letöltési fájlnév/útvonal évszám nélkül. A bevezetőből és a jellemzőkből kikerül a „2665” és a „2026-os bevalláshoz igazítva” megfogalmazás; a „2025 júliustól elérhető f1–f4 és h1–h4 oszlopok” említése változatlanul marad.
2. Mindkét licenc `note` mezőjéhez bekerül: „A megvásárolt licenc a megrendelés évére érvényes – a szabályok évi változása miatt évente új verziót kell vásárolni.” Ugyanez a mondat a bevezető leírás végére is, hogy a pénztárnál és a termékoldalon is látszódjon. Licenc továbbra is kettő (1 cég 34 900 Ft, Korlátlan 99 900 Ft) — nem módosul.
3. `src/routes/termek.afa-2665-xml-generalo.tsx` → átnevezés `termek.afa-ev65-xml-generalo.tsx`-re; TITLE, DESCRIPTION, H1, CANONICAL, JSON-LD (név, leírás, URL, breadcrumb) évszám nélkül.
4. `src/lib/product-categories.ts` — slug frissítése a kategóriában (helye változatlan).
5. `public/sitemap.xml` — új URL.
6. Stripe: új `afa_ev65_xml_generalo` termék + a két ár fillérben (3 490 000 és 9 990 000).

## Amit ellenőrizni kell

- A régi `/termek/afa-2665-xml-generalo` URL megszűnik. Ha az indexelt cím miatt átirányítás kell, azt külön kérésre teszem be.
- A tárolóban lévő fájl neve `2665_XML.xlsm`; a névből az évszám kivételéhez a fájlt új néven kell feltölteni (admin → Friss verzió feltöltés), vagy maradhat a mostani fájlnév — jelezd, melyiket szeretnéd.
