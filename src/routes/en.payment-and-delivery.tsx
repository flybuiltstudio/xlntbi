import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/LegalPage";
import { COMPANY } from "@/lib/company";
import { buildHead } from "@/lib/i18n/head";

const TITLE = "Payment and Delivery | EXCELlent Business Intelligence";
const DESCRIPTION =
  "Information about the available payment methods and the fulfilment process for services and products.";

export const Route = createFileRoute("/en/payment-and-delivery")({
  head: () =>
    buildHead({
      huPath: "/fizetes-es-teljesites",
      lang: "en",
      title: TITLE,
      description: DESCRIPTION,
    }),
  component: () => (
    <LegalPage
      title="Payment and Delivery"
      intro={[
        "The products offered on the site are digital products, so there is no physical shipping: fulfilment happens by download or by access sent via e-mail.",
      ]}
      sections={[
        {
          heading: "Ordering process",
          list: [
            "Clicking the \"Order\" button on the product page opens the order form.",
            "On the order form, the quantity and billing data must be provided. No delivery address is required.",
            "After submitting the order, an automatic confirmation e-mail is sent with the order number.",
            "The service provider confirms the order and sends the invoice and payment details.",
          ],
        },
        {
          heading: "Payment methods",
          list: [
            "Bank transfer: based on the invoice and payment details sent. Fulfilment begins after the amount is received.",
            "Online card payment: payment is processed via the secure interface of Stripe Payments Europe, Ltd. Card data is handled exclusively by Stripe and does not reach the service provider.",
          ],
          afterList: [
            "In the event of a failed or interrupted card payment, the order remains in a pending-payment status; the payment can be restarted, or switched to bank transfer.",
          ],
        },
        {
          heading: "Prices and invoice",
          paragraphs: [
            `Prices shown on the website are in Hungarian forints. The service provider falls under the ${COMPANY.vatStatus} (VAT-exempt small taxpayer) tax status, so prices do not include VAT, and no VAT is charged on the invoice.`,
            "An electronic invoice is issued for the order via the Billingo system and sent to the e-mail address provided.",
          ],
        },
        {
          heading: "Fulfilment",
          paragraphs: [
            "Access to the digital product (download link or file) is sent to the provided e-mail address after the payment is received, within 2 business days at the latest. The technical requirements needed to use the product are described in the product description.",
          ],
        },
        {
          heading: "Withdrawal",
          paragraphs: [
            "You can read about the rules of the right of withdrawal for digital content on the Right of Withdrawal page.",
          ],
        },
      ]}
    />
  ),
});
