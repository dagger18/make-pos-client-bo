import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'

export class AppPage {
  constructor(private page: Page) {}

  async expectOnDashboard() {
    await expect(this.page).not.toHaveURL(/\/login/)
  }

  async logout() {
    // The logout item lives inside a collapsed user accordion in the nav sidebar.
    // First open the accordion by clicking the avatar/name toggle in the nav header,
    // then click the Logout link that becomes visible.
    await this.page.locator('.nav-header .cursor-pointer').first().click()
    await this.page.locator('.nav-link a', { hasText: 'Logout' }).click()
    await this.page.waitForURL(/\/login/)
  }
}
