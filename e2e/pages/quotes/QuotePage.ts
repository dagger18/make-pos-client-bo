import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'

export class QuotePage {
  constructor(private page: Page) {}

  async gotoList(transportType = 'sea') {
    await this.page.goto(`/quote/${transportType}`)
  }

  async gotoRequest() {
    await this.page.goto('/quote/request')
  }

  async gotoDetail(id: number) {
    await this.page.goto(`/quote/preview/${id}`)
  }

  async gotoUpdate(id: number) {
    await this.page.goto(`/quote/update/${id}`)
  }

  async expectQuoteInList(text: string) {
    await expect(this.page.getByRole('row').filter({ hasText: text })).toBeVisible()
  }

  async expectDetailVisible() {
    await expect(this.page.getByRole('main')).toBeVisible()
    await expect(this.page).not.toHaveURL(/\/login/)
    await expect(this.page.getByText(/something went wrong|unhandled error/i)).not.toBeVisible()
  }

  async fillRequestForm(data: { clientName: string }) {
    await this.page.getByLabel(/client/i).fill(data.clientName)
    await this.page.getByRole('option').first().click()
  }

  async submitRequest() {
    await this.page.getByRole('button', { name: /submit|save|create/i }).click()
    await this.page.waitForURL(url => !url.pathname.includes('/request'))
  }

  async clickEditFirstRow() {
    await this.page.getByRole('row').nth(1).getByRole('button', { name: /edit/i }).click()
  }

  async clickDeleteFirstRow() {
    await this.page.getByRole('row').nth(1).getByRole('button', { name: /delete/i }).click()
    await this.page.getByRole('button', { name: /confirm|yes|delete/i }).click()
  }
}
