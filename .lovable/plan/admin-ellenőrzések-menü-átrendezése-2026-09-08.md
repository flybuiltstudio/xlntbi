# Admin „Ellenőrzések” menü átrendezése

Ma hat külön aloldal van a menüben (Számlázás, Billingo ellenőrzés, Katalógus
ellenőrzés, Rendelési audit, NAV ellenőrzés, Fizetés teszt), és a blokkok címei
háromféle méretben, hol ikonnal, hol ikon nélkül jelennek meg. Néhány blokk
tematikusan is máshol van, mint ahol keresnéd (Stripe terméknevek a számlázási
naplónál, kuponvédelem a fizetés tesztnél).

## Új menüszerkezet

```text
Ellenőrzések ▾
  1. Számlázás és számlaellenőrzés   /admin/szamlazas
  2. Katalógus ellenőrzés            /admin/katalogus-ellenorzes
  3. Fizetés teszt                   /admin/fizetes-teszt
```

Hat menüpontból három lesz, a sorrend a napi használat logikáját követi:
számlák → termékkatalógus → tesztelés.

## 1. Számlázás és számlaellenőrzés

Egy oldalon, felülről lefelé (a mai Számlázás + Billingo ellenőrzés + Rendelési
audit + NAV ellenőrzés lapok tartalma):

1. Számlázási napló
2. Billingo webhook végpont
3. Számla–rendelés egyezés
4. Rendelési audit (számla ↔ sztornó párosítás)
5. NAV Online Számla állapot

A négy blokk ugyanazt a témát fedi (kiállított számlák helyessége), ezért
egyetlen lapon, lenyíló/nagy címekkel tagolva sokkal átláthatóbb.

## 2. Katalógus ellenőrzés

1. Katalógus ellenőrzés (Stripe lookup key, aktív ár, letölthető fájl)
2. Stripe terméknevek — ide kerül át a számlázási lapról, mert termékadat, nem
   számlázás.

## 3. Fizetés teszt

1. Teljes vásárlási teszt
2. Kézi teszt megrendelés (a mai 1–2. lépéses űrlap)

A „Kuponvédelem éles környezetben” blokk átkerül a **Kuponok** oldalra, a
kuponlétrehozó alá — kuponkezelés, nem fizetéstesztelés. Törlés nélkül, csak
áthelyezés.

## Törlés

Semmit nem törlök. Végignéztem a blokkokat: nincs két olyan, amelyik bizonyosan
ugyanazt tenné. A Billingo egyezés-vizsgálat és a rendelési audit is más
kérdésre válaszol (megjegyzés-egyezés vs. számla–sztornó párosítás), ezért
mindkettő megmarad, csak egy lapra kerül. Az oldalak bevezető szövegei
viszont beépülnek az érintett blokkok leírásába, hogy ne legyen kétszer ugyanaz
a magyarázat.

## Egységes blokkforma

Minden ellenőrző blokk ugyanígy néz ki:

- kártya: `rounded-xl border border-border bg-card p-5 sm:p-6`
- cím: `<h2 className="flex items-center gap-2 text-xl font-bold text-foreground">`
  lucide ikonnal
- alatta egy rövid, magyar magyarázó sor `text-sm text-muted-foreground`
- belső alcímek: `<h3 className="text-base font-semibold text-foreground">`
- blokkok közti térköz: `space-y-10`

## Technikai részletek

- `src/routes/admin.tsx`: a `checksLinks` lista háromelemű lesz az új
  címkékkel.
- `src/routes/admin.szamlazas.tsx`: `InvoiceLogsPanel`, `BillingoAuditPanel`,
  `OrderAuditPanel`, `NavStatusPanel` egy `space-y-10` konténerben; head/meta
  szöveg frissítése.
- `src/routes/admin.rendelesi-audit.tsx` és `admin.nav-ellenorzes.tsx`:
  megmaradnak, de `beforeLoad`-ban `redirect`-elnek a `/admin/szamlazas`-ra
  (elmentett belső linkek nem törnek el). `src/lib/admin-access.ts` bejegyzések
  maradnak.
- `src/routes/admin.katalogus-ellenorzes.tsx`: `StripeProductNamePanel`
  hozzáadása; kikerül a `admin.szamlazas.tsx`-ből.
- `FullPurchaseTestPanel.tsx`: a kuponvédelem szekció külön exportált
  komponensbe (`LiveCouponGuardPanel`) kerül, és a `admin.kuponok.tsx`
  rendereli `admin` szerepkörnél.
- Címformázás egységesítése: `BillingoAuditPanel`, `CatalogAuditPanel`,
  `OrderAuditPanel`, `NavStatusPanel`, `FullPurchaseTestPanel`,
  `StripeProductNamePanel`, `CouponUsagePanel`, `CouponAttemptsPanel`,
  `InvoiceLogsPanel` — csak megjelenés, működés és adatlogika érintetlen.
