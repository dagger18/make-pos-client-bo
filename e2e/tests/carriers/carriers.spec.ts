import { test, expect } from '@playwright/test'
import { CarrierPage } from '../../pages/carriers/CarrierPage'

test.describe('Carriers — Vessel Sailing', () => {
  test('vessel sailing page loads', async ({ page }) => {
    const c = new CarrierPage(page)
    await c.gotoVesselSailing()
    await c.expectPageLoaded()
  })
})

test.describe('Carriers — Flight Schedule', () => {
  test('flight schedule page loads', async ({ page }) => {
    const c = new CarrierPage(page)
    await c.gotoFlightSchedule()
    await c.expectPageLoaded()
  })
})

test.describe('Carriers — Container Tracking', () => {
  test('container tracking page loads', async ({ page }) => {
    const c = new CarrierPage(page)
    await c.gotoContainerTracking()
    await c.expectPageLoaded()
  })

  test('container tracking search renders result area', async ({ page }) => {
    const c = new CarrierPage(page)
    await c.gotoContainerTracking()
    await c.searchContainer('TCKU1234567')
    await expect(page.getByRole('main')).toBeVisible()
  })
})
