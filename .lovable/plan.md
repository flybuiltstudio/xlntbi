# Admin Megrendelések – gombok rendezése

## Válaszok a kérdésekre

**„Számlázás” vs. „Billingo számla újraküldése”:** technikailag ugyanaz a művelet (mindkettő ugyanazt a számlakiállítást indítja). Csak a megjelenés más: a „Számlázás” akkor látszik, ha a rendelés rendezett; ha már van számla, felirata „Számlázva ✓” és nem nyomható. A „Billingo számla újraküldése” csak akkor jelenik meg, ha egy korábbi számlakiállítás hibára futott — lényegében ugyanaz a gomb, piros, hibajelző kiadásban.

**Hónapra szűrés:** ma a hónap-gombok csak akkor élnek, ha előtte kiválasztasz egy konkrét évet. Ezt megszüntetem: a hónap év kiválasztása nélkül is szűrni fog (pl. az összes év szeptembere), évet választva pedig az adott év hónapjára.

**Számla megnyitása / Számla letöltése:** valóban ugyanaz a hivatkozás; a letöltés a külső számlaszolgáltató címe miatt nem tud igazi mentést indítani, ezért ugyanúgy megnyitja. Ezért az egyiket törlöm.

## Mit csinálok

Az egy rendelés alatti gombsor sorrendje és feliratai:

1. „Beérkezett az utalás – jóváhagyom” (fizetésre váró rendelésnél)
2. „Számlázás” / „Számlázva ✓”
3. „Billingo számla újraküldése” (csak hiba után)
4. „Sztornó újrapróbálása” (csak hiba után)
5. „Számla adatai”
6. „Számla megnyitása/letöltése”
7. „Letöltési link újraküldése”
8. „Licenc küldése”
9. „E-mail a vevőnek”

Változások:
- „Licensz küldése” → **„Licenc küldése”**, illetve „Licenc küldése – mégsem”.
- A „Számla letöltése” gomb törlése; a „Számla megnyitása” új neve **„Számla megnyitása/letöltése”**.
- „Számla adatai” a számlanyitó gomb elé kerül.
- „Letöltési link újraküldése” és „Licenc küldése” minden számlázási gomb után, közvetlenül az „E-mail a vevőnek” előtt.

Csak a megjelenítés és a sorrend változik, a gombok működése nem.

## Technikai részletek

- Érintett fájl: `src/components/admin-panels.tsx`, az `OrdersPanel` rendeléskártyájának gombsora (kb. 955–1072. sor).
- A „Letöltési link újraküldése” ma a jóváhagyó gombbal egy `else` ágban van; kiemelem külön, `paymentStatus === "paid"` feltétellel, a sorrendben hátrébb.
- Az `onInvoicePdf(order, "download")` ág és a `mode` paraméter `"download"` értéke használaton kívül marad, ezért a függvény egyszerűsödik `open`-re.
