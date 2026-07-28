import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'

export class ConsolidationPage {
  constructor(private page: Page) {}

  async gotoList() {
    await this.page.goto('/consolidation')
  }

  async gotoDetail(id: number) {
    await this.page.goto(`/consolidation/${id}`)
  }

  async gotoWarehouseInventory() {
    await this.page.goto('/warehouse/inventory')
  }

  async gotoWarehouseFacility() {
    await this.page.goto('/warehouse/facility')
  }

  async clickAdd() {
    await this.page.getByRole('button', { name: /add|create|new/i }).first().click()
  }

  async fillField(label: string | RegExp, value: string) {
    await this.page.getByRole('dialog').getByLabel(label).fill(value)
  }

  async saveDialog() {
    await this.page.getByRole('dialog').getByRole('button', { name: /save|submit|create/i }).click()
    await this.page.getByRole('dialog').waitFor({ state: 'hidden' })
  }

  async expectItemInList(text: string) {
    await expect(this.page.getByRole('row').filter({ hasText: text })).toBeVisible()
  }

  async expectDetailLoaded() {
    await expect(this.page.getByRole('main')).toBeVisible()
    await expect(this.page).not.toHaveURL(/\/login/)
    await expect(this.page.getByText(/something went wrong|unhandled error/i)).not.toBeVisible()
  }
}
