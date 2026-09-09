# Menü és a Konzultáció oldal oszlopainak javítása

## Mit találtam

A legutóbbi módosítás **kizárólag** ezeket a fájlokat érintette (ez a verziótörténetből ellenőrizve van):
`src/routes/termekeim.tsx`, `src/routes/en.products.tsx`, `src/routes/konzultacio.tsx`,
`src/routes/en.consultation.tsx` és az új pCloud logó hivatkozása.
A fejlécet (menüt) **nem** módosítottam, abban nincs változás.

Amit látsz, az méret-küszöb kérdése:

- A vízszintes menü csak **900 képernyőpixel** felett jelenik meg, alatta hamburger ikon van.
  A jelenlegi előnézeti ablak 890 pixel széles, ezért látszik a hamburger.
- A Konzultáció oldal új bal oszlopa csak **1024 pixel** felett kerül balra;
  890 pixelen ezért csúszik a szöveg és az űrlap **fölé**, nem melléje.

## Mit csinálok

1. A Konzultáció oldal (magyar és angol) két oszlopa a menüvel azonos küszöbnél,
   **900 pixel** felett váltson kétoszlopos elrendezésre, hogy a hírlevél és a pCloud blokk
   valóban a szöveg és az űrlap **bal oldalán** legyen, ne fölötte.
   Alatta (telefonon) továbbra is egymás alá kerülnek.
2. A Termékeim / Products oldalon nem változtatok semmit — ott a pCloud blokk már
   a kért helyen, a "Miért jók ezek?" alatt, a jobb hasábban van.
3. A menü küszöbén nem nyúlok hozzá semmihez, mert azt nem én állítottam el.
   Ha szeretnéd, hogy a vízszintes menü kisebb ablakban is látszódjon, szólj,
   és lejjebb vesszük a küszöböt.

## Technikai részletek

- `src/routes/konzultacio.tsx` és `src/routes/en.consultation.tsx`:
  a külső rács `lg:grid-cols-[1fr_1.4fr]` helyett `min-[900px]:grid-cols-[1fr_1.4fr]`.
  Minden meglévő tartalom, szöveg és `ContactForm` prop változatlan.
- Ellenőrzés: typecheck, majd 890 px és 1280 px szélességű böngészős képernyőkép
  mindkét konzultációs oldalról.
