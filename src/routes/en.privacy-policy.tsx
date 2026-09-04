import { createFileRoute } from "@tanstack/react-router";
import { LegalPage, type LegalSection } from "@/components/LegalPage";
import { AUTHORITIES, COMPANY, PROCESSORS } from "@/lib/company";
import { buildHead } from "@/lib/i18n/head";

const TITLE = "Privacy Policy | EXCELlent Business Intelligence";
const DESCRIPTION =
  "The privacy policy of EXCELlent Business Intelligence regarding the handling of personal data of website visitors and customers.";

export const Route = createFileRoute("/en/privacy-policy")({
  head: () =>
    buildHead({
      huPath: "/adatvedelmi-tajekoztato",
      lang: "en",
      title: TITLE,
      description: DESCRIPTION,
    }),
  component: PrivacyPolicyPage,
});

const sections: LegalSection[] = [
  {
    heading: "1. Data of the data controller",
    list: [
      `Data controller: ${COMPANY.legalName} (${COMPANY.brand})`,
      `Registered seat: ${COMPANY.address}`,
      `Registration number: ${COMPANY.registrationNumber}`,
      `Tax number: ${COMPANY.taxNumber}`,
      `E-mail: ${COMPANY.email}`,
      `Phone: ${COMPANY.phone}`,
      `Website: ${COMPANY.website}`,
    ],
    afterList: [
      "The data controller is not obliged to designate a data protection officer and does not employ one. Data protection questions can be addressed to the e-mail address above.",
    ],
  },
  {
    heading: "2. Purpose and scope of this notice",
    paragraphs: [
      "This notice has been prepared pursuant to Article 13 of Regulation (EU) 2016/679 of the European Parliament and of the Council (General Data Protection Regulation, GDPR) and Act CXII of 2011 on the Right of Informational Self-Determination and Freedom of Information (Infotv.).",
      "It describes what personal data are processed on the xlntbi.hu website, in the related forms, when ordering digital products and during online payment, for what purpose, on what legal basis, for how long, who may access the data, and what rights data subjects have.",
    ],
  },
  {
    heading: "3. Principles of data processing",
    paragraphs: [
      "Personal data are processed lawfully, fairly and transparently, only to the extent necessary for the specified purposes (data minimisation).",
      "Data are retained only for as long as necessary, and their security is ensured through appropriate technical and organisational measures (encrypted connection, access-controlled database, abuse filtering).",
    ],
  },
  {
    heading: "4. Contact and consultation request form",
    list: [
      "Data processed: last name, first name, e-mail address, phone number, company name, the selected service, preferred method and time of contact, and the text of the message.",
      "Technical data used for filtering abuse (automated spam): IP address and browser identifier (user agent).",
      "Purpose: answering the inquiry, providing an offer, preparing the contract, and ensuring the abuse-free operation of the form.",
      "Legal basis: the data subject's consent (GDPR Art. 6(1)(a)); for the technical data related to spam filtering, the data controller's legitimate interest (GDPR Art. 6(1)(f)).",
      "Retention period: 2 years after the inquiry is closed, or, in case of a concluded contract, the retention period applicable to the contract. Technical log data are stored for 90 days.",
    ],
  },
  {
    heading: "5. Ordering a digital product",
    list: [
      "Data processed: name, e-mail address, phone number, billing name and address, tax number (if provided), the ordered product and quantity, the order number, the selected payment method, and the payment status.",
      "Only digital products are available on the website, so no delivery address is requested or processed.",
      "Purpose: fulfilling the order, issuing the invoice, sending confirmation and fulfilment e-mails.",
      "Legal basis: performance of a contract (GDPR Art. 6(1)(b)); for billing data, compliance with a legal obligation (GDPR Art. 6(1)(c)).",
      "Retention period: accounting documents are retained for 8 years pursuant to Section 169 of Act C of 2000 on Accounting. Order data are processed until the statute of limitations for warranty and settlement claims expires.",
    ],
  },
  {
    heading: "6. Online card payment",
    paragraphs: [
      "Card payments are processed by Stripe Payments Europe, Ltd. The card number, expiry date and security code are handled exclusively by Stripe; the data controller does not receive access to, or store, this data.",
      "The data controller only receives the transaction identifier, amount, status and the payer's e-mail address, for the purpose of fulfilling the order and invoicing. Legal basis: performance of a contract (GDPR Art. 6(1)(b)).",
      "Stripe's own privacy notice is available at stripe.com.",
    ],
  },
  {
    heading: "7. Calculators",
    paragraphs: [
      "The calculations of the calculators available on the website (salary test, income tax) run in your browser. The values entered are not transmitted to the server and are not stored.",
    ],
  },
  {
    heading: "8. Newsletter",
    list: [
      "Data processed: last name, first name, e-mail address and, if provided, phone number and company name. For abuse filtering, the IP address and browser identifier (user agent) are recorded; to prove the subscription, the time of consent and confirmation are recorded.",
      "Purpose: sending newsletters about the services, updates on digital products, legislative changes and deadlines.",
      "Legal basis: the data subject's voluntary, explicit consent (GDPR Art. 6(1)(a)). Subscription happens via double opt-in: the newsletter is only started after confirmation via the link sent by e-mail.",
      "Retention period: until consent is withdrawn (unsubscription). The fact and date of unsubscription are retained afterwards for statutory accountability purposes.",
      "Unsubscription: every newsletter contains an unsubscribe link accessible with one click at the bottom; an unsubscription request can also be sent to info@xlntbi.hu.",
      "External mailing system: if the newsletter is sent through an external provider (MailerLite, EmailOctopus, Sender, SendPulse or Brevo), the subscriber's name, e-mail address and the provided phone number and company name are also transmitted to that provider, solely for the purpose of sending the newsletter.",
    ],
  },
  {
    heading: "9. Cookies",
    paragraphs: [
      "The website uses cookies that are necessary for operation, including cookies placed by Stripe to ensure the secure processing of card payments. We currently do not use analytics or marketing cookies. Details are available on the Cookie Policy page.",
    ],
  },
  {
    heading: "10. Data processors and recipients",
    paragraphs: [
      "The following data processors, or independent data controllers, participate in the data processing:",
    ],
    list: [...PROCESSORS],
    afterList: [
      "In the case of data transfer to a third country (typically the United States), the legal basis for the transfer is the European Commission's adequacy decision (EU-U.S. Data Privacy Framework) or the standard contractual clauses (SCC) adopted by the European Commission. Data are disclosed to authorities only on the basis of a statutory obligation.",
    ],
  },
  {
    heading: "11. Automated decision-making, profiling, AI tools",
    paragraphs: [
      "No automated decision-making or profiling takes place during the data processing.",
      "The service provider uses AI tools to develop its software and internal processes; however, personal data submitted on the website is not used to train AI models and is not transferred to any AI provider.",
    ],
  },
  {
    heading: "12. Data security",
    paragraphs: [
      "Data are transmitted via an encrypted (HTTPS) connection. Submissions are stored in the database with access-controlled (row level security) protection, accessible only to the data controller and, to the extent necessary, to the data processors.",
    ],
  },
  {
    heading: "13. Rights of data subjects",
    paragraphs: ["The data subject has the following rights:"],
    list: [
      "Right to information and access (GDPR Art. 15)",
      "Right to rectification (GDPR Art. 16)",
      "Right to erasure, the \"right to be forgotten\" (GDPR Art. 17), within the limits of statutory retention obligations",
      "Right to restriction of processing (GDPR Art. 18)",
      "Right to data portability (GDPR Art. 20)",
      "Right to object to processing based on legitimate interest (GDPR Art. 21)",
      "The right to withdraw consent at any time, without affecting the lawfulness of processing carried out before the withdrawal (GDPR Art. 7(3))",
    ],
    afterList: [
      `Requests can be submitted to ${COMPANY.email}. We respond to requests without undue delay, at the latest within 1 month; this deadline may be extended by a further 2 months where justified, of which we will inform you.`,
    ],
  },
  {
    heading: "14. Remedies",
    paragraphs: [
      `If the data subject believes that their rights have been violated during the processing of their personal data, they may lodge a complaint with the supervisory authority: NAIH (Hungarian National Authority for Data Protection and Freedom of Information) – ${AUTHORITIES.naih}.`,
      "The data subject may also turn to the regional court (törvényszék) competent for their place of residence or stay, pursuant to Article 79 of the GDPR and the Infotv.",
    ],
  },
  {
    heading: "15. Amendment of this notice",
    paragraphs: [
      "The data controller reserves the right to amend this notice. The version in force at any given time is available on the website.",
      "Effective from: 19 August 2026.",
    ],
  },
];

function PrivacyPolicyPage() {
  return <LegalPage title="Privacy Policy" sections={sections} />;
}
