import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'

export class ReportPage {
  constructor(private page: Page) {}

  async goto(reportPath: string) {
    await this.page.goto(`/report/${reportPath}`)
  }

  async expectLoaded() {
    await expect(this.page.getByRole('main')).toBeVisible()
    await expect(this.page).not.toHaveURL(/\/login/)
    await expect(this.page.getByText(/something went wrong|unhandled error/i)).not.toBeVisible()
  }
}
