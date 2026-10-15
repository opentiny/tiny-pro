  import { defineConfig, devices } from '@playwright/test';
  import { resolvePlaywrightWebServerCommand } from './playwright-webserver.mjs';

  export default defineConfig({
    workers: 1,
    timeout: 60_000,
    expect: { timeout: 10_000 },
    fullyParallel: false,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 1,
    reporter: [
      ['list'],
      ['html', { outputFolder: 'playwright-report', open: 'never' }]
    ],
    use: {
      baseURL: 'http://localhost:3031/vue-pro', 
      trace: 'on-first-retry',
    },
    projects: [
      // 手机
      {
        name: 'iPhone 12 Safari', // 390 * 664
        use: { ...devices['iPhone 12'] },
        testDir: './tests/e2e/mobile',
      },
      {
        name: 'Pixel 5', // 393 * 727
        use: { ...devices['Pixel 5'] },
        testDir: './tests/e2e/mobile',
      },
      // 平板
      {
        name: 'iPad (gen 5)', // 768 * 1024
        use: { ...devices['iPad (gen 5)'] },
        testDir: './tests/e2e/mobile',
      }
    ],
    webServer: {
      command: resolvePlaywrightWebServerCommand(),
      cwd: 'template/tinyvue',
      url: 'http://localhost:3031/vue-pro',
      reuseExistingServer: true,
      timeout: 120_000
    }
  });
