import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'

export class RatePage {
  constructor(private page: Page) {}

  async gotoFreight(transportType = 'sea') {
    await this.page.goto(`/rate/freight/${transportType}`)
  }

  async gotoCustoms(transportType = 'sea') {
    await this.page.goto(`/rate/customs/${transportType}`)
  }

  async gotoLocal(transportType = 'sea') {
    await this.page.goto(`/rate/local/${transportType}`)
  }

  async gotoMarkup() {
    await this.page.goto('/rate/markup')
  }

  async gotoImport() {
    await this.page.goto('/rate/import')
  }

  async clickAdd() {
    await this.page.getByRole('button', { name: /add|create|new/i }).first().click()
  }

  async saveDialog() {
    await this.page.getByRole('dialog').getByRole('button', { name: /save|submit|add/i }).click()
    await this.page.getByRole('dialog').waitFor({ state: 'hidden' })
  }

  async expectTableVisible() {
    await expect(this.page.getByRole('table')).toBeVisible()
  }

  async expectRowWithText(text: string) {
    await expect(this.page.getByRole('row').filter({ hasText: text })).toBeVisible()
  }

  async clickEditFirstRow() {
    await this.page.getByRole('row').nth(1).getByRole('button', { name: /edit/i }).click()
  }

  async clickDeleteFirstRow() {
    await this.page.getByRole('row').nth(1).getByRole('button', { name: /delete/i }).click()
    await this.page.getByRole('button', { name: /confirm|yes|delete/i }).click()
  }

  async fillFieldInDialog(label: string | RegExp, value: string) {
    await this.page.getByRole('dialog').getByLabel(label).fill(value)
  }
}
