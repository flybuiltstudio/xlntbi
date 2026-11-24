import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { requiresCountedDocument } from "./lib/page-view-navigation";

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  });

  // Link and imperative navigation share this boundary. Counted pages must
  // reach the existing server document counter; all other routes stay SPA.
  const navigate = router.navigate;
  router.navigate = (options) => {
    if (typeof window === "undefined" || options.reloadDocument) {
      return navigate(options);
    }
    if (options.href) {
      const destination = new URL(options.href, window.location.href);
      return navigate({
        ...options,
        reloadDocument: destination.origin === window.location.origin
          && requiresCountedDocument(destination.pathname, window.location.pathname),
      });
    }
    // Both APIs accept navigation options at runtime, but their generic
    // signatures differ in this Router version. Keep the public NavigateFn
    // generic and adapt only the internal location-builder boundary.
    const destination = router.buildLocation(options as Parameters<typeof router.buildLocation>[0]);
    return navigate({
      ...options,
      reloadDocument: requiresCountedDocument(destination.pathname, window.location.pathname),
    });
  };

  return router;
};
