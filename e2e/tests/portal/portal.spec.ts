import { test, expect } from '@playwright/test'
import { PortalPage } from '../../pages/portal/PortalPage'

// Portal has its own login — do not use BO session
test.use({ storageState: { cookies: [], origins: [] } })

test.describe('Portal', () => {
  test.beforeEach(async ({ page }) => {
    const portal = new PortalPage(page)
    await portal.gotoLogin()
    await portal.login(
      process.env.E2E_PORTAL_USERNAME!,
      process.env.E2E_PORTAL_PASSWORD!,
    )
  })

  test('portal dashboard loads after login', async ({ page }) => {
    const portal = new PortalPage(page)
    await portal.gotoDashboard()
    await portal.expectPageLoaded()
  })

  test('portal shipments list loads', async ({ page }) => {
    const portal = new PortalPage(page)
    await portal.gotoShipments()
    await portal.expectPageLoaded()
  })

  test('portal invoices list loads', async ({ page }) => {
    const portal = new PortalPage(page)
    await portal.gotoInvoices()
    await portal.expectPageLoaded()
  })

  test('portal documents list loads', async ({ page }) => {
    const portal = new PortalPage(page)
    await portal.gotoDocuments()
    await portal.expectPageLoaded()
  })

  test('portal quote request page loads', async ({ page }) => {
    const portal = new PortalPage(page)
    await portal.gotoQuoteRequest()
    await portal.expectPageLoaded()
  })
})

test.describe('Portal — Login page', () => {
  test('portal login page loads unauthenticated', async ({ page }) => {
    const portal = new PortalPage(page)
    await portal.gotoLogin()
    await expect(page.getByRole('button', { name: /login|sign in/i })).toBeVisible()
  })
})
