import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/ev")({
  beforeLoad: () => {
    throw redirect({ to: "/ev-konyveles", replace: true });
  },
});
