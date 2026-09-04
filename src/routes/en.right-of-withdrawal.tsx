import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/LegalPage";
import { buildHead } from "@/lib/i18n/head";

const TITLE = "Right of Withdrawal | EXCELlent Business Intelligence";
const DESCRIPTION = "Information on the conditions and process of withdrawing from the contract.";

export const Route = createFileRoute("/en/right-of-withdrawal")({
  head: () =>
    buildHead({
      huPath: "/elallas-a-szerzodestol",
      lang: "en",
      title: TITLE,
      description: DESCRIPTION,
    }),
  component: () => (
    <LegalPage
      title="Right of Withdrawal"
      intro={[
        "This notice concerns the right of withdrawal and termination available to consumers, pursuant to Government Decree 45/2014 (II. 26.) on the detailed rules of contracts between consumers and businesses.",
      ]}
      sections={[
        {
          heading: "General rule on the right of withdrawal",
          paragraphs: [
            "The consumer may withdraw from the contract within 14 days without giving any reason. In the case of digital content (downloadable software, Excel- or Google Sheets-based solutions), this period starts on the date the contract is concluded.",
          ],
        },
        {
          heading: "When does the right of withdrawal cease?",
          paragraphs: [
            "For digital content not supplied on a tangible medium, the right of withdrawal cannot be exercised if performance has begun with the consumer's prior, explicit consent, and the consumer, at the same time as giving this consent, acknowledged the loss of the right of withdrawal.",
            "This is why this declaration must be separately marked on the order form. Without this mark, the order cannot be placed.",
          ],
        },
        {
          heading: "How to withdraw before fulfilment begins",
          paragraphs: [
            "If the download or access has not yet started, it is sufficient to clearly indicate the intention to withdraw at info@xlntbi.hu or by phone at 06 20 962 2176, quoting the order number. In the event of withdrawal, the amount already paid will be refunded within 14 days at the latest, using the same payment method as the original transaction.",
          ],
        },
        {
          heading: "Warranty for defective performance",
          paragraphs: [
            "If the ordered digital product does not work as described, please report it to info@xlntbi.hu. The remedy for the defect – repair, delivery of a corrected version, or, where justified, refund of the price – is provided in accordance with the statutory warranty rules.",
          ],
        },
        {
          heading: "Remedies",
          paragraphs: [
            "If you feel that your complaint has not been handled appropriately, you can find the contact details of the conciliation bodies and authorities on the Consumer Information page.",
          ],
        },
      ]}
    />
  ),
});
