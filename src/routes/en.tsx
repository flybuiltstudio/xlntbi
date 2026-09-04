import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/en")({
  component: EnglishLayout;
});

function EnglishLayout() {
  return <Outlet />;
}
