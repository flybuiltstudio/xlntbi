# Módosítások (magyar és angol oldalon is)

## 1. NAV pénztárgép letöltő – termékfájl csere
- A csatolt `nav_online_penztargep_letolto.exe` felkerül a védett termékfájl-tárolóba ugyanarra a helyre, ahonnan most a vevők letöltik (a régi fájlt felülírja). Név, ár, leírás nem változik.

## 2. Főoldal (HU + EN)
- A „Rólam / About me" blokk képe a csatolt `David_weboldal_kep_2.jpg` lesz (a Rólam oldal képe marad a régi).
- A „Rólam" gomb a szöveg alól átkerül jobbra, a kép mellé; közvetlenül előtte az `Animáció_2.mp4` jelenik meg (automatikus, néma, ismétlődő lejátszás, vezérlők nélkül).
- „AI-val gyorsított fejlesztés" → „AI-jal gyorsított fejlesztés" (az angolban nincs ilyen ragozás, ott nincs mit javítani).

## 3. Rólam / About oldal
- A „Mi a célom?" rész közvetlenül a bemutatkozó szöveg alá kerül, ugyanakkora térközzel, mint „Az egyik legerősebb…" bekezdés felett, és ugyanolyan szélesen (a bal hasábban).
- A kép alá kerül az `Animáció_1.mp4` (ugyanúgy néma, ismétlődő).
- Az „Amit képviselek" és a „Tanúsítványaim" cím felett sokkal kisebb térköz.

## 4. Oktatás / Training oldal
- A címek felett ugyanilyen, sokkal kisebb térköz.

## 5. Asztali lenyíló menük (Szolgáltatásaim, Kalkulátorok, Termékeim)
- Ok: a menü addig nyitva marad, amíg a kattintott pont „fókuszban" van. Javítás: kattintás után a menü azonnal bezárul; egér fölé vitelkor továbbra is kinyílik és nyitva marad.

## 6. Szolgáltatás aloldalak gombja
- Minden szolgáltatás aloldalon (HU + EN) a „Konzultációt kérek / Request a consultation" gomb a Konzultáció oldalra visz a Kapcsolat helyett.

## Technikai részletek
- Kép és videók: `lovable-assets` pointerek (`src/assets/`), `<video autoPlay muted loop playsInline>`.
- Menü: `SiteHeader.tsx` – `group-focus-within` helyett kattintáskor rövid ideig tiltott állapot (state), ami egér elhagyásakor visszaáll.
- `ServicePage.tsx` 197. sor: `/kapcsolat` → `/konzultacio` (az angol útvonal `/en/consultation` automatikusan).
- Termékfájl: tárolóba feltöltés `nav-penztargep-letolto/nav_online_penztargep_letolto.exe` útvonalra, utána méret-ellenőrzés.
- Érintett: `index.tsx`, `en.index.tsx`, `rolam.tsx`, `en.about.tsx`, `oktatas.tsx`/`en.training.tsx` (vagy `ServicePage` térközök, csak az oktatásra), `SiteHeader.tsx`, `ServicePage.tsx`.
