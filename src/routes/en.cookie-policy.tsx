import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/LegalPage";
import { buildHead } from "@/lib/i18n/head";

const TITLE = "Cookie Policy | EXCELlent Business Intelligence";
const DESCRIPTION = "Information about the cookies used on the website and how they are managed.";

export const Route = createFileRoute("/en/cookie-policy")({
  head: () =>
    buildHead({
      huPath: "/cookie-tajekoztato",
      lang: "en",
      title: TITLE,
      description: DESCRIPTION,
    }),
  component: () => (
    <LegalPage
      title="Cookie Policy"
      intro={[
        "This notice describes which cookies and similar technologies the xlntbi.hu website uses.",
      ]}
      sections={[
        {
          heading: "What is a cookie?",
          paragraphs: [
            "A cookie is a small data file that the website stores in your browser. It helps the website recognise your settings and ensures basic functionality.",
          ],
        },
        {
          heading: "What cookies does this site use?",
          list: [
            "Necessary (functional) cookies: they serve the secure operation of the site and its forms (for example, protecting submissions against abuse). Their use is essential for operation, so under the electronic communications rules they may be placed without consent.",
            "Payment-related cookies: when starting a card payment, Stripe Payments Europe, Ltd. places cookies to ensure the secure processing of the transaction and fraud prevention. These are likewise necessary for providing the service.",
            "Statistical and marketing cookies: no such cookies currently run on this site. If analytics or advertising measurement code is added later, it will only load after your consent, and this notice will be updated accordingly.",
          ],
        },
        {
          heading: "How can you manage cookies?",
          paragraphs: [
            "You can delete stored cookies or disable their storage at any time in your browser settings. If you disable the necessary cookies, some functions – such as form submission – may not work properly.",
          ],
        },
        {
          heading: "Contact",
          paragraphs: [
            "Have a question about cookies? Write to info@xlntbi.hu. You can read about the processing of personal data in detail in the Privacy Policy.",
          ],
        },
      ]}
    />
  ),
});
