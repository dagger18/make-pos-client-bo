import { test, expect } from '@playwright/test'
import { seed } from '../../fixtures/seed'
import { QuotePage } from '../../pages/quotes/QuotePage'

test.describe('Quotes', () => {
  test('quote list loads for sea', async ({ page }) => {
    const q = new QuotePage(page)
    await q.gotoList('sea')
    await expect(page.getByRole('table')).toBeVisible()
  })

  test('quote list loads for air', async ({ page }) => {
    const q = new QuotePage(page)
    await q.gotoList('air')
    await expect(page.getByRole('table')).toBeVisible()
  })

  test('quote detail page loads for seeded quote', async ({ page }) => {
    const q = new QuotePage(page)
    await q.gotoDetail(seed.quoteId)
    await q.expectDetailVisible()
  })

  test('quote update page loads for seeded quote', async ({ page }) => {
    const q = new QuotePage(page)
    await q.gotoUpdate(seed.quoteId)
    await expect(page.getByRole('main')).toBeVisible()
    await expect(page).not.toHaveURL(/\/login/)
  })

  test('quote request page loads', async ({ page }) => {
    const q = new QuotePage(page)
    await q.gotoRequest()
    await expect(page.getByRole('main')).toBeVisible()
  })
})
