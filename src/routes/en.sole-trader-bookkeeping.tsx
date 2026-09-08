import { createFileRoute, Link } from "@tanstack/react-router";
import { useLocation } from "@tanstack/react-router";
import { Check, ChevronDown } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { usePageView } from "@/lib/use-page-view";
import heroImage from "@/assets/ev-konyveles-poster.jpg";

const TITLE = "Self-employed bookkeeping – KATA & flat-rate | EXCELlent Business Intelligence";
const DESCRIPTION =
  "Bookkeeping for KATA and flat-rate self-employed entrepreneurs at favourable rates, with automated processes and 20 years of professional experience.";
const CANONICAL = "https://xlntbi.hu/en/sole-trader-bookkeeping";
const OG_IMAGE = "https://xlntbi.hu/og/ev-konyveles-poster.jpg";
const HU_URL = "https://xlntbi.hu/ev-konyveles";

const faqItems = [
  {
    q: "Can I change accountants mid-year?",
    a: "Yes. You can join with an already operating self-employed business at any time. The exact handover process is agreed based on your particular situation. There is no need to worry about what your previous accountant thinks: nothing is needed from them for a mid-year change of accountant.",
  },
  {
    q: "Why is the bookkeeping fee so favourable?",
    a: "A significant part of the routine administration is supported by automated processes. This enables more efficient work, while professional review and decision-making stay in the accountant's hands.",
  },
  {
    q: "Do you also take on more complex businesses?",
    a: "Yes, I handle both simple and more complex cases. For VAT scope, foreign relationships or foreign services – for example Google or Facebook ads – the required tasks and the fee are determined based on a prior consultation.",
  },
  {
    q: "Can you help if I do not have a business yet?",
    a: "Yes, I can also help with the main steps of starting a business and with an overview of the available taxation options.",
  },
] as const;

const scopeItems = [
  "Bookkeeping for KATA self-employed entrepreneurs",
  "Bookkeeping for flat-rate self-employed entrepreneurs",
  "Tax return and related administrative tasks",
  "Tracking key deadlines and obligations",
  "Mid-year takeover of an already operating business",
  "Support for starting self-employed businesses",
  "Handling more complex situations – e.g. VAT scope, foreign relationships (such as Google or Facebook ads)",
  "Professional help with individual questions",
];

export const Route = createFileRoute("/en/sole-trader-bookkeeping")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: CANONICAL },
      { property: "og:image", content: OG_IMAGE },
      { property: "og:locale", content: "en_HU" },
      { property: "og:locale:alternate", content: "hu_HU" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
      { name: "twitter:image", content: OG_IMAGE },
    ],
    links: [
      { rel: "canonical", href: CANONICAL },
      { rel: "alternate", hrefLang: "en", href: CANONICAL }, { rel: "alternate", hrefLang: "x-default", href: HU_URL },
      { rel: "alternate", hrefLang: "hu", href: HU_URL },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Service",
          name: "Self-employed bookkeeping – KATA and flat-rate entrepreneurs",
          description: DESCRIPTION,
          serviceType: "Self-employed bookkeeping",
          url: CANONICAL,
          areaServed: "HU",
          provider: {
            "@type": "ProfessionalService",
            name: "EXCELlent Business Intelligence",
            url: "https://xlntbi.hu/",
          },
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "https://xlntbi.hu/" },
            { "@type": "ListItem", position: 2, name: "Services", item: "https://xlntbi.hu/en/services" },
            { "@type": "ListItem", position: 3, name: "SE bookkeeping", item: CANONICAL },
          ],
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqItems.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }),
      },
    ],
  }),
  component: SeBookkeepingPage,
});

function SeBookkeepingPage() {
  const pathname = useLocation({ select: (l) => l.pathname });
  usePageView("service", pathname);
  return (
    <div lang="en">
      <PageHero>
        <h1 className="text-3xl font-bold leading-tight text-primary-foreground md:text-4xl">
          Self-employed bookkeeping
        </h1>
      </PageHero>

      {/* Intro + image */}
      <section className="mx-auto max-w-6xl px-4 py-14 md:py-16">
        <div className="grid items-start gap-10 md:grid-cols-2">
          <div>
            <p className="text-base leading-relaxed text-muted-foreground">
              20 years of professional experience, modern automation and personal expertise. For both
              simple and more complex self-employed situations.
            </p>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              The bookkeeping of a self-employed entrepreneur is not really bookkeeping but payroll
              calculation. That is why many accountants who only handle companies do not even know how to
              do it.
            </p>
          </div>
          <img
            src={heroImage}
            alt="Self-employed bookkeeping – home office with a laptop and calculator"
            loading="lazy"
            className="w-full rounded-xl border border-border object-cover shadow-sm"
          />
        </div>
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-foreground">
            Bookkeeping that adapts to your business
          </h2>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground">
            The bookkeeping of a self-employed business can be simple, but a foreign partner, an
            advertisement placed with a foreign provider – such as Google or Facebook –, VAT scope or
            another special transaction can quickly require more expertise. My goal is for you to have
            solid professional backing even when your business goes beyond the simplest cases.
          </p>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground">
            I combine more than 20 years of bookkeeping experience with automated solutions that
            significantly reduce routine administration. This way I can devote more professional attention
            to where it is truly needed, while the service fee stays favourable.
          </p>
          <Link
            to="/en/consultation"
            className="mt-8 inline-flex items-center rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-brand-dark"
          >
            Request a consultation
          </Link>
        </div>
      </section>

      {/* Pricing */}
      <section className="border-t border-border bg-secondary/60">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="text-2xl font-bold text-foreground">
            Favourable price – with the advantage of automation
          </h2>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground">
            The lower bookkeeping fee does not mean less professional work. A significant part of the
            routine tasks is supported by automated processes, so bookkeeping can be done faster and more
            efficiently. Professional decisions, review and the handling of more complex questions remain
            my responsibility.
          </p>
          <div className="mt-8 overflow-hidden rounded-xl border border-border bg-card">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th scope="col" className="px-5 py-3 font-semibold text-foreground">Service</th>
                  <th scope="col" className="px-5 py-3 font-semibold text-foreground">Fee</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border">
                  <td className="px-5 py-4 font-medium text-card-foreground">KATA bookkeeping</td>
                  <td className="px-5 py-4 text-card-foreground">15,000 HUF / month</td>
                </tr>
                <tr>
                  <td className="px-5 py-4 font-medium text-card-foreground">
                    Bookkeeping for a flat-rate self-employed entrepreneur
                  </td>
                  <td className="px-5 py-4 text-card-foreground">
                    from 60,000 HUF / quarter
                    <span className="block text-xs text-muted-foreground">
                      (20,000 HUF per month)
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            The flat-rate fee may vary depending on the complexity of the business.
          </p>
        </div>
      </section>

      {/* Not only the simplest cases */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-2xl font-bold text-foreground">Not only for the simplest cases</h2>
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground">
          The favourable fee does not mean that I can only handle simple businesses. Alongside the routine
          KATA and flat-rate bookkeeping, I can also help in more complex situations, for example with
          VAT-liable self-employed businesses, foreign relationships or the use of foreign services. An
          everyday example of this can be a Google or Facebook advertisement, whose bookkeeping and tax
          handling may require extra attention.
        </p>
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground">
          If you are not sure whether your business fits within the basic bookkeeping service, I will
          review your situation in a short consultation.
        </p>
      </section>

      {/* Switch, start, year-end */}
      <section className="border-t border-border bg-secondary/60">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <div className="grid gap-10 md:grid-cols-3">
            <div>
              <h2 className="text-xl font-bold text-foreground">You can switch mid-year</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                There is no need to wait until the end of the year to change accountants. You can join at
                any time during the year with an already operating self-employed business, and I will
                agree the necessary transition steps with you in advance. Nothing is needed from your
                previous accountant, so you do not have to worry that something will not be handed over.
                You can be confident that the switch will be smooth and trouble-free.
              </p>
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Starting your self-employed business?</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                If you do not have a business yet, I can also help with starting. We go over your starting
                situation, the taxation options and the main steps needed to launch, so you can build on
                the right foundations from the very beginning.
              </p>
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Year-end closing</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Naturally, I also prepare your year-end closing. As a self-employed entrepreneur this means
                preparing your HIPA (local business tax) and personal income tax return. Its fee is the
                bookkeeping fee applicable to you plus one extra month.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What you can count on */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-2xl font-bold text-foreground">What you can count on</h2>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {scopeItems.map((item) => (
            <li
              key={item}
              className="flex items-start gap-3 rounded-lg border border-border bg-card p-4 text-sm font-medium text-card-foreground"
            >
              <Check className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>
      </section>

      {/* Closing thought */}
      <section className="border-t border-border bg-secondary/60">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="text-2xl font-bold text-foreground">
            20 years of experience. Less routine work. More professional attention.
          </h2>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground">
            For me, automation does not mean replacing the accountant. I use it for what it is good for:
            speeding up repetitive tasks and reducing administration. Experience, review and professional
            decisions are still added by a person.
          </p>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground">
            If, as a KATA or flat-rate self-employed entrepreneur, you are looking for reliable, modern
            and favourably priced bookkeeping, get in touch and we will see which solution fits your
            business.
          </p>
          <Link
            to="/en/consultation"
            className="mt-8 inline-flex items-center rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-brand-dark"
          >
            Request a consultation
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-2xl font-bold text-foreground">Frequently asked questions</h2>
        <div className="mt-8 space-y-3">
          {faqItems.map((f) => (
            <details
              key={f.q}
              className="group rounded-xl border border-border bg-card p-5 [&_summary]:list-none"
            >
              <summary className="flex cursor-pointer items-center justify-between gap-4 text-sm font-semibold text-card-foreground">
                {f.q}
                <ChevronDown
                  className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180"
                  aria-hidden="true"
                />
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
