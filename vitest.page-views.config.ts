import { defineConfig } from "vitest/config";

// Test server-only helpers without Start's RPC transform.
export default defineConfig({
  resolve: { alias: { "@": new URL("./src", import.meta.url).pathname } },
  test: { include: ["src/lib/page-views.server.test.ts", "src/lib/page-view-navigation.test.ts", "src/lib/page-view-history.test.ts", "src/lib/page-view-reporting.test.ts"] },
});