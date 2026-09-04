import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/LegalPage";
import { AUTHORITIES, COMPANY, HOSTING } from "@/lib/company";
import { buildHead } from "@/lib/i18n/head";

const TITLE = "Imprint | EXCELlent Business Intelligence";
const DESCRIPTION =
  "Official company data and contact details of the operator of the EXCELlent Business Intelligence website.";

export const Route = createFileRoute("/en/imprint")({
  head: () =>
    buildHead({
      huPath: "/impresszum",
      lang: "en",
      title: TITLE,
      description: DESCRIPTION,
    }),
  component: () => (
    <LegalPage
      title="Imprint"
      intro={[
        "Below you will find the data and contact details of the operator of the xlntbi.hu website, pursuant to Section 4 of Act CVIII of 2001 on certain aspects of electronic commerce services (Ekertv.).",
      ]}
      sections={[
        {
          heading: "Data of the service provider",
          list: [
            `Name: ${COMPANY.legalName}`,
            `Brand: ${COMPANY.brand}`,
            `Registered seat and correspondence address: ${COMPANY.address}`,
            `Registration number: ${COMPANY.registrationNumber}`,
            `Tax number: ${COMPANY.taxNumber}`,
            `Statistical (KSH) number: ${COMPANY.statisticalNumber}`,
            `Tax status: ${COMPANY.vatStatus} (VAT-exempt small taxpayer status)`,
            `E-mail: ${COMPANY.email}`,
            `Phone: ${COMPANY.phone}`,
            `Website: ${COMPANY.website}`,
          ],
          afterList: [
            "The registration is recorded in the register of sole traders. The service provider is not a member of any professional self-regulatory body and has not subjected itself to any code of conduct.",
          ],
        },
        {
          heading: "Hosting provider",
          list: [
            `Name: ${HOSTING.name}`,
            `Contact for hosting matters: ${HOSTING.contact}`,
          ],
        },
        {
          heading: "Supervisory authorities",
          list: [
            `NAV (National Tax and Customs Administration of Hungary) – ${AUTHORITIES.nav}`,
            `Consumer protection authority – ${AUTHORITIES.fogyasztovedelem}`,
            `NAIH (Hungarian National Authority for Data Protection and Freedom of Information) – ${AUTHORITIES.naih}`,
          ],
        },
        {
          heading: "Complaint handling",
          paragraphs: [
            `Questions or complaints regarding the service can be sent to ${COMPANY.email} or by phone to ${COMPANY.phone}. Complaints are investigated and answered in writing within the statutory deadline. You can read about consumer remedies on the Consumer Information page.`,
          ],
        },
      ]}
    />
  ),
});
