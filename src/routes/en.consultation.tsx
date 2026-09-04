import { createFileRoute } from "@tanstack/react-router";
import { ContactForm } from "@/components/ContactForm";
import { PageHero } from "@/components/PageHero";
import { buildHead } from "@/lib/i18n/head";

const TITLE = "Request a consultation | EXCELlent Business Intelligence";
const DESCRIPTION =
  "Request a consultation on bookkeeping, taxation, controlling, BI or custom development. Fill in the form and I will reply shortly.";

export const Route = createFileRoute("/en/consultation")({
  head: () =>
    buildHead({ huPath: "/konzultacio", lang: "en", title: TITLE, description: DESCRIPTION }),
  component: EnglishConsultation,
});

const SERVICES = [
  "Bookkeeping",
  "Sole trader bookkeeping",
  "Tax advisory",
  "Fintech and BI",
  "Controlling",
  "Company audit",
  "Statutory audit",
  "Accounting firm audit",
  "Digital time-saving audit",
  "Custom development",
  "Training",
  "Other",
];

const CONTACT_METHODS = ["By e-mail", "By phone", "Either"];

const CONTACT_TIMES = [
  "Weekdays morning (8:00–12:00)",
  "Weekdays afternoon (12:00–17:00)",
  "Evening after 17:00",
  "At the weekend",
  "Any time",
];

function EnglishConsultation() {
  return (
    <>
      <PageHero>
        <h1 className="text-3xl font-bold text-primary-foreground md:text-4xl">Consultation</h1>
      </PageHero>

      <div className="mx-auto max-w-4xl px-4 py-14 md:py-16">
        <p className="text-base leading-relaxed text-muted-foreground">
          Fill in the form below and let me know what you would like to consult about.
          <br />
          I will write back how we can move forward fastest, and we will agree on a time.
        </p>
        <div className="mt-8">
          <ContactForm
            formType="konzultacio"
            serviceOptions={SERVICES}
            serviceLabel="What topic would you like a consultation about?"
            showCompany
            contactMethodOptions={CONTACT_METHODS}
            contactTimeOptions={CONTACT_TIMES}
            allTimeLabel="Any time"
            emailMethodLabel="By e-mail"
            messageLabel="Message"
            defaultMessage={`Dear Dávid,

I would like to consult with you about the selected topic(s).

Thank you!`}
            submitLabel="Request consultation"
          />
        </div>
      </div>
    </>
  );
}
