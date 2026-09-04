import { createFileRoute } from "@tanstack/react-router";
import { LegalPage, type LegalSection } from "@/components/LegalPage";
import { AUTHORITIES, COMPANY, HOSTING } from "@/lib/company";
import { buildHead } from "@/lib/i18n/head";

const TITLE = "General Terms and Conditions | EXCELlent Business Intelligence";
const DESCRIPTION =
  "The General Terms and Conditions (ÁSZF) applicable to the services and products of EXCELlent Business Intelligence.";

export const Route = createFileRoute("/en/terms")({
  head: () =>
    buildHead({
      huPath: "/aszf",
      lang: "en",
      title: TITLE,
      description: DESCRIPTION,
    }),
  component: TermsPage,
});

const sections: LegalSection[] = [
  {
    heading: "1. General provisions",
    paragraphs: [
      "These General Terms and Conditions (ÁSZF) apply to the services, digital products, calculators and other online content available on the xlntbi.hu website.",
      "By using the website, purchasing a product or using a service, the User accepts the provisions of these Terms. Acceptance of the Terms must be separately indicated on the order form.",
      "The language of the contract is Hungarian; the contract is concluded electronically and does not qualify as a written contract. The service provider stores the order electronically, and it remains accessible afterwards.",
      "For matters not regulated herein, the provisions of Act V of 2013 on the Civil Code (Ptk.), Act CVIII of 2001 on certain aspects of electronic commerce services (Ekertv.), and Government Decree 45/2014 (II. 26.) on the detailed rules of contracts between consumers and businesses shall apply.",
    ],
  },
  {
    heading: "2. Data of the seller (service provider)",
    list: [
      `Name: ${COMPANY.legalName}`,
      `Brand: ${COMPANY.brand}`,
      `Registered seat and correspondence address: ${COMPANY.address}`,
      `Registration number: ${COMPANY.registrationNumber}`,
      `Tax number: ${COMPANY.taxNumber}`,
      `Statistical (KSH) number: ${COMPANY.statisticalNumber}`,
      `E-mail: ${COMPANY.email}`,
      `Phone: ${COMPANY.phone}`,
      `Website: ${COMPANY.website}`,
      `Hosting provider: ${HOSTING.name} (${HOSTING.contact})`,
    ],
  },
  {
    heading: "3. Scope of services and products",
    paragraphs: ["The services and products available on the website include in particular:"],
    list: [
      "Bookkeeping services",
      "Tax advisory and business administration consulting",
      "Statutory audit, due diligence and audit services",
      "Fintech and BI consulting",
      "Controlling and reporting services",
      "Digital audits",
      "Calculators",
      "Training materials",
      "Downloadable digital products, including solutions supported by complex macros",
    ],
  },
  {
    heading: "4. Ordering process",
    paragraphs: [
      "The User may request a quote, consultation or product through the website or by direct contact.",
      "For a digital product, clicking the \"Order\" button on the product page opens the order form, where the quantity and billing data must be provided. Only digital products are available on the site, so a delivery address is not required.",
      "After submitting the order, an automatic confirmation e-mail is sent with the order number. The contract is concluded upon the service provider's confirmation of the order or upon successful online payment.",
      "Data entry errors can be corrected on the form before the order is submitted. If an error is discovered after submission, it can be reported by e-mail, quoting the order number.",
    ],
  },
  {
    heading: "5. Prices and invoicing",
    paragraphs: [
      `Prices shown on the website are in Hungarian forints. The service provider falls under the ${COMPANY.vatStatus} (VAT-exempt small taxpayer) tax status, so prices do not include VAT, and no VAT is charged on the invoice.`,
      "An electronic invoice is issued for the order via the Billingo invoicing system and sent to the e-mail address provided. By submitting the order, the User accepts the receipt of the invoice.",
      "The service provider reserves the right to change prices; such changes do not affect orders already placed.",
    ],
  },
  {
    heading: "6. Payment methods",
    paragraphs: ["The following payment methods can be chosen when placing an order:"],
    list: [
      "Bank transfer: based on the invoice and payment details sent after the order confirmation. Fulfilment begins after the amount is received.",
      "Online card payment: payment is processed via the secure payment interface of Stripe Payments Europe, Ltd. Card data is handled exclusively by Stripe; it does not reach the service provider and is not stored by the service provider.",
    ],
    afterList: [
      "Data provided on Stripe's interface during card payment is also subject to Stripe's own privacy notice. After a successful payment, the system sends an automatic confirmation e-mail.",
      "In the event of a failed or interrupted payment, the order remains in a pending-payment status; the payment can be restarted, or switched to bank transfer in agreement with the service provider.",
    ],
  },
  {
    heading: "7. Fulfilment, digital products",
    paragraphs: [
      "Digital products are fulfilled electronically: the file or download access is sent to the provided e-mail address after the payment is received, within 2 business days at the latest.",
      "Services are fulfilled based on individual agreement, according to the given assignment. The deadline for fulfilment is set out in the offer, the confirmation, or a separate agreement.",
      "The technical requirements needed to use the products (e.g. Microsoft Excel version, enabling macros) are described in the product description. It is the User's responsibility to ensure these conditions are met.",
      "The products may be used for the buyer's own purposes or to serve the buyer's own client base. Resale, public disclosure or unauthorised sharing of the products is prohibited unless separate written permission is granted.",
    ],
  },
  {
    heading: "8. Withdrawal and termination",
    paragraphs: [
      "For digital content not supplied on a tangible medium, consumers are entitled to a 14-day right of withdrawal under Government Decree 45/2014 (II. 26.); however, this right cannot be exercised if performance has begun with the consumer's prior, explicit consent, and the consumer, at the same time as giving this consent, acknowledged the loss of the right of withdrawal.",
      "This declaration must be separately marked on the order form; without this mark, the order cannot be placed. Detailed rules are set out on the Right of Withdrawal page.",
    ],
  },
  {
    heading: "9. Warranty for defective performance",
    paragraphs: [
      `If the ordered digital product does not work as described, the issue should be reported to ${COMPANY.email}. The remedy for the defect – repair, delivery of a corrected version, or, where justified, refund of the price – is provided in accordance with the warranty rules of the Ptk. (Hungarian Civil Code).`,
      "The service provider does not offer a guarantee (jótállás) for digital content, but statutory warranty rights (kellékszavatosság) can be enforced.",
    ],
  },
  {
    heading: "10. Limitation of liability",
    paragraphs: [
      "The calculators, informational content and digital tools on the website are for informational purposes only and do not constitute tax advice or an individual professional opinion.",
      "The final decision and its application are always the individual responsibility of the user, taking into account their own professional situation. The service provider is not liable for damages arising from incorrect data entry or from using the product other than as described.",
    ],
  },
  {
    heading: "11. Intellectual property",
    paragraphs: [
      "The texts, graphic elements, logos, product descriptions, calculators, automation files, macros and other content on the website are the intellectual property of the service provider.",
      "Copying, distributing or using them without the service provider's prior written consent is prohibited.",
    ],
  },
  {
    heading: "12. Data processing",
    paragraphs: [
      "Detailed information about the data processing related to orders and contact is provided on the Privacy Policy page, in accordance with the requirements of the General Data Protection Regulation (EU 2016/679, GDPR).",
    ],
  },
  {
    heading: "13. Complaint handling and remedies",
    paragraphs: [
      `In the event of a complaint, the User is entitled to contact the service provider at ${COMPANY.email} or by phone at ${COMPANY.phone}. Complaints are investigated and answered within the statutory deadline.`,
      `In the event of a consumer dispute, the consumer may turn to the conciliation body (békéltető testület) competent for their place of residence. The body competent for the service provider's registered seat: ${AUTHORITIES.bekelteto}.`,
      `A consumer protection authority procedure can be initiated at the government office competent for the consumer's place of residence; for the service provider's registered seat: ${AUTHORITIES.fogyasztovedelem}.`,
    ],
  },
  {
    heading: "14. Closing provisions",
    paragraphs: [
      "The service provider reserves the right to amend these Terms. The version in force at any time is published on the website and takes effect from the date of publication. Orders already placed are governed by the Terms in force on the date of the order.",
      "Effective from: 19 August 2026.",
    ],
  },
];

function TermsPage() {
  return <LegalPage title="General Terms and Conditions (ÁSZF)" sections={sections} />;
}
