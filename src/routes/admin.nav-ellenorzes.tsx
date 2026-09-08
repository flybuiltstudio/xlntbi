import { createFileRoute, redirect } from "@tanstack/react-router";

/** Régi URL: a NAV ellenőrzés a Számlázás lapra került. */
export const Route = createFileRoute("/admin/nav-ellenorzes")({
  beforeLoad: () => {
    throw redirect({ to: "/admin/szamlazas", replace: true });
  },
});
