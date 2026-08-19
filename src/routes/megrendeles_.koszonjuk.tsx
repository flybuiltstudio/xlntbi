import { Link, createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const TITLE = "Sikeres fizetés | EXCELlent";
const DESC = "A bankkártyás fizetés megtörtént, a megrendelés visszaigazolása e-mailben érkezik.";

export const Route = createFileRoute("/megrendeles/koszonjuk")({
  validateSearch: z.object({
    rendeles: z.string().max(40).optional(),
    session_id: z.string().max(200).optional(),
  }),
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: ThankYouPage,
});

function ThankYouPage() {
  const { rendeles } = Route.useSearch();

  return (
    <div className="mx-auto max-w-2xl px-4 py-20">
      <h1 className="text-3xl font-bold text-foreground">Köszönöm, a fizetés megtörtént!</h1>
      <p className="mt-4 text-base leading-relaxed text-muted-foreground">
        {rendeles ? (
          <>
            A rendelésed száma: <strong className="text-foreground">{rendeles}</strong>.{" "}
          </>
        ) : null}
        A visszaigazolást és a számlát elküldöm a megadott e-mail címre, a letöltési tudnivalókkal
        együtt. Ha bármi kérdésed van, válaszolj a visszaigazoló levélre.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          to="/termekeim"
          className="inline-flex items-center rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-brand-dark"
        >
          Vissza a termékekhez
        </Link>
        <Link
          to="/kapcsolat"
          className="inline-flex items-center rounded-md border border-input px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-accent"
        >
          Kapcsolat
        </Link>
      </div>
    </div>
  );
}
