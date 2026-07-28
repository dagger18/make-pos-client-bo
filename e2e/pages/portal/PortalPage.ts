import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'

export class PortalPage {
  constructor(private page: Page) {}

  async gotoLogin() {
    await this.page.goto('/portal/login')
  }

  async login(username: string, password: string) {
    await this.page.getByLabel(/email|username/i).fill(username)
    await this.page.getByLabel(/password/i).fill(password)
    await this.page.getByRole('button', { name: /login|sign in/i }).click()
    await this.page.waitForURL(url => !url.pathname.includes('/portal/login'))
  }

  async gotoDashboard() {
    await this.page.goto('/portal/dashboard')
  }

  async gotoShipments() {
    await this.page.goto('/portal/shipments')
  }

  async gotoInvoices() {
    await this.page.goto('/portal/invoices')
  }

  async gotoDocuments() {
    await this.page.goto('/portal/documents')
  }

  async gotoQuoteRequest() {
    await this.page.goto('/portal/quote-request')
  }

  async expectPageLoaded() {
    await expect(this.page.getByRole('main')).toBeVisible()
    await expect(this.page).not.toHaveURL(/\/portal\/login/)
    await expect(this.page.getByText(/something went wrong|unhandled error/i)).not.toBeVisible()
  }
}
