# Tudástár-termékek feltöltése

## Termékek

A Tudástár végére négy új termék kerül, rövidített névvel és termékenként egyetlen árral:

1. **XLNT Ügyvezetői díjazás és cégköltségek** — **8 990 Ft**
   - Letöltés: a csatolt ZIP, benne a magyar és angol PDF-fel.
2. **XLNT E-nyugta és e-pénztárgép útmutató** — **0 Ft**
   - Letöltés: a csatolt PDF, adatbekérés után, fizetési lépés nélkül.
3. **XLNT Német és osztrák adóvisszatérítési útmutató** — **8 990 Ft**
   - Letöltés: a csatolt „Külföldi munkavégzés adózása” PDF.
4. **XLNT Német munkanélküli segély útmutató** — **6 990 Ft**
   - Letöltés: a csatolt PDF.

A listaárak és a csomagajánlatok nem jelennek meg; kizárólag a leírásokban szereplő kedvezményes ár lesz használva.

## Megjelenés és tartalom

- A DOCX termékajánlókból elkészül a magyar termékoldal tartalma az eredeti információk megtartásával.
- Elkészülnek az angol termékoldalak és az egyedi magyar/angol keresőleírások.
- Mindegyik termék saját, szöveg és logó nélküli, fényképszerű generált képet kap.
- A termékek a Tudástár kategóriában, a csatolmányok fenti sorrendjében jelennek meg.
- Mind a magyar, mind az angol terméklista, nyelvváltás és sitemap automatikusan tartalmazza őket.

## Vásárlás és letöltés

- A három fizetős termékhez egyetlen ár készül a teszt- és éles fizetési környezetben.
- Sikeres bankkártyás fizetés vagy jóváhagyott átutalás után a meglévő védett, lejáró letöltőlinkes folyamat küldi a fájlt.
- A 0 Ft-os terméknél nem indul Stripe-fizetés és nem készül Billingo-számla.
- A 0 Ft-os igénylésnél csak a szükséges kapcsolattartási adatok kerülnek bekérésre; sikeres beküldés után azonnal létrejön és e-mailben megérkezik a korlátozott, lejáró, védett PDF-letöltőlink.
- A 0 Ft-os igénylés honeypot- és gyakorisági védelemmel működik.
- Mind a négy Tudástár-termék letöltési e-mailje kihagyja a szoftverekhez beszúrt gépazonosító-, HWID- és licenckérő szöveget, gombot és licencfeltételt; csak a dokumentum letöltési adatai maradnak.

## Adatkezelés

- A 0 Ft-os igénylést külön, RLS-védett nyilvántartás tárolja a letöltési jogosultság és a visszaélésvédelem céljából.
- A szükséges adatkezelési tájékoztatás bekerül a meglévő adatvédelmi oldalba.
- A normál fizetős rendelési és statisztikai adatoktól elkülönítve marad, így nem számít vásárlásnak.

## Technikai részletek

- A fizetős termékek egyetlen `tiers` elemet kapnak; a 0 Ft-os termék külön ingyenes típusként működik, mert a jelenlegi katalógus csak pozitív árú Stripe-terméket enged.
- A fájlok a meglévő privát terméktárhelyre kerülnek, a letöltés rövid életű aláírt URL-en történik.
- A termékadatok a meglévő egyedi termék-katalógusba kerülnek, nem statikus, különálló oldalakként.
- Ellenőrzés: fájlegyezés, magyar/angol oldalak, Tudástár-sorrend, fizetős tesztfolyamat, 0 Ft-os igénylés és letöltő e-mail, sitemap, mobil/asztali megjelenés.

## Kapcsolódó, későbbi DEMO-licencprojekt

- A DEMO-licenc minden jelenlegi, nem Tudástár kategóriájú termékhez elérhető lesz.
- Minden jövőben felvett, nem Tudástár kategóriájú termék automatikusan kap DEMO-lehetőséget is.
- A Tudástár jelenlegi és jövőbeli termékei kivételt képeznek: ezekhez nem készül DEMO-licenc, és nem jelenik meg DEMO-választás.
- Ez a szabály hozzáadódik a korábban előkészített DEMO-folyamathoz; maga a DEMO-rendszer most nem készül el.
