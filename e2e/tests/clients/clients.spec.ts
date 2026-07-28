import { test, expect } from '@playwright/test'
import { seed } from '../../fixtures/seed'
import { ClientPage } from '../../pages/clients/ClientPage'

test.describe('Clients', () => {
  test('list page loads and shows seeded client', async ({ page }) => {
    const c = new ClientPage(page)
    await c.gotoList()
    await c.expectClientInList(seed.clientName)
  })

  test('detail page loads with client info', async ({ page }) => {
    const c = new ClientPage(page)
    await c.gotoDetail(seed.clientId)
    await expect(page.getByText(seed.clientName)).toBeVisible()
  })

  test('create new client', async ({ page }) => {
    const c = new ClientPage(page)
    await c.gotoList()
    await c.clickAdd()
    await c.fillName('E2E Create Client')
    await c.saveDialog()
    await c.expectClientInList('E2E Create Client')
  })

  test('update client name', async ({ page }) => {
    const c = new ClientPage(page)
    await c.gotoList()
    await c.clickAdd()
    await c.fillName('E2E Update Client Old')
    await c.saveDialog()
    await c.clickEditForClient('E2E Update Client Old')
    await c.fillName('E2E Update Client New')
    await c.saveDialog()
    await c.expectClientInList('E2E Update Client New')
  })

  test('delete client', async ({ page }) => {
    const c = new ClientPage(page)
    await c.gotoList()
    await c.clickAdd()
    await c.fillName('E2E Delete Client')
    await c.saveDialog()
    await c.clickDeleteForClient('E2E Delete Client')
    await c.expectClientNotInList('E2E Delete Client')
  })
})
