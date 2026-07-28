import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'

export class ClientPage {
  constructor(private page: Page) {}

  async gotoList() {
    await this.page.goto('/client')
  }

  async gotoDetail(id: number) {
    await this.page.goto(`/client/${id}`)
  }

  async clickAdd() {
    await this.page.getByRole('button', { name: /add|create|new client/i }).first().click()
  }

  async fillName(name: string) {
    await this.page.getByRole('dialog').getByLabel(/name/i).fill(name)
  }

  async saveDialog() {
    await this.page.getByRole('dialog').getByRole('button', { name: /save|submit|add/i }).click()
    await this.page.getByRole('dialog').waitFor({ state: 'hidden' })
  }

  async expectClientInList(name: string) {
    await expect(this.page.getByRole('row').filter({ hasText: name })).toBeVisible()
  }

  async clickEditForClient(name: string) {
    const row = this.page.getByRole('row').filter({ hasText: name })
    await row.getByRole('button', { name: /edit/i }).click()
  }

  async clickDeleteForClient(name: string) {
    const row = this.page.getByRole('row').filter({ hasText: name })
    await row.getByRole('button', { name: /delete/i }).click()
    await this.page.getByRole('button', { name: /confirm|yes|delete/i }).click()
  }

  async expectClientNotInList(name: string) {
    await expect(this.page.getByRole('row').filter({ hasText: name })).toHaveCount(0)
  }
}
