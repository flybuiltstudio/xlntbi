# Visszaigazoló e-mail feladónév javítása

## Probléma
A visszaigazoló e-mailek feladójának megjelenítendő neve „xclntbi" (felesleges „c" betűvel) jelenik meg a postafiókban, helyette „xlntbi" kellene.

## Ok
`src/lib/email-templates/send-email.ts` 9. sorában:
```ts
const SITE_NAME = "xclntbi"
```
Ez az érték kerül a `from` fejlécbe (72. sor): `${SITE_NAME} <noreply@notify.xlntbi.hu>`. A levelezők ezt a nevet mutatják feladóként.

## Javítás
A `SITE_NAME` értékét `"xclntbi"` → `"xlntbi"` értékre kell írni. Csak ez az egy karakterhelyet kell módosítani; a `notify.xlntbi.hu` feladó-domén már helyes.

## Ellenőrzés
- A módosítás után a visszaigazoló és belső értesítő e-mailek feladója egységesen „xlntbi" néven jelenik meg.
