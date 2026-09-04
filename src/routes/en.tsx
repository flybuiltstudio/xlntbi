import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { translate } from "@/lib/i18n/dictionary";

export const Route = createFileRoute("/en")({
  component: EnglishLayout,
  notFoundComponent: EnglishNotFound,
});

function EnglishLayout() {
  return <Outlet />;
}

function EnglishNotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-background px-4 py-20">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">
          {translate("en", "notFound.title")}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">{translate("en", "notFound.text")}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Link
            to="/en"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {translate("en", "notFound.home")}
          </Link>
          <Link
            to="/en/contact"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            {translate("en", "nav.contact")}
          </Link>
        </div>
      </div>
    </div>
  );
}
