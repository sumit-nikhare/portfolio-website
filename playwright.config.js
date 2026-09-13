import { defineConfig } from "@playwright/test";
import { existsSync } from "node:fs";
const localChrome =
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
export default defineConfig({
  testDir: "./tests/browser",
  fullyParallel: false,
  workers: 1,
  timeout: 30000,
  expect: { timeout: 8000 },
  outputDir: "artifacts/test-results",
  reporter: [
    ["list"],
    ["html", { outputFolder: "artifacts/test-report", open: "never" }],
  ],
  use: {
    baseURL: "http://127.0.0.1:4173",
    viewport: { width: 1440, height: 1000 },
    launchOptions: existsSync(localChrome)
      ? { executablePath: localChrome }
      : {},
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "npm run preview",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: true,
  },
});
