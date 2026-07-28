import { test, expect } from '@playwright/test'
import { seed } from '../../fixtures/seed'
import { ProviderPage } from '../../pages/providers/ProviderPage'

test.describe('Providers', () => {
  test('provider list loads', async ({ page }) => {
    const p = new ProviderPage(page)
    await p.gotoList('freight')
    await expect(page.getByRole('table')).toBeVisible()
  })

  test('provider list shows seeded provider', async ({ page }) => {
    const p = new ProviderPage(page)
    await p.gotoList('freight')
    await p.expectProviderInList(seed.providerName)
  })

  test('provider detail page loads', async ({ page }) => {
    const p = new ProviderPage(page)
    await p.gotoDetail(seed.providerId)
    await expect(page.getByText(seed.providerName)).toBeVisible()
  })

  test('create new provider', async ({ page }) => {
    const p = new ProviderPage(page)
    await p.gotoList('freight')
    await p.clickAdd()
    await p.fillName('E2E Create Provider')
    await p.saveDialog()
    await p.expectProviderInList('E2E Create Provider')
  })

  test('update provider name', async ({ page }) => {
    const p = new ProviderPage(page)
    await p.gotoList('freight')
    await p.clickAdd()
    await p.fillName('E2E Update Provider Old')
    await p.saveDialog()
    await p.clickEditForProvider('E2E Update Provider Old')
    await p.fillName('E2E Update Provider New')
    await p.saveDialog()
    await p.expectProviderInList('E2E Update Provider New')
  })
})
