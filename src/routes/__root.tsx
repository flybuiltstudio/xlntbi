import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { CookieConsent } from "@/components/CookieConsent";
import { initAnalytics } from "@/lib/analytics";
import { langFromPath, useLanguagePersistence } from "@/lib/i18n";
import { translate } from "@/lib/i18n/dictionary";
import { getProductOverrides } from "@/lib/product-overrides.functions";
import { applyProductOverrides } from "@/lib/product-overrides";



function NotFoundComponent() {
  const pathname = useRouterState({ select: (st) => st.location.pathname });
  const lang = langFromPath(pathname);
  const tr = (k: Parameters<typeof translate>[1]) => translate(lang, k);
  const home = lang === "en" ? "/en" : "/";
  const contact = lang === "en" ? "/en/contact" : "/kapcsolat";
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">{tr("notFound.title")}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{tr("notFound.text")}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Link
            to={home}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {tr("notFound.home")}
          </Link>
          <Link
            to={contact}
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            {tr("nav.contact")}
          </Link>
        </div>
      </div>
    </div>
  );
}


function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  const pathname = useRouterState({ select: (st) => st.location.pathname });
  const lang = langFromPath(pathname);
  const tr = (k: Parameters<typeof translate>[1]) => translate(lang, k);
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          {tr("error.title")}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">{tr("error.text")}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {tr("error.retry")}
          </button>
          <a
            href={lang === "en" ? "/en" : "/"}
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            {tr("notFound.home")}
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  // Layers the admin-managed product descriptions and license prices onto the
  // catalog before anything renders, so SSR output already carries them.
  loader: async () => {
    const data = await getProductOverrides();
    applyProductOverrides(data);
    return { productOverrides: data };
  },
  staleTime: 60_000,
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "author", content: "Sarinay Dávid – EXCELlent Business Intelligence" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap",
      },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "icon", href: "/favicon.png", type: "image/png" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <html lang={langFromPath(pathname)}>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();
  useLanguagePersistence();

  useEffect(() => {
    // Initialise Google Analytics (only loads after statistics consent).
    initAnalytics();
  }, []);

  useEffect(() => {
    // Notify analytics of client-side route changes so GA4 records page_views.
    const dispose = router.subscribe("onResolved", () => {
      window.dispatchEvent(
        new CustomEvent("xlntbi:route-change", {
          detail: { path: window.location.pathname },
        }),
      );
    });
    return () => dispose();
  }, [router]);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1">
          {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
          <Outlet />
        </main>
        <SiteFooter />
        <CookieConsent />
      </div>

    </QueryClientProvider>
  );
}

