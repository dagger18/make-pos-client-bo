import { test, expect } from '@playwright/test'
import { LoginPage } from '../../pages/LoginPage'

// These tests verify the login page itself — run without saved session
test.use({ storageState: { cookies: [], origins: [] } })

test.describe('Login', () => {
  test('valid credentials redirect away from /login', async ({ page }) => {
    const login = new LoginPage(page)
    await login.goto()
    await login.login(process.env.E2E_USERNAME!, process.env.E2E_PASSWORD!)
    await expect(page).not.toHaveURL(/\/login/)
  })

  test('wrong credentials show error and stay on /login', async ({ page }) => {
    const login = new LoginPage(page)
    await login.goto()
    await login.login('wrong@example.com', 'wrongpassword')
    await login.expectError()
    await login.expectOnLoginPage()
  })
})
