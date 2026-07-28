import { test, expect } from '@playwright/test'

test.describe('Login with token', () => {
  test('valid token redirects to dashboard', async ({ page, browser }) => {
    const orgId = process.env.E2E_ORGANIZATION_ID!

    // page uses the saved auth session — use it to fetch the login link
    const response = await page.request.get(`/api/organizations/login-link/${orgId}`)
    expect(response.ok()).toBeTruthy()

    const { link } = await response.json() as { link: string }
    expect(link).toBeTruthy()

    // Navigate the login link in a fresh (unauthenticated) context
    const freshContext = await browser.newContext({ baseURL: process.env.E2E_BASE_URL })
    const freshPage = await freshContext.newPage()

    await freshPage.goto(link)
    await freshPage.waitForURL(url => !url.pathname.includes('/login-with-token/'))
    await expect(freshPage).not.toHaveURL(/\/login$/)

    await freshContext.close()
  })

  test('invalid token shows error state', async ({ browser }) => {
    const baseURL = process.env.E2E_BASE_URL!

    const freshContext = await browser.newContext({ baseURL: process.env.E2E_BASE_URL })
    const freshPage = await freshContext.newPage()

    // Navigate with fake base64 values (decode to "invalid" and "test@example.com")
    const emailB64 = Buffer.from('test@example.com').toString('base64').replace(/=/g, '%3D')
    await freshPage.goto(`${baseURL}/login-with-token/aW52YWxpZA==/${emailB64}`)
    await expect(freshPage.getByText('Invalid or expired login link')).toBeVisible()

    await freshContext.close()
  })
})
