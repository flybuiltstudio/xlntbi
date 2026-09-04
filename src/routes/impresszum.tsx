import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/LegalPage";
import { AUTHORITIES, COMPANY, HOSTING } from "@/lib/company";


const TITLE = "Impresszum | EXCELlent Business Intelligence";
const DESCRIPTION = "Az EXCELlent Business Intelligence weboldal üzemeltetőjének hivatalos adatai és elérhetőségei.";
const CANONICAL = "https://xlntbi.hu/impresszum";

export const Route = createFileRoute("/impresszum")({
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
      { rel: "alternate", hrefLang: "hu", href: "https://xlntbi.hu/impresszum" },
      { rel: "alternate", hrefLang: "en", href: "https://xlntbi.hu/en/imprint" },
      { rel: "alternate", hrefLang: "x-default", href: "https://xlntbi.hu/impresszum" },
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
                              "name": "Impresszum",
                              "item": "https://xlntbi.hu/impresszum"
                      }
              ]
      }),
      },
    ],
  }),
  component: () => (
    <LegalPage
      title="Impresszum"
      intro={[
        "Az alábbiakban a xlntbi.hu weboldal üzemeltetőjének adatait és elérhetőségeit találod, az elektronikus kereskedelmi szolgáltatásokról szóló 2001. évi CVIII. törvény (Ekertv.) 4. §-a alapján.",
      ]}
      sections={[
        {
          heading: "A szolgáltató adatai",
          list: [
            `Név: ${COMPANY.legalName}`,
            `Márkanév: ${COMPANY.brand}`,
            `Székhely és levelezési cím: ${COMPANY.address}`,
            `Nyilvántartási szám: ${COMPANY.registrationNumber}`,
            `Adószám: ${COMPANY.taxNumber}`,
            `Statisztikai (KSH) számjel: ${COMPANY.statisticalNumber}`,
            `Adózási státusz: ${COMPANY.vatStatus}`,
            `E-mail: ${COMPANY.email}`,
            `Telefon: ${COMPANY.phone}`,
            `Weboldal: ${COMPANY.website}`,
          ],
          afterList: [
            "A nyilvántartásba vételt az egyéni vállalkozók nyilvántartása tartalmazza. A szolgáltató nem tagja szakmai önszabályozó testületnek, magatartási kódexnek nem vetette alá magát.",
          ],
        },
        {
          heading: "Tárhelyszolgáltató",
          list: [
            `Név: ${HOSTING.name}`,
            `Kapcsolat tárhely ügyben: ${HOSTING.contact}`,
          ],
        },
        {
          heading: "Felügyeleti szervek",
          list: [
            AUTHORITIES.nav,
            AUTHORITIES.fogyasztovedelem,
            AUTHORITIES.naih,
          ],
        },
        {
          heading: "Panaszkezelés",
          paragraphs: [
            `A szolgáltatással kapcsolatos kérdésekkel, panaszokkal a ${COMPANY.email} címen vagy a ${COMPANY.phone} telefonszámon lehet fordulni hozzám. A panaszt megvizsgálom, és a jogszabályi határidőn belül írásban válaszolok. A fogyasztói jogorvoslati lehetőségekről a Fogyasztóvédelmi tájékoztatás oldalon olvashatsz.`,
          ],
        },
      ]}
    />
  ),
});
