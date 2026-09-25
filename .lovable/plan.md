# Kapcsolat oldal: Elérhetőségeim blokk két hasábosra pCloud blokkal

## Cél
A Kapcsolat oldalon a bal oldali hasábban lévő „Elérhetőségeim" rész és az alatta lévő kép közé (a Hírlevél blokk és a kép közé) bekerül egy két hasábos blokk. A bal oldali hasábjába kerül a Termékeim oldalon lévő pCloud ajánló blokk (azonos szöveggel és linkkel), a jobb oldali hasábjába pedig a mostani „Elérhetőségeim" rész — változatlan formában. Az egész két hasábos blokk a bal oldali hasáb szélességén belül marad (a Hírlevél blokk és a kép szélességében). A jobb oldali nagy hasáb (űrlap) és minden más változatlan.

## Magyar oldal — `src/routes/kapcsolat.tsx`

A bal oldali `<div className="space-y-6">` jelenlegi sorrendje:
1. Hírlevél blokk
2. `<h2>Elérhetőségeim</h2>` + `<ul>` elérhetőségek
3. kép

Új sorrend:
1. Hírlevél blokk (változatlan)
2. Új két hasábos grid: `<div className="grid gap-6 sm:grid-cols-2">`
   - Bal: pCloud blokk (a lenti szöveggel és logóval, link `157444`)
   - Jobb: a mostani `<h2>Elérhetőségeim</h2>` + `<ul>` blokk, változatlanul
3. kép (változatlan)

pCloud blokk (azonos a Termékeim oldallal):
```jsx
<div className="rounded-2xl border border-border/60 bg-muted/40 p-5">
  <p className="text-sm leading-relaxed text-muted-foreground">
    💰 A legjobb felhőalapú tárhely befektetés: Egyszeri díj, élethosszig tartó tárhely! A pCloud pár év alatt behozza az árát a GDrive-val, az iCloud-dal és a OneDrive-val szemben. Svájci biztonság, szigorú GDPR-védelem. Én már csak ezt használom, szívből ajánlom:
  </p>
  <a href="https://partner.pcloud.com/r/157444" target="_blank" rel="noopener noreferrer" className="mt-3 inline-block">
    <img src={pcloudLogo.url} alt="pCloud – Svájci felhőalapú tárhely" loading="lazy" className="h-auto w-48" />
  </a>
</div>
```

Új import: `import pcloudLogo from "@/assets/pcloud-logo.jpg.asset.json";`

A két hasáb csak `sm` (640px) felett aktív; mobilon egy oszlopra rendeződik, ahogy a külső `lg:grid-cols-[1fr_1.4fr]` is egy oszloppá válik `lg` alatt.

## Angol oldal — `src/routes/en.contact.tsx`

Ugyanez a két hasábos átalakítás, angol pCloud szöveggel (az en.products oldallal egyezően):
```jsx
<div className="rounded-2xl border border-border/60 bg-muted/40 p-5">
  <p className="text-sm leading-relaxed text-muted-foreground">
    💰 The best cloud storage investment: a one-time fee for lifetime storage! pCloud pays for itself in a few years compared to Google Drive, iCloud and OneDrive. Swiss security, strict GDPR compliance. I use it exclusively — highly recommended:
  </p>
  <a href="https://partner.pcloud.com/r/157444" target="_blank" rel="noopener noreferrer" className="mt-3 inline-block">
    <img src={pcloudLogo.url} alt="pCloud – Swiss cloud storage" loading="lazy" className="h-auto w-48" />
  </a>
</div>
```

Új import: `import pcloudLogo from "@/assets/pcloud-logo.jpg.asset.json";`

A bal oldali hasáb jelenlegi sorrendje (Hírlevél → „My contact details" → kép) ugyanúgy változik: a „My contact details" blokk és a pCloud blokk kerülnek a `sm:grid-cols-2` gridbe.

## Technikai részletek
- Csak a két route fájl (`kapcsolat.tsx`, `en.contact.tsx`) módosul; semmi más nem érintett.
- SSR: a pCloud szöveg és logó link szerveroldalon renderelődik (statikus JSX).
- A pCloud logó sötét háttérű, a `bg-muted/40` blokkban mindkét témában látható.
- Typecheck a végén: `bunx tsgo --noEmit`.

## Ellenőrzés
- Vizuális ellenőrzés magyar és angol Kapcsolat oldalon.
- Typecheck.
