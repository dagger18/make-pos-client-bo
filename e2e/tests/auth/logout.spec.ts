import { test, expect } from '@playwright/test'
import { AppPage } from '../../pages/AppPage'

// This test uses the saved session (default storageState from playwright.config.mjs)
test.describe('Logout', () => {
  test('logout redirects to /login and clears accessToken cookie', async ({ page }) => {
    // Start from dashboard (already authenticated via storageState)
    await page.goto('/')

    const app = new AppPage(page)
    await app.expectOnDashboard()
    await app.logout()

    await expect(page).toHaveURL(/\/login/)

    const cookies = await page.context().cookies()
    const accessToken = cookies.find(c => c.name === 'accessToken')
    expect(accessToken).toBeUndefined()
  })
})
