import { defineConfig, devices } from "@playwright/test";

/**
 * Runs against a production build: `NEXT_PUBLIC_API_MODE=mock npm run build` (mock) or `live` first, since NEXT_PUBLIC_*
 * values are inlined at build time. Not installed on the dev PC; CI and the VM run it (see .github/workflows).
 * E2E_PORT picks the port (default 3010); the server binds to 127.0.0.1 only.
 */
const PORT = Number(process.env.E2E_PORT ?? 3010);
const URL = `http://127.0.0.1:${PORT}`;
export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  expect: { timeout: 15_000 },
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: { baseURL: URL, trace: "retain-on-failure", screenshot: "only-on-failure" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: `npx next start -H 127.0.0.1 -p ${PORT}`,
    url: URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
