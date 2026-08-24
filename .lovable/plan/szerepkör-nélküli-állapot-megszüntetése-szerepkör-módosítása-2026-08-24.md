# Szerepkör nélküli állapot megszüntetése + szerepkör módosítása

## Cél
Ne fordulhasson elő, hogy egy felhasználó be tud jelentkezni, de „nincs jogosultságod" üzenetet kap, mert nincs szerepköre. Létrehozáskor kötelező a szerepkör (ez már így van), hiba esetén ne maradjon árva fiók, és később a Felhasználók oldalon lehessen a szerepkört módosítani.

## Változások

### 1. Létrehozásnál ne maradjon szerepkör nélküli fiók — `src/lib/admin.server.ts`
- A `createUser` jelenleg: létrehozza az auth-felhasználót, majd külön beszúrja a szerepkört. Ha a második lépés hibázik, a fiók szerepkör nélkül megmarad — pont a tiltott állapot.
- Javítás: ha a szerepkör beszúrása nem sikerül, a frissen létrehozott auth-felhasználót azonnal töröljük (visszagörgetés), és hibaüzenetet adunk. Így vagy teljesen létrejön a fiók szerepkörrel, vagy sehogy.

### 2. Szerepkör módosítása utólag — szerver oldal
- Új `updateUserRole(userId, role)` helper az `src/lib/admin.server.ts`-ben: a felhasználó meglévő szerepkör-sorait törli, és beszúrja az újat (admin vagy felhasználó) — service role klienssel, mint a többi felhasználókezelő művelet.
- Új `adminUpdateUserRole` szerverfüggvény az `src/lib/admin.functions.ts`-ben: admin-jogosultság ellenőrzése (meglévő `gate`), szerepkör validálása (`admin`/`user`).
- Biztonsági korlát: **saját magad szerepkörét nem módosíthatod** (ugyanaz a védelem, mint a törlésnél), így nem zárhatod ki magad az admin felületről.

### 3. Felhasználók oldal UI — `src/components/admin-panels.tsx` (`UsersPanel`)
- Minden felhasználó sorába egy „Szerepkör" legördülő kerül (Admin / Felhasználó), az aktuális értékkel.
- Módosításkor megerősítő kérdés („Biztosan megváltoztatod X szerepkörét?"), mentés után a lista frissül, visszajelző üzenet jelenik meg.
- A saját sorodban a legördülő letiltva (ahogy a Törlés gomb is).
- A létrehozó űrlap szerepkör-választója változatlanul kötelező marad (már az).

### 4. Mi marad érintetlen
- A „nincs jogosultságod" vészhelyzeti képernyő megmarad védelmi hálo gyanánt (ha valaki pl. kézzel törölne egy szerepkört az adatbázisból), de a fenti változásokkal az alkalmazáson belül ez az állapot nem hozható létre.
- Ha egy épp bejelentkezett felhasználó szerepköre megváltozik, az a következő oldalbetöltésnél / belépésnél lép életbe.

## Technikai részletek
- Érintett fájlok: `src/lib/admin.server.ts` (createUser rollback + updateUserRole), `src/lib/admin.functions.ts` (adminUpdateUserRole), `src/components/admin-panels.tsx` (UsersPanel sor-dropdown).
- Adatbázis-változás nincs: a `user_roles` tábla és RLS-szabályai változatlanok, az írások továbbra is service role kliensen át mennek.
- Ellenőrzés: típusellenőrzés + admin felületen végigpróbálás (létrehozás, szerepkör-módosítás, saját szerepkör tiltása).
