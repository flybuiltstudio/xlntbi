import { createStart, createCsrfMiddleware, createMiddleware } from "@tanstack/react-start";

import { renderErrorPage } from "./lib/error-page";
import { attachSupabaseAuth } from "@/integrations/supabase/auth-attacher";

const errorMiddleware = createMiddleware().server(async ({ next, request }) => {
  // Lovable platform routes authenticate themselves; never wrap/redirect them.
  if (new URL(request.url).pathname.startsWith("/lovable/")) {
    return next();
  }

  try {
    return await next();
  } catch (error) {
    if (error != null && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    console.error(error);
    return new Response(renderErrorPage(), {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
});

// Start installs this automatically when src/start.ts is absent; defining the
// file opts out, so re-add it explicitly to keep server functions protected
// from cross-site requests.
const csrfMiddleware = createCsrfMiddleware({
  filter: (ctx) => ctx.handlerType === "serverFn",
});

// Counters follow successfully served documents, never caller-selected RPC data.
const pageViewMiddleware = createMiddleware().server(async ({ next, request }) => {
  const result = await next();
  const response = result instanceof Response ? result : result.response;
  try {
    const { recordServedPageView } = await import("./lib/page-views.server");
    await recordServedPageView(request, response);
  } catch {
    // Statistics must not interfere with page delivery.
    console.error("[page-views] recording failed");
  }
  return result;
});

export const startInstance = createStart(() => ({
  functionMiddleware: [attachSupabaseAuth],
  requestMiddleware: [errorMiddleware, csrfMiddleware, pageViewMiddleware],
}));
