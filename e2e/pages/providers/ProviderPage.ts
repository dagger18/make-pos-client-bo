import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'

export class ProviderPage {
  constructor(private page: Page) {}

  async gotoList(providerType = 'freight') {
    await this.page.goto(`/provider/${providerType}`)
  }

  async gotoDetail(id: number) {
    await this.page.goto(`/provider/id-${id}`)
  }

  async clickAdd() {
    await this.page.getByRole('button', { name: /add|create|new/i }).first().click()
  }

  async fillName(name: string) {
    await this.page.getByRole('dialog').getByLabel(/name/i).fill(name)
  }

  async saveDialog() {
    await this.page.getByRole('dialog').getByRole('button', { name: /save|submit|add/i }).click()
    await this.page.getByRole('dialog').waitFor({ state: 'hidden' })
  }

  async expectProviderInList(name: string) {
    await expect(this.page.getByRole('row').filter({ hasText: name })).toBeVisible()
  }

  async clickEditForProvider(name: string) {
    const row = this.page.getByRole('row').filter({ hasText: name })
    await row.getByRole('button', { name: /edit/i }).click()
  }
}
