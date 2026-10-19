Online bemutató ajánlat a két követő levélbe

Mi változik
- A Fizetési emlékeztető és a Demó visszajelzés kérés levélben a „Ha az ár nem reális szerinted, akkor mi lenne az?" sor alá külön bekezdésként bekerül, szó szerint:
  „Esetleg egy negyedórás online bemutató, amiben megmutatom, milyen pofonegyszerű használni, és mennyi rengeteg órát megspórolsz vele segítene a döntésben?"
- A felugró előnézetben és a kiküldött levélben is megjelenik (ugyanabból a szövegből épül).
- Minden más szöveg, sorrend, gomb és küldési folyamat változatlan.

Technikai rész
- `src/lib/admin-mail-templates.ts`: új `DEMO_OFFER` konstans, beszúrva mindkét listába a „Ha az ár nem reális…" elem után.
- `src/lib/admin-mail-templates.test.ts`: új teszt, hogy a sor közvetlenül az ár-kérdés után áll mindkét levélben; a meglévő, utolsó elemektől számolt indexek (ajánló, köszönő mondat, aláírás) nem változnak.
- Tesztek futtatása.
