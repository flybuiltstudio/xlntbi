import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/kalkulatorok/invoice-dates")({
  beforeLoad: () => {
    throw redirect({ to: "/en/calculators/invoice-dates", replace: true });
  },
});
