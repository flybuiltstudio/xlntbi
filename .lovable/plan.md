# Heti audit vasárnapra + NAV-lista magyarázat

## 1. Heti katalógus-audit áttétele vasárnap hajnali 3-ra

Az automatikus ellenőrzés jelenleg hétfő 3:00-kor fut. Átállítom vasárnap 3:00-ra.

- Az ütemezés módosítása a meglévő `weekly-catalog-audit` feladaton: `0 3 * * 1` helyett `0 3 * * 0` (új feladat nem jön létre, a gyakoriság marad heti egy futás).
- A Katalógus ellenőrzés panel két magyarázó szövegében a „minden hétfőn 3:00-kor” helyett „minden vasárnap 3:00-kor” (`src/components/CatalogAuditPanel.tsx`).
- A futás tartalma, az e-mail értesítés és az „Utolsó futás” kijelzés változatlan.

Megjegyzés: az „Utolsó futás: 2026. 09. 14. 5:00:05” a szerver UTC-idejéből adódó 3:00 → helyi 5:00 eltérés, nem hiba; ezt nem módosítom, csak jelzem.

## 2. NAV Online Számla állapot — miért csak egy sor jelenik meg

Ez nem szűrési hiba. Az ellenőrzés csak azokat a rendeléseket kérdezi vissza,
amelyekhez tartozik kiállított Billingo számla. Jelenleg összesen 4 rendelés van,
és ezek közül **egyetlenegyhez** tartozik számla — így a „Csak a problémás számlák”
pipa kivételekor is csak ez az egy sor létezik, nincs elrejtve semmi.

A jelölőnégyzet működése helyes: bepipálva kihagyja az „OK” állapotú sorokat,
kipipálás nélkül mindet mutatja.

Hogy ez ne tűnjön hibának, kiegészítem a panelt:

- A táblázat alatt egy sor: hány számla szerepel a listában és hány rendelés
  maradt ki azért, mert nincs hozzá számla (pl. „1 számla · 3 rendeléshez még nincs
  Billingo számla”).
- Ha a „Csak a problémás számlák” be van pipálva és így üres a lista, a
  meglévő üzenet mellett látszik, hogy mennyi OK-állapotú számla van elrejtve.

Ehhez az ellenőrzés visszaad egy „számla nélküli rendelés” darabszámot is.

## Technikai részletek

- `cron.job` frissítése: `weekly-catalog-audit` → `0 3 * * 0`.
- `src/components/CatalogAuditPanel.tsx`: két helyen szövegcsere.
- `src/lib/nav-status.ts`: `NavStatusReport` kap egy `withoutInvoice: number` mezőt.
- `src/lib/nav-status.server.ts`: az orders lekérdezés mellett egy darabszám-lekérdezés
  a számla nélküli rendelésekre; a mező a jelentésbe kerül.
- `src/components/NavStatusPanel.tsx`: összegző sor a táblázat alatt, illetve az
  üres állapot szövegének kiegészítése.
- Végén `bunx tsgo --noEmit`.
