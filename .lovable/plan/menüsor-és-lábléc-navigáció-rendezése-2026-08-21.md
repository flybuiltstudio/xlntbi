# Menüsor és lábléc navigáció rendezése

## 1. Felső menüsor új sorrendje
A desktop navigáció sorrendje legyen:
**Főoldal → Termékeim → Kalkulátorok (lenyíló) → Szolgáltatásaim (lenyíló) → Oktatás → Rólam → Kapcsolat → Konzultációt kérek (gomb)**

Módosítások a `src/components/SiteHeader.tsx`-ben:
- `Termékeim` kerüljön a `Főoldal` után, közvetlen linkként (kikerül a `mainLinks` tömbből).
- A két lenyíló sorrendje felcserélődik: **Kalkulátorok** előre, **Szolgáltatásaim** utána.
- `mainLinks` marad: Oktatás, Rólam, Kapcsolat.
- A mobil menü flat listája is ugyanebben a sorrendben legyen:
  Főoldal, Termékeim, Összes kalkulátor + Bérteszt + Jövedelemadó, Szolgáltatásaim + 8 szolgáltatás, Oktatás, Rólam, Kapcsolat, Konzultáció.

## 2. Lábléc: Szolgáltatásaim lista vissza, Oldalak = főmenü
Módosítások a `src/components/SiteFooter.tsx`-ben:

### Oldalak oszlop
Ugyanazok az elemek, ugyanabban a sorrendben, mint a felső fő navigáció fő menüi:
Főoldal → Termékeim → Kalkulátorok → Szolgáltatásaim → Oktatás → Rólam → Kapcsolat → Konzultáció.

### Új oszlop: Szolgáltatásaim
A 8 szolgáltatás-aloldal listája ( ugyanaz, mint a `services` tömb a fejlécben):
Könyvelés, Adótanácsadás, Fintech és BI, Kontrolling, Cégaudit, Könyvvizsgálat, Könyvelőiroda audit, Digitális időmegtakarítási audit.

### Rács elrendezés
A 3 oszlopos `md:grid-cols-3` átmegy `md:grid-cols-4`-be:
1. Logó + cégnév
2. Oldalak (főmenü linkjei)
3. Szolgáltatásaim (8 aloldal)
4. Elérhetőség + Jogi információk

Mobilon az oszlopok egymás alá kerülnek (alapértelmezett single-column).

## Technikai részletek
- Csak 2 fájlt érint: `src/components/SiteHeader.tsx` és `src/components/SiteFooter.tsx`.
- A `services` és `calculators` tömbök tartalma nem változik, csak a megjelenítési sorrend.
- Az SSR HTML-ben a linkek `<a href>` formában jelennek meg — a keresők/AI-crawlerek számára változatlanul látható.
