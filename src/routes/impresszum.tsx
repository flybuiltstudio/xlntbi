import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/LegalPage";

const TITLE = "Impresszum | EXCELlent Accounting & Consulting";
const DESC =
  "A xlntbi.hu weboldal üzemeltetőjének adatai, elérhetőségek és a szolgáltatással kapcsolatos tájékoztatás.";

export const Route = createFileRoute("/impresszum")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <LegalPage
      title="Impresszum"
      intro={[
        "Az alábbiakban a xlntbi.hu weboldal üzemeltetőjének adatait és elérhetőségeit találod.",
      ]}
      sections={[
        {
          heading: "A szolgáltató",
          list: [
            "Név: Sarinay Dávid – EXCELlent Accounting & Consulting",
            "E-mail: info@xlntbi.hu",
            "Telefon: 20/962-2176",
            "Weboldal: xlntbi.hu",
          ],
          afterList: [
            "A cégjegyzékszám / nyilvántartási szám, az adószám és a székhely pontos adatai kitöltésre várnak – ezeket a szolgáltató adja meg. Kérjük, addig az e-mailes elérhetőséget használd.",
          ],
        },
        {
          heading: "Tárhelyszolgáltató",
          list: [
            "A weboldal a Lovable (Lovable Labs Incorporated) infrastruktúráján fut.",
            "Kapcsolat tárhely ügyben: support@lovable.dev",
          ],
        },
        {
          heading: "Panaszkezelés",
          paragraphs: [
            "A szolgáltatással kapcsolatos kérdésekkel, panaszokkal az info@xlntbi.hu címen vagy a fenti telefonszámon lehet fordulni hozzánk. A fogyasztói jogorvoslati lehetőségekről a Fogyasztóvédelmi tájékoztatás oldalon olvashatsz.",
          ],
        },
      ]}
    />
  ),
});
