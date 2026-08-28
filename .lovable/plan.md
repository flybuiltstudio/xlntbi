# Terméknevek egységesítése: „XLNT " előtag

## Cél
Minden termék neve kezdődjön „XLNT "-tel. Ahol már így kezdődik (pl. XLNT Beszámoló, XLNT Telefonszámla Könyvelő), nem változik semmi.

## Átnevezendő termékek (22 db)
- NAV Online Számla letöltő → XLNT NAV Online Számla letöltő
- NAV Pénztárgép letöltő → XLNT NAV Pénztárgép letöltő
- év65 ÁFA-bevallás ÁNYK XML-generáló → XLNT év65 ÁFA-bevallás ÁNYK XML-generáló
- Ügyfélkapu+ TOTP Manager → XLNT Ügyfélkapu+ TOTP Manager
- évA60 összesítő nyilatkozat XML-generáló → XLNT évA60 összesítő nyilatkozat XML-generáló
- NAV Törzsszám- és Partnerellenőrző → XLNT NAV Törzsszám- és Partnerellenőrző
- Bérszámfejtő → XLNT Bérszámfejtő
- Banki Utalási Csomag Készítő Excelben → XLNT Banki Utalási Csomag Készítő Excelben
- Cégkivonat → Excel konverter → XLNT Cégkivonat → Excel konverter
- Útnyilvántartás és Kiküldetési rendelvény → XLNT Útnyilvántartás és Kiküldetési rendelvény
- Kulcs-Soft Bejövő Külföldi Számla Import → XLNT Kulcs-Soft Bejövő Külföldi Számla Import
- PÉNZSZÁM Bejövő Külföldi Számla Import → XLNT PÉNZSZÁM Bejövő Külföldi Számla Import
- PDF → Excel konverter → XLNT PDF → Excel konverter
- RLB Bank Konverter PRO → XLNT RLB Bank Konverter PRO
- RLB Bank Konverter → XLNT RLB Bank Konverter
- RLB Bejövő Külföldi Számla Import → XLNT RLB Bejövő Külföldi Számla Import
- Nyitó és Vegyes Könyvelő – RLB/Kulcs-Soft/SUP kiadás → XLNT Nyitó és Vegyes Könyvelő – … (3 db)
- Univerzális bankkivonat-konverter → XLNT Univerzális bankkivonat-konverter
- AuditXML Ellenőrző-Javító → XLNT AuditXML Ellenőrző-Javító
- DEVIZABANK → XLNT DEVIZABANK
- MNB ERA Jelentésgenerátor (R09 és R12) → XLNT MNB ERA Jelentésgenerátor (R09 és R12)
- Ingatlanalap MNB Jelentés-előkészítő – NEÉ Számoló és ERA/STEFI Generátor → XLNT Ingatlanalap MNB …

## Változatlan marad (13 db, már XLNT-vel kezdődik)
XLNT Adófolyószámla egyeztető, XLNT Beszámoló, XLNT Havi Riport, XLNT Monthly Report, XLNT Kamatlekérdező, XLNT Számviteli Konszolidáló, XLNT IFRS Konszolidáló, XLNT Telefonszámla Könyvelő, XLNT WiFi Jelszó Néző, stb.

## Munkalépések
1. **src/lib/products.ts** — a 22 termék `name` mezőjéhez „XLNT " előtag. A `nameEn` (ha van) szintén frissül.
2. **Termék aloldalak** (`src/routes/termek.*.tsx`) — minden érintett route-ban frissül: meta title, description, H1, JSON-LD `name`. (Email-sablonok dinamikusan a terméknévből dolgoznak, kézi javítás nem kell — ellenőrzöm.)
3. **Változatlanul marad**: termék-ID-k, slugok/URL-ek, Stripe price ID-k, `storagePath` (a letöltési linkek és sitemap nem törnek el).
4. Ellenőrzés: `rg` keresés, hogy ne maradjon régi név a route-okban; build lefut.

## Megjegyzés
A Stripe-ban a termék megjelenítési neve külön kezelendő — ha szeretnéd, ott is frissítem a termékneveket (a checkout oldalon látszik).
