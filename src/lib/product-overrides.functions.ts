import { createServerFn } from "@tanstack/react-start";

import { applyProductOverrides, type ProductOverrideData } from "./product-overrides";

/**
 * Public, read-only fetch of the product description and price overrides.
 * Called from the root route loader so every page (SSR included) renders the
 * current text and price. Internal fields (storage paths, Stripe errors) are
 * redacted — server code reads them via readProductOverrides directly.
 */
export const getProductOverrides = createServerFn({ method: "GET" }).handler(
  async (): Promise<ProductOverrideData> => {
    const { readProductOverrides } = await import("./product-overrides.server");
    const data = await readProductOverrides();
    // The server catalog must retain real paths; only the returned DTO is redacted.
    applyProductOverrides(data);
    return {
      ...data,
      custom: data.custom.map((row) => ({
        ...row,
        // Keep a truthy marker so the client still knows a download exists.
        downloadStoragePath: row.downloadStoragePath ? "protected" : null,
        stripeError: null,
      })),
    };
  },
);
