# Admin apró javítások

## 1. Hírlevél-szerkesztő: háttérszínek a betűszínek alatt
- A színpaletta két külön sorba kerül: felül „Betűszín" + 10 szín, közvetlenül alatta „Háttérszín" + 10 szín, oszlopra pontosan egymás alatt (azonos szélességű címke, azonos négyzetméret).
- Szűk képernyőn a sorok továbbra is tördelődhetnek, de egymás alatt maradnak.

## 2. Új kupon: 24 órás időpont
- A böngésző saját időmezője helyett (ami gépbeállítástól függően DE/DU-t mutathat) két legördülő lista: óra 00–23 és perc 00–59. A mentett érték nem változik.

## 3. Statisztika: „Havi bontás grafikonon" menüpont
- A grafikon jelenleg csak konkrét év kiválasztásakor jelenik meg, ezért „Összes év" nézetben a gomb nem talál semmit. Emellett a horgony a címen van, nem a pufferelt blokkon.
- Javítás: a blokk mindig megjelenik a címmel; ha nincs év kiválasztva, rövid üzenet: „A havi grafikonhoz válassz ki egy konkrét évet." A horgony a blokkra kerül (a Termékek oldal mintájára). A menü gombjai frissülnek, hogy mindegyik létező blokkra ugorjon, a sorrend az oldal sorrendjét kövesse.

## 4. Fájlválasztó ablak „Custom Files" felirata
- Ez a felirat a Windows / böngésző saját fájlmegnyitó ablakából jön (a szűrő neve), weboldalról nem fordítható le és nem írható át. A mi gombunk és a „Nincs fájl kiválasztva" szöveg már magyar. Ezen a ponton kódmódosítás nem lesz — ha ez így nem elfogadható, szólj.

## 5. „↑ Tetejére" gombok az Ellenőrzések aloldalain
- Számlázás és számlaellenőrzés, Katalógus ellenőrzés, Fizetés teszt: minden, a felső menüből elérhető blokk végére bekerül a szokásos „↑ Tetejére" gomb (ugyanaz, mint a Termékek és Kalkulátorok oldalon).

## Technikai részletek
- `NewsletterEditor.tsx`: a színes gombok két `flex` sorba, fix szélességű címkével.
- `CouponAdminPanel.tsx`: `type="time"` helyett két `<select>`, `expiresTime` = `HH:mm`.
- `admin.statisztika.tsx`: `havi-bontas` section mindig renderel, `id` + `scroll-mt-36` a sectionön; `STATS_NAV` sorrend igazítása.
- `admin.szamlazas.tsx`, `admin.katalogus-ellenorzes.tsx`, `admin.fizetes-teszt.tsx`: `admin-toc.tsx` meglévő „Tetejére" komponense minden horgonyzott blokk alján.
