import { test, expect } from '@playwright/test'
import { LibraryPage } from '../../pages/library/LibraryPage'

test.describe('Library — HS Codes', () => {
  test('hs code list loads', async ({ page }) => {
    const lib = new LibraryPage(page)
    await lib.gotoHsCodes()
    await expect(page.getByRole('table')).toBeVisible()
  })

  test('create hs code', async ({ page }) => {
    const lib = new LibraryPage(page)
    await lib.gotoHsCodes()
    await lib.clickAdd()
    await lib.fillField(/code/i, '888888')
    await lib.fillField(/description/i, 'E2E Create HS Code')
    await lib.saveDialog()
    await lib.expectRowWithText('888888')
  })

  test('update hs code description', async ({ page }) => {
    const lib = new LibraryPage(page)
    await lib.gotoHsCodes()
    await lib.clickAdd()
    await lib.fillField(/^code$/i, '888888')
    await lib.fillField(/description/i, 'E2E Update HS Old')
    await lib.saveDialog()
    await lib.clickEditForRow('E2E Update HS Old')
    await lib.fillField(/description/i, 'E2E Update HS New')
    await lib.saveDialog()
    await lib.expectRowWithText('E2E Update HS New')
  })

  test('delete hs code', async ({ page }) => {
    const lib = new LibraryPage(page)
    await lib.gotoHsCodes()
    await lib.clickAdd()
    await lib.fillField(/code/i, '777777')
    await lib.fillField(/description/i, 'E2E Delete HS Code')
    await lib.saveDialog()
    await lib.clickDeleteForRow('777777')
    await lib.expectNoRowWithText('777777')
  })
})

test.describe('Library — Incoterms', () => {
  test('incoterm list loads', async ({ page }) => {
    const lib = new LibraryPage(page)
    await lib.gotoIncoterms()
    await expect(page.getByRole('table')).toBeVisible()
  })
})

test.describe('Library — Shipment Modes', () => {
  test('shipment mode list loads', async ({ page }) => {
    const lib = new LibraryPage(page)
    await lib.gotoShipmentModes()
    await expect(page.getByRole('table')).toBeVisible()
  })
})

test.describe('Library — Package Types', () => {
  test('package type list loads for sea', async ({ page }) => {
    const lib = new LibraryPage(page)
    await lib.gotoPackageTypes('sea')
    await expect(page.getByRole('main')).toBeVisible()
  })

  test('create package type', async ({ page }) => {
    const lib = new LibraryPage(page)
    await lib.gotoPackageTypes('sea')
    await lib.clickAdd()
    await lib.fillField(/name/i, 'E2E Create Package')
    await lib.saveDialog()
    await lib.expectRowWithText('E2E Create Package')
  })

  test('delete package type', async ({ page }) => {
    const lib = new LibraryPage(page)
    await lib.gotoPackageTypes('sea')
    await lib.clickAdd()
    await lib.fillField(/name/i, 'E2E Delete Package')
    await lib.saveDialog()
    await lib.clickDeleteForRow('E2E Delete Package')
    await lib.expectNoRowWithText('E2E Delete Package')
  })
})
