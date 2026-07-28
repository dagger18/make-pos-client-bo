import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'

export class AccountingPage {
  constructor(private page: Page) {}

  async gotoJournal() {
    await this.page.goto('/accounting/journal')
  }

  async gotoAgeingAP() {
    await this.page.goto('/accounting/ageing-ap')
  }

  async gotoAgeingAR() {
    await this.page.goto('/accounting/ageing-ar')
  }

  async gotoPnlPeriod() {
    await this.page.goto('/accounting/pnl-period')
  }

  async expectPageLoaded() {
    await expect(this.page.getByRole('main')).toBeVisible()
    await expect(this.page).not.toHaveURL(/\/login/)
    await expect(this.page.getByText(/something went wrong|unhandled error/i)).not.toBeVisible()
  }

  async expectTableVisible() {
    await expect(this.page.getByRole('table')).toBeVisible()
  }
}
