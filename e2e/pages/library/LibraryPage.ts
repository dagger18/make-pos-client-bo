import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'

export class LibraryPage {
  constructor(private page: Page) {}

  async gotoHsCodes() {
    await this.page.goto('/library/hs-code')
  }

  async gotoIncoterms() {
    await this.page.goto('/library/incoterm')
  }

  async gotoShipmentModes() {
    await this.page.goto('/library/shipment-mode')
  }

  async gotoPackageTypes(transportType = 'sea') {
    await this.page.goto(`/library/package-type/${transportType}`)
  }

  async clickAdd() {
    await this.page.getByRole('button', { name: /add|create|new/i }).first().click()
  }

  async fillField(label: string | RegExp, value: string) {
    await this.page.getByRole('dialog').getByLabel(label).fill(value)
  }

  async saveDialog() {
    await this.page.getByRole('dialog').getByRole('button', { name: /save|submit|add/i }).click()
    await this.page.getByRole('dialog').waitFor({ state: 'hidden' })
  }

  async expectRowWithText(text: string) {
    await expect(this.page.getByRole('row').filter({ hasText: text })).toBeVisible()
  }

  async clickEditForRow(text: string) {
    const row = this.page.getByRole('row').filter({ hasText: text })
    await row.getByRole('button', { name: /edit/i }).click()
  }

  async clickDeleteForRow(text: string) {
    const row = this.page.getByRole('row').filter({ hasText: text })
    await row.getByRole('button', { name: /delete/i }).click()
    await this.page.getByRole('button', { name: /confirm|yes|delete/i }).click()
  }

  async expectNoRowWithText(text: string) {
    await expect(this.page.getByRole('row').filter({ hasText: text })).toHaveCount(0)
  }
}
