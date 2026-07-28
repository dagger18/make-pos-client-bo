import { test, expect } from '@playwright/test'
import { CrmPage } from '../../pages/crm/CrmPage'

test.describe('CRM — Leads', () => {
  test('leads list loads', async ({ page }) => {
    const crm = new CrmPage(page)
    await crm.gotoLeads()
    await crm.expectTableVisible()
  })

  test('create lead', async ({ page }) => {
    const crm = new CrmPage(page)
    await crm.gotoLeads()
    await crm.clickAdd()
    await crm.fillField(/first.?name/i, 'E2E')
    await crm.fillField(/last.?name/i, 'Create Lead')
    await crm.fillField(/email/i, 'e2e-create-lead@test.invalid')
    await crm.saveDialog()
    await crm.expectItemInList('Create Lead')
  })

  test('delete lead', async ({ page }) => {
    const crm = new CrmPage(page)
    await crm.gotoLeads()
    await crm.clickAdd()
    await crm.fillField(/first.?name/i, 'E2E')
    await crm.fillField(/last.?name/i, 'Delete Lead')
    await crm.fillField(/email/i, 'e2e-delete-lead@test.invalid')
    await crm.saveDialog()
    await crm.clickDeleteForRow('Delete Lead')
    await crm.expectRowNotVisible('Delete Lead')
  })
})

test.describe('CRM — Opportunities', () => {
  test('opportunities list loads', async ({ page }) => {
    const crm = new CrmPage(page)
    await crm.gotoOpportunities()
    await crm.expectTableVisible()
  })

  test('create opportunity', async ({ page }) => {
    const crm = new CrmPage(page)
    await crm.gotoOpportunities()
    await crm.clickAdd()
    await crm.fillField(/name/i, 'E2E Create Opportunity')
    await crm.saveDialog()
    await crm.expectItemInList('E2E Create Opportunity')
  })
})

test.describe('CRM — Activities', () => {
  test('activities list loads', async ({ page }) => {
    const crm = new CrmPage(page)
    await crm.gotoActivities()
    await crm.expectTableVisible()
  })

  test('create activity', async ({ page }) => {
    const crm = new CrmPage(page)
    await crm.gotoActivities()
    await crm.clickAdd()
    await crm.fillField(/subject/i, 'E2E Create Activity')
    await crm.saveDialog()
    await crm.expectItemInList('E2E Create Activity')
  })
})
