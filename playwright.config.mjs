import { defineConfig, devices } from '@playwright/test'
import { config } from 'dotenv'

config({ path: '.env.e2e' })

if (!process.env.E2E_BASE_URL) {
  throw new Error('E2E_BASE_URL is not set. Copy .env.e2e and fill in the values.')
}

export default defineConfig({
  testDir: './e2e/tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: 'html',
  use: {
    baseURL: process.env.E2E_BASE_URL,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'setup',
      testDir: './e2e/setup',
      testMatch: /auth\.setup\.ts/,
    },
    {
      name: 'seed',
      testDir: './e2e/setup',
      testMatch: /seed\.setup\.ts/,
      dependencies: ['setup'],
      use: {
        storageState: 'playwright/.auth/user.json',
      },
    },
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/user.json',
      },
      dependencies: ['seed'],
    },
  ],
})
