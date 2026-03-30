import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    root: "/root/cs-erp",
    include: ["tests/**/*.test.ts"],
    environment: "node",
    globals: true,
    testTimeout: 15_000,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
