import { test } from '@playwright/test'
import { AccountingPage } from '../../pages/accounting/AccountingPage'

test.describe('Accounting — Journal', () => {
  test('journal list loads', async ({ page }) => {
    const a = new AccountingPage(page)
    await a.gotoJournal()
    await a.expectPageLoaded()
  })
})

test.describe('Accounting — AP Ageing', () => {
  test('AP ageing page loads', async ({ page }) => {
    const a = new AccountingPage(page)
    await a.gotoAgeingAP()
    await a.expectPageLoaded()
  })
})

test.describe('Accounting — AR Ageing', () => {
  test('AR ageing page loads', async ({ page }) => {
    const a = new AccountingPage(page)
    await a.gotoAgeingAR()
    await a.expectPageLoaded()
  })
})

test.describe('Accounting — P&L Period', () => {
  test('P&L period page loads', async ({ page }) => {
    const a = new AccountingPage(page)
    await a.gotoPnlPeriod()
    await a.expectPageLoaded()
  })
})
