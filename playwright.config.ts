import { defineConfig } from '@playwright/test';

// Runs against the real production build served by `astro preview`.
export default defineConfig({
  testDir: 'tests',
  timeout: 20_000,
  retries: 0,
  reporter: [['list']],
  use: { baseURL: 'http://localhost:4321', viewport: { width: 1440, height: 900 } },
  webServer: {
    command: 'npx astro preview --port 4321',
    url: 'http://localhost:4321',
    reuseExistingServer: false,
    timeout: 30_000,
  },
});
