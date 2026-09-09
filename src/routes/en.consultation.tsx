import { createFileRoute } from "@tanstack/react-router";
import { ContactForm } from "@/components/ContactForm";
import { PageHero } from "@/components/PageHero";
import { buildHead } from "@/lib/i18n/head";
import { NewsletterSignup } from "@/components/NewsletterSignup";
import pcloudLogo from "@/assets/pcloud-logo.jpg.asset.json";

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
  "Statutory audit",
  "Company audit",
  "Accounting firm audit",
  "Request a DEMO",
  "Custom development",
  "Digital time-saving audit",
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

      <div className="mx-auto max-w-6xl px-4 py-14 md:py-16">
        <div className="grid gap-10 md:grid-cols-[1fr_1.4fr]">
          <div className="space-y-6">
            <div className="rounded-2xl border border-border/60 bg-muted/40 p-5">
              <h2 className="text-base font-semibold text-foreground">Newsletter</h2>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                Regulatory changes, deadlines and new Excel tools — a few emails per month.
              </p>
              <div className="mt-4">
                <NewsletterSignup lang="en" />
              </div>
            </div>
            <div className="rounded-2xl border border-border/60 bg-muted/40 p-5">
              <p className="text-sm leading-relaxed text-muted-foreground">
                🔐 Forget about monthly subscriptions! pCloud's lifetime storage pays for itself in just 2–3 years — far better value than Google Drive, iCloud or OneDrive. Swiss data protection, 100% GDPR compliance and maximum security. I use it exclusively — highly recommended:
              </p>
              <a
                href="https://partner.pcloud.com/r/157443"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-block"
              >
                <img
                  src={pcloudLogo.url}
                  alt="pCloud – Swiss cloud storage"
                  loading="lazy"
                  className="h-auto w-48"
                />
              </a>
            </div>
          </div>
          <div>
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
        </div>
      </div>
    </>
  );
}
