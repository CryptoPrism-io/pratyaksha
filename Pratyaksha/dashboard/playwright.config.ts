import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: 'test-results/html-report' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['list']
  ],
  outputDir: 'test-results/screenshots',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'on',
    video: 'retain-on-failure',
  },
  projects: [
    // Desktop - Chrome
    {
      name: 'desktop-chrome',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
      },
    },
    // Desktop - Firefox
    {
      name: 'desktop-firefox',
      use: {
        ...devices['Desktop Firefox'],
        viewport: { width: 1920, height: 1080 },
      },
    },
    // Desktop - Safari
    {
      name: 'desktop-safari',
      use: {
        ...devices['Desktop Safari'],
        viewport: { width: 1920, height: 1080 },
      },
    },
    // iPad Pro (landscape)
    {
      name: 'ipad-pro-landscape',
      use: {
        ...devices['iPad Pro 11 landscape'],
      },
    },
    // iPad Pro (portrait)
    {
      name: 'ipad-pro-portrait',
      use: {
        ...devices['iPad Pro 11'],
      },
    },
    // iPad Mini
    {
      name: 'ipad-mini',
      use: {
        ...devices['iPad Mini'],
      },
    },
    // iPhone 14 Pro Max
    {
      name: 'mobile-iphone-14-pro-max',
      use: {
        ...devices['iPhone 14 Pro Max'],
      },
    },
    // iPhone 14
    {
      name: 'mobile-iphone-14',
      use: {
        ...devices['iPhone 14'],
      },
    },
    // iPhone SE
    {
      name: 'mobile-iphone-se',
      use: {
        ...devices['iPhone SE'],
      },
    },
    // Pixel 7
    {
      name: 'mobile-pixel-7',
      use: {
        ...devices['Pixel 7'],
      },
    },
    // Galaxy S23
    {
      name: 'mobile-galaxy-s23',
      use: {
        viewport: { width: 360, height: 780 },
        deviceScaleFactor: 3,
        isMobile: true,
        hasTouch: true,
      },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
