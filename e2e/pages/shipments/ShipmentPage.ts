import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'

export class ShipmentPage {
  constructor(private page: Page) {}

  async gotoList(transportType = 'sea') {
    await this.page.goto(`/shipment/${transportType}`)
  }

  async gotoDetail(id: number, tab1 = '', tab2 = '') {
    const tabSuffix = tab1 ? `/${tab1}${tab2 ? `-${tab2}` : ''}` : ''
    await this.page.goto(`/shipment/${id}${tabSuffix}`)
  }

  async expectListLoaded() {
    await expect(this.page.getByRole('table')).toBeVisible()
  }

  async expectDetailLoaded() {
    await expect(this.page.getByRole('main')).toBeVisible()
    await expect(this.page).not.toHaveURL(/\/login/)
    await expect(this.page.getByText(/something went wrong|unhandled error/i)).not.toBeVisible()
  }

  async clickTab(tabName: string) {
    const tab = this.page.getByRole('tab', { name: new RegExp(tabName, 'i') })
    await tab.click()
    await expect(tab).toHaveAttribute('aria-selected', 'true')
  }

  async expectTabContentVisible() {
    await expect(this.page.getByRole('tabpanel')).toBeVisible()
  }

  async clickAdd() {
    await this.page.getByRole('button', { name: /add|create|new shipment/i }).first().click()
  }

  async saveDialog() {
    await this.page.getByRole('dialog').getByRole('button', { name: /save|submit|create/i }).click()
    await this.page.getByRole('dialog').waitFor({ state: 'hidden' })
  }

  async expectShipmentInList(text: string) {
    await expect(this.page.getByRole('row').filter({ hasText: text })).toBeVisible()
  }
}
