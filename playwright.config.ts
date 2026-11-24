import { defineConfig, devices } from "@playwright/test";

/**
 * Runs against a production build in mock mode: `NEXT_PUBLIC_API_MODE=mock npm run build` first (NEXT_PUBLIC_*
 * values are inlined at build time). Not installed on the dev PC; CI and the VM run it (see .github/workflows).
 */
const PORT = 3010;
export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  expect: { timeout: 15_000 },
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: { baseURL: `http://localhost:${PORT}`, trace: "retain-on-failure", screenshot: "only-on-failure" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: `npx next start -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
