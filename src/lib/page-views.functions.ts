import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/**
 * Public counter endpoint. It only accepts a page type and a short page key,
 * stores no personal data, and returns nothing useful to a caller, so it is
 * safe as an unauthenticated endpoint.
 */
export const recordPageView = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z
      .object({
        pageType: z.enum(["product", "service"]),
        pageKey: z
          .string()
          .trim()
          .min(1)
          .max(120)
          .regex(/^[a-z0-9/-]+$/),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const { recordView } = await import("./page-views.server");
    await recordView(data.pageType, data.pageKey);
    return { ok: true };
  });
