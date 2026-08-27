# XLNTTESZT100 kupon időzített engedélyezése élesben

Az `XLNTTESZT100` (100% kedvezmény) kód **2026. augusztus 31. 23:59:59 (budapesti idő)** végéig
élesben is használható lesz, utána automatikusan kikapcsol és eltűnik az éles kuponok közül.
A teszt (sandbox) oldalon változatlanul aktív marad.

## Hogyan fog működni

1. **Időablakos engedély** — a kód bekerül egy lejárati dátummal ellátott éles engedélylistába.
   Amíg az ablak nyitva van, a pénztárnál élesben is megjelenik a kuponmező, és a kód levonja a 100%-ot.
2. **Éles Stripe kupon újraaktiválása** — a kód éles Stripe promotion code-ja jelenleg inaktív
   (korábban kikapcsoltuk), ezért újra aktiválni kell, és beállítjuk rá Stripe-oldalon is a
   lejáratot ugyanarra az időpontra. Így akkor sem érvényes szeptember 1-től, ha valaki
   közvetlen linkkel próbálná.
3. **Automatikus törlés a határidő után** — a meglévő éles kuponőr (ami minden éles fizetésnél
   futni szokott, illetve az adminból kézzel indítható) a határidő lejárta után már nem tekinti
   engedélyezettnek a kódot, ezért kikapcsolja és a kuponmező is eltűnik a pénztárból.
   A sandbox kód érintetlen marad.
4. **Admin láthatóság** — a Fizetés-teszt oldal kuponőr-blokkja kiírja, hogy az engedély
   meddig érvényes, és hogy az ablak épp nyitva van-e.

## Amit tudni érdemes

- A lejárat pillanatában induló, még be nem fejezett éles pénztár-munkamenetnél a Stripe
  lejárati dátuma dönt: szeptember 1. után a kód nem érvényesül.
- A 100%-os éles rendelés valódi rendelést hoz létre: számla (AAM) kiállításra kerül és
  letöltő link + licensz-e-mail is mehet. Ha ezt nem szeretnéd, tesztvásárlás után érdemes
  az admin „Teszt rendelések törlése” / sztornó funkciót használni.

## Technikai részletek

- `src/lib/coupons.ts`: az `ALLOWED_LIVE_PROMOTION_CODES` egyszerű string-lista helyett
  kód + `expiresAt` (ISO, `2026-08-31T21:59:59Z` = 23:59:59 budapesti idő) párokat tárol.
  `isAllowedLiveCode()` és `promotionCodesEnabled()` mostantól időfüggő: csak a még
  le nem járt bejegyzéseket fogadja el. A `TEST_PROMOTION_CODES` marad.
- `src/lib/coupon-guard.server.ts`: a sweep a lejárt bejegyzéseket nem tekinti engedélyezettnek,
  így a határidő után az `XLNTTESZT100` élesben automatikusan `active: false` lesz;
  a mentett guard-állapotba bekerül az engedély lejárata is.
- Stripe (éles): az `XLNTTESZT100` promotion code visszaállítása `active: true` értékre,
  `expires_at` = 2026-08-31 23:59:59 (+02:00) unix timestamp. Ha a kód nem újraaktiválható
  (Stripe nem engedi minden mezőt módosítani), új promotion code jön létre ugyanahhoz a
  100%-os couponhoz, ugyanazzal a `XLNTTESZT100` kóddal és a lejárattal.
- `src/utils/payments.functions.ts`: változatlan hívások, de a `promotionCodesEnabled("live")`
  az időablak alatt igazat ad, utána hamisat — a kuponmező automatikusan eltűnik.
- `src/components/FullPurchaseTestPanel.tsx` (kuponőr-blokk): kiírja az engedély lejáratát
  és állapotát.
