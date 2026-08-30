/**
 * Single source of truth for the service provider's legal data.
 * Used across the legal pages (impresszum, ÁSZF, privacy, etc.).
 */
export const COMPANY = {
  legalName: "Sarinay Dávid egyéni vállalkozó",
  brand: "EXCELlent Business Intelligence",
  address: "1076 Budapest, Péterfy Sándor utca 9. 8/26.",
  registrationNumber: "57905657",
  taxNumber: "59861010-1-42",
  statisticalNumber: "59861010-7020-231-01",
  vatStatus: "alanyi adómentes (AAM)",
  email: "info@xlntbi.hu",
  phone: "20/962-2176",
  phoneIntl: "+36 20 962 2176",
  website: "xlntbi.hu",
  facebook: "https://www.facebook.com/xlntbi",
} as const;

export const HOSTING = {
  name: "Lovable Labs Incorporated",
  contact: "support@lovable.dev",
} as const;

/** Named data processors – required by GDPR Art. 13. */
export const PROCESSORS = [
  "Lovable Labs Incorporated (weboldal üzemeltetés, tárhely, adatbázis) – USA / EU, az EU–USA adatvédelmi keret, illetve általános szerződési feltételek alapján",
  "Stripe Payments Europe, Ltd. (bankkártyás fizetés feldolgozása) – Írország; a kártyaadatokat kizárólag a Stripe kezeli, azok hozzám nem jutnak el",
  "Resend (e-mail-küldés: visszaigazoló és értesítő levelek) – USA, megfelelő garanciák mellett",
  "Billingo Technologies Zrt. (számlázás) – Magyarország",
  "Google Ireland Ltd. (e-mail-fiók, irodai szolgáltatások) – Írország",
] as const;

export const AUTHORITIES = {
  naih: "Nemzeti Adatvédelmi és Információszabadság Hatóság (NAIH), 1055 Budapest, Falk Miksa utca 9-11., posta: 1363 Budapest, Pf. 9., telefon: +36 1 391 1400, e-mail: ugyfelszolgalat@naih.hu",
  bekelteto:
    "Budapesti Békéltető Testület, 1016 Budapest, Krisztina krt. 99. III. em. 310., posta: 1253 Budapest, Pf. 10., telefon: +36 1 488 2131, e-mail: bekelteto.testulet@bkik.hu",
  fogyasztovedelem:
    "Budapest Főváros Kormányhivatala Fogyasztóvédelmi Főosztály, 1051 Budapest, Sas utca 19. III. em., e-mail: fogyasztovedelem@bfkh.gov.hu",
  nav: "Nemzeti Adó- és Vámhivatal (nav.gov.hu)",
} as const;
