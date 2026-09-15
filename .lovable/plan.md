# Terv: Egységes kategóriaképek színei

## Helyzet
A 7 termékkategória-kép (`src/assets/kategoriak/*.jpg`) stílusa eltér:
- **Adózás** (`adozas.jpg`): világosabb, élénkebb zöld háttér (~#00592E), masszív **fehér** kitöltött ikon.
- **Riportok** (`riportok.jpg`): sötétzöld háttér, de szintén masszív **fehér** ikon.
- **Bank, Bérszámfejtés, Egyebek, Számla-nyugta, Vegyes könyvelés** (5 db): sötétzöld háttér (~#004422 / #004832), vékony **világoszöld** vonalrajz ikonok (~#A7D16A–#E0F784).

A háttérzöld árnyalata is kissé változó képről képre. A felhasználó egységes színt kér.

## Cél
Minden kategóriakép azonos színvilágú és ikonkezelésű legyen, de minden kategória megtartja a saját szimbólumát (különbözőek maradnak, csak a stílus egységes).

## Megoldás
Újragenerálom mind a 7 kategóriaképet egyetlen egységes stílusban:
- **Háttér:** azonos sötétzöld, a márka `--brand-dark` (oklch ~0.39 0.083 158.6) árnyalatához igazítva — konzisztens hex érték minden képen.
- **Ikon:** vékony vonalrajz, világoszöld (a meglévő többség mintája), azonos vonalvastagság és szín minden képen.
- **Szimbólumok:** kategóriánként más ikon marad (Adózás: %-os papír; Bank: oszlopos épület; Bérszámfejtés: pénztárca + számológép; Egyebek: fogaskerék/pajzs/mappa; Riportok: grafikon; Számla-nyugta: dokumentumok; Vegyes könyvelés: könyv + autó), csak a megjelenítés egységesítve.

## Lépések
1. `imagegen`-nel legenerálom mind a 7 képet ugyanazzal a stíluskoncepcióval (azonos háttérszín + azonos ikonkezelés), kategóriánkénti szimbólummal, 512×512 px, nem transzparens, `.jpg`.
2. Felülírom a meglévő fájlokat `src/assets/kategoriak/` alatt (azonos fájlnevek, így a `product-categories.ts` import nem változik).
3. `vision--describe_image`-szel ellenőrzöm, hogy mind a 7 háttér és ikonkezelés egységes lett.
4. Typecheck / build nem érintett (importok változatlanok).

## Nem változik
- Kód (`product-categories.ts`, termékoldalak) — csak a képcserék.
- Kategóriák száma, elrendezése, szimbólumai.
- Termékképek és kalkulátorképek (külön szabály vonatkozik rájuk).

## Ellenőrzés a végén
- 7/7 kategóriakép azonos háttérzöld + azonos ikonstílus (vision confirm).
- Nincs kódváltozás, typecheck felesleges.
