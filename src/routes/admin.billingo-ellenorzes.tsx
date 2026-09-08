import { createFileRoute, redirect } from "@tanstack/react-router";

/** Régi URL: a Billingo ellenőrzés a Számlázás lapra került. */
export const Route = createFileRoute("/admin/billingo-ellenorzes")({
  beforeLoad: () => {
    throw redirect({ to: "/admin/szamlazas", replace: true });
  },
});
