import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  use: {
    baseURL: "http://127.0.0.1:4178",
    trace: "retain-on-failure",
    launchOptions: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE, args: ["--no-sandbox"] } : {},
  },
  webServer: {
    command: "bun run preview --host 127.0.0.1 --port 4178",
    url: "http://127.0.0.1:4178",
    // Preview cold-start on CI / constrained agents often exceeds 30s after homepage asset growth.
    timeout: 180_000,
    reuseExistingServer: !process.env.CI,
  },
});
