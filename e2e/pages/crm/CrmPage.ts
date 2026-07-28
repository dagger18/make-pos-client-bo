import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'

export class CrmPage {
  constructor(private page: Page) {}

  async gotoLeads() {
    await this.page.goto('/crm/leads')
  }

  async gotoOpportunities() {
    await this.page.goto('/crm/opportunities')
  }

  async gotoActivities() {
    await this.page.goto('/crm/activities')
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

  async expectTableVisible() {
    await expect(this.page.getByRole('table')).toBeVisible()
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

  async expectRowNotVisible(text: string) {
    await expect(this.page.getByRole('row').filter({ hasText: text })).toHaveCount(0)
  }
}
