import { createServerFn } from "@tanstack/react-start";

import type { ProductOverrideData } from "./product-overrides";

/**
 * Public, read-only fetch of the product description and price overrides.
 * Called from the root route loader so every page (SSR included) renders the
 * current text and price.
 */
export const getProductOverrides = createServerFn({ method: "GET" }).handler(
  async (): Promise<ProductOverrideData> => {
    const { readProductOverrides } = await import("./product-overrides.server");
    return readProductOverrides();
  },
);
