import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'

export class SettingsPage {
  constructor(private page: Page) {}

  async gotoBranches() {
    await this.page.goto('/setting/branch')
  }

  async gotoDepartments() {
    await this.page.goto('/setting/department')
  }

  async gotoGroups() {
    await this.page.goto('/setting/groups')
  }

  async gotoUsers() {
    await this.page.goto('/setting/users')
  }

  async gotoCompany() {
    await this.page.goto('/setting/company')
  }

  async gotoGlobalSetting() {
    await this.page.goto('/setting/global-setting')
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
