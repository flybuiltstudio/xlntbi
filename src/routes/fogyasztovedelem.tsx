import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/LegalPage";
import { AUTHORITIES, COMPANY } from "@/lib/company";


const TITLE = "Fogyasztóvédelem | EXCELlent Business Intelligence";
const DESCRIPTION = "Fogyasztóvédelmi tájékoztató és elérhetőségek panasz esetére.";
const CANONICAL = "https://xlntbi.hu/fogyasztovedelem";

export const Route = createFileRoute("/fogyasztovedelem")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: CANONICAL },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
      { name: "robots", content: "noindex, follow" },
    ],
    links: [
      { rel: "canonical", href: CANONICAL },
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
                              "name": "Fogyasztóvédelem",
                              "item": "https://xlntbi.hu/fogyasztovedelem"
                      }
              ]
      }),
      },
    ],
  }),
  component: () => (
    <LegalPage
      title="Fogyasztóvédelmi tájékoztatás"
      intro={[
        "Ha fogyasztóként rendelsz az oldalról, az alábbi jogorvoslati lehetőségek állnak rendelkezésedre.",
      ]}
      sections={[
        {
          heading: "A szolgáltató adatai",
          list: [
            `Név: ${COMPANY.legalName}`,
            `Székhely: ${COMPANY.address}`,
            `Nyilvántartási szám: ${COMPANY.registrationNumber}`,
            `Adószám: ${COMPANY.taxNumber}`,
            `E-mail: ${COMPANY.email}`,
            `Telefon: ${COMPANY.phone}`,
          ],
        },
        {
          heading: "Panasz bejelentése",
          paragraphs: [
            `Panaszt a ${COMPANY.email} címen vagy a ${COMPANY.phone} telefonszámon lehet bejelenteni. A panaszt megvizsgáljuk, és a jogszabályi határidőn belül írásban válaszolunk.`,
          ],
        },
        {
          heading: "Békéltető testület",
          paragraphs: [
            "A fogyasztói jogvita bírósági eljáráson kívüli rendezése érdekében a fogyasztó a lakóhelye vagy tartózkodási helye szerinti békéltető testülethez fordulhat. A testületek elérhetőségei a bekeltetes.hu oldalon találhatók.",
            `A szolgáltató székhelye szerint illetékes testület: ${AUTHORITIES.bekelteto}.`,
          ],
        },
        {
          heading: "Fogyasztóvédelmi hatóság",
          paragraphs: [
            "Fogyasztóvédelmi hatósági eljárás a lakóhely szerint illetékes megyei (fővárosi) kormányhivatalnál indítható. Az elérhetőségek a kormanyhivatalok.hu oldalon találhatók.",
            `A szolgáltató székhelye szerint: ${AUTHORITIES.fogyasztovedelem}.`,
          ],
        },
        {
          heading: "Online vitarendezés",
          paragraphs: [
            "Online megvásárolt termékkel kapcsolatos jogvita esetén az Európai Bizottság online vitarendezési platformja is igénybe vehető, amennyiben az adott ügytípusban rendelkezésre áll.",
          ],
        },
        {
          heading: "Bírósági eljárás",
          paragraphs: [
            "A fogyasztó jogosult a fogyasztói jogvitából eredő követelésének bíróság előtti érvényesítésére a polgári perrendtartás szabályai szerint.",
          ],
        },
      ]}
    />
  ),
});
