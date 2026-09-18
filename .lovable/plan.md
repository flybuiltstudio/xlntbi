# Admin Megrendelések – gombok rendezése

## Válaszok a kérdésekre

**„Számlázás” vs. „Billingo számla újraküldése”:** technikailag ugyanaz a művelet. Ezért a külön „Billingo számla újraküldése” gomb megszűnik. Ha a számlakiállítás hibára futott, ugyanaz a „Számlázás” gomb jelenik meg piros, hibajelző kiadásban, és újrapróbálja a számlázást.

**Hónapra szűrés:** ma a hónap-gombok csak akkor élnek, ha előtte kiválasztasz egy konkrét évet. Ezt megszüntetem: a hónap év kiválasztása nélkül is szűrni fog (pl. az összes év szeptembere), évet választva pedig az adott év hónapjára.

**Számla megnyitása / Számla letöltése:** valóban ugyanaz a hivatkozás; a letöltés a külső számlaszolgáltató címe miatt nem tud igazi mentést indítani, ezért ugyanúgy megnyitja. Ezért az egyiket törlöm.

## Mit csinálok

Az egy rendelés alatti gombsor sorrendje és feliratai:

1. „Beérkezett az utalás – jóváhagyom” (fizetésre váró rendelésnél)
2. „Számlázás” / „Számlázva ✓”
3. „Sztornó újrapróbálása” (csak hiba után)
4. „Számla adatai”
5. „Számla megnyitása/letöltése”
6. „Letöltési link újraküldése”
7. „Licenc küldése”
8. „E-mail a vevőnek”
9. „↑ Tetejére”

Változások:
- „Licensz küldése” → **„Licenc küldése”**. A gomb első kattintásra megnyitja a licenckód mezőt; amikor ez nyitva van, a felirat **„Licenc küldése – mégsem”**, és erre kattintva elküldés nélkül bezárható a mező.
- A külön „Billingo számla újraküldése” gomb megszűnik. Számlázási hiba esetén a „Számlázás” gomb lesz piros, hibajelző megjelenésű, a korábbi hibaüzenetet mutató súgószöveggel.
- A „Számla letöltése” gomb törlése; a „Számla megnyitása” új neve **„Számla megnyitása/letöltése”**.
- „Számla adatai” a számlanyitó gomb elé kerül.
- „Letöltési link újraküldése” és „Licenc küldése” minden számlázási gomb után, közvetlenül az „E-mail a vevőnek” előtt.
- Minden rendeléskártya végére kerül egy kis „↑ Tetejére” gomb; ez simán a szűrőpanel tetejéhez görget, nem az oldal legtetejére.

Csak a megjelenítés és a sorrend változik, a gombok működése nem.

## Technikai részletek

- Érintett fájl: `src/components/admin-panels.tsx`, az `OrdersPanel` rendeléskártyájának gombsora (kb. 955–1072. sor).
- A „Letöltési link újraküldése” ma a jóváhagyó gombbal egy `else` ágban van; kiemelem külön, `paymentStatus === "paid"` feltétellel, a sorrendben hátrébb.
- Az `onInvoicePdf(order, "download")` ág és a `mode` paraméter `"download"` értéke használaton kívül marad, ezért a függvény egyszerűsödik `open`-re.
- Hónap szűrés (Megrendelések, `admin-panels.tsx`): az `activeMonth` már nem nullázódik `activeYear === null` esetén, a hónap-gombok `disabled` feltétele megszűnik, a szűrő pedig az évtől függetlenül alkalmazza a `date.getMonth()` egyezést.
- Hónap szűrés (Statisztika, `src/routes/admin.statisztika.tsx`): a `periodRows` szűrő már ma is év-független, ezért elég a hónap-gombok `disabled` feltételét eltávolítani és a `activeMonth` nullázást megszüntetni. Az időszak-felirat („2026. szeptember") évnélküli hónapnál „Összes év – szeptember" formára egyszerűsödik. A havi bontású grafikon és a PDF-export továbbra is évhez kötött, ezeken nem változtatok.
- A Megrendelések szűrőpanelje stabil azonosítót kap; a rendelésenkénti „Tetejére” gomb ezt célozza `scrollIntoView({ behavior: "smooth" })` hívással.
