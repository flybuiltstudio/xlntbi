import { createFileRoute } from "@tanstack/react-router";
import { LegalPage, type LegalSection } from "@/components/LegalPage";

const TITLE = "Adatvédelmi tájékoztató | EXCELlent";
const DESC =
  "Adatvédelmi tájékoztató a weboldal, a kapcsolatfelvétel, a kalkulátorok és a digitális termékek adatkezeléséről, a GDPR követelményei szerint.";

export const Route = createFileRoute("/adatvedelmi-tajekoztato")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdatvedelmiPage,
});

const sections: LegalSection[] = [
  {
    heading: "1. Az adatkezelő adatai",
    list: [
      "Adatkezelő: Sarinay Dávid",
      "E-mail: info@xlntbi.hu",
      "Telefon: +36 20 962 2176",
      "Honlap: xlntbi.hu",
    ],
  },
  {
    heading: "2. A tájékoztató célja",
    paragraphs: [
      "Jelen tájékoztató bemutatja, hogy a weboldal, kapcsolódó digitális szolgáltatások és automatizált megoldások során milyen személyes adatokat kezelünk, milyen célból, milyen jogalapon, mennyi ideig, valamint milyen jogok illetik meg az érintetteket.",
      "A tájékoztató a GDPR követelményeinek megfelelő alapstruktúrában készült, és a weboldal működéséhez, kapcsolatfelvételhez, ajánlatkéréshez, hírlevél-feliratkozáshoz, kalkulátorok használatához, digitális termékértékesítéshez és automatizált megoldásokhoz igazodik.",
    ],
  },
  {
    heading: "3. Az adatkezelés alapelvei",
    paragraphs: [
      "A személyes adatokat jogszerűen, tisztességesen és átlátható módon kezeljük. Csak olyan adatokat kérünk, amelyek a szolgáltatás nyújtásához, a kapcsolatfelvételhez, a szerződés teljesítéséhez vagy jogszabályi kötelezettség teljesítéséhez szükségesek.",
      "Az adatokat kizárólag a szükséges ideig őrizzük meg, és megfelelő technikai, valamint szervezési intézkedésekkel gondoskodunk azok biztonságáról.",
    ],
  },
  {
    heading: "4. A kezelt személyes adatok köre",
    paragraphs: [
      "A weboldal és a kapcsolódó szolgáltatások használata során az alábbi személyes adatok kezelése fordulhat elő:",
    ],
    list: [
      "Név",
      "E-mail cím",
      "Telefonszám",
      "Számlázási adatok",
      "Kapcsolati és ügyféladatok",
      "Technikai adatok (IP-cím, böngészőinformációk, naplóadatok)",
      "A kapcsolatfelvétel vagy megrendelés során megadott egyéb információk",
    ],
    afterList: [
      "A kapcsolatfelvételi és konzultációkérő űrlapon megadott adatokat (név, e-mail cím, telefonszám, cégnév, üzenet, a választott szolgáltatás, valamint a preferált kapcsolatfelvételi mód és időpont) a megkeresés megválaszolása és a szerződés előkészítése céljából kezeljük. A beküldést a weboldal biztonságos adatbázisában is rögzítjük, a visszakereshetőség érdekében, és a visszaélések (automatizált spam) szűréséhez az IP-címet és a böngésző azonosítóját is eltároljuk.",
    ],
  },
  {
    heading: "5. Az adatkezelés céljai",
    paragraphs: ["Az adatkezelés célja különösen:"],
    list: [
      "Kapcsolatfelvétel és kapcsolattartás",
      "Ajánlatadás és szerződés előkészítése",
      "Szerződés teljesítése",
      "Számlázási és könyvelési kötelezettségek teljesítése",
      "Ügyfélszolgálati kommunikáció",
      "Hírlevél küldése, amennyiben ehhez külön hozzájárulás történt",
      "Kalkulátorok és digitális eszközök működésének biztosítása",
      "A weboldal működésének, biztonságának és fejlesztésének támogatása",
    ],
  },
  {
    heading: "6. Az adatkezelés jogalapjai",
    paragraphs: ["Az adatkezelés jogalapja az alábbiak valamelyike lehet:"],
    list: [
      "Az érintett hozzájárulása",
      "Szerződés teljesítése",
      "Jogi kötelezettség teljesítése",
      "Az adatkezelő jogos érdeke",
      "Jogszabályban meghatározott kötelezettség",
    ],
  },
  {
    heading: "7. Az adatok megőrzési ideje",
    paragraphs: [
      "A személyes adatokat kizárólag az adatkezelés céljának megvalósulásához szükséges ideig őrizzük meg. A számlázási és számviteli adatokat a hatályos jogszabályokban előírt ideig tároljuk. A kapcsolatfelvételi és ajánlatkérési adatokat a kapcsolat lezárását követő ésszerű ideig őrizzük meg, kivéve, ha jogszabály vagy jogos érdek ennél hosszabb megőrzést tesz szükségessé.",
    ],
  },
  {
    heading: "8. Adatfeldolgozók és címzettek",
    paragraphs: [
      "Az adatkezelés során adatfeldolgozóként vagy önálló adatkezelőként közreműködhetnek többek között:",
    ],
    list: [
      "Tárhelyszolgáltató",
      "E-mail szolgáltató",
      "Számlázási rendszer",
      "Könyvelési rendszer",
      "Hírlevélküldő rendszer",
      "Analitikai és technikai szolgáltatók",
    ],
    afterList: ["E szolgáltatók saját adatkezelési szabályzatuk szerint végzik tevékenységüket."],
  },
  {
    heading: "9. Az érintettek jogai",
    paragraphs: ["Az érintettet az alábbi jogok illetik meg:"],
    list: [
      "Tájékoztatás kérése az adatkezelésről",
      "Hozzáférés a kezelt személyes adatokhoz",
      "Az adatok helyesbítésének kérése",
      "Az adatok törlésének kérése, amennyiben annak jogszabályi feltételei fennállnak",
      "Az adatkezelés korlátozásának kérése",
      "Tiltakozás a jogos érdeken alapuló adatkezelés ellen",
      "Adathordozhatósághoz való jog, amennyiben annak feltételei fennállnak",
    ],
  },
  {
    heading: "10. Jogorvoslat",
    paragraphs: [
      "Amennyiben az érintett úgy véli, hogy személyes adatainak kezelése során jogsérelem érte, panaszt nyújthat be a Nemzeti Adatvédelmi és Információszabadság Hatósághoz (NAIH), valamint jogosult bírósághoz fordulni.",
    ],
  },
  {
    heading: "11. Kapcsolat",
    paragraphs: [
      "Adatkezeléssel kapcsolatos kérdés, kérelem vagy panasz esetén az alábbi e-mail címen lehet kapcsolatba lépni: info@xlntbi.hu",
    ],
  },
];

function AdatvedelmiPage() {
  return <LegalPage title="Adatvédelmi tájékoztató" sections={sections} />;
}
