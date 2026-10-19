# Ajánlási mondat a két követő levélbe

A Demó visszajelzés és a Fizetési emlékeztető levélben az „Üdvözlettel:" elé, önálló bekezdésként bekerül:

> Ha hasznosnak találod az oldalamat, kérlek, ajánld a kollégáidnak is: https://xlntbi.hu

A felugró előnézetben és a kiküldött levélben is megjelenik. Ha más szöveget szeretnél, írd meg, és szó szerint azt teszem be.

## Google Search Console

A projekthez jelenleg nincs Google Search Console bekötve. Külön lépésben be tudom kötni (fiók kiválasztása, oldal hitelesítése, sitemap beküldése); ez nem része ennek a tervnek.

## Technical details
- `src/lib/admin-mail-templates.ts`: új `REFERRAL` konstans, a `SIGNATURE` elé mindkét bekezdéslistában.
- Meglévő sablontesztek bővítése: mindkét levélben az ajánló sor közvetlenül az aláírás előtt áll.
