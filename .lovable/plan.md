# Szolgáltatásaim oldal: kis képek és új videó

## 1. Kis képek a jobb felső sarokban (HU + EN)
- Minden szolgáltatásdobozban a kis kép a jobb felső sarokba kerül, a cím első sorával egy magasságba.
- A cím a kép mellett, balra fut, és több sorba törhet.
- A „Tovább” a doboz alján marad. A kép mérete nem változik, és nem növeli a dobozt.

## 2. Új mozgó kép (a Szolgáltatásaim oldalon)
- A téma ugyanaz marad: tanácsadás az asztalnál, laptopon grafikonok, kinyomtatott kimutatások, világos iroda, zöld székek.
- **Tanácsadó (te):** nő, világos bőrű, hosszú szőke haj, sötét blézer és világoskék blúz. Az arcvonások a csatolt fotóra hasonlítanak (szemforma, kékesszürke szem, arcél, mosoly), de nőiesen.
- **Ügyfél:** nő, világos bőrű, hosszú barna haj, aki figyelmesen hallgat és bólogat.
- **Mozgás:** a tanácsadó magyaráz és a laptopon lévő grafikonra mutat. A kamera nem mozog.
- **Elkészítés:** először egy fotószerű kiinduló képet készítek a csatolt fotó alapján. Ezt megmutatom, és csak a jóváhagyásod után készül belőle a kb. 6 másodperces, hang nélküli, ismétlődő videó.
- A videó neve továbbra is „szolgaltatasok-hero” marad. A Termékeim oldal videója nem változik.

## Megjegyzés
- Ha a kép vagy a videó megjelenítése valakinek a valódi arcához hasonlít, azt a képkészítő biztonsági szűrője néha nem engedi. Ha ez történik, jelzem, és egy hasonló, de általános arcú változatot javaslok.

## Technikai részletek
- `src/components/ServicesGrid.tsx`: az ikon a kártyán belül `absolute top-4 right-4`, a cím `pr-16`. Az alsó ikon pozíciója megszűnik.
- Kiinduló kép: `imagegen--edit_image` a feltöltött fotóval mint referencia, eredmény: `src/assets/szolgaltatasok-hero.jpg`, ez lesz a videó előnézeti képe is.
- Videó: `videogen--generate_video`, ahol a `starting_frame` a fenti kép, `camera_fixed: true`. A régi videót a `lovable-assets` törlés–létrehozás lépéseivel cserélem, ugyanazzal a fájlnévvel.
