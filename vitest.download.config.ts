import { defineConfig } from "vitest/config";

// Exercise the server handler directly, without Start's RPC build transform.
export default defineConfig({
  resolve: { alias: { "@": new URL("./src", import.meta.url).pathname } },
  test: { include: ["src/lib/product-overrides.functions.test.ts"] },
});