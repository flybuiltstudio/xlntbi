# Mérés, konverziók, mobil gyorsítás és apró javítások

## Most elvégzendő javítások

**1. Google Analytics javítása**
A mérőkód most tömböt tesz a dataLayerbe, ezért a Google nem dolgozza fel. Átírom a hagyományos `function gtag(){dataLayer.push(arguments)}` alakra. A meglévő G-PHGLH1TL5X azonosító marad, és továbbra is csak a statisztikai sütik elfogadása után töltődik be. Utána böngészőben ellenőrzöm, hogy tényleg kimegy-e az oldalmegtekintés a Google felé.

**2. Konverziós események (GA4)**
Ezt javaslom: négy szabványos esemény menjen ki, csak sikeres beküldés után és csak hozzájárulással.
- konzultációs űrlap → `generate_lead` (form: consultation)
- kapcsolat-űrlap → `generate_lead` (form: contact)
- DEMO-igénylés → `sign_up` / `demo_request`
- megrendelés → `purchase` a köszönőoldalon, valós összeggel, rendelésenként egyszer
Külön köszönőoldal nem kell, mert az esemény a sikeres válasznál indul. A GA4-ben ezeket kulcseseménynek kell jelölnöd, ebben segítek.

**4. Kalkulátorok „Konzultációt kérek” gombja**
Négy kalkulátornál (számla-dátumok, bérteszt, átalányadó, jövedelemadó) a cloudHQ-link helyére a saját konzultációs oldalad kerül, HU és EN változatban is. A kalkulátorok képletei nem változnak.

**6. Konzultáció-gomb mobilon**
Mobilon a fejlécben, a menügomb mellett megjelenik egy kompakt „Konzultációt kérek” gomb (angolul a meglévő angol felirattal). A főoldal első képernyőjén lévő gombokat nem írom át.

**9. Mobil gyorsítás**
- Minden kép kap kis WebP-változatot (mobilon 250 KB alatt), és a böngésző a képernyőhöz illőt tölti le. A logó is kicsinyített WebP lesz.
- A főoldal 2 videója és a Rólam oldal videója mobilon állóképpé válik, így ott a videó le sem töltődik. Asztali gépen minden marad a régiben.
- Utána mobil méréssel ellenőrzöm a letöltött méreteket.

**10. Süti-ablak gombjai**
Mobilon mindhárom gomb legalább 44 px magas lesz, azonos súllyal. A kártya kicsi és lebegő marad.

## Nem módosítom, csak javaslatot adok (5. és 7.)

**5. Konzultációs űrlap**: első körben név, e-mail, telefon és rövid kérdés legyen. A 13 jelölőnégyzet egy lenyitható „Mely szolgáltatások érdekelnek? (nem kötelező)” részbe kerülhetne, az üzenet pedig ne legyen kötelező.

**7. Bizalomépítés a főoldalon**: a középső AI-rész fölé kerülhet egy rövid blokk: „20 év tapasztalat”, a végzettségeid és a kamarai tagságod, néhány valódi ügyfélvélemény (csak tőled kapott, engedélyezett szöveggel), és egy „Kinek dolgozom” sor. Az AI-rész lejjebb kerülne.

## Ehhez kell tőled valami (3.)

**Meta pixel és Google Ads címke**: be tudom építeni őket úgy, hogy csak a marketing-sütik elfogadása után töltődjenek be, és a konzultáció, a DEMO-igénylés és a vásárlás külön eseményként menjen ki (Meta: Lead, CompleteRegistration, Purchase). A pixelt viszont én nem tudom létrehozni, ahhoz kell:
- a Meta-hirdetési fiókod csatlakoztatása, vagy a pixelazonosító,
- a Google Ads fiókod csatlakoztatása, vagy az AW-azonosító és a konverziós címkék.
Amíg ezek nincsenek meg, ezt a részt nem építem be. Az adatvédelmi és a süti-tájékoztatót akkor egészítem ki, amikor a pixel bekerül.

## Technical details
- `src/lib/analytics.ts`: use `arguments` in gtag; add `trackEvent()` that sends only when consent is given. Calls go in the success handlers of the consultation, contact and demo forms and on the thank-you page (dedupe with a sessionStorage key per order id).
- Calculators: replace the cloudHQ URL in `src/lib/calculators/*.ts` (HU+EN) with `/konzultacio` / its EN route.
- Header: mobile-only CTA next to the hamburger button.
- Media: generate WebP variants (sharp, ≤250 KB) as assets, use `<picture>`/`srcset`; video components use `matchMedia('(max-width:767px)')` to show a poster image and never set `src` on mobile.
- CookieConsent: `min-h-11` buttons on mobile.
