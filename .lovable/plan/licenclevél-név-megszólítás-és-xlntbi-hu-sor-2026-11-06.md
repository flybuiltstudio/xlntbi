# Licenclevél: név megszólítás és xlntbi.hu sor

## Mi változik
1. **DEMO licenclevél**: a „Licenc küldése az igénylőnek" gombbal megnyíló levél az igénylő beírt nevét szólítja meg: „Tisztelt {Név}!". Üres névnél marad a „Tisztelt DEMO-igénylő!".
2. **Rendes vásárlás licenclevele**: jelenleg mindig „Tisztelt Vásárló!" áll benne, a név nem kerül bele. Ez is a vevő számlázási nevét kapja: „Tisztelt {Név}!", üres névnél marad a „Tisztelt Vásárló!".
3. **Aláírás vége** mindkét levélben: a „XLNT BI" alá új sorba „xlntbi.hu".

Csak az új igénylésekre és rendelésekre vonatkozik; a már megkapott belső értesítők gombja a régi szöveget nyitja meg.

## Technikai részletek
- `src/lib/demo-request.server.ts`: `licenseBody` első sora `input.name.trim()` alapján, végére `"xlntbi.hu"`.
- `src/lib/email-templates/belso-rendeles-ertesito.tsx`: új `customerName` prop, `licenseMailto` ezt használja; body végére `'xlntbi.hu'`.
- `order.server.ts`, `order-paid.server.ts`, `download.server.ts`: a sablonhívásba `customerName` (számlázási név) átadása.
- Ellenőrzés: típusellenőrzés és a meglévő tesztek.
