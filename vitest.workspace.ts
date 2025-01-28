import "./src/lib/env/load";
import { resolve } from "path";
import react from "@vitejs/plugin-react";
import { defineConfig, defineWorkspace } from "vitest/config";
import { env } from "./src/lib/env";

const shared = defineConfig({
  test: {
    globals: true,
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
});

export default defineWorkspace([
  {
    ...shared,
    test: {
      ...shared.test,
      include: ["src/services/**/*.test.ts"],
      name: "db",
      environment: "node",
      setupFiles: ["./src/lib/test/setup-db.ts"],
    },
  },
  {
    ...shared,
    plugins: [react()],
    test: {
      ...shared.test,
      include: ["src/lib/**/*.test.ts"],
      name: "browser",
      browser: {
        enabled: true,
        provider: "playwright",
        // https://playwright.dev
        providerOptions: {},
        headless: env.HEADLESS,
      },
    },
  },
]);
