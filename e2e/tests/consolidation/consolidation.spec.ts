import { test, expect } from '@playwright/test'
import { seed } from '../../fixtures/seed'
import { ConsolidationPage } from '../../pages/consolidation/ConsolidationPage'

test.describe('Consolidation', () => {
  test('consolidation list loads', async ({ page }) => {
    const c = new ConsolidationPage(page)
    await c.gotoList()
    await expect(page.getByRole('table')).toBeVisible()
  })

  test('consolidation detail loads for seeded consolidation', async ({ page }) => {
    const c = new ConsolidationPage(page)
    await c.gotoDetail(seed.consolidationId)
    await c.expectDetailLoaded()
  })

  test('create new consolidation', async ({ page }) => {
    const c = new ConsolidationPage(page)
    await c.gotoList()
    await c.clickAdd()
    await c.fillField(/name/i, 'E2E Create Consolidation')
    await c.saveDialog()
    await c.expectItemInList('E2E Create Consolidation')
  })

  test('warehouse inventory page loads', async ({ page }) => {
    const c = new ConsolidationPage(page)
    await c.gotoWarehouseInventory()
    await expect(page.getByRole('main')).toBeVisible()
  })

  test('warehouse facility page loads', async ({ page }) => {
    const c = new ConsolidationPage(page)
    await c.gotoWarehouseFacility()
    await expect(page.getByRole('main')).toBeVisible()
  })
})
