import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'

export class CarrierPage {
  constructor(private page: Page) {}

  async gotoVesselSailing() {
    await this.page.goto('/carrier/vessel-sailing')
  }

  async gotoFlightSchedule() {
    await this.page.goto('/carrier/flight-schedule')
  }

  async gotoContainerTracking() {
    await this.page.goto('/carrier/container-tracking')
  }

  async expectPageLoaded() {
    await expect(this.page.getByRole('main')).toBeVisible()
    await expect(this.page.getByText(/something went wrong|unhandled error/i)).not.toBeVisible()
  }

  async searchContainer(containerNumber: string) {
    await this.page.getByRole('textbox').first().fill(containerNumber)
    await this.page.getByRole('button', { name: /search|track/i }).first().click()
  }
}
