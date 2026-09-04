import { createFileRoute } from "@tanstack/react-router";
import { Facebook, Instagram, Linkedin, Mail, Phone } from "lucide-react";
import kapcsolatBusiness from "@/assets/kapcsolat-business.jpg";
import { ContactForm } from "@/components/ContactForm";
import { NewsletterSignup } from "@/components/NewsletterSignup";
import { PageHero } from "@/components/PageHero";
import { buildHead } from "@/lib/i18n/head";

const TITLE = "Contact: bookkeeping and BI consulting | EXCELlent Business Intelligence";
const DESCRIPTION =
  "Get in touch about bookkeeping, tax advisory, controlling or my digital products. Phone, e-mail and contact form.";

export const Route = createFileRoute("/en/contact")({
  head: () => buildHead({ huPath: "/kapcsolat", lang: "en", title: TITLE, description: DESCRIPTION }),
  component: EnglishContact,
});

const SERVICES = [
  "Bookkeeping",
  "Tax advisory",
  "Fintech and BI",
  "Controlling",
  "Company audit",
  "Statutory audit",
  "Accounting firm audit",
  "Digital time-saving audit",
];

function EnglishContact() {
  return (
    <>
      <PageHero>
        <h1 className="text-3xl font-bold text-primary-foreground md:text-4xl">Contact</h1>
      </PageHero>

      <div className="mx-auto max-w-6xl px-4 py-14 md:py-16">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr]">
          <div className="space-y-6">
            <div className="rounded-2xl border border-border/60 bg-muted/40 p-5">
              <h2 className="text-base font-semibold text-foreground">Newsletter</h2>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                Changes in legislation, deadlines and new Excel tools – a few e-mails a month.
              </p>
              <div className="mt-4">
                <NewsletterSignup />
              </div>
            </div>

            <h2 className="text-xl font-semibold text-foreground">My contact details</h2>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li className="flex items-start gap-3">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                <a href="tel:+36209622176" className="hover:text-foreground">
                  +36 20 962 2176
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                <a href="mailto:info@xlntbi.hu" className="hover:text-foreground">
                  info@xlntbi.hu
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Facebook className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                <a
                  href="https://www.facebook.com/xlntbi"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground"
                >
                  Facebook
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Instagram className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                <a
                  href="https://www.instagram.com/xlntbi/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground"
                >
                  Instagram
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Linkedin className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                <a
                  href="https://www.linkedin.com/company/xlntbi/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground"
                >
                  LinkedIn
                </a>
              </li>
              <li className="flex items-start gap-3">
                <svg
                  className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .57.04.84.13V9.4a6.34 6.34 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43V8.69a8.16 8.16 0 0 0 4.77 1.52V6.76a4.83 4.83 0 0 1-.04-.07z" />
                </svg>
                <a
                  href="https://www.tiktok.com/@xlntbi"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground"
                >
                  TikTok
                </a>
              </li>
            </ul>
            <figure className="mt-2 overflow-hidden rounded-2xl border border-border/60 shadow-lg">
              <img
                src={kapcsolatBusiness}
                alt="Elegant, modern illustration symbolising business contact"
                width={1200}
                height={912}
                loading="lazy"
                className="h-auto w-full object-cover"
              />
            </figure>
          </div>

          <div>
            <p className="max-w-2xl text-base leading-relaxed text-muted-foreground">
              Feel free to write if you have a question about my services or products.
              <br />
              Fill in the form and I will reply shortly.
            </p>
            <h2 className="mt-8 text-xl font-semibold text-foreground">Write to me</h2>
            <div className="mt-5">
              <ContactForm
                formType="kapcsolat"
                serviceOptions={SERVICES}
                messageLabel="Message"
                defaultMessage={`Dear Dávid,

When could we talk about the selected topic(s)?

Thank you!`}
                submitLabel="Send message"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
