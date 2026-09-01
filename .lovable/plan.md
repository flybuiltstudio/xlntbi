# Angol nyelvű "SE bookkeeping" oldal

Az EV Könyvelés oldal angol párja, saját URL-en, a menüben az EV Könyvelés és az Adótanácsadás között.

## Mit építek

1. **Új oldal:** `/se-bookkeeping`
   - Az `ev-konyveles.tsx` teljes szerkezetének (Hero, bevezető + kép, teljes szélességű szakasz, szolgáltatási lista, ártáblázat, GYIK, CTA) angol fordítása.
   - Hero cím: **Self-employed bookkeeping**
   - Ugyanaz a hero kép (`ev-konyveles-poster.jpg`), ugyanaz a vizuális arculat.
   - Árak, díjak, tények változatlanul – csak a nyelv más, tartalom nem bővül és nem rövidül.

2. **Menü:** a "Szolgáltatásaim" legördülőben (asztali és mobil egyaránt) új pont **SE bookkeeping** néven, az EV Könyvelés és az Adótanácsadás között (`SiteHeader.tsx` és `src/lib/services.ts`).

3. **SEO:**
   - Angol title / meta description / OG + Twitter tagek, canonical `https://xlntbi.hu/se-bookkeeping`.
   - Service + BreadcrumbList + FAQPage JSON-LD angolul.
   - `hreflang` páros a két oldal között: a magyar oldal `hu`, az angol `en`, mindkettőn kölcsönös hivatkozás.
   - Az oldal felkerül a sitemap.xml-be.
   - Az oldal tetején egy diszkrét nyelvváltó link a magyar változatra (és fordítva).

4. **Oldalletöltés-mérés:** ugyanaz a `usePageView("service", pathname)` hívás, hogy a statisztikában is látszódjon.

## Technikai részletek

- Új fájl: `src/routes/se-bookkeeping.tsx`, `createFileRoute("/se-bookkeeping")`.
- A `<html lang="hu">` globális marad; az angol oldal szövegblokkjai `lang="en"` attribútumot kapnak a fő tartalmi konténeren.
- SSR-ben teljes szöveg renderelődik (nincs kliensoldali betöltés), egyetlen `<h1>`.
