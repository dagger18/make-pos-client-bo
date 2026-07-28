import { test, expect } from '@playwright/test'
import { seed } from '../../fixtures/seed'
import { ShipmentPage } from '../../pages/shipments/ShipmentPage'

test.describe('Shipments', () => {
  test('shipment list loads for sea', async ({ page }) => {
    const s = new ShipmentPage(page)
    await s.gotoList('sea')
    await s.expectListLoaded()
  })

  test('shipment list loads for air', async ({ page }) => {
    const s = new ShipmentPage(page)
    await s.gotoList('air')
    await s.expectListLoaded()
  })

  test('shipment detail page loads for seeded shipment', async ({ page }) => {
    const s = new ShipmentPage(page)
    await s.gotoDetail(seed.shipmentId)
    await s.expectDetailLoaded()
  })

  test('shipment detail — navigate documents tab', async ({ page }) => {
    const s = new ShipmentPage(page)
    await s.gotoDetail(seed.shipmentId)
    await s.clickTab('documents')
    await s.expectTabContentVisible()
  })

  test('shipment detail — navigate events tab', async ({ page }) => {
    const s = new ShipmentPage(page)
    await s.gotoDetail(seed.shipmentId)
    await s.clickTab('events')
    await s.expectTabContentVisible()
  })

  test('shipment detail — navigate financials tab', async ({ page }) => {
    const s = new ShipmentPage(page)
    await s.gotoDetail(seed.shipmentId)
    await s.clickTab('financials')
    await s.expectTabContentVisible()
  })
})
