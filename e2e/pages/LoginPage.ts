import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'

export class LoginPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/login')
  }

  async login(username: string, password: string) {
    await this.page.locator('input[type="text"]').first().fill(username)
    await this.page.locator('input[type="password"]').fill(password)
    await this.page.getByRole('button', { name: 'Login' }).click()
  }

  async expectError() {
    await expect(this.page.getByText('Wrong credentials').first()).toBeVisible()
  }

  async expectOnLoginPage() {
    await expect(this.page).toHaveURL(/\/login/)
  }
}
