import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/LegalPage";
import { AUTHORITIES, COMPANY } from "@/lib/company";
import { buildHead } from "@/lib/i18n/head";

const TITLE = "Consumer Information | EXCELlent Business Intelligence";
const DESCRIPTION = "Consumer protection information and contact details in case of a complaint.";

export const Route = createFileRoute("/en/consumer-information")({
  head: () =>
    buildHead({
      huPath: "/fogyasztovedelem",
      lang: "en",
      title: TITLE,
      description: DESCRIPTION,
    }),
  component: () => (
    <LegalPage
      title="Consumer Information"
      intro={[
        "If you order from the site as a consumer, the following remedies are available to you.",
      ]}
      sections={[
        {
          heading: "Data of the service provider",
          list: [
            `Name: ${COMPANY.legalName}`,
            `Registered seat: ${COMPANY.address}`,
            `Registration number: ${COMPANY.registrationNumber}`,
            `Tax number: ${COMPANY.taxNumber}`,
            `E-mail: ${COMPANY.email}`,
            `Phone: ${COMPANY.phone}`,
          ],
        },
        {
          heading: "Filing a complaint",
          paragraphs: [
            `A complaint can be filed at ${COMPANY.email} or by phone at ${COMPANY.phone}. We investigate the complaint and respond in writing within the statutory deadline.`,
          ],
        },
        {
          heading: "Conciliation body (Békéltető testület)",
          paragraphs: [
            "To resolve a consumer dispute out of court, the consumer may turn to the conciliation body (békéltető testület) competent for their place of residence or stay. The contact details of these bodies can be found at bekeltetes.hu.",
            `The body competent for the service provider's registered seat: ${AUTHORITIES.bekelteto}.`,
          ],
        },
        {
          heading: "Consumer protection authority",
          paragraphs: [
            "A consumer protection authority procedure can be initiated at the county (metropolitan) government office competent for the consumer's place of residence. Contact details can be found at kormanyhivatalok.hu.",
            `For the service provider's registered seat: ${AUTHORITIES.fogyasztovedelem}.`,
          ],
        },
        {
          heading: "Online dispute resolution",
          paragraphs: [
            "For disputes related to products purchased online, the European Commission's online dispute resolution platform can also be used, where available for the given type of case.",
          ],
        },
        {
          heading: "Judicial proceedings",
          paragraphs: [
            "The consumer is entitled to enforce their claim arising from a consumer dispute before a court, in accordance with the rules of civil procedure.",
          ],
        },
      ]}
    />
  ),
});
