# Termékfájlok épségének ellenőrzése

## 1. Azonnali, egyszeri ellenőrzés (most)

Minden termékfájlt teljes egészében letöltök a tárolóból, és megvizsgálom. Az eredményt tételesen ide írom a chatbe.

1. **Minden exe:** megvan-e a fájl vége. A PyInstallerrel készült programoknál ezt a záró jelölő mutatja meg, a többinél az, hogy a program minden része belefér-e a fájlba. Közben azt is megnézem, hogy a letöltött méret egyezik-e a tárolt mérettel.
2. **Minden zip:** kicsomagolható-e, és egyik benne lévő fájl sem sérült-e.
3. **Minden pdf:** megnyitható-e, és kiolvasható-e belőle az első oldal.

A lista: fájlnév, a hozzá tartozó termék, méret, és hogy OK vagy HIBÁS, a hiba okával. A cégkivonat exe már most biztosan hibás: csonka, a vége hiányzik.

Hibás fájlt nem javítok és nem törlök. Azt neked kell újra feltöltened az Admin → Termékek és Kalkulátorok oldalon.

## 2. Heti automatikus ellenőrzés

A vasárnap hajnali heti karbantartás kap egy új lépést: **Termékfájlok épsége**.

- Minden termékfájlt ellenőriz: exe, zip, pdf, xlsm.
- Ha valamelyik hibás, a heti karbantartási e-mailben külön sorban jelzi, termékenként, a hiba okával.
- A heti e-mail eddig is csak akkor ment ki, ha volt teendő, és ez így marad.
- Az Admin → Ellenőrzések alatt a Katalógus-ellenőrzés oldalon megjelenik a legutóbbi eredmény (mikor futott, mi lett hibás), és lesz egy „Ellenőrzés most" gomb is.

Az automatikus ellenőrzés nem tölti le a teljes fájlt, mert a nagy, 170 MB-os programok nem férnének bele a szerver memóriájába. Ehelyett csak a fájl elejét és végét olvassa be:
- **exe:** megvan-e a fájlvégi jelölő, illetve a program minden része belefér-e a fájlba (ez pont kiszűri a cégkivonathoz hasonló csonkolást);
- **zip:** megvan-e és ép-e a tartalomjegyzéke, és minden benne lévő fájl a csomagon belül kezdődik-e;
- **pdf és xlsm:** jó-e a fájl eleje, és megvan-e a fájl vége.

Ez a csonka és a félig feltöltött fájlokat biztosan elkapja. A zipen belüli tartalmi sérülést viszont csak a teljes, kézi ellenőrzés találja meg (1. pont).

## 3. Feltöltéskor is ellenőriz

Ugyanez az ellenőrzés lefut az Admin → Termékek és Kalkulátorok oldalon minden új termékfájl-feltöltés után is. Ha a feltöltött fájl csonka, azonnal piros hibaüzenetet kapsz, így nem kell vasárnapig várni.

## Technikai részletek

- Új `src/lib/product-file-integrity.server.ts`: `checkProductFile(path, size)` signed URL-lel és `Range` kérésekkel (az első 4 KB és az utolsó kb. 64 KB), plusz exe-nél a PE-szakaszok vége miatt a PE-fejléc beolvasása. A zipnél EOCD → központi könyvtár (Range), a helyi fejlécek eltolásainak ellenőrzése; a pdf-nél `%PDF-` és `%%EOF`/`startxref`; az xlsm valójában zip, ugyanazzal a logikával. A termékek listája a katalógusból és a `custom_products` táblából jön, a méret a `storage.objects`-ből.
- `runWeeklyCleanup()` (`maintenance.server.ts`): új lépés, a hibák az `issues` listába kerülnek, új sor a jelentésben („Hibás termékfájlok"); az eredményt `app_settings` (`product_file_integrity`) tárolja.
- Új admin szerverfunkció és panel a Katalógus-ellenőrzés oldalon; feltöltés után ugyanez a függvény fut a fájlverzió-feltöltésnél.
- Nincs új tábla, nincs új időzített feladat: a meglévő vasárnapi takarításban fut.
