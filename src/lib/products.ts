import szamlaImg from "@/assets/account-assets-audit-bank-bookkeeping-finance-concept.jpg";
import penztargepImg from "@/assets/close-up-busy-businesswoman.jpg";
import accountImg from "@/assets/account-assets-audit-bank-bookkeeping-finance-concept.jpg";
import businessImg from "@/assets/135731.jpg";
import controllingImg from "@/assets/controlling.jpg";
import auditImg from "@/assets/cegaudit.jpg";
import biImg from "@/assets/bi.jpg";
import officeImg from "@/assets/konyveloiroda-audit.jpg";
import modernImg from "@/assets/En-modern-konyveloirodaban.jpg";
import closeupImg from "@/assets/close-up-busy-businesswoman.jpg";
import termekekImg from "@/assets/termekek.jpg";
import calcImg from "@/assets/online-kalkulator.jpg";
import utalasiImg from "@/assets/utalasi-csomag-keszito.jpg";
import ifrsImg from "@/assets/ifrs-konszolidalo.jpg";
import pdfExcelImg from "@/assets/pdf-excel-konverter.jpg";
import nyitoVegyesImg from "@/assets/nyito-vegyes-konyvelo.jpg";
import wifiJelszoImg from "@/assets/wifi-jelszo-nezo.jpg";

export type ProductTier = {
  /** Stable, product-scoped tier id used in orders and URLs. */
  id: string;
  label: string;
  price: number;
  note?: string;
  /** Stripe price lookup key (human-readable, stable across test and live). */
  priceId: string;
};

export type ProductDownload = {
  fileName: string;
  /** Object path inside the private `termekfajlok` storage bucket. */
  storagePath: string;
};

export type Product = {
  slug: string;
  /** Stripe price lookup key of the default (first) tier. */
  priceId: string;
  name: string;
  tagline?: string;
  status: "available" | "coming_soon";
  /** Price of the default (first) tier, in HUF. */
  price: number;
  currency: "HUF";
  image: string;
  metaTitle: string;
  metaDescription: string;
  intro: string[];
  features: string[];
  why?: string;
  /** A konszolidálási lépéssor; ha meg van adva, a termékoldalon saját szekcióban jelenik meg. */
  steps?: { title: string; text: string }[];
  tiers: ProductTier[];
  download?: ProductDownload;
};

export const products: Product[] = [
  {
    slug: "nav-online-szamla-letolto",
    priceId: "nav_online_szamla_letolto_onetime",
    name: "NAV Online Számla letöltő",
    tagline: "NAV Online Számla adatok lekérdezése és Excelbe exportálása, időszakkorlát nélkül",
    status: "available",
    price: 19900,
    currency: "HUF",
    image: szamlaImg,
    metaTitle: "NAV Online Számla letöltő | EXCELlent",
    metaDescription:
      "Asztali segédprogram a NAV Online Számla adatok lekérdezéséhez és Excelbe exportálásához. 19 900 Ft.",
    intro: [
      "Ez a NAV Online Számla letöltő egy kényelmes, asztali segédprogram, amellyel néhány kattintással lekérdezhetők és menthetők a NAV Online Számla rendszerből a számlaadatok. A program gyorsabbá teszi a napi adminisztrációt, csökkenti a kézi másolgatást, és segít abban, hogy a letöltött adatok rendezett, Excelben is könnyen használható, akár onnan könyvelőprogramba importálható formában álljanak rendelkezésre.",
    ],
    features: [
      "NAV Online Számla adatok lekérdezése és Excelbe exportálása.",
      "Bejövő és kimenő számlák kezelése, időszak szerinti szűréssel.",
      "A NAV által megszabott max. 35 napos időintervallum-korlát áttörése, így tetszőleges hosszúságú időszak választható ki és dolgozható fel.",
      "Külön munkalap a fejlécadatoknak és külön munkalap a tételsoroknak.",
      "Rögzített fejléc, szűrhető táblázat és automatikusan formázott oszlopok az átlátható használatért.",
      "Használható akár Ügyfél általi ellenőrzésre, hogy összegyűjtött-e minden számlát",
      "Különös hasznos külföldi könyvelőprogramokat (pl. SAP, NAVISION, Business Central, Oracle stb.) használóknak, akár erre épülően importálás is megvalósítható",
    ],
    why: "A program különösen hasznos, ha nagyobb időszakokat kell feldolgozni, vagy ha a NAV korlátja miatt eddig több részletben kellett lekérdezned az adatokat. Ezzel az eszközzel egyetlen kiválasztott időszakból is kényelmesen készíthetsz rendezett, tovább feldolgozható Excel-fájlt.",
    tiers: [
      {
        id: "orokos",
        label: "Örökös licenc",
        price: 19900,
        note: "Egyszeri díj, korlátlan és időbeli korlát nélküli felhasználás.",
        priceId: "nav_online_szamla_letolto_onetime",
      },
    ],
    download: {
      fileName: "nav_online_szamla_letolto.exe",
      storagePath: "nav-online-szamla-letolto/nav_online_szamla_letolto.exe",
    },

  },
  {
    slug: "nav-penztargep-letolto",
    priceId: "nav_penztargep_letolto_onetime",
    name: "NAV Pénztárgép letöltő",
    tagline: "Hiteles AEE naplóállományok letöltése és könyvelőbarát Excel kimenet",
    status: "available",
    price: 19900,
    currency: "HUF",
    image: penztargepImg,
    metaTitle: "NAV Pénztárgép letöltő | EXCELlent",
    metaDescription:
      "Asztali segédprogram a pénztárgépes adatok és AEE naplóállományok letöltéséhez, könyvelőbarát Excel kimenettel. 19 900 Ft.",
    intro: [
      "NAV Pénztárgép letöltő – egy praktikus asztali segédprogram, amellyel gyorsan és átláthatóan lekérhetők és menthetők a pénztárgéphez kapcsolódó adatok. A program úgy készült, hogy a napi adminisztrációt egyszerűbbé tegye, csökkentse a kézi munkát, és rendezett, jól kezelhető kimenetet adjon.",
      "A szoftver fő előnye, hogy egy helyen kezeli a szükséges lekérdezéseket, a mentést és az adatfeldolgozást, így kevesebb kattintással lehet eljutni a használható eredményig. Ez különösen hasznos lehet azoknak, akik rendszeresen dolgoznak pénztárgépes adatokkal, és fontos nekik az áttekinthető, megbízható működés.",
    ],
    features: [
      "Pénztárgépes adatok lekérdezése és letöltése.",
      "Rendezett adatmentés és feldolgozás.",
      "Áttekinthető kezelőfelület a gyors napi használathoz.",
      "A munkafolyamatok egyszerűsítése, kevesebb manuális adatkezeléssel.",
      "NAV Online Pénztárgép (OPG) hiteles AEE naplóállományok letöltése, teszt és éles környezetben egyaránt.",
      "Az aláírt P7B állományokból a tényleges napló-adat automatikus kinyerése és feldolgozása.",
      "Az adatok RLB-szerű, könyvelőbarát Excel munkafüzetbe rendezve: Fejléc, Tétel, Pénztárjelentés, Forgalmi jelentés és Beállítások lapok, valamint Pénztárgép státusz és Naplóállományok.",
      "A pénztárgép AP száma és típusa, valamint a cégnév automatikus kitöltése (a saját adószám alapján).",
      "Időszak szerinti szűrés gyorsgombokkal, vagy egyetlen kattintással az „Összes elérhető” teljes tartomány letöltése.",
      "Profi Excel-formázás: valós dátum + időpont, ezres elválasztós összegek, középszürke rögzített fejléc, automatikus oszlopszélesség.",
    ],
    tiers: [
      {
        id: "orokos",
        label: "Örökös licenc",
        price: 19900,
        note: "Egyszeri díj, korlátlan és időbeli korlát nélküli felhasználás.",
        priceId: "nav_penztargep_letolto_onetime",
      },
    ],
    download: {
      fileName: "nav_online_penztargep_letolto.exe",
      storagePath: "nav-penztargep-letolto/nav_online_penztargep_letolto.exe",
    },
  },
  {
    slug: "afa-2665-xml-generalo",
    name: "2665 ÁFA-bevallás ÁNYK XML-generáló",
    tagline: "Automatikus M-lap XML előállítás könyvelőknek — percek alatt, hibák nélkül",
    status: "available",
    priceId: "afa_2665_xml_generalo_1_ceg",
    price: 34900,
    currency: "HUF",
    image: accountImg,
    metaTitle: "2665 ÁFA-bevallás ÁNYK XML-generáló | EXCELlent",
    metaDescription: "Automatikus M-lap XML előállítás könyvelőknek — percek alatt, hibák nélkül. Ár: 34 900 Ft-tól.",
    intro: [
      "Az xlntbi.hu 2665 XML-generáló egy Windows asztali alkalmazás (önálló .exe), amely a könyvelőprogram adataiból — egyetlen kattintással — előállítja a NAV 2665-ös ÁFA-bevallás M-lapjaihoz szükséges ÁNYK-kompatibilis XML-fájlt. Nincs több kézi másolás, elírási hiba vagy sorkihagyás az összezítő jelentésben.",
      "Az eszköz mindkét lapot — az alap M-02-t és a korrekciós M-02-K-t — automatikusan kitölti, beleértve az új, 2025 júliustól elérhető f1–f4 és h1–h4 oszlopokat is.",
    ],
    features: [
      "Órák helyett percek — 100 partneres bevallás is elvégez 2-3 perc alatt.",
      "Nulla elírási hiba — a gép nem téveszt adószámot, dátumot, összeget.",
      "Mindig naprakész — a 2026-os bevalláshoz igazítva, f1–f4 és h1–h4 oszlopokkal.",
      "Nem kell ÁNYK-ismeret — az XML-t csak betölti a könyvelő, nem kézzel szerkeszti.",
      "Próbálja ki kockázatmentesen — 14 napos visszatérítési garancia.",
    ],
    tiers: [
      {
        id: "1_ceg",
        label: "1 cég",
        price: 34900,
        note: "Egyetlen adószám bevallásaihoz.",
        priceId: "afa_2665_xml_generalo_1_ceg",
      },
      {
        id: "korlatlan",
        label: "Korlátlan",
        price: 99900,
        note: "Könyvelőirodáknak, korlátlan ügyfélszámmal.",
        priceId: "afa_2665_xml_generalo_korlatlan",
      },
    ],
    download: {
      fileName: "2665_XML.xlsm",
      storagePath: "afa-2665-xml-generalo/2665_XML.xlsm",
    },
  },
  {
    slug: "ugyfelkapu-totp-manager",
    name: "Ügyfélkapu+ TOTP Manager",
    tagline: "Egy helyen kezelheted az összes Ügyfélkapu+ belépési kódodat, közvetlenül Excelből",
    status: "available",
    priceId: "ugyfelkapu_totp_manager_munkahelyi_licenc",
    price: 7990,
    currency: "HUF",
    image: businessImg,
    metaTitle: "Ügyfélkapu+ TOTP Manager | EXCELlent",
    metaDescription: "Egy helyen kezelheted az összes Ügyfélkapu+ belépési kódodat, közvetlenül Excelből. Ár: 7 990 Ft-tól.",
    intro: [
      "Ha könyvelőként, könyvvizsgálóként vagy adótanácsadóként több ügyfél Ügyfélkapu+ fiókjához kell rendszeresen belépned, ismered a helyzetet: minden egyes alkalommal elő kell venni a telefont, megnyitni az authenticator appot, megkeresni a megfelelő fiókot, leolvasni a kódot — és imádkozni, hogy ne járjon le, mire átgépeled.",
      "Az Ügyfélkapu+ TOTP Manager ezt a napi rutint szünteti meg. Egyetlen Excel táblázatban látod az összes ügyfeled belépési adatát és az aktuálisan érvényes kódot — egy kattintással másolhatod a vágólapra.",
    ],
    features: [
      "Valós idejű TOTP kódgenerálás – másodpercenként frissülő, mindig érvényes 6 jegyű kód, nem kell telefonhoz nyúlni.",
      "Egy kattintásos másolás – felhasználónév, jelszó és TOTP kód külön-külön gombbal másolható a vágólapra.",
      "Visszaszámláló jelzőfény – zöld–sárga–piros színezéssel látod, mennyi idő van hátra a kód lejártáig.",
      "Korlátlan fiókszám – egy lapon annyi Ügyfélkapu+ fiókot kezelhetsz, amennyit csak szeretnél.",
      "Helyi adattárolás – minden adat a saját gépeden marad, jelszóval védhető Excel fájlban. Nincs felhő.",
      "Nincs telepítés – egyetlen .xlsm fájl, 32 és 64 bites Excelben is működik.",
    ],
    tiers: [
      {
        id: "munkahelyi_licenc",
        label: "Munkahelyi licenc",
        price: 7990,
        note: "Egyszeri díj, korlátlan használat, ingyenes frissítések.",
        priceId: "ugyfelkapu_totp_manager_munkahelyi_licenc",
      },
    ],
    download: {
      fileName: "UgyfelkapuTOTP.xlsm",
      storagePath: "ugyfelkapu-totp-manager/UgyfelkapuTOTP.xlsm",
    },
  },
  {
    slug: "a60-osszesito-nyilatkozat-xml",
    name: "26A60 összesítő nyilatkozat XML-generáló",
    tagline: "A60 összesítő nyilatkozat Excelből, ÁNYK-ba tölthető XML-lel és VIES-ellenőrzéssel",
    status: "available",
    priceId: "a60_osszesito_nyilatkozat_xml_1_ceg",
    price: 24900,
    currency: "HUF",
    image: controllingImg,
    metaTitle: "26A60 összesítő nyilatkozat XML-generáló | EXCELlent",
    metaDescription: "A60 összesítő nyilatkozat Excelből, ÁNYK-ba tölthető XML-lel és VIES-ellenőrzéssel. Ár: 24 900 Ft-tól.",
    intro: [
      "A közösségi ügyletekről az áfabevallás mellett összesítő nyilatkozatot (A60) is be kell nyújtani – és ezt az eÁFA rendszer sem váltja ki. A nyomtatvány ÁNYK-ban való kitöltése azonban lassú, a partnerek közösségi adószámát külön kellene ellenőrizni, és könnyű elvéteni a helyesbítéseket.",
      "A 26A60 XML ezt a munkát teszi gyorsabbá és biztonságosabbá: a tételeket egy jól átlátható Excel-táblázatba viszi be, a program pedig legenerálja belőle az ÁNYK-ba tölthető nyomtatványt. Nincs kényszer, nincs felesleges kör – csak egy eszköz, amelyik leveszi a válláról a mechanikus részt.",
    ],
    features: [
      "Teljes A60 kitöltés a mind a négy laptípushoz (01 termékértékesítés, 02 termékbeszerzés, 03 szolgáltatásnyújtás, 04 szolgáltatás igénybevétele), egyetlen áttekinthető táblázatban.",
      "XML-export közvetlenül az ÁNYK-ba tölthető formátumban – a kézi átgépelés kiváltására.",
      "Beépített VIES-ellenőrzés a partnerek közösségi adószámára: a program visszaadja az érvényességet, a cégnevet és a címet, így a hibás adószámok még beadás előtt kiderülnek.",
      "Helyesbítés-támogatás – eredeti és helyesbítő (T/U) tételek, egyedi jelölés és a helyesbítés okainak kezelése, hogy az utólagos módosítások is szabályosak maradjanak.",
      "65 – A60 egyeztetés a 65-ös áfabevallás és az A60 összevetéséhez, hogy a két adatszolgáltatás konzisztens legyen.",
      "MNB-árfolyamok és teljesítésiidőpont-kalkulátor a határidők és a devizás tételek pontos kezeléséhez.",
      "Könnyű indulás beépített használati útmutatóval és gyakorló változatokkal – a betanulás így néhány perc.",
    ],
    tiers: [
      {
        id: "1_ceg",
        label: "1 cég",
        price: 24900,
        note: "Egyetlen adószám nyilatkozataihoz.",
        priceId: "a60_osszesito_nyilatkozat_xml_1_ceg",
      },
      {
        id: "konyveloiroda_korlatlan",
        label: "Könyvelőiroda / korlátlan",
        price: 59900,
        note: "Korlátozás nélkül, bármennyi ügyfélre.",
        priceId: "a60_osszesito_nyilatkozat_xml_konyveloiroda_korlatlan",
      },
    ],
    download: {
      fileName: "26A60_XML.xlsm",
      storagePath: "a60-osszesito-nyilatkozat-xml/26A60_XML.xlsm",
    },
  },
  {
    slug: "adofolyoszamla-egyezteto",
    name: "XLNT Adófolyószámla egyeztető",
    tagline: "Excel + VBA eszköz könyvelőknek · a NAV adófolyószámla és a főkönyv percek alatt egyeztetve",
    status: "available",
    priceId: "adofolyoszamla_egyezteto_1_ceg",
    price: 9900,
    currency: "HUF",
    image: auditImg,
    metaTitle: "XLNT Adófolyószámla egyeztető | EXCELlent",
    metaDescription: "Excel + VBA eszköz könyvelőknek · a NAV adófolyószámla és a főkönyv percek alatt egyeztetve. Ár: 9 900 Ft-tól.",
    intro: [
      "A zárás egyik visszatérő, időrabló feladata az adófolyószámla és a főkönyv összevetése. Ez az eszköz beolvassa a NAV kivonatot, kigyűjti a főkönyvi egyenlegeket, és adónemenként megmutatja, hol tér el a kettő – egyetlen Excel munkafüzetben, telepítés és felhő nélkül.",
      "A NAV folyószámla mellett az önkormányzati (helyi iparűzési adó, késedelmi pótlék) egyeztetést is támogatja. Nincs havidíjas platform, nincs adatfeltöltés idegen szerverre: a fájl az Ön gépén marad, a saját könyvelési adataival dolgozik.",
      "A NAV ügyfélportálról / eBEV-ről letöltött adófolyószámla-kivonatot közvetlenül beolvassa: a tételes fszlaKivonat XML-t és a NAV XLSX exportot egyaránt. Automatikusan elkészíti az összesítő, az adónemenkénti és a tételes lapokat, valamint a kódlistát. Új beolvasáskor a korábbi lapok maguktól törlődnek, így nem keverednek az időszakok.",
    ],
    features: [
      "Két forrás: választható, hogy a főkönyvi kivonatból vagy az összes kartonból dolgozzon;.",
      "Automatikus: ha a választott forrás üres, magától a másikkal próbálkozik;.",
      "Egyezés: pontos vagy „kezdete szerint” összevonás (pl. 473 → 4731, 4732 …).",
      "Adatbiztonság: Ami az Ön gépén van, az az Öné marad – nincs felhő, nincs adattovábbítás.",
      "Bármilyen forrás: nem kötődik egyetlen könyvelőprogramhoz sem; azzal dolgozik, amit exportál.",
      "Nyílt Excel: látja a képleteket, testre szabhatja, beépítheti a saját zárási sablonjába.",
      "Kényelem: a fájlmegnyitás mindig a program mappájában nyílik, hálózati (UNC) meghajtón is.",
      "Ellenőrzött: a mintaadaton az adónem-egyenlegek pontosan egyeztek a NAV saját végösszegével.",
    ],
    tiers: [
      {
        id: "1_ceg",
        label: "1 cég",
        price: 9900,
        note: "Egyetlen cég egyeztetéséhez.",
        priceId: "adofolyoszamla_egyezteto_1_ceg",
      },
      {
        id: "konyveloiroda",
        label: "Könyvelőiroda",
        price: 34900,
        note: "Az iroda teljes ügyfélkörére.",
        priceId: "adofolyoszamla_egyezteto_konyveloiroda",
      },
      {
        id: "orokos",
        label: "Örökös",
        price: 79900,
        note: "Időbeli korlát nélkül, korlátlan felhasználással.",
        priceId: "adofolyoszamla_egyezteto_orokos",
      },
    ],
    download: {
      fileName: "XLNT_Adofolyoszamla_egyezteto.xlsm",
      storagePath: "adofolyoszamla-egyezteto/XLNT_Adofolyoszamla_egyezteto.xlsm",
    },
  },
  {
    slug: "nav-torzsszam-partnerellenorzo",
    name: "NAV Törzsszám- és Partnerellenőrző",
    tagline: "Excel munkafüzet makróval – adószám-ellenőrzés, EU VIES és cégkeresés egy helyen",
    status: "available",
    priceId: "nav_torzsszam_partnerellenorzo_egygepes_licenc",
    price: 19900,
    currency: "HUF",
    image: biImg,
    metaTitle: "NAV Törzsszám- és Partnerellenőrző | EXCELlent",
    metaDescription: "Excel munkafüzet makróval – adószám-ellenőrzés, EU VIES és cégkeresés egy helyen. Ár: 19 900 Ft-tól.",
    intro: [
      "Ha könyvelőként vagy vállalkozóként naponta ellenőriz partnereket, ezt a munkát ma jellemzően három különböző weboldalon kattintgatva végzi el. Ez a munkafüzet mindhármat egy Excel-táblába hozza: a NAV Online Számla rendszer hivatalos adószám-ellenőrzését, az Európai Bizottság VIES szolgáltatását, és – opcionálisan – a cégnév alapján történő keresést.",
      "Nem egy újabb havidíjas felhőszolgáltatás. Egyetlen Excel-fájl, amit letölt, kitölt, és onnantól a saját gépén dolgozik vele. Tömegesen is: egy oszlopba beírja a törzsszámokat, elindítja, és megkapja az eredményt.",
    ],
    features: [
      "Megkapja: a törzsszám létezik-e a NAV nyilvántartásában, és érvényes-e az adószám.",
      "a teljes 11 jegyű adószámot, formázva is (pl. 32305964-2-43).",
      "az adózó teljes és rövidített nevét, szervezeti formáját.",
      "az ÁFA-kód jelentését magyarul, a megyekódot, az áfacsoport-tagságot.",
      "a székhelyet, és külön lapon minden telephelyet és fióktelepet.",
      "helyi ellenőrző számjegy (CDV) vizsgálatot – hálózat nélkül is kiszűri az elgépelést.",
      "Megkapja: érvényes-e a közösségi adószám, mi a cég neve és címe.",
      "Megkapja: keresés cégnév, adószám vagy cégjegyzékszám alapján, elírásbarát módban is.",
      "a teljes adatlapot: 11 jegyű adószám, cégforma, bontott cím, cégjegyzékszám, statisztikai számjel, állapot.",
    ],
    tiers: [
      {
        id: "egygepes_licenc",
        label: "Egygépes licenc",
        price: 19900,
        note: "Egyéni könyvelőnek vagy egy vállalkozásnak, egy munkaállomásra.",
        priceId: "nav_torzsszam_partnerellenorzo_egygepes_licenc",
      },
      {
        id: "konyveloirodai_licenc",
        label: "Könyvelőirodai licenc",
        price: 49900,
        note: "Az iroda összes gépére, létszámkorlát nélkül.",
        priceId: "nav_torzsszam_partnerellenorzo_konyveloirodai_licenc",
      },
    ],
    download: {
      fileName: "Adoszam_ellenorzo.xlsm",
      storagePath: "nav-torzsszam-partnerellenorzo/Adoszam_ellenorzo.xlsm",
    },
  },
  {
    slug: "berszamfejto-2026",
    name: "Bérszámfejtő 2026",
    tagline: "Excel-alapú bérszámfejtés ÁNYK-exporttal – mikro- és kisvállalkozásoknak",
    status: "available",
    priceId: "berszamfejto_2026_alap",
    price: 24900,
    currency: "HUF",
    image: officeImg,
    metaTitle: "Bérszámfejtő 2026 | EXCELlent",
    metaDescription: "Excel-alapú bérszámfejtés ÁNYK-exporttal – mikro- és kisvállalkozásoknak. Ár: 24 900 Ft-tól.",
    intro: [
      "Havonta ugyanaz a kör: kiszámolni a bruttót, a kedvezményeket, a járulékokat – aztán kézzel átpötyögni a számokat az ÁNYK 08-as bevallásába. A Bérszámfejtő 2026 mindkét lépést leveszi a válláról: egy ismerős Excel-munkafüzetben számfejt, majd egyetlen gombnyomással előállítja az ÁNYK-ba importálható XML-t.",
      "A havi összesítő lapon egyetlen legördülő menüvel váltja a hónapot, és azonnal ott van minden szám, amit a 08-as bevallás kér – ugyanezekből dolgozik az exportáló makró is.",
    ],
    features: [
      "12 havi számfejtő lap – dolgozónként bruttó bér, SZJA-alap, levont SZJA, TB-járulék, nettó bér és munkáltatói szocho, automatikusan.",
      "Törvény szerinti időarányosítás – hó közbeni be- vagy kilépésnél az Mt. 136. § (3) bekezdése szerint arányosítja a havi alapbért, a munkaszüneti napok figyelembevételével.",
      "Betegszabadság és táppénz – a betegszabadságra automatikusan a távolléti díj 70%-át számolja, követi az éves 15 munkanapos keretet, és helyesen kezeli a kifizetőhelyi táppénz közterheit (SZJA igen, járulék és szocho nem), valamint a munkáltatói 1/3 táppénz-hozzájárulást.",
      "Minden fontos kedvezmény – 25 év alatti fiatalok kedvezménye, első házasok kedvezménye, családi kedvezmény és a családi járulékkedvezmény, a 2026-os értékhatárokkal.",
      "Béren kívüli és egyes meghatározott juttatások – az Szja tv. 71. §-a szerinti SZÉP-kártya a rekreációs keretfigyeléssel, a keret feletti rész automatikus átsorolásával a 70. § szerinti, 1,18-as szorzós adózásba.",
      "Egygombos ÁNYK-export – a makró a kiválasztott hónapból elkészíti a 2608A főlapot és a dolgozónkénti 2608M lapokat tartalmazó XML-t, akár egyből el is indítja az ÁNYK-t.",
      "Szabadság-nyilvántartás – az éves keretet a Munka törvénykönyve szerint számolja (alapszabadság + életkori és gyermekek utáni pótszabadság, év közbeni belépésnél arányosítva), és követi a maradványt.",
    ],
    tiers: [
      {
        id: "alap",
        label: "Alap",
        price: 24900,
        note: "Egy cég bérszámfejtéséhez.",
        priceId: "berszamfejto_2026_alap",
      },
      {
        id: "standard",
        label: "Standard",
        price: 39900,
        note: "Több cég, bővített kimutatásokkal.",
        priceId: "berszamfejto_2026_standard",
      },
      {
        id: "konyveloi",
        label: "Könyvelői",
        price: 74900,
        note: "Könyvelőirodáknak, korlátlan ügyfélszámmal.",
        priceId: "berszamfejto_2026_konyveloi",
      },
    ],
    download: {
      fileName: "Berszamfejto_2026.xlsm",
      storagePath: "berszamfejto-2026/Berszamfejto_2026.xlsm",
    },
  },
  {
    slug: "utalasi-csomag-keszito",
    name: "Banki Utalási Csomag Készítő Excelben",
    tagline: "A havi utalásait Excelből, egyetlen gombnyomással – gépelés és elütés nélkül",
    status: "available",
    priceId: "utalasi_csomag_keszito_egygepes_licenc",
    price: 19900,
    currency: "HUF",
    image: utalasiImg,
    metaTitle: "Utalási Csomag Készítő Excelhez | EXCELlent",
    metaDescription: "A havi utalásait Excelből, egyetlen gombnyomással – gépelés és elütés nélkül. Ár: 19 900 Ft-tól.",
    intro: [
      "Ha havonta több partnernek utal, ismeri az egyhangú munkát: minden tételt egyesével begépelni a netbankba, számlaszámot és összeget figyelve. Ez az Excel-eszköz ezt veszi le a válláról. Ön egy áttekinthető táblázatba viszi a tételeket, a program pedig kész banki importfájlt készít belőle – amit már csak be kell töltenie a netbankba, ellenőriznie és aláírnia.",
      "A sárgával jelölt cellákba írja a tételeket – partnerenként egy sor. A táblázat összesíti a tételszámot és a végösszeget, így export előtt azonnal látja, mit küld.",
      "A megbízó adatait (név, számlaszám, alapértelmezett értéknap) egyszer adja meg a Beállítások lapon – minden későbbi export ezekből dolgozik. A csoportos átutaláshoz szükséges azonosítókat is itt állítja be.",
    ],
    features: [
      "Háromféle szabványos banki formátum: forint átutalás (*.HUF), csoportos átutalás (*.CAT) és MultiCash (*.UNG).",
      "Eseti és napközbeni forint átutalás, tételenkénti VIBER-jelöléssel.",
      "Csoportos átutalási állomány bérutaláshoz, akár több száz tétellel.",
      "Beépített ellenőrzések: számlaszám-hossz és -helyesség (CDV), összeg, értéknap és közlemény – a hibás tételt exportálás előtt jelzi.",
      "Tételszám és végösszeg megerősítése minden fájlkészítés előtt.",
      "16 jegyű számlaszám automatikus kiegészítése, kötőjeles beírás támogatása.",
      "Ékezetes partnernevek helyes kezelése a bankok által várt kódolással.",
    ],
    tiers: [
      {
        id: "egygepes_licenc",
        label: "Egygépes licenc",
        price: 19900,
        note: "Egyszeri díj, egy munkaállomásra.",
        priceId: "utalasi_csomag_keszito_egygepes_licenc",
      },
      {
        id: "irodai_licenc_5_gepig",
        label: "Irodai licenc (5 gépig)",
        price: 34900,
        note: "Egyszeri díj, akár öt gépre.",
        priceId: "utalasi_csomag_keszito_irodai_licenc_5_gepig",
      },
    ],
    download: {
      fileName: "Utalasi_csomag_keszito.xlsm",
      storagePath: "utalasi-csomag-keszito/Utalasi_csomag_keszito.xlsm",
    },
  },
  {
    slug: "beszamolo-2025",
    name: "XLNT Beszámoló 2025",
    tagline: "Éves beszámoló, kiegészítő melléklet, OBR-fájl és adóbevallások — egyetlen Excel-fájlban",
    status: "available",
    priceId: "beszamolo_2025_egy_ceg",
    price: 14900,
    currency: "HUF",
    image: closeupImg,
    metaTitle: "XLNT Beszámoló 2025 | EXCELlent",
    metaDescription: "Éves beszámoló, kiegészítő melléklet, OBR-fájl és adóbevallások — egyetlen Excel-fájlban. Ár: 14 900 Ft-tól.",
    intro: [
      "A zárási szezonban ritkán a szakmai döntés viszi el az időt. Az idő nagy része az adatok mozgatásával megy el: a főkönyvből a mérlegbe, a mérlegből az adószámításba, onnan a bevallásokba, majd vissza a kiegészítő mellékletbe. És minden egyes átvezetésnél ott a kérdés, hogy tényleg egyezik-e minden mindennel.",
      "Ez a fájl ezt a láncot kapcsolja össze. A főkönyvi kivonatot egyszer tölti fel, a többi — a beszámoló, a kiegészítő melléklet, az OBR-fájl, a társasági adó vagy KIVA bevallás és a helyi iparűzési adó bevallás — ugyanabból az adatállományból készül. Így egymással is, és a főkönyvvel is egyezik.",
      "Nem veszi át a könyvelő szakmai döntéseit, és nem is akarja: minden számítás nyitott, minden cella követhető, minden besorolás felülírható. Azt a munkát veszi le a válláról, ami mechanikus.",
    ],
    features: [
      "Főkönyvi kivonat beolvasása külön import lapokra: tárgyév, előző év, és egy harmadik oszlop (például évközi vagy csoportszintű adat).",
      "Automatikus besorolás mérleg- és eredménykimutatás-sorokra, saját mapping-lapok alapján — a besorolás bármikor felülírható, az átsorolás nem igényel képletírást.",
      "Mérlegleltár és Eredménykimutatás leltár: minden beszámolósor mögött ott van a főkönyvi alátámasztás, soronként.",
      "Mérleg és eredménykimutatás nyomtatható, közzétételre kész formában.",
      "Fedlap és üzleti jelentés külön munkalapon.",
      "Teljes szöveges kiegészítő melléklet, a cég adataival automatikusan feltöltve; a szövegtörzs szabadon szerkeszthető.",
    ],
    tiers: [
      {
        id: "egy_ceg",
        label: "Egy cég",
        price: 14900,
        note: "Egyetlen adószámra kötve.",
        priceId: "beszamolo_2025_egy_ceg",
      },
      {
        id: "konyveloiroda",
        label: "Könyvelőiroda",
        price: 34900,
        note: "Adószám-korlátozás nélkül, tetszőleges számú cégre.",
        priceId: "beszamolo_2025_konyveloiroda",
      },
      {
        id: "iroda_2026_elovetel",
        label: "Iroda + 2026 elővétel",
        price: 54900,
        note: "A 2025-ös verzió, és mellé a 2026-os is, amint elkészül.",
        priceId: "beszamolo_2025_iroda_2026_elovetel",
      },
    ],
    download: {
      fileName: "XLNT_Beszamolo_2025.xlsm",
      storagePath: "beszamolo-2025/XLNT_Beszamolo_2025.xlsm",
    },
  },
  {
    slug: "cegkivonat-excel-konverter",
    name: "Cégkivonat → Excel konverter",
    tagline: "Magyar cégkivonatok és NAV adatlapok – egy kattintással, tiszta Excel táblázatban",
    status: "available",
    priceId: "cegkivonat_excel_konverter_orokos_licenc",
    price: 12900,
    currency: "HUF",
    image: termekekImg,
    metaTitle: "Cégkivonat → Excel konverter | EXCELlent",
    metaDescription: "Magyar cégkivonatok és NAV adatlapok – egy kattintással, tiszta Excel táblázatban. Ár: 12 900 Ft-tól.",
    intro: [
      "Ha valaha is bemásoltad már kézzel egy cégkivonat adatait Excelbe – tudod, mennyi idő. Ez a program PDF-ből automatikusan kinyeri az összes adatot, és átlátható, azonnal használható Excel fájlt készít belőle.",
    ],
    features: [
      "Minden adat egy helyen – cégnév, székhely, adószám, ügyvezetők, tagok, tevékenységi körök, bankszámlák, telephelyek, szekciókra bontva.",
      "Szkennelt PDF is megy – ha a cégkivonatod fénykép vagy szkennelt dokumentum, a program beépített karakterfelismeréssel olvassa ki.",
      "Kétféle nézet egy Excelben – strukturált adatlap és a PDF teljes szövege.",
      "Egyszerű felület – tallózd ki a PDF-et, a kimeneti fájlnév automatikusan képződik.",
      "Egyszeri vásárlás – egyszeri összegért korlátlan fájl átalakítható.",
      "Önálló program, telepítés nélkül futtatható (.exe), nem igényel Pythont vagy egyéb előzetes szoftvert.",
    ],
    tiers: [
      {
        id: "orokos_licenc",
        label: "Örökös licenc",
        price: 12900,
        note: "Egyszeri vásárlás, korlátlan, örökös felhasználási jog.",
        priceId: "cegkivonat_excel_konverter_orokos_licenc",
      },
    ],
    download: {
      fileName: "cegkivonat.exe",
      storagePath: "cegkivonat-excel-konverter/cegkivonat.exe",
    },
  },
  {
    slug: "havi-riport",
    name: "XLNT Havi Riport",
    tagline: "Teljes havi pénzügyi riportcsomag könyvelőknek – egyetlen Excelben",
    status: "available",
    priceId: "havi_riport_egyszeri_licenc",
    price: 49900,
    currency: "HUF",
    image: calcImg,
    metaTitle: "XLNT Havi Riport | EXCELlent",
    metaDescription: "Teljes havi pénzügyi riportcsomag könyvelőknek – egyetlen Excelben. Ár: 29 900 Ft-tól.",
    intro: [
      "Egy import, több mint 25 kész riportlap. Betöltöd a könyvelőprogram főkönyvi kivonatát vagy kartonját, megnyomsz egy gombot, és a munkafüzet feltölti a mérleget, az eredménykimutatást (éves, egyszerűsített és havi bontásban), a cash flow-t, a vevő- és szállítókorosítást, az ÁFA-összesítőt, a dashboardot és a kiegészítő melléklet részletezőit – mindezt a saját géped Exceljében, adatkapcsolat és havidíj nélkül.",
      "Egyetlen gombbal legenerálja a Magyar Könyvvizsgálói Kamara AuditXML2 (v1.0.23.0) adatexport-fájlját a főkönyvi tételekből. A generátor a kamara hivatalos XSD-sémájához igazítva ellenőrzi az adatokat (adószám, pénznem, dátumok, mezőhosszak), és BOM nélküli UTF-8 fájlt ír – amit a kamarai ellenőrző is hibátlannak fogad el.",
    ],
    features: [
      "Mérleg és eredménykimutatás — éves, egyszerűsített és teljes havi bontásban, külön lapokon – a havi oszlopok összege mindig kiadja az éves zárót.",
      "Cash flow — a számviteli törvény 7. melléklete szerinti szerkezetben, kézi korrekciós lehetőséggel, havi bontással is.",
      "Vevő- és szállítókorosítás — korosztályok szerint, plusz a Top10 legnagyobb és a Top10 legrégebben lejárt tétel kiemelve.",
      "ÁFA-összesítő és tagi kölcsön — külön lapokon, a folyószámlákból.",
      "Pénzügyi elemzés — bevételi és költségstruktúra arányokkal, valamint kulcsmutatók: eredményhányad, költségarány, likviditás, saját tőke arány.",
      "Költség-anomáliák — automatikusan jelzi a kiugró tételeket (átlag + 2 szórás) és a hiányzó hónapokat (elmaradt rendszeres költség), KRITIKUS / FIGYELMEZTETÉS súlyozással – segít elkapni a könyvelési hibákat és a hiányzó bizonylatokat.",
      "Befektetési tükör — immateriális javak és tárgyi eszközök mozgástáblája (nyitó bruttó, növekedés, csökkenés, écs, nettó) a kiegészítő melléklet szerkezetében.",
      "Saját tőke mozgástábla, időbeli elhatárolások, egyéb követelések/kötelezettségek — az utóbbinál külön jelölve, mi került átsorolásra.",
      "Szerkeszthető sorterv — a mérleg- és eredménysorokat a saját számlatükrödhöz igazíthatod – nincs beégetett számlakiosztás.",
      "Nyers import bármely programból — RLB, Kulcs-Soft, Novitax és társai exportját változatlanul beolvashatod, onnan képlettel viszed át.",
    ],
    tiers: [
      {
        id: "egyszeri_licenc",
        label: "Egyszeri licenc",
        price: 49900,
        note: "Örökös használat, 1 munkaállomás.",
        priceId: "havi_riport_egyszeri_licenc",
      },
      {
        id: "eves_licenc",
        label: "Éves licenc",
        price: 29900,
        note: "Éves frissítésekkel, jogszabálykövetéssel.",
        priceId: "havi_riport_eves_licenc",
      },
    ],
    download: {
      fileName: "XLNT_Havi_Riport.xlsm",
      storagePath: "havi-riport/XLNT_Havi_Riport.xlsm",
    },
  },
  {
    slug: "havi-riport-en",
    name: "XLNT Monthly Report (English)",
    tagline: "Complete monthly financial reporting pack for accountants – in a single Excel file",
    status: "available",
    priceId: "monthly_report_en_egyszeri_licenc",
    price: 74900,
    currency: "HUF",
    image: biImg,
    metaTitle: "XLNT Monthly Report (English) | EXCELlent",
    metaDescription:
      "English version of the XLNT monthly reporting pack for accountants: 25+ report sheets from one import, MKVK AuditXML2 export. From 49 900 Ft.",
    intro: [
      "One import, more than 25 finished report sheets. Load the trial balance or the ledger export of your accounting software, press one button, and the workbook fills the balance sheet, the income statement (annual, simplified and monthly), the cash flow, the receivables and payables ageing, the VAT summary, the dashboard and the notes-to-the-accounts detail sheets – all in the Excel on your own machine, with no data connection and no monthly fee.",
      "With a single button it generates the Chamber of Hungarian Auditors' AuditXML2 (v1.0.23.0) data-export file from the ledger entries. The generator validates the data against the Chamber's official XSD schema (tax number, currency, dates, field lengths) and writes a UTF-8 file without a BOM – which the Chamber's own checker accepts without errors.",
    ],
    features: [
      "Balance sheet and income statement — annual, simplified and full monthly breakdown on separate sheets; the monthly columns always add up to the annual close.",
      "Cash flow — in the structure of Annex 7 of the Hungarian Accounting Act, with manual correction options and a monthly breakdown.",
      "Receivables and payables ageing — by age bucket, plus the Top 10 largest and the Top 10 longest overdue items.",
      "VAT summary and shareholder loan — on separate sheets, from the current accounts.",
      "Financial analysis — income and cost structure with ratios, plus key indicators: profit margin, cost ratio, liquidity, equity ratio.",
      "Cost anomalies — automatically flags outlier items (mean + 2 std dev) and missing months, with CRITICAL / WARNING severity.",
      "Fixed asset roll-forward — intangible and tangible assets movement table (opening gross, additions, disposals, depreciation, net) in the structure required for the notes.",
      "Equity movement table, accruals and deferrals, other receivables/payables — with reclassifications flagged separately in the latter.",
      "Editable row plan — you can adjust the balance-sheet and income-statement rows to your own chart of accounts; nothing is hard-coded.",
      "Raw import from any software — you can load the export of RLB, Kulcs-Soft, Novitax and the like unchanged, then move it across with formulas.",
      "Built-in branding and sheet protection — yellow cells mark what to fill in; one macro locks every sheet with a password while the input cells stay open.",
    ],
    why: "One-time or annual licence – no monthly fee, no per-report charge. It runs in the Excel on your own machine, so there is no cloud dependency and your data stays with you. Office / multiple PCs: ask for a custom quote based on the number of users.",
    tiers: [
      {
        id: "egyszeri_licenc",
        label: "One-time licence",
        price: 74900,
        note: "Perpetual use, 1 workstation.",
        priceId: "monthly_report_en_egyszeri_licenc",
      },
      {
        id: "eves_licenc",
        label: "Annual licence",
        price: 49900,
        note: "With annual updates and legal-compliance upkeep.",
        priceId: "monthly_report_en_eves_licenc",
      },
    ],
    download: {
      fileName: "XLNT_Monthly_Report_EN.xlsm",
      storagePath: "havi-riport-en/XLNT_Monthly_Report_EN.xlsm",
    },
  },
  {
    slug: "kamatlekerdezo-potlekszamito",
    name: "XLNT Kamatlekérdező és Pótlékszámító",
    tagline: "Késedelmi pótlék, önellenőrzési pótlék és kamatszámítás naponkénti kamattáblával",
    status: "available",
    priceId: "kamatlekerdezo_potlekszamito_egy_adoszam",
    price: 7900,
    currency: "HUF",
    image: accountImg,
    metaTitle: "XLNT Kamatlekérdező és Pótlékszámító | EXCELlent",
    metaDescription: "Késedelmi pótlék, önellenőrzési pótlék és kamatszámítás naponkénti kamattáblával. Ár: 7 900 Ft-tól.",
    intro: [
      "Ha könyvelőként vagy adótanácsadóként dolgozik, valószínűleg Ön is ismeri a helyzetet: egy késedelmi pótlék vagy önellenőrzési pótlék kiszámításához előbb elő kell keresni az adott időszakban érvényes jegybanki alapkamatot, majd napra pontosan végigszámolni a törvényi képletet. Ez a munkafüzet ezt a lépést veszi le a válláról.",
      "Nem varázslatot ígérünk, hanem egy jól átlátható, ellenőrizhető eszközt: minden érték mögött ott a forrás és a jogszabályi hivatkozás. Nézze meg nyugodtan, és döntse el Ön, hogy beilleszthető-e a munkájába.",
    ],
    features: [
      "Naponkénti kamattábla 2020. január 1-jétől a mai napig (és előre is): az év minden napjára kiolvasható az érvényes kamatláb, nem csak tól–ig időszakokra.",
      "Öt kamat- és pótléktípus egy helyen: MNB jegybanki alapkamat, NAV késedelmi pótlék (napi mértékkel), önellenőrzési pótlék (alap és ismételt), Ptk. szerinti késedelmi kamat, valamint EURIBOR 1/3/6/12 hó.",
      "Külön számoló lapok: elég beírni a tól–ig időszakot és az összeget, és azonnal megkapja az arra az időszakra esedékes kamatot vagy pótlékot.",
      "Jövőbeli időpont is megadható — a jövőre eső napokra a program a jelenlegi (utolsó ismert) kamatlábbal számol.",
      "Jogszabályi pontosság: az Art. 209. § és 212. §, valamint a Ptk. 6:48. § és 6:155. § szerinti számítás, a napi mérték három tizedesjegyre csonkolva, ahogy a törvény előírja.",
      "Egygombos frissítés: az MNB alapkamat és az EURIBOR internetről tölthető — VBA makróval vagy Power Query-vel.",
      "Átlátható forrásmegjelölés: minden naphoz látszik, hogy tény- vagy jövőbeli (a mai napon túli) érték.",
    ],
    tiers: [
      {
        id: "egy_adoszam",
        label: "Egy adószám",
        price: 7900,
        note: "Egyéni vállalkozó vagy egyetlen cég saját könyvelése.",
        priceId: "kamatlekerdezo_potlekszamito_egy_adoszam",
      },
      {
        id: "konyveloiroda",
        label: "Könyvelőiroda",
        price: 24900,
        note: "Egy iroda, korlátlan ügyfél és adószám.",
        priceId: "kamatlekerdezo_potlekszamito_konyveloiroda",
      },
      {
        id: "korlatlan",
        label: "Korlátlan",
        price: 49900,
        note: "Több telephely / hálózat, vagy viszonteladói felhasználás.",
        priceId: "kamatlekerdezo_potlekszamito_korlatlan",
      },
    ],
    download: {
      fileName: "Kamatlekerdezo_2020-2030.xlsm",
      storagePath: "kamatlekerdezo-potlekszamito/Kamatlekerdezo_2020-2030.xlsm",
    },
  },
  {
    slug: "utnyilvantartas-kikuldetesi-rendelveny",
    name: "Útnyilvántartás és Kiküldetési rendelvény",
    tagline: "Saját gépjárműves és kiküldetéses elszámolás a hatályos magyar szabályok szerint, magyarul és angolul",
    status: "available",
    priceId: "utnyilvantartas_kikuldetesi_rendelveny_1_eves_ceges_licenc",
    price: 12900,
    currency: "HUF",
    image: businessImg,
    metaTitle: "Útnyilvántartás és Kiküldetési rendelvény | EXCELlent",
    metaDescription: "Saját gépjárműves és kiküldetéses elszámolás a hatályos magyar szabályok szerint, magyarul és angolul. Ár: 12 900 Ft-tól.",
    intro: [
      "Egyetlen, gondosan felépített Excel-fájl, amellyel a saját gépjárműves és a kiküldetéses elszámolásokat a hatályos magyar szabályok szerint készítheti el – magyarul és angolul is. Egy lapon egész havi, akár több úttal; a napokat, az árfolyamot és a könyvelési tételeket a rendszer számítja. Nincs havidíj: letölti, és a következő elszámolásnál már használhatja.",
      "Minden csomag: korlátlan munkatárs és jármű, magyar + angol lapok, RLB-export, PDF-gomb, élő NAV/MNB adatok. A licenc adószámhoz és időtartamhoz köthető.",
    ],
    features: [
      "Havi, több-utas kiküldetési: egy lapon akár 3–5 út, útonkénti és havi összesítéssel.",
      "Automatikus napok-számítás: külföld a 285/2011 Korm. r. szerint (24 órás napok + a tört rész ≥ 8 óra egész nap), belföld 6 órás küszöb.",
      "Automatikus MNB-árfolyam tételenként: a Szja tv. 6.§(4)a szerint a tétel dátumát megelőző hónap 15. napi árfolyamon (hétvégére/ünnepre az utolsó jegyzettel).",
      "Adómentes/adóköteles napidíj: külföld 30% / max. 15 EUR, fuvarozó 85 EUR, belföld szabályai – Jogcím (Általános/Fuvarozó) választással, automatikusan.",
      "Automatikus kontírozás: a költségtípusból a T/K főkönyvi számok maguktól kitöltődnek; taxi, parkolás és autópálya külön (a nem levonható ÁFA jelezve).",
      "Könyvelési összesítő + RLB vegyes CSV export: gombnyomásra RLB-be importálható vegyes tétel, a költségek soronkénti dátummal és árfolyammal.",
      "PDF-mentés gomb mind a 4 főlapon; hónap-legördülő és automatikus elszámolási dátum (a hónap utolsó napja).",
      "Élő adatok: a NAV üzemanyagár és az MNB-árfolyam a beépített lekérdezésekből frissül; minden a 2026-os hatályos értékekre ellenőrizve.",
      "Kétnyelvű: magyar Kiküldetési rendelvény és angol „Travel Expense report”, azonos számítási logikával.",
    ],
    tiers: [
      {
        id: "1_eves_ceges_licenc",
        label: "1 éves céges licenc",
        price: 12900,
        note: "1 adószám · 12 hónapig érvényes.",
        priceId: "utnyilvantartas_kikuldetesi_rendelveny_1_eves_ceges_licenc",
      },
      {
        id: "orokos_ceges_licenc",
        label: "Örökös céges licenc",
        price: 34900,
        note: "1 adószám · időbeli korlát nélkül.",
        priceId: "utnyilvantartas_kikuldetesi_rendelveny_orokos_ceges_licenc",
      },
      {
        id: "konyveloiroda_licenc",
        label: "Könyvelőiroda licenc",
        price: 79900,
        note: "Adószám-kötés nélkül, bármely ügyfél adószámára · örökös.",
        priceId: "utnyilvantartas_kikuldetesi_rendelveny_konyveloiroda_licenc",
      },
    ],
    download: {
      fileName: "Utnyilvantartas_Kikuldetesi_rendelveny.xlsm",
      storagePath: "utnyilvantartas-kikuldetesi-rendelveny/Utnyilvantartas_Kikuldetesi_rendelveny.xlsm",
    },
  },
  {
    slug: "szamviteli-konszolidalo",
    name: "XLNT Számviteli Konszolidáló",
    tagline: "Összevont (konszolidált) éves beszámoló Excelben — lépésről lépésre, ellenőrzött egyezőségekkel, magyarul és angolul",
    status: "available",
    priceId: "szamviteli_konszolidalo_egy_cegcsoport",
    price: 79900,
    currency: "HUF",
    image: controllingImg,
    metaTitle: "XLNT Számviteli Konszolidáló | EXCELlent",
    metaDescription: "Összevont (konszolidált) éves beszámoló Excelben, a magyar számviteli törvény szerint — lépésről lépésre, ellenőrzött egyezőségekkel. Ár: 79 900 Ft-tól.",
    intro: [
      "Összevont (konszolidált) éves beszámoló Excelben — lépésről lépésre, ellenőrzött egyezőségekkel, magyarul és angolul.",
      "Eszközök = Források ✓ · Napló: Tartozik = Követel ✓ · Eredmény = Mérleg szerinti eredmény ✓ · Cash flow = Pénzeszközök változása ✓.",
      "A konszolidálás nehéz része a szerkezet és az egyezőség. Ezt veszi le a válláról a program: a mérleg, az eredménykimutatás és a cash flow a törvényi mellékletek szerint, készen áll; a korrekciók egyetlen naplóba kerülnek, ahonnan a beszámoló automatikusan összeáll, beépített egyezőség-ellenőrzésekkel.",
    ],
    features: [
      "Törvényi séma: Teljes mérleg, eredmény, cash flow — Mérleg „A” és „B” változat, összköltség és forgalmi költség eljárású eredménykimutatás, cash flow a 7. sz. melléklet szerint – az 1., 2., 3., 6. és 7. melléklet alapján.",
      "Motor: Napló-alapú konszolidáció — A korrekciók egy naplóban, tartozik/követel bontásban. A munkatábla soronként számol: egyedi összeg + kvóta × árfolyam + korrekció = konszolidált érték.",
      "Lépések: Konszolidációs generátorok — Tőkekonszolidáció, adósság-, közbenső eredmény-, bevétel/ráfordítás-konszolidálás, equity (társult) és adókülönbözet – gombnyomásra naplózva.",
      "Deviza: Több pénznem kezelése — Cégenkénti záró- és átlagárfolyam, automatikus átszámítás; az árfolyam-különbözet a saját tőkében jelenik meg (Szt. 22.§).",
      "Évváltás: Előző évi adatok átvétele — A tárgyévi konszolidált adatok átfordíthatók előző évvé; a kimutatások tárgyév/előző év bontásban állnak.",
      "Ellenőrzés: Beépített egyezőségi próbák — Eszközök = források, napló T = K, eredmény = mérleg szerinti eredmény, cash flow = pénzeszköz-változás – egy helyen, a kezdőlapon is.",
      "Kétnyelvű: Magyar / angol — Egy szerkeszthető szótár hajtja az egész munkafüzetet; a nyelv váltása minden feliratot – a gombokét is – átállít.",
      "Márka: Saját arculat — A könyvelőiroda logója minden fő lapra kerülhet, a saját weboldalára mutató hivatkozással.",
      "OBR: e-beszámoló-fájl generátor — Egy gombnyomással elkészíti a hivatalos OBR-portálra feltölthető .obr fájlt a kész konszolidált mérlegből és eredménykimutatásból, a kötelező mellékletekkel (PDF) becsomagolva.",
    ],
    why: "A konszolidálás nehéz része a szerkezet és az egyezőség. Ezt veszi le a válláról a program: a mérleg, az eredménykimutatás és a cash flow a törvényi mellékletek szerint, készen áll; a korrekciók egyetlen naplóba kerülnek, ahonnan a beszámoló automatikusan összeáll, beépített egyezőség-ellenőrzésekkel.",
    steps: [
      { title: "1. Alapbeállítások", text: "Anyavállalat adatai, üzleti év, pénznem, adókulcs, nyelv." },
      { title: "2. Konszolidációs kör", text: "Cégek felvétele, bevonás módja (teljes / kvótás / equity / kivont), tulajdoni hányad." },
      { title: "3. Egyedi beszámolók bevitele", text: "Cégenkénti, már egységesített mérleg- és eredménykimutatás-adatok." },
      { title: "4. Tőkekonszolidáció", text: "Részesedés könyv szerinti értéke a megillető saját tőkével szemben; különbözet, külső tagok." },
      { title: "5. Adósságkonszolidálás", text: "A csoporton belüli követelések és kötelezettségek kiszűrése." },
      { title: "6. Közbenső eredmény kiszűrése", text: "A záró készletben / eszközben maradt csoporton belüli eredmény kiszűrése." },
      { title: "7. Bevételek és ráfordítások konszolidálása", text: "Belső árbevétel-ráfordítás párok és a csoporton belüli osztalék kiszűrése." },
      { title: "8. Társult vállalkozások (equity)", text: "Társult vállalkozások értékelése tőkerészesedési módszerrel." },
      { title: "9. Adókülönbözet", text: "A konszolidálás miatti eredménykülönbözetre jutó számított társasági adó." },
      { title: "10. Konszolidációs napló", text: "Minden korrekció egy helyen, tartozik/követel bontásban. Ez hajtja a munkatáblát." },
      { title: "11. Konszolidációs munkatábla", text: "Egyedi adatok összege + korrekciók = konszolidált érték, soronként." },
      { title: "12. Konszolidált mérleg", text: "Az összevont (konszolidált) mérleg tárgyév / előző év bontásban." },
      { title: "13. Konszolidált eredménykimutatás", text: "Összköltség eljárású összevont eredménykimutatás." },
      { title: "14. Ellenőrzések", text: "Egyezőségi próbák: mérlegfőösszeg, napló T=K, eredményegyezés." },
      { title: "15. Sorséma (szerkeszthető)", text: "A mérleg- és eredménysorok listája; itt lehet átnevezni vagy bővíteni." },
      { title: "16. Súgó és jogszabályi háttér", text: "Lépésenkénti útmutató és a vonatkozó törvényhelyek." },
      { title: "17. Előző évi (nyitó) adatok", text: "Az előző évi konszolidált mérleg és eredménykimutatás – ebből számol a cash flow." },
      { title: "18. Konszolidált cash flow-kimutatás", text: "A Szt. 7. sz. melléklete szerinti szerkezetben, a konszolidált adatokból levezetve." },
      { title: "19. Konszolidált mérleg – „B” változat", text: "Ugyanazok az adatok, a „B” változat szerinti tagolásban." },
      { title: "20. Eredménykimutatás – összköltséges és forgalmi változat", text: "A 3. sz. melléklet szerinti tagolás. A program az eredménykimutatás összköltséges és forgalmi változatát is tudja." },
      { title: "21. OBR (e-beszámoló) fájl elkészítése", text: "A kész konszolidált mérlegből és eredménykimutatásból egy gombnyomással elkészíti a hivatalos OBR-portálra feltölthető .obr fájlt, a kötelező mellékletekkel (PDF) becsomagolva." },
    ],
    tiers: [
      {
        id: "egy_cegcsoport",
        label: "Egy cégcsoport",
        price: 79900,
        note: "Egy anyavállalat (egy adószám) alatti csoport konszolidálásához.",
        priceId: "szamviteli_konszolidalo_egy_cegcsoport",
      },
      {
        id: "konyveloiroda_korlatlan",
        label: "Könyvelőiroda / korlátlan",
        price: 149900,
        note: "Több ügyfél-cégcsoport konszolidálásához, korlátozás nélkül.",
        priceId: "szamviteli_konszolidalo_konyveloiroda_korlatlan",
      },
    ],
    download: {
      fileName: "XLNT_Konszolidalo_v1.5.xlsm",
      storagePath: "szamviteli-konszolidalo/XLNT_Konszolidalo_v1.5.xlsm",
    },
  },
  {
    slug: "ifrs-konszolidalo",
    name: "XLNT IFRS Konszolidáló",
    tagline: "Összevont (konszolidált) IFRS pénzügyi kimutatások Excelben – az IFRS 18 kötelező részösszegeivel, magyarul és angolul",
    status: "available",
    priceId: "ifrs_konszolidalo_egy_cegcsoport",
    price: 149900,
    currency: "HUF",
    image: ifrsImg,
    metaTitle: "XLNT IFRS Konszolidáló | EXCELlent",
    metaDescription: "Konszolidált IFRS pénzügyi kimutatások Excelben – IFRS 18 részösszegekkel, goodwill- és devizaszámítással, magyarul és angolul. Ár: 149 900 Ft-tól.",
    intro: [
      "Összevont (konszolidált) IFRS pénzügyi kimutatások Excelben – az IFRS 18 kötelező részösszegeivel, magyarul és angolul. IFRS 10 · IFRS 3 · IAS 28 · IAS 21 · IAS 36 · IAS 7 · IFRS 18.",
      "A munkafüzet az IFRS 18 (Presentation and Disclosure in Financial Statements) szerinti bemutatásra épül. Az IFRS 18 a 2027. január 1-jén vagy azt követően kezdődő időszakokra hatályos (korábbi alkalmazás megengedett), felváltja az IAS 1-et, és az EU 2026 februárjában befogadta. Mivel az áttérés visszamenőleges, a 2026-os összehasonlító adatokat is az új szerkezetben kell bemutatni.",
      "Az eredménykimutatás az IFRS 18 öt kategóriájában és a két kötelező részösszeggel áll elő: üzemi eredmény, valamint finanszírozás és nyereségadók előtti eredmény.",
    ],
    features: [
      "IFRS 18 – Öt kategória, két részösszeg: az eredménykimutatás működési, befektetési, finanszírozási, nyereségadó és megszűnt tevékenység kategóriákban, üzemi eredmény és finanszírozás előtti eredmény részösszegekkel; az eredmény anyavállalatra és NCI-re bontva.",
      "IFRS 3 – Akvizíció és goodwill: átadott ellenérték, NCI (valós érték vagy arányos rész – IFRS 3.19), azonosítható nettó eszközök → goodwill automatikusan. Nyereséges vétel esetén azonnal eredménybe.",
      "IAS 36 – Goodwill értékvesztés-teszt: a goodwill nem amortizálható, évente tesztelendő; a program egyezteti a mérleg szerinti goodwillt a számított értékkel és az elszámolt értékvesztéssel.",
      "IAS 21 – Devizaátszámítás: cégenkénti záró- és átlagárfolyam; mérlegtételek záró, eredménytételek átlagárfolyamon; az átszámítási különbözet az egyéb átfogó jövedelemben (OCI).",
      "IAS 28 – Equity módszer: társult és közös vezetésű vállalkozások tőkerészesedési értékelése, az eredményből és az OCI-ból való részesedéssel.",
      "IAS 7 – Cash flow (IFRS 18 után): indirekt módszer az üzemi eredményből kiindulva, „működési cash flow a nyereségadók előtt” részösszeggel; az osztalékfizetés mindig finanszírozási.",
      "IAS 1 – Saját tőke változása: tőkeelemenkénti levezetés nyitótól záróig, a nem ellenőrző részesedésekkel – IFRS szerint kötelező kimutatás.",
      "Ellenőrzés – Nyolc egyezőségi próba: mérlegfőösszeg, napló T=K, tőkekimutatás, cash flow, eredménymegbontás, goodwill-egyeztetés – egy helyen, a kezdőlapon is.",
    ],
    why: "Egyszeri megvásárlás, időbeli korlát nélkül. A program a bevitt adatokból számol. A séma az IAS 1.54 minimumára és az IFRS 18 kategóriáira épül – mivel az IFRS-ben nincs kötelező formátum, ez szabadon szerkeszthető keret. Makrós Excel-munkafüzet: Windows + asztali Excel 2010 vagy újabb szükséges, engedélyezett makrókkal.",
    steps: [
      { title: "1. Alapbeállítások", text: "Anyavállalat adatai, beszámolási időszak, pénznem, adókulcs, nyelv, bemutatási mód." },
      { title: "2. Konszolidációs kör (IFRS 10)", text: "Társaságok, ellenőrzés, tulajdoni hányad, NCI értékelése (IFRS 3.19), pénznem és árfolyamok." },
      { title: "3. Egyedi pénzügyi kimutatások", text: "Társaságonként, IFRS-re már átdolgozott mérleg-, eredmény- és OCI-adatok." },
      { title: "4. Akvizíciós elszámolás (IFRS 3)", text: "Átadott ellenérték, azonosítható nettó eszközök valós értéke, NCI, goodwill számítása." },
      { title: "5. Csoporton belüli egyenlegek (IFRS 10)", text: "Csoporton belüli követelések és kötelezettségek teljes kiszűrése." },
      { title: "6. Nem realizált eredmény", text: "Készletben és eszközökben maradt csoporton belüli nem realizált eredmény kiszűrése." },
      { title: "7. Csoporton belüli bevételek és ráfordítások", text: "Belső árbevétel-ráfordítás párok és a csoporton belüli osztalék kiszűrése." },
      { title: "8. Társult és közös vezetésű vállalkozások (IAS 28)", text: "Tőkerészesedési (equity) módszer szerinti értékelés." },
      { title: "9. Halasztott adó (IAS 12)", text: "A konszolidációs korrekciók átmeneti különbözeteire jutó halasztott adó." },
      { title: "10. Goodwill értékvesztés-teszt (IAS 36)", text: "A goodwill nem amortizálható; évente értékvesztés-tesztet kell végezni." },
      { title: "11. Konszolidációs napló", text: "Minden korrekció egy helyen, tartozik/követel bontásban. Ez hajtja a munkatáblát." },
      { title: "12. Konszolidációs munkatábla", text: "Egyedi adatok összege + korrekciók = konszolidált érték, soronként." },
      { title: "13. Konszolidált pénzügyi helyzet kimutatása", text: "Az IAS 1.54 szerinti minimum sortételekkel, tárgyév / előző év bontásban." },
      { title: "14. Konszolidált eredmény és OCI", text: "Az IFRS 18 kategóriái és a két kötelező részösszeg, majd az egyéb átfogó jövedelem." },
      { title: "15. Saját tőke változásának kimutatása", text: "Tőkeelemenkénti levezetés nyitótól záróig, NCI-vel együtt." },
      { title: "16. Konszolidált cash flow (IAS 7)", text: "Indirekt módszer – az IFRS 18 módosítása szerint az üzemi eredményből kiindulva." },
      { title: "17. Előző évi (nyitó) adatok", text: "Az előző évi konszolidált adatok – ebből számol a cash flow és az összehasonlító oszlop." },
      { title: "18. Ellenőrzések", text: "Egyezőségi próbák: mérlegfőösszeg, napló T=K, tőkekimutatás, cash flow." },
      { title: "19. Sorséma (szerkeszthető)", text: "Az IFRS nem ír elő kötött formátumot – itt szabadon átnevezhet vagy bővíthet." },
      { title: "20. Súgó és standardhivatkozások", text: "Lépésenkénti útmutató és a vonatkozó IFRS standardok." },
    ],
    tiers: [
      {
        id: "egy_cegcsoport",
        label: "Egy cégcsoport",
        price: 149900,
        note: "Egy anyavállalat alatti csoport IFRS-konszolidálásához.",
        priceId: "ifrs_konszolidalo_egy_cegcsoport",
      },
      {
        id: "konyveloiroda_korlatlan",
        label: "Könyvelőiroda / korlátlan",
        price: 299900,
        note: "Több ügyfél-cégcsoport konszolidálásához, korlátozás nélkül.",
        priceId: "ifrs_konszolidalo_konyveloiroda_korlatlan",
      },
    ],
    download: {
      fileName: "XLNT_IFRS_Konszolidalo_v1.0.xlsm",
      storagePath: "ifrs-konszolidalo/XLNT_IFRS_Konszolidalo_v1.0.xlsm",
    },
  },
  {
    slug: "penzszam-kulfoldi-szamla-import",
    name: "PÉNZSZÁM Bejövő Külföldi Számla Import",
    tagline: "Excel-alapú CSV generáló és partner-importáló eszköz könyvelőirodáknak · EU & harmadik ország",
    status: "available",
    priceId: "penzszam_kulfoldi_szamla_import_egyszeri_licenc_egyetlen_iro",
    price: 12900,
    currency: "HUF",
    image: auditImg,
    metaTitle: "PÉNZSZÁM Bejövő Külföldi Számla Import | EXCELlent",
    metaDescription: "Excel-alapú CSV generáló és partner-importáló eszköz könyvelőirodáknak · EU & harmadik ország. Ár: 12 900 Ft-tól.",
    intro: [
      "Ha rendszeresen könyvelsz EU-s vagy harmadik országból érkező bejövő számlákat PÉNZSZÁM rendszerben, ez az eszköz a manuális adatrögzítés terhét veszi le. A partnereket közvetlenül a PÉNZSZÁMBÓL importálod, a számlákat Excelben rögzíted – egy gombnyomással kész a pontosan 84 mezős, kötelező ellenőrző sorral ellátott CSV fájl.",
    ],
    features: [
      "Partner import a PÉNZSZÁMBÓL – az exportált partner CSV egyetlen gombnyomással beolvasható a Partner Törzs lapra; az oszlopok (Psajatkod, Pnev, Pvaros, Padoszam stb.) fejléc alapján automatikusan azonosítódnak.",
      "Szállító Törzs auto-kitöltés – Partner kód (Psajatkod) megadása után a szállítónév, cím, adószám, EU adószám, ország, főkönyvi szám és ÁFA kulcs automatikusan kitöltődik; a partner kód legördülőből választható az importált Partner Törzsből.",
      "84 mezős PÉNZSZÁM struktúra – a Financia Kft. feladás specifikáció szerinti pontos formátum: fejsor (Tetelszam=0) + tételsor(ok) + kötelező ellenőrző sor (Forgtipus=0).",
      "Kötelező ellenőrző sor automatikusan – a CSV végére automatikusan kerül a helyes összesítő ellenőrző sor a nettó összeggel és rekordszámmal.",
      "Könyvelési időszak auto-számítás – ÉÉÉÉHH formátumban automatikusan képződik a számla keltéjéből, felülírható.",
      "Devizakezelés – EUR, USD, CHF és más devizák; árfolyam 6 tizedesjegyig; deviza nettó és ÁFA külön lila mezőkben.",
      "ÁFA kulcs legördülő – numerikus (27, 5, 0) és betűs (TM, AM, ME, EU0) kulcsok egyaránt.",
      "Validáció – generáláskor ellenőrzi a kötelező mezőket és figyelmeztet a hiányosságokra.",
      "100 számlasor befogadóképesség egyszerre.",
    ],
    tiers: [
      {
        id: "egyszeri_licenc_egyetlen_iro",
        label: "Egyszeri licenc – egyetlen iroda",
        price: 12900,
        note: "Korlátlan felhasználás, frissítések 1 évig díjmentesen.",
        priceId: "penzszam_kulfoldi_szamla_import_egyszeri_licenc_egyetlen_iro",
      },
    ],
    download: {
      fileName: "Penzszam_Szamla_Import.xlsm",
      storagePath: "penzszam-kulfoldi-szamla-import/Penzszam_Szamla_Import.xlsm",
    },
  },
  {
    slug: "pdf-excel-konverter",
    name: "PDF → Excel konverter",
    tagline: "Bármilyen PDF tartalma – szöveg, táblázat, kép – egy kattintással Excelbe, az eredeti elrendezést megőrizve",
    status: "available",
    priceId: "pdf_excel_konverter_orokos_licenc",
    price: 12900,
    currency: "HUF",
    image: pdfExcelImg,
    metaTitle: "PDF → Excel konverter | EXCELlent",
    metaDescription: "Bármilyen PDF tartalma – szöveg, táblázat, kép – egy kattintással Excelbe, az eredeti elrendezést megőrizve. Ár: 12 900 Ft-tól.",
    intro: [
      "A legtöbb PDF→Excel konverter csak a nyers szöveget önti ki, formázás és rendszer nélkül. Ez a program másképp dolgozik: megtartja a betűméretet, a kiemeléseket, a táblázatok szerkezetét és a beágyazott képeket is – úgy, hogy az Excel fájl tényleg hasonlítson az eredeti dokumentumra.",
      "Akkor is működik, ha a PDF szkennelt vagy fényképként mentett dokumentum – ilyenkor a program beépített karakterfelismeréssel (OCR) olvassa ki a szöveget, magyar és angol nyelven egyaránt.",
    ],
    features: [
      "Formázás-hű átalakítás – a szöveg betűmérete, kiemelései és a táblázatok szerkezete megmarad.",
      "Képek is bekerülnek – logók, ábrák, fényképek automatikusan átkerülnek az Excel fájlba.",
      "Szkennelt PDF is megy – beépített OCR motor, magyar és angol nyelven, nem kell külön program.",
      "Bármilyen dokumentumtípus – szerződés, jelentés, kimutatás, szkennelt papír.",
      "Jól követhető napló – látod, mi történik feldolgozás közben.",
      "Egyszerű, áttekinthető felület – tallózd ki a PDF-et, a kimeneti fájlnév automatikusan képződik.",
      "Önálló program, telepítés nélkül futtatható (.exe), nem igényel Pythont vagy egyéb előzetes szoftvert.",
    ],
    tiers: [
      {
        id: "orokos_licenc",
        label: "Örökös licenc",
        price: 12900,
        note: "Egyszeri vásárlás · korlátlan · örökös felhasználási jog.",
        priceId: "pdf_excel_konverter_orokos_licenc",
      },
    ],
    download: {
      fileName: "pdf2excel.exe",
      storagePath: "pdf-excel-konverter/pdf2excel.exe",
    },
  },
  {
    slug: "rlb-bank-konverter-pro",
    name: "RLB Bank Konverter PRO",
    tagline: "23 bemeneti formátum · kontírozás · Kivonatmágus · PDF automatikus felismerés (OCR-rel)",
    status: "available",
    priceId: "rlb_bank_konverter_pro_pro_egyszeri_licenc",
    price: 29900,
    currency: "HUF",
    image: officeImg,
    metaTitle: "RLB Bank Konverter PRO | EXCELlent",
    metaDescription: "23 bemeneti formátum · kontírozás · Kivonatmágus · PDF automatikus felismerés (OCR-rel). Ár: 29 900 Ft-tól.",
    intro: [
      "A PRO verzió az alap konverter tudásán messze túlmegy: nemcsak konvertál, hanem a banki forgalmat a könyvelői logika szerint előkészítve adja át. Felismeri a NAV-befizetéseket, béreket, bankköltségeket, egyezteti a banki és a könyvelési partnerneveket, és minden konvertált kivonathoz egy áttekinthető Excel-kimutatást is generál – mindezt PDF fájlokból is, OCR-támogatással.",
      "A PRO verzió az elektronikus fájlformátumokon felül a legtöbb nagyobb bank PDF kivonatát is feldolgozza – akár szöveges, akár szkennelt (képes) PDF esetén.",
      "Wise CSV/XLSX (3 változat) · K&H XLS · OTP XLS · Erste CSV · Payoneer CSV · MT940 (SWIFT) · Electra STM · camt XML (ISO 20022)",
    ],
    features: [
      "NAV TB, NAV SZJA, NAV ÁFA, munkabér, bankköltség, kamat, cashback – előre beépített szabályokkal.",
      "A lista szabadon bővíthető, típusonként (csak terhelés / csak jóváírás / mindkettő).",
      "A szabályok automatikusan elmentődnek, legközelebb már csak konvertálni kell.",
    ],
    tiers: [
      {
        id: "pro_egyszeri_licenc",
        label: "PRO egyszeri licenc",
        price: 29900,
        note: "1 gépre, élettartam-frissítéssel, ingyenes kisebb verziókkal.",
        priceId: "rlb_bank_konverter_pro_pro_egyszeri_licenc",
      },
      {
        id: "pro_iroda_csomag_3_gep",
        label: "PRO iroda csomag (3 gép)",
        price: 69900,
        note: "Könyvelőirodáknak, kollégánkénti telepítéssel, közös szabálylistával.",
        priceId: "rlb_bank_konverter_pro_pro_iroda_csomag_3_gep",
      },
    ],
    download: {
      fileName: "RLB_Konverter_PRO.exe",
      storagePath: "rlb-bank-konverter-pro/RLB_Konverter_PRO.exe",
    },
  },
  {
    slug: "rlb-bank-konverter",
    name: "RLB Bank Konverter",
    tagline: "10 banki formátumból RLB-kompatibilis CSV – automatikusan",
    status: "available",
    priceId: "rlb_bank_konverter_egyszeri_licenc",
    price: 14900,
    currency: "HUF",
    image: modernImg,
    metaTitle: "RLB Bank Konverter | EXCELlent",
    metaDescription: "10 banki formátumból RLB-kompatibilis CSV – automatikusan. Ár: 14 900 Ft-tól.",
    intro: [
      "Az egyre több bankot, pénzügyi szolgáltatót és exportformátumot kezelő könyvelési munkában az egyik legnehézkesebb feladat az egységes, rendezetten importálható banki adat előállítása az RLB-be. Ez az eszköz azt a munkát veszi le a válláról, amit eddig soronként, kézzel kellett elvégezni.",
      "Egyetlen ablakban, egyszerre akár tíz különböző formátumú fájlt tölt be, és egy gombnyomással alakítja át az RLB által beolvasható CSV formátumra.",
    ],
    features: [
      "Nem kell többé kézzel gépelni vagy másolni a banki tételeket az RLB-be – a program elvégzi az átalakítást.",
      "Egyszerre akár tucatnyi fájlt dolgoz fel – akár egy negyedévnyi kivonatot is egylépésben.",
      "Electra .stm fájlokban a több számla / több deviza automatikusan külön fájlokba kerül.",
      "A bankszámlaszám mező fájlonként szerkeszthető, forint 3×8-as és deviza IBAN formátumban egyaránt.",
      "Az eredményfájl neve automatikusan épül fel: tulajdonos – bank – deviza – számlaszám vége – időszak.",
    ],
    tiers: [
      {
        id: "egyszeri_licenc",
        label: "Egyszeri licenc",
        price: 14900,
        note: "1 gépre, élettartam-frissítéssel, ingyenes kisebb verziókkal.",
        priceId: "rlb_bank_konverter_egyszeri_licenc",
      },
      {
        id: "iroda_csomag_3_gep",
        label: "Iroda csomag (3 gép)",
        price: 34900,
        note: "Könyvelőirodáknak, kollégánkénti telepítéssel.",
        priceId: "rlb_bank_konverter_iroda_csomag_3_gep",
      },
    ],
    download: {
      fileName: "RLB_Konverter.exe",
      storagePath: "rlb-bank-konverter/RLB_Konverter.exe",
    },
  },
  {
    slug: "rlb-kulfoldi-szamla-import",
    name: "RLB Bejövő Külföldi Számla Import",
    tagline: "Excel-alapú, makróvezérelt importáló eszköz könyvelőirodák számára",
    status: "available",
    priceId: "rlb_kulfoldi_szamla_import_egyszeri_licenc_egyetlen_iro",
    price: 9900,
    currency: "HUF",
    image: closeupImg,
    metaTitle: "RLB Bejövő Külföldi Számla Import | EXCELlent",
    metaDescription: "Excel-alapú, makróvezérelt importáló eszköz könyvelőirodák számára. Ár: 9 900 Ft-tól.",
    intro: [
      "EU-s és harmadik országbeli szállítói számlák könyvelése Excelből, közvetlenül az RLB rendszerbe – manuális újrabegépelés nélkül. Ez az eszköz azoknak a könyvelőirodáknak készült, amelyek rendszeresen kezelnek devizás bejövő számlákat, és időt szeretnének megtakarítani az adatrögzítésen.",
    ],
    features: [
      "Szállító Törzs – szállítóid partnerkóddal, főkönyvi számokkal, ÁFA kóddal és bevallási sorral egyszer felviszed, utána minden automatikus.",
      "Automatikus kitöltés – partnerkód beírásával a szállítónév, szállító FK, költség FK, ÁFA kód, bev.sor, pénznem azonnal kitöltődik.",
      "RLB-kompatibilis ÁFA kódok – pontosan az RLB rendszerben szereplő kódok (27%-os, 5%-os, mentes, 0%-os, stb.), legördülő választóból.",
      "Devizakezelés – EUR, USD, CHF, GBP és más devizák, MNB-árfolyam megadásával automatikus HUF átszámítás.",
      "CSV GENERÁLÁS gombbal – egy kattintás, és kész az RLB Automatikus könyvelés csv-ből menüpontjába közvetlenül betölthető fájl.",
      "SF/ST struktúra – fejléc- és tételsorok az RLB V1.1 specifikáció szerint, pontosvesszővel tagolva.",
      "Validáció – a gomb megnyomásakor ellenőrzi a kötelező mezőket és figyelmeztet a hiányosságokra.",
      "100 számlasor befogadóképesség – egy importfájlba akár 100 szállítói számla.",
    ],
    tiers: [
      {
        id: "egyszeri_licenc_egyetlen_iro",
        label: "Egyszeri licenc – egyetlen iroda",
        price: 9900,
        note: "Korlátlan felhasználás, frissítések 1 évig díjmentesen.",
        priceId: "rlb_kulfoldi_szamla_import_egyszeri_licenc_egyetlen_iro",
      },
    ],
    download: {
      fileName: "RLB_Szamla_Import.xlsm",
      storagePath: "rlb-kulfoldi-szamla-import/RLB_Szamla_Import.xlsm",
    },
  },
  {
    slug: "rlb-nyito-vegyes-konyvelo",
    name: "Nyitó és Vegyes Könyvelő – RLB kiadás",
    tagline: "Töltse fel a főkönyvi adatokat – a program az RLB vegyes importfájlját készen adja",
    status: "available",
    priceId: "rlb_nyito_vegyes_konyvelo_alap_licenc",
    price: 19900,
    currency: "HUF",
    image: nyitoVegyesImg,
    metaTitle: "Nyitó és Vegyes Könyvelő – RLB kiadás | EXCELlent",
    metaDescription:
      "Nyitó egyenlegek, havi vegyes és bérkönyvelés Excelben, RLB többsoros vegyes importfájllal. Ár: 19 900 Ft-tól.",
    intro: [
      "A hónap végi vegyes könyvelés és a nyitás a legidőigényesebb, legtöbb kézi munkát követelő feladatok közé tartozik. Ez az eszköz Excelben, ismerős felületen oldja meg mindezt: Ön beilleszti vagy rögzíti a tételeket, a program pedig előállítja az RLB által beolvasható importfájlt – gépelés, átszámozgatás és tükörsor-párosítás nélkül.",
    ],
    features: [
      "Nyitás: nyitó egyenlegek könyvelése ellenszámlával (491), egyetlen lapon.",
      "Vegyes és bér: havi vegyes tételek és teljes bérkönyvelés, 12 hónap készen előkészítve.",
      "RLB export: az RLB hivatalos többsoros vegyes (CSV, XF/XT) importfájljának automatikus előállítása.",
      "Deviza: MNB-árfolyam lekérdezés és devizás tételek kezelése.",
      "Segédeszközök: teljesítési időpont kalkulátor, munkanap-számítás, számlatükör, kölcsön-nyilvántartás.",
      "Kommunikáció: teljesítés-igazoló e-mail (magyar és angol) kiküldése.",
      "Beolvasás: PDF-beolvasó a bizonylatok gyorsabb rögzítéséhez.",
    ],
    why: "Az RLB kiadás az RLB hivatalos többsoros vegyes import-struktúrája alapján készül; első használatkor egy próba-import ajánlott a visszaigazoláshoz. A program a betöltött adatokból dolgozik; az áfamentes vegyes és nyitó tételeket kezeli. Áfás vagy devizás vegyes tételhez egy rövid egyeztetés után illesztjük a formátumot. Excel (Windows) és engedélyezett makrók szükségesek.",
    tiers: [
      {
        id: "alap_licenc",
        label: "Alap licenc – 1 adószám",
        price: 19900,
        note: "Egy céget könyvelő vállalkozásnak, saját könyveléshez. Éves licenc.",
        priceId: "rlb_nyito_vegyes_konyvelo_alap_licenc",
      },
      {
        id: "iroda_licenc",
        label: "Iroda licenc – korlátlan adószám",
        price: 49900,
        note: "Könyvelőirodának, tetszőleges számú ügyfél könyveléséhez. Éves licenc.",
        priceId: "rlb_nyito_vegyes_konyvelo_iroda_licenc",
      },
    ],
    download: {
      fileName: "RLB_Nyito_Vegyes_Konyvelo.xlsm",
      storagePath: "rlb-nyito-vegyes-konyvelo/RLB_Nyito_Vegyes_Konyvelo.xlsm",
    },
  },
  {
    slug: "telefonszamla-konyvelo",
    name: "XLNT Telefonszámla Könyvelő",
    tagline: "Telefonszámlából könyvelés – percek alatt, hívószámonként, hibátlan áfával",
    status: "available",
    priceId: "telefonszamla_konyvelo_alap_licenc_1_adoszam",
    price: 12900,
    currency: "HUF",
    image: termekekImg,
    metaTitle: "XLNT Telefonszámla Könyvelő | EXCELlent",
    metaDescription: "Telefonszámlából könyvelés – percek alatt, hívószámonként, hibátlan áfával. Ár: 12 900 Ft-tól.",
    intro: [
      "A többtelefonszámos céges számlák könyvelése hónapról hónapra ugyanaz a fárasztó, hibalehetőségekkel teli kézi munka. A Telefonszámla Könyvelő beolvassa a PDF-számlát, hívószámonként szétbontja a tételeket, és egyetlen kattintással a könyvelőprogramjába importálható fájlt készít – helyes áfakulcsokkal és a telefonszolgáltatás magán/céges áfabontásával együtt. A Magyar Telekom és a Yettel üzleti mobilszámláit automatikusan felismeri.",
      "Könyvelőirodáknak és cégeknek, amelyek több hívószámos, üzleti mobilszámlákat könyvelnek (Magyar Telekom, Yettel), és RLB, Kulcs-Soft, Novitax vagy Pénzszám rendszert használnak.",
    ],
    features: [
      "Időt spórol: a havi telefonszámla-könyvelés kézi munkája perces feladattá zsugorodik.",
      "Ellenőrzött: a hívószámonkénti bontás összegét a program a számla végösszegével automatikusan egyezőségre ellenőrzi (rekonciliáció).",
      "Rugalmas: egy program két szolgáltatót ismer fel és négy könyvelőrendszerbe exportál – nem kell külön eszköz.",
      "Beolvasás: Magyar Telekom és Yettel üzleti mobilszámla automatikus felismerése (fejléc, hívószámok, áfa-összesítő).",
      "Automatikus bontás: szöveges PDF-nél a program hívószámonként Telefon (27%), Internet/adat (5%) és Parkolás tételekre bont, és a számlával egyezőségre ellenőriz.",
      "Bontás: hívószámhoz munkaszám rendelhető; a telefontétel bruttójából automatikus magán / céges nem-levonható / céges levonható + áfa sorok (szabadon állítható százalékok és főkönyvi számok).",
      "Kontírozás: kész könyvelési leképezés (költség- és szállító-főkönyvek, áfakódok); a szállító törzsben a Magyar Telekom, a Yettel és a One előre felvéve (adószám, cím, Követel-főkönyv).",
      "SZJA + SZOCHO: a magáncélú 20%-ra – igény szerint, a fő lapon kapcsolható – kiszámolja az SZJA-t és a szochót (egyes meghatározott juttatás), külön vegyes tételként. A kulcsok a hatályos értékek, de átírhatók.",
      "Export: RLB, Kulcs-Soft, Novitax, Pénzszám – plusz általános CSV. A formátumok a hivatalos importmakrókkal egyeznek.",
    ],
    tiers: [
      {
        id: "alap_licenc_1_adoszam",
        label: "Alap licenc – 1 adószám",
        price: 12900,
        note: "Egy vállalkozás / adószám részére.",
        priceId: "telefonszamla_konyvelo_alap_licenc_1_adoszam",
      },
      {
        id: "iroda_licenc_korlatlan_adosz",
        label: "Iroda licenc – korlátlan adószám",
        price: 39900,
        note: "Könyvelőirodáknak, tetszőleges ügyfélszámmal.",
        priceId: "telefonszamla_konyvelo_iroda_licenc_korlatlan_adosz",
      },
    ],
    download: {
      fileName: "telefon_konyvelo.exe",
      storagePath: "telefonszamla-konyvelo/telefon_konyvelo.exe",
    },
  },
  {
    slug: "univerzalis-bank-konverter",
    name: "Univerzális bankkivonat-konverter",
    tagline: "Automatikus bankkivonat-konverter könyvelőknek és vállalkozásoknak",
    status: "available",
    priceId: "univerzalis_bank_konverter_egyszeri_licenc_1_pc",
    price: 19900,
    currency: "HUF",
    image: calcImg,
    metaTitle: "Univerzális bankkivonat-konverter | EXCELlent",
    metaDescription: "Automatikus bankkivonat-konverter könyvelőknek és vállalkozásoknak. Ár: 19 900 Ft-tól.",
    intro: [
      "A könyvelőirodák és vállalkozások egyik legnagyobb időrabló feladata a havi bankkivonatok kézi rögzítése vagy félig manuális másolgatása.",
    ],
    features: [
      "Univerzális és intelligens felismerés: A szoftver automatikusan felismeri a forrást – legyen az K&H, CIB, Erste, MBH, Wise vagy Payoneer, PDF, CSV, esetleg Excel formátum. Nem kell a felhasználónak kézzel beállítania semmit.",
      "Szkennelt PDF-ek feldolgozása (OCR): Sokan csak kinyomtatott, majd visszaszkennelt bizonylatokat kapnak. A beépített Tesseract OCR segítségével a képként elmentett Erste és MBH dokumentumok is könnyedén beolvashatók.",
      "Többféle kimenet és könyvelőprogram-kompatibilitás: A strukturált Excel mellett közvetlenül RLB formátumba (egysoros vagy többsoros CSV) vagy akár nyers szöveges formátumban is exportálhatunk, így a könyvelőprogramok azonnal be tudják fogadni az adatokat.",
      "Beépített matematikai ellenőrzés: A program automatikusan összeveti a nyitó és záró egyenlegeket a tranzakciók összegével, minimalizálva az elgépelésből vagy hiányzó oldalakból eredő hibákat. A terhelések mindig konzisztensen negatív előjellel szerepelnek.",
    ],
    tiers: [
      {
        id: "egyszeri_licenc_1_pc",
        label: "Egyszeri licenc (1 PC)",
        price: 19900,
        note: "Egyéni könyvelőknek, mikro-vállalkozásoknak. Örökös használat az aktuális verzióra.",
        priceId: "univerzalis_bank_konverter_egyszeri_licenc_1_pc",
      },
      {
        id: "irodai_licenc_multi_pc_cli",
        label: "Irodai licenc (multi-PC, CLI)",
        price: 49900,
        note: "Könyvelőirodáknak (3–5 gép), automatizált CLI futtatással, 1 év ingyenes frissítéssel.",
        priceId: "univerzalis_bank_konverter_irodai_licenc_multi_pc_cli",
      },
    ],
    download: {
      fileName: "bankkivonat.exe",
      storagePath: "univerzalis-bank-konverter/bankkivonat.exe",
    },
  },
  {
    slug: "wifi-jelszo-nezo",
    name: "XLNT WiFi Jelszó Néző",
    tagline: "Elfelejtett Wi‑Fi jelszavak – a saját gépén, egy kattintással",
    status: "available",
    priceId: "wifi_jelszo_nezo_egyszeri_licenc",
    price: 2900,
    currency: "HUF",
    image: wifiJelszoImg,
    metaTitle: "XLNT WiFi Jelszó Néző | EXCELlent",
    metaDescription:
      "Az ezen a gépen elmentett Wi-Fi jelszavak egy listában, másolással és CSV-exporttal. Windowsra, egyszeri licenc: 2 900 Ft.",
    intro: [
      "Új telefon, új laptop, vendég az irodában – és a Wi-Fi jelszó rég feledésbe merült. A XLNT WiFi Jelszó Néző összegyűjti és áttekinthető listában megmutatja mindazokat a Wi-Fi jelszavakat, amelyeket ez a számítógép korábban elmentett. Nincs regisztráció, nincs bonyolult telepítés: elindítja, és látja.",
      "Könyvelőirodáknak, rendszergazdáknak, informatikusoknak, ügyfélszolgálatoknak – és mindenkinek, aki több gépet kezel, vagy egyszerűen csak gyorsan szeretné visszakeresni egy korábban beállított hálózat jelszavát, anélkül hogy a routert kellene előkeresnie.",
    ],
    features: [
      "Minden mentett hálózat egy helyen: az összes eltárolt Wi-Fi és a hozzá tartozó jelszó azonnal, egy listában.",
      "Másolás egy kattintással: a „Másol” gombbal a jelszó rögtön a vágólapra kerül.",
      "Összes másolása / CSV-export: az egész lista beilleszthető Excelbe, vagy elmenthető CSV-be (magyar Excellel közvetlenül nyitható, UTF-8 + pontosvessző).",
      "Magyar Windowson is megbízható: a kiolvasás nyelvfüggetlen módszerrel dolgozik, nem a rendszernyelvtől függő szövegből.",
      "Okos felismerés: a nyílt és a vállalati (802.1X) hálózatokat külön, félreértés nélkül jelöli.",
      "Tiszta, modern felület: sötét, jól olvasható kezelőfelület – reklámok és kéretlen kiegészítők nélkül.",
      "Hordozható: egyetlen futtatható program, telepítés nélkül is elindul.",
    ],
    why: "Windows rendszerre készült. Csak az ezen a gépen korábban elmentett, saját hálózatokat mutatja – pontosan azt, amit a Windows Beállítások is elérhetővé tesz, csak egy helyre gyűjtve. A jelszavak megjelenítéséhez rendszergazdai jogosultság kell; a program indításkor felkéri erre.",
    tiers: [
      {
        id: "egyszeri_licenc",
        label: "Egyszeri licenc – 1 eszköz",
        price: 2900,
        note: "Egyszeri licencdíj, egy eszközre.",
        priceId: "wifi_jelszo_nezo_egyszeri_licenc",
      },
    ],
    download: {
      fileName: "XLNT_WiFi_Jelszo.exe",
      storagePath: "wifi-jelszo-nezo/XLNT_WiFi_Jelszo.exe",
    },
  },
];

export const productSlugs = products.map((p) => p.slug);

export function getProduct(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getTier(product: Product, tierId?: string | null): ProductTier {
  return product.tiers.find((t) => t.id === tierId) ?? product.tiers[0]!;
}

export function priceFrom(product: Product): number {
  return Math.min(...product.tiers.map((t) => t.price));
}

export function formatPrice(value: number): string {
  return `${value.toLocaleString("hu-HU").replace(/\u00a0/g, " ")} Ft`;
}
