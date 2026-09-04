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
        "The training topics are built around bookkeeping, taxation, digital processes, Power BI and automation. The emphasis is always on practical application.",
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
          "Career starters",
          "Advanced professionals",
        ],
        ctaLabel: "Request a consultation",
        ctaTo: "/en/consultation",
      }}
    />
  );
}
