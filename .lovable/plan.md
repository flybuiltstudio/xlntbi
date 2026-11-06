# Licenclevél: név megszólítás és xlntbi.hu sor

## Mi változik
1. **DEMO licenclevél megszólítása**: a „Licenc küldése az igénylőnek" gombbal megnyíló levél az igénylő beírt nevét szólítja meg: „Tisztelt {Név}!". Ha a név üres, marad a „Tisztelt DEMO-igénylő!".
2. **Aláírás vége**: a DEMO és a rendes vásárlás licenclevelében is a „XLNT BI" alá új sorba kerül: „xlntbi.hu".

A rendes vásárlás levelének megszólítása („Tisztelt Vásárló!") nem változik — ha ott is a vevő nevét szeretnéd, szólj.

Megjegyzés: ez csak az új igénylésekre vonatkozik, a már megkapott belső értesítőkben lévő gomb a régi szöveget nyitja meg.

## Technikai részletek
- `src/lib/demo-request.server.ts`: `licenseBody` első sora `input.name.trim()` alapján, fallback a régi szöveg; a végére `"xlntbi.hu"`.
- `src/lib/email-templates/belso-rendeles-ertesito.tsx`: `licenseMailto` body végére `'xlntbi.hu'`.
- Gyors ellenőrzés: típusellenőrzés és a meglévő tesztek.
