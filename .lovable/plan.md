# Márkanév egységesítése: EXCELlent Business Intelligence

A régi „EXCELlent Accounting & Consulting" / „Perfect Solutions. Automated Future." név még több helyen szerepel. Mindenhol az új márkanévre cserélem.

## Amit cserélek

**Látható szövegek**
- Lábléc: logó alt-szöveg, a logó alatti szlogen és a copyright sor („© 2026 Sarinay Dávid EV – EXCELlent Business Intelligence").
- Főoldal és gyökér-layout SEO címe és leírása.
- Impresszum, Kapcsolat, Konzultáció oldalcímek.
- Termék JSON-LD `brand` értéke.
- E-mail sablonok fejléc-alcíme („Perfect Solutions, Automated FUTURE.").

**Változatlan marad**
- A rövid „| EXCELlent" végződés az aloldalak title-jeiben (kb. 25 oldal) — ez rövid, jól olvasható a keresőben, és nem a régi márkanév. Ha szeretnéd, ezeket is átírom hosszabb formára, de a hosszú név minden title-ben túllépné a 60 karakteres ajánlást.
- Az URL-ek, a logó és a favicon.

## Technikai megjegyzés

A cégadat már központilag a `src/lib/company.ts`-ben van (`brand`), ez már az új nevet tartalmazza. A fenti helyeken hardkódolt szövegek vannak — ahol értelmes, a `COMPANY.brand` értékre hivatkozok, a `head()` metaadatokban statikus stringként írom be (a prerender miatt).

Érintett fájlok: `SiteFooter.tsx`, `__root.tsx`, `index.tsx`, `impresszum.tsx`, `kapcsolat.tsx`, `konzultacio.tsx`, `termek.$slug.tsx`, `email-templates/parts.tsx`.
