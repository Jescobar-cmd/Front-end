import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  retries: 1,
  workers: 1,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "https://front-end-virid-phi.vercel.app",
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
});
