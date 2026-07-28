import { test, expect } from '@playwright/test'
import { RatePage } from '../../pages/rates/RatePage'

test.describe('Rates — Freight', () => {
  test('freight rate list loads for sea', async ({ page }) => {
    const r = new RatePage(page)
    await r.gotoFreight('sea')
    await r.expectTableVisible()
  })

  test('freight rate list loads for air', async ({ page }) => {
    const r = new RatePage(page)
    await r.gotoFreight('air')
    await r.expectTableVisible()
  })

  test('create freight rate', async ({ page }) => {
    const r = new RatePage(page)
    await r.gotoFreight('sea')
    await r.clickAdd()
    await r.fillFieldInDialog(/name|description/i, 'E2E Freight Rate')
    await r.saveDialog()
    await r.expectRowWithText('E2E Freight Rate')
  })
})

test.describe('Rates — Customs', () => {
  test('customs rate list loads', async ({ page }) => {
    const r = new RatePage(page)
    await r.gotoCustoms('sea')
    await r.expectTableVisible()
  })
})

test.describe('Rates — Local Charges', () => {
  test('local charge list loads', async ({ page }) => {
    const r = new RatePage(page)
    await r.gotoLocal('sea')
    await r.expectTableVisible()
  })
})

test.describe('Rates — Markup', () => {
  test('markup list loads', async ({ page }) => {
    const r = new RatePage(page)
    await r.gotoMarkup()
    await r.expectTableVisible()
  })
})

test.describe('Rates — Import', () => {
  test('rate import page loads', async ({ page }) => {
    const r = new RatePage(page)
    await r.gotoImport()
    await expect(page.getByRole('main')).toBeVisible()
  })
})
