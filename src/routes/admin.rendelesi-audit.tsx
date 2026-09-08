import { createFileRoute, redirect } from "@tanstack/react-router";

/** Régi URL: a rendelési audit a Számlázás lapra került. */
export const Route = createFileRoute("/admin/rendelesi-audit")({
  beforeLoad: () => {
    throw redirect({ to: "/admin/szamlazas", replace: true });
  },
});
