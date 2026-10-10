import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  testMatch: "**/*.spec.ts",
  fullyParallel: true,
  workers: 2,
  timeout: 30000,
  use: { baseURL: "http://127.0.0.1:3000", headless: true, screenshot: "only-on-failure" },
  reporter: [["list"], ["html", { open: "never" }]],
  webServer: [
    {
      command: "node node_modules/next/dist/bin/next start --hostname 127.0.0.1 --port 3000",
      url: "http://127.0.0.1:3000",
      reuseExistingServer: !process.env.CI,
    },
    {
      command: "node node_modules/next/dist/bin/next dev --hostname 127.0.0.1 --port 3002",
      url: "http://127.0.0.1:3002",
      env: { NEXT_PUBLIC_EMART_DEBUG: "false" },
      reuseExistingServer: !process.env.CI,
    },
  ],
});
