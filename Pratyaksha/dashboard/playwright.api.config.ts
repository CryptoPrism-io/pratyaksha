import { defineConfig } from '@playwright/test'

// Unit + API tests. No browser and no Vite dev server, unlike playwright.config.ts.
//
//   npm run test:unit                      pure logic tests
//   npm run test:api                       starts the API locally (no DB/AI keys needed)
//   API_URL=https://... npm run test:api   runs against a deployed backend instead

const LOCAL_PORT = 3101
const apiUrl = process.env.API_URL || `http://localhost:${LOCAL_PORT}`
// Only the api project needs a server; `--project=unit` runs without one.
const unitOnly = process.argv.includes('--project=unit')

export default defineConfig({
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { outputFolder: 'test-results/api-report', open: 'never' }]],
  outputDir: 'test-results/api',
  projects: [
    { name: 'unit', testDir: './tests/unit' },
    {
      name: 'api',
      testDir: './tests/api',
      // A sleeping free-tier backend can take ~60 s to answer the first call.
      timeout: 90_000,
      use: { baseURL: apiUrl },
    },
  ],
  webServer: process.env.API_URL || unitOnly
    ? undefined
    : {
        command: 'npx tsx server/index.ts',
        url: `${apiUrl}/health`,
        reuseExistingServer: !process.env.CI,
        timeout: 60_000,
        env: {
          PORT: String(LOCAL_PORT),
          NODE_ENV: 'development',
          CRON_SECRET: 'test-cron-secret',
          // Placeholders: the SDK clients refuse to load without a key, and
          // these tests never reach an AI provider or the database.
          GROQ_API_KEY: 'test',
          OPENROUTER_API_KEY: 'test',
          GEMINI_API_KEY: 'test',
        },
      },
})
