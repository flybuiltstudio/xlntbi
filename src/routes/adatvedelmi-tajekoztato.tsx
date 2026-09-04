import { createFileRoute } from "@tanstack/react-router";
import { LegalPage, type LegalSection } from "@/components/LegalPage";
import { AUTHORITIES, COMPANY, PROCESSORS } from "@/lib/company";


const TITLE = "Adatvédelmi tájékoztató | EXCELlent Business Intelligence";
const DESCRIPTION = "Az EXCELlent Business Intelligence adatvédelmi tájékoztatója a weboldal látogatói és ügyfelei személyes adatainak kezeléséről.";
const CANONICAL = "https://xlntbi.hu/adatvedelmi-tajekoztato";

export const Route = createFileRoute("/adatvedelmi-tajekoztato")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: CANONICAL },
      { property: "og:locale", content: "hu_HU" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
      { name: "robots", content: "noindex, follow" },
    ],
    links: [
      { rel: "canonical", href: CANONICAL },
      { rel: "alternate", hrefLang: "hu", href: "https://xlntbi.hu/adatvedelmi-tajekoztato" },
      { rel: "alternate", hrefLang: "en", href: "https://xlntbi.hu/en/privacy-policy" },
      { rel: "alternate", hrefLang: "x-default", href: "https://xlntbi.hu/adatvedelmi-tajekoztato" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              "itemListElement": [
                      {
                              "@type": "ListItem",
                              "position": 1,
                              "name": "Főoldal",
                              "item": "https://xlntbi.hu/"
                      },
                      {
                              "@type": "ListItem",
                              "position": 2,
                              "name": "Adatvédelmi tájékoztató",
                              "item": "https://xlntbi.hu/adatvedelmi-tajekoztato"
                      }
              ]
      }),
      },
    ],
  }),
  component: AdatvedelmiPage,
});

const sections: LegalSection[] = [
  {
    heading: "1. Az adatkezelő adatai",
    list: [
      `Adatkezelő: ${COMPANY.legalName} (${COMPANY.brand})`,
      `Székhely: ${COMPANY.address}`,
      `Nyilvántartási szám: ${COMPANY.registrationNumber}`,
      `Adószám: ${COMPANY.taxNumber}`,
      `E-mail: ${COMPANY.email}`,
      `Telefon: ${COMPANY.phone}`,
      `Weboldal: ${COMPANY.website}`,
    ],
    afterList: [
      "Az adatkezelő adatvédelmi tisztviselő kijelölésére nem kötelezett, ilyet nem alkalmaz. Adatvédelmi kérdésekkel a fenti e-mail címen lehet hozzá fordulni.",
    ],
  },
  {
    heading: "2. A tájékoztató célja és hatálya",
    paragraphs: [
      "Jelen tájékoztató az Európai Parlament és a Tanács (EU) 2016/679 rendelete (általános adatvédelmi rendelet, GDPR) 13. cikke, valamint az információs önrendelkezési jogról és az információszabadságról szóló 2011. évi CXII. törvény (Infotv.) alapján készült.",
      "Bemutatja, hogy a xlntbi.hu weboldal, a hozzá kapcsolódó űrlapok, a digitális termékek megrendelése és az online fizetés során milyen személyes adatokat kezelünk, milyen célból, milyen jogalapon, mennyi ideig, kik ismerhetik meg azokat, és milyen jogok illetik meg az érintetteket.",
    ],
  },
  {
    heading: "3. Az adatkezelés alapelvei",
    paragraphs: [
      "A személyes adatokat jogszerűen, tisztességesen és átlátható módon kezeljük, kizárólag a megjelölt célokhoz szükséges mértékben (adattakarékosság).",
      "Az adatokat csak a szükséges ideig őrizzük meg, és megfelelő technikai, valamint szervezési intézkedésekkel gondoskodunk azok biztonságáról (titkosított kapcsolat, jogosultsághoz kötött adatbázis-hozzáférés, visszaélés elleni szűrés).",
    ],
  },
  {
    heading: "4. Kapcsolatfelvételi és konzultációkérő űrlap",
    list: [
      "Kezelt adatok: vezetéknév, keresztnév, e-mail cím, telefonszám, cégnév, a választott szolgáltatás, a preferált kapcsolatfelvételi mód és időpont, üzenet szövege.",
      "Technikai adatok a visszaélések (automatizált spam) szűréséhez: IP-cím és böngészőazonosító (user agent).",
      "Cél: a megkeresés megválaszolása, ajánlatadás, a szerződés előkészítése, valamint az űrlap visszaélésmentes működésének biztosítása.",
      "Jogalap: az érintett hozzájárulása (GDPR 6. cikk (1) a)), a spamszűréshez kapcsolódó technikai adatok esetében az adatkezelő jogos érdeke (GDPR 6. cikk (1) f)).",
      "Megőrzési idő: a megkeresés lezárását követő 2 év, illetve szerződéskötés esetén a szerződéshez kapcsolódó megőrzési idő. A technikai naplóadatokat 90 napig tároljuk.",
      "Adattárolás: a beküldést a weboldal biztonságos adatbázisában rögzítjük, és a beküldésről e-mailben is értesítést küldünk.",
    ],
  },
  {
    heading: "5. Digitális termék megrendelése",
    list: [
      "Kezelt adatok: név, e-mail cím, telefonszám, számlázási név és cím, adószám (ha megadják), a megrendelt termék és darabszám, a rendelésszám, a választott fizetési mód, a fizetés állapota.",
      "Az oldalon kizárólag digitális termékek érhetők el, ezért szállítási címet nem kérünk és nem kezelünk.",
      "Cél: a megrendelés teljesítése, a számla kiállítása, a visszaigazoló és teljesítési e-mailek megküldése.",
      "Jogalap: szerződés teljesítése (GDPR 6. cikk (1) b)), a számlázási adatok tekintetében jogi kötelezettség teljesítése (GDPR 6. cikk (1) c)).",
      "Megőrzési idő: a számviteli bizonylatokat a számvitelről szóló 2000. évi C. törvény 169. §-a alapján 8 évig őrizzük meg. A megrendelési adatokat a szavatossági és elszámolási igények elévülésének idejéig kezeljük.",
    ],
  },
  {
    heading: "6. Bankkártyás online fizetés",
    paragraphs: [
      "A bankkártyás fizetést a Stripe Payments Europe, Ltd. bonyolítja le. A kártyaszámot, a lejárati dátumot és a biztonsági kódot kizárólag a Stripe kezeli, ezekhez az adatkezelő nem kap hozzáférést, és azokat nem tárolja.",
      "Az adatkezelőhöz a fizetésről csak a tranzakció azonosítója, összege, állapota és a fizető e-mail címe jut el, a megrendelés teljesítése és a számlázás céljából. Jogalap: szerződés teljesítése (GDPR 6. cikk (1) b)).",
      "A Stripe saját adatkezelési tájékoztatója a stripe.com oldalon érhető el.",
    ],
  },
  {
    heading: "7. Kalkulátorok",
    paragraphs: [
      "A weboldalon elérhető kalkulátorok (bérteszt, jövedelemadó) számításai a böngésződben futnak. A beírt értékeket nem továbbítjuk szerverre, és nem tároljuk.",
    ],
  },
  {
    heading: "8. Hírlevél",
    list: [
      "Kezelt adatok: vezetéknév, keresztnév, e-mail cím, valamint – ha megadják – telefonszám és cégnév. A visszaélések szűréséhez IP-címet és böngészőazonosítót (user agent), a feliratkozás igazolásához a hozzájárulás és a megerősítés időpontját rögzítjük.",
      "Cél: hírlevél küldése a szolgáltatásokról, a digitális termékek újdonságairól, jogszabályi változásokról és határidőkről.",
      "Jogalap: az érintett önkéntes, kifejezett hozzájárulása (GDPR 6. cikk (1) a)). A feliratkozás kettős megerősítéssel (double opt-in) történik: a hírlevél csak az e-mailben kapott megerősítő link után indul.",
      "Megőrzési idő: a hozzájárulás visszavonásáig (leiratkozásig). A leiratkozás tényét és időpontját a jogszabályi elszámoltathatóság érdekében ezt követően is nyilvántartjuk.",
      "Leiratkozás: minden hírlevél alján egy kattintással elérhető leiratkozó link szerepel, illetve leiratkozási kérés az info@xlntbi.hu címre is küldhető.",
      "Külső levelezőrendszer: ha a hírlevél kiküldése külső szolgáltatóval (MailerLite, EmailOctopus, Sender, SendPulse vagy Brevo) történik, a feliratkozó neve, e-mail címe és a megadott telefonszám, cégnév az érintett szolgáltatóhoz is továbbításra kerül, kizárólag a hírlevél kiküldése céljából.",
    ],
  },
  {
    heading: "9. Sütik (cookie-k)",
    paragraphs: [
      "A weboldal a működéshez szükséges sütiket használ, ideértve a bankkártyás fizetés biztonságos lebonyolításához a Stripe által elhelyezett sütiket is. Analitikai és marketing sütiket jelenleg nem alkalmazunk. Részletek a Cookie-tájékoztató oldalon.",
    ],
  },
  {
    heading: "10. Adatfeldolgozók és címzettek",
    paragraphs: [
      "Az adatkezelés során az alábbi adatfeldolgozók, illetve önálló adatkezelők működnek közre:",
    ],
    list: [...PROCESSORS],
    afterList: [
      "Harmadik országba (jellemzően az Amerikai Egyesült Államokba) történő adattovábbítás esetén a továbbítás jogalapja az Európai Bizottság megfelelőségi határozata (EU–USA adatvédelmi keret), illetve az Európai Bizottság által elfogadott általános szerződési feltételek (SCC). Az adatokat hatóság részére csak jogszabályi kötelezettség alapján adjuk ki.",
    ],
  },
  {
    heading: "11. Automatizált döntéshozatal, profilalkotás, AI-eszközök",
    paragraphs: [
      "Az adatkezelés során automatizált döntéshozatal és profilalkotás nem történik.",
      "A szolgáltató a szoftverei és belső folyamatai fejlesztéséhez AI-eszközöket használ, azonban a weboldalon beküldött személyes adatokat AI-modell tanítására nem használjuk fel, és azokat AI-szolgáltatónak nem továbbítjuk.",
    ],
  },
  {
    heading: "12. Adatbiztonság",
    paragraphs: [
      "Az adatok titkosított (HTTPS) kapcsolaton keresztül kerülnek továbbításra. Az adatbázisban a beküldések jogosultsághoz kötött (row level security) védelem mellett tárolódnak, azokhoz csak az adatkezelő és a szükséges mértékben az adatfeldolgozók férhetnek hozzá.",
    ],
  },
  {
    heading: "13. Az érintettek jogai",
    paragraphs: ["Az érintettet az alábbi jogok illetik meg:"],
    list: [
      "Tájékoztatáshoz és hozzáféréshez való jog (GDPR 15. cikk)",
      "Helyesbítéshez való jog (GDPR 16. cikk)",
      "Törléshez való jog, az „elfeledtetéshez való jog” (GDPR 17. cikk), a jogszabályi megőrzési kötelezettség keretei között",
      "Az adatkezelés korlátozásához való jog (GDPR 18. cikk)",
      "Adathordozhatósághoz való jog (GDPR 20. cikk)",
      "Tiltakozás joga a jogos érdeken alapuló adatkezelés ellen (GDPR 21. cikk)",
      "A hozzájárulás bármikori visszavonásának joga, amely a visszavonás előtti adatkezelés jogszerűségét nem érinti (GDPR 7. cikk (3))",
    ],
    afterList: [
      `A kérelmeket a ${COMPANY.email} címen lehet benyújtani. A kérelemre indokolatlan késedelem nélkül, legkésőbb 1 hónapon belül válaszolunk; ez a határidő indokolt esetben további 2 hónappal meghosszabbítható, amiről tájékoztatást adunk.`,
    ],
  },
  {
    heading: "14. Jogorvoslat",
    paragraphs: [
      `Ha az érintett úgy véli, hogy személyes adatainak kezelése során jogsérelem érte, panaszt nyújthat be a felügyeleti hatósághoz: ${AUTHORITIES.naih}.`,
      "Az érintett a lakóhelye vagy tartózkodási helye szerinti törvényszékhez is fordulhat, a GDPR 79. cikke és az Infotv. alapján.",
    ],
  },
  {
    heading: "15. A tájékoztató módosítása",
    paragraphs: [
      "Az adatkezelő fenntartja a jogot a tájékoztató módosítására. A mindenkor hatályos változat a weboldalon érhető el.",
      "Hatályos: 2026. augusztus 19-től.",
    ],
  },
];

function AdatvedelmiPage() {
  return <LegalPage title="Adatvédelmi tájékoztató" sections={sections} />;
}
