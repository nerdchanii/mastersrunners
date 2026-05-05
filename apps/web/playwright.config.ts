import { defineConfig, devices } from "@playwright/test";

const PLAYWRIGHT_PORT = 3100;
const PLAYWRIGHT_BASE_URL = `http://127.0.0.1:${PLAYWRIGHT_PORT}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  timeout: 15000,
  use: {
    baseURL: PLAYWRIGHT_BASE_URL,
    trace: "on-first-retry",
    actionTimeout: 10000,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: `pnpm exec vite --host 127.0.0.1 --port ${PLAYWRIGHT_PORT}`,
    url: PLAYWRIGHT_BASE_URL,
    reuseExistingServer: false,
  },
});
