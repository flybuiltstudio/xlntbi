import { createFileRoute } from "@tanstack/react-router";
import { ServicePage } from "@/components/ServicePage";
import { buildHead } from "@/lib/i18n/head";
import heroImage from "@/assets/oktatas.jpg";


const TITLE = "Training: accounting, tax and Power BI courses | EXCELlent Business Intelligence";
const DESCRIPTION =
  "Practical training in bookkeeping, taxation, digital processes, Excel, Power BI and automation – knowledge you can use in your daily work.";

export const Route = createFileRoute("/en/training")({
  head: () => buildHead({ huPath: "/oktatas", lang: "en", title: TITLE, description: DESCRIPTION }),
  component: EnglishTraining,
});

function EnglishTraining() {
  return (
    <ServicePage
      title="Training"
      intro={[
        "In my training sessions I do not only pass on theory, but knowledge that can be applied in daily work. The goal is that participants not only understand the topic, but can actually use it.",
        "The training topics are built around bookkeeping, taxation, digital processes, Excel (including advanced-level use and macros), Power BI and automation. The emphasis is always on practical application.",
      ]}
      ctaLabel="Request training"
      ctaTo="/en/consultation"
      image={heroImage}
      imageAlt="Training – professional course"
      listTitle="Topics"
      listItems={[
        "Bookkeeping basics and advanced practice",
        "Tax logic and decision support",
        "Professional-level Excel use",
        "Power BI basics",
        "Automation with a financial mindset",
        "Using AI in everyday work",
        "Preparation for exams and practical work",
      ]}
      closing={{
        heading: "Who is it for?",
        items: [
          "College and university students",
          "Students of certified accountant (mérlegképes könyvelő) courses",
          "Tax advisor candidates",
          "Statutory auditor candidates",
          "Career starters",
          "Advanced professionals",
        ],
        ctaLabel: "Request a consultation",
        ctaTo: "/en/consultation",
      }}
    >
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-2xl font-bold text-foreground">For those preparing for exams</h2>
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground">
          If you are preparing for an exam in a certified accountant course (Business or IFRS
          specialisation), tax advisor course or statutory auditor training, and are interested in
          fully worked exam papers and/or topics, I recommend the{" "}
          <a
            href="https://vizsgasorok.lovable.app"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-primary underline underline-offset-4 hover:text-brand-dark"
          >
            vizsgasorok.lovable.app
          </a>{" "}
          website.
        </p>
      </section>
    </ServicePage>
  );
}
