# Kapcsolat, lábléc és szolgáltatás-ikonok

## 1. Telefonszám egységesítés
A megjelenített szám mindenhol `20/962-2176` legyen (a `tel:` link marad hívhatóan `+36209622176`).
- Lábléc Elérhetőség blokk
- Kapcsolat oldal elérhetőségek

## 2. Cím és nyitvatartás eltávolítása
- Kapcsolat oldalról kikerül a „Magyarország” cím-sor (MapPin ikonnal együtt), így csak telefon + e-mail marad.
- Nyitvatartás sehol nem szerepel — nem is kerül be.
- Lábléc: cím/nyitvatartás nincs, marad telefon, e-mail, Facebook.

## 3. Szolgáltatás-aloldalakon ikonok a pipák helyett
A szolgáltatásoldalak listáiban most minden pontnál ugyanaz a zöld pipa van. Ehelyett minden listaelem a tartalmához illő ikont kap (pl. „riportkészítés” → diagram-ikon, „bérszámfejtés” → emberek, „NAV-ügyintézés” → pecsét/irat, „áfa” → százalék, „adótanácsadás” → mérleg, „automatizáció” → fogaskerék/villám, „adatelemzés” → adatbázis).

Megvalósítás: kulcsszó → Lucide ikon leképezés a `ServicePage` komponensben (magyar kulcsszavakra illeszkedő szabálylista, találat nélkül semleges alapikon). Így mind a 8 szolgáltatásoldal automatikusan illeszkedő ikonokat kap, a szövegek változtatása nélkül.

Az azonos elven a záró („closing”) listákhoz is bekerül ugyanez az ikonozás, hogy egységes legyen.

## Technikai részletek
- `src/components/SiteFooter.tsx`: telefon-címke szövege.
- `src/routes/kapcsolat.tsx`: telefon-címke, MapPin sor törlése.
- `src/components/ServicePage.tsx`: új `iconFor(label)` segédfüggvény (Lucide ikonok), a `Check` helyére kerül a listákban. Ikonok inline SVG-ként SSR-ben renderelődnek, tehát a keresők/AI-crawlerek számára is látszik a szöveg.
- Nem érintem a szolgáltatásoldalak szövegeit.
