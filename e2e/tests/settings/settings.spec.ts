import { test, expect } from '@playwright/test'
import { seed } from '../../fixtures/seed'
import { SettingsPage } from '../../pages/settings/SettingsPage'

test.describe('Settings — Branches', () => {
  test('branch list loads and shows seeded branch', async ({ page }) => {
    const s = new SettingsPage(page)
    await s.gotoBranches()
    await s.expectRowWithText(seed.branchName)
  })

  test('create new branch', async ({ page }) => {
    const s = new SettingsPage(page)
    await s.gotoBranches()
    await s.clickAdd()
    await s.fillName('E2E Create Branch')
    await s.saveDialog()
    await s.expectRowWithText('E2E Create Branch')
  })

  test('update branch name', async ({ page }) => {
    const s = new SettingsPage(page)
    await s.gotoBranches()
    await s.clickAdd()
    await s.fillName('E2E Update Branch Old')
    await s.saveDialog()
    await s.clickEditForRow('E2E Update Branch Old')
    await s.fillName('E2E Update Branch New')
    await s.saveDialog()
    await s.expectRowWithText('E2E Update Branch New')
  })

  test('delete branch', async ({ page }) => {
    const s = new SettingsPage(page)
    await s.gotoBranches()
    await s.clickAdd()
    await s.fillName('E2E Delete Branch')
    await s.saveDialog()
    await s.clickDeleteForRow('E2E Delete Branch')
    await s.expectNoRowWithText('E2E Delete Branch')
  })
})

test.describe('Settings — Departments', () => {
  test('department list loads and shows seeded department', async ({ page }) => {
    const s = new SettingsPage(page)
    await s.gotoDepartments()
    await s.expectRowWithText(seed.departmentName)
  })

  test('create new department', async ({ page }) => {
    const s = new SettingsPage(page)
    await s.gotoDepartments()
    await s.clickAdd()
    await s.fillName('E2E Create Department')
    await s.saveDialog()
    await s.expectRowWithText('E2E Create Department')
  })

  test('delete department', async ({ page }) => {
    const s = new SettingsPage(page)
    await s.gotoDepartments()
    await s.clickAdd()
    await s.fillName('E2E Delete Department')
    await s.saveDialog()
    await s.clickDeleteForRow('E2E Delete Department')
    await s.expectNoRowWithText('E2E Delete Department')
  })
})

test.describe('Settings — Groups', () => {
  test('group list loads and shows seeded group', async ({ page }) => {
    const s = new SettingsPage(page)
    await s.gotoGroups()
    await s.expectRowWithText(seed.groupName)
  })

  test('create new group', async ({ page }) => {
    const s = new SettingsPage(page)
    await s.gotoGroups()
    await s.clickAdd()
    await s.fillName('E2E Create Group')
    await s.saveDialog()
    await s.expectRowWithText('E2E Create Group')
  })

  test('delete group', async ({ page }) => {
    const s = new SettingsPage(page)
    await s.gotoGroups()
    await s.clickAdd()
    await s.fillName('E2E Delete Group')
    await s.saveDialog()
    await s.clickDeleteForRow('E2E Delete Group')
    await s.expectNoRowWithText('E2E Delete Group')
  })
})

test.describe('Settings — Company', () => {
  test('company settings page loads', async ({ page }) => {
    const s = new SettingsPage(page)
    await s.gotoCompany()
    await expect(page.getByRole('heading', { name: /company|organization/i }).first()).toBeVisible()
  })
})

test.describe('Settings — Global Setting', () => {
  test('global settings page loads', async ({ page }) => {
    const s = new SettingsPage(page)
    await s.gotoGlobalSetting()
    await expect(page.getByRole('main')).toBeVisible()
  })
})
