import { Link, createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { z } from "zod";

import { getStripeEnvironment } from "@/lib/stripe";
import { getCheckoutSummary } from "@/utils/payments.functions";

type Summary = Awaited<ReturnType<typeof getCheckoutSummary>>;

function money(value: number, currency: string): string {
  return currency === "HUF"
    ? `${Math.round(value).toLocaleString("hu-HU")} Ft`
    : `${value.toLocaleString("hu-HU")} ${currency}`;
}

const TITLE = "Sikeres fizetés | EXCELlent";
const DESC = "A bankkártyás fizetés megtörtént, a megrendelés visszaigazolása e-mailben érkezik.";

export const Route = createFileRoute("/megrendeles_/koszonjuk")({
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
      { property: "og:locale", content: "hu_HU" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: ThankYouPage,
});

function ThankYouPage() {
  const { rendeles, session_id: sessionId } = Route.useSearch();
  const [summary, setSummary] = useState<Summary | null>(null);
  const fetchSummary = useServerFn(getCheckoutSummary);

  useEffect(() => {
    if (!sessionId) return;
    let cancelled = false;
    fetchSummary({ data: { sessionId, environment: getStripeEnvironment() } })
      .then((result) => {
        if (!cancelled) setSummary(result);
      })
      .catch(() => {
        if (!cancelled) setSummary(null);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  const currency = summary?.currency ?? "HUF";

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
      {summary?.ok && typeof summary.totalAmount === "number" ? (
        <dl className="mt-8 space-y-1.5 rounded-lg border border-border bg-card px-4 py-4 text-sm">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Fizetés részletezése
          </p>
          <div className="flex items-baseline justify-between gap-4">
            <dt className="text-muted-foreground">Eredeti összeg</dt>
            <dd className="font-medium text-foreground">
              {money(summary.originalAmount ?? summary.totalAmount, currency)}
            </dd>
          </div>
          {summary.discountAmount ? (
            <div className="flex items-baseline justify-between gap-4">
              <dt className="text-muted-foreground">
                Kuponkedvezmény
                {summary.couponCode ? ` (${summary.couponCode})` : ""}
              </dt>
              <dd className="font-semibold text-primary">
                −{money(summary.discountAmount, currency)}
              </dd>
            </div>
          ) : null}
          <div className="flex items-baseline justify-between gap-4 border-t border-border pt-2">
            <dt className="font-semibold text-foreground">Fizetett végösszeg</dt>
            <dd className="text-base font-bold text-foreground">
              {money(summary.totalAmount, currency)}
            </dd>
          </div>
          {summary.discountAmount ? (
            <p className="pt-1 text-xs text-muted-foreground">
              A kedvezmény tételesen szerepel a számlán is.
            </p>
          ) : null}
        </dl>
      ) : null}

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
