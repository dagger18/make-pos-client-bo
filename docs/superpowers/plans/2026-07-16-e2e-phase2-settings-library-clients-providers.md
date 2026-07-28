# E2E Phase 2 — Settings, Library, Clients, Providers

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add full CRUD e2e tests for Settings (branches, departments, groups, users, company), Library (HS codes, incoterms, shipment modes), Clients, and Providers.

**Architecture:** Each module gets one page object (`e2e/pages/{module}/{Module}Page.ts`) and one spec file (`e2e/tests/{module}/{module}.spec.ts`). All tests use the saved auth session (storageState from playwright.config.mjs). Tests that create records for deletion create their own throwaway records so the shared seeded record stays intact. Seeded IDs are imported from `e2e/fixtures/seed.ts`.

**Tech Stack:** Playwright `@playwright/test`, TypeScript, Vuetify 3 selectors, pnpm.

**Prerequisite:** Phase 1 (seed infrastructure) must be complete and `playwright/.auth/seed.json` must exist with valid IDs.

**Selector note:** Selectors use `getByRole`, `getByLabel`, and `getByText` which work well with Vuetify 3. If a selector fails, inspect the element in Chrome DevTools and adjust. Vuetify dialogs are `role="dialog"`, buttons are `role="button"`, text inputs have associated labels.

---

## File Map

| Action | Path |
|--------|------|
| Create | `e2e/pages/settings/SettingsPage.ts` |
| Create | `e2e/tests/settings/settings.spec.ts` |
| Create | `e2e/pages/library/LibraryPage.ts` |
| Create | `e2e/tests/library/library.spec.ts` |
| Create | `e2e/pages/clients/ClientPage.ts` |
| Create | `e2e/tests/clients/clients.spec.ts` |
| Create | `e2e/pages/providers/ProviderPage.ts` |
| Create | `e2e/tests/providers/providers.spec.ts` |
| Delete | `e2e/tests/settings/.gitkeep` |

---

### Task 1: Settings tests

**Files:**
- Create: `e2e/pages/settings/SettingsPage.ts`
- Create: `e2e/tests/settings/settings.spec.ts`
- Delete: `e2e/tests/settings/.gitkeep`

- [ ] **Step 1: Create `e2e/pages/settings/SettingsPage.ts`**

```typescript
import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'

export class SettingsPage {
  constructor(private page: Page) {}

  async gotoBranches() {
    await this.page.goto('/setting/branch')
  }

  async gotoDepartments() {
    await this.page.goto('/setting/department')
  }

  async gotoGroups() {
    await this.page.goto('/setting/groups')
  }

  async gotoUsers() {
    await this.page.goto('/setting/users')
  }

  async gotoCompany() {
    await this.page.goto('/setting/company')
  }

  async gotoGlobalSetting() {
    await this.page.goto('/setting/global-setting')
  }

  async clickAdd() {
    await this.page.getByRole('button', { name: /add|create|new/i }).first().click()
  }

  async fillName(name: string) {
    await this.page.getByRole('dialog').getByLabel(/name/i).fill(name)
  }

  async saveDialog() {
    await this.page.getByRole('dialog').getByRole('button', { name: /save|submit|add/i }).click()
    await this.page.getByRole('dialog').waitFor({ state: 'hidden' })
  }

  async expectRowWithText(text: string) {
    await expect(this.page.getByRole('table').getByText(text)).toBeVisible()
  }

  async clickEditForRow(text: string) {
    const row = this.page.getByRole('row').filter({ hasText: text })
    await row.getByRole('button', { name: /edit/i }).click()
  }

  async clickDeleteForRow(text: string) {
    const row = this.page.getByRole('row').filter({ hasText: text })
    await row.getByRole('button', { name: /delete/i }).click()
    await this.page.getByRole('button', { name: /confirm|yes|delete/i }).click()
  }

  async expectNoRowWithText(text: string) {
    await expect(this.page.getByRole('table').getByText(text)).not.toBeVisible()
  }
}
```

- [ ] **Step 2: Create `e2e/tests/settings/settings.spec.ts`**

```typescript
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
    await s.clickEditForRow(seed.branchName)
    await page.getByRole('dialog').getByLabel(/name/i).clear()
    await page.getByRole('dialog').getByLabel(/name/i).fill('E2E Updated Branch')
    await s.saveDialog()
    await s.expectRowWithText('E2E Updated Branch')
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
```

- [ ] **Step 3: Remove the old placeholder**

```powershell
Remove-Item "e2e\tests\settings\.gitkeep"
```

- [ ] **Step 4: Run settings tests**

```powershell
npx playwright test e2e/tests/settings/settings.spec.ts
```

Expected: all 10 tests pass. If a selector fails (e.g. the dialog's label text is different), inspect the element in Chrome and update `SettingsPage.ts` accordingly.

- [ ] **Step 5: Commit**

```powershell
git add e2e/pages/settings/SettingsPage.ts e2e/tests/settings/settings.spec.ts
git rm e2e/tests/settings/.gitkeep
git commit -m "feat(e2e): add settings CRUD tests (branches, departments, groups, company)"
```

---

### Task 2: Library tests

**Files:**
- Create: `e2e/pages/library/LibraryPage.ts`
- Create: `e2e/tests/library/library.spec.ts`

- [ ] **Step 1: Create `e2e/pages/library/LibraryPage.ts`**

```typescript
import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'

export class LibraryPage {
  constructor(private page: Page) {}

  async gotoHsCodes() {
    await this.page.goto('/library/hs-code')
  }

  async gotoIncoterms() {
    await this.page.goto('/library/incoterm')
  }

  async gotoShipmentModes() {
    await this.page.goto('/library/shipment-mode')
  }

  async gotoPackageTypes(transportType = 'sea') {
    await this.page.goto(`/library/package-type/${transportType}`)
  }

  async clickAdd() {
    await this.page.getByRole('button', { name: /add|create|new/i }).first().click()
  }

  async fillField(label: string | RegExp, value: string) {
    await this.page.getByRole('dialog').getByLabel(label).fill(value)
  }

  async saveDialog() {
    await this.page.getByRole('dialog').getByRole('button', { name: /save|submit|add/i }).click()
    await this.page.getByRole('dialog').waitFor({ state: 'hidden' })
  }

  async expectRowWithText(text: string) {
    await expect(this.page.getByRole('table').getByText(text)).toBeVisible()
  }

  async clickEditForRow(text: string) {
    const row = this.page.getByRole('row').filter({ hasText: text })
    await row.getByRole('button', { name: /edit/i }).click()
  }

  async clickDeleteForRow(text: string) {
    const row = this.page.getByRole('row').filter({ hasText: text })
    await row.getByRole('button', { name: /delete/i }).click()
    await this.page.getByRole('button', { name: /confirm|yes|delete/i }).click()
  }

  async expectNoRowWithText(text: string) {
    await expect(this.page.getByRole('table').getByText(text)).not.toBeVisible()
  }
}
```

- [ ] **Step 2: Create `e2e/tests/library/library.spec.ts`**

```typescript
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
    await lib.clickEditForRow('E2E Test HS Code')
    await page.getByRole('dialog').getByLabel(/description/i).clear()
    await page.getByRole('dialog').getByLabel(/description/i).fill('E2E Updated HS Code')
    await lib.saveDialog()
    await lib.expectRowWithText('E2E Updated HS Code')
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
```

- [ ] **Step 3: Run library tests**

```powershell
npx playwright test e2e/tests/library/library.spec.ts
```

Expected: all 8 tests pass.

- [ ] **Step 4: Commit**

```powershell
git add e2e/pages/library/LibraryPage.ts e2e/tests/library/library.spec.ts
git commit -m "feat(e2e): add library CRUD tests (HS codes, incoterms, shipment modes, package types)"
```

---

### Task 3: Clients tests

**Files:**
- Create: `e2e/pages/clients/ClientPage.ts`
- Create: `e2e/tests/clients/clients.spec.ts`

- [ ] **Step 1: Create `e2e/pages/clients/ClientPage.ts`**

```typescript
import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'

export class ClientPage {
  constructor(private page: Page) {}

  async gotoList() {
    await this.page.goto('/client')
  }

  async gotoDetail(id: number) {
    await this.page.goto(`/client/${id}`)
  }

  async clickAdd() {
    await this.page.getByRole('button', { name: /add|create|new client/i }).first().click()
  }

  async fillName(name: string) {
    await this.page.getByRole('dialog').getByLabel(/name/i).fill(name)
  }

  async saveDialog() {
    await this.page.getByRole('dialog').getByRole('button', { name: /save|submit|add/i }).click()
    await this.page.getByRole('dialog').waitFor({ state: 'hidden' })
  }

  async expectClientInList(name: string) {
    await expect(this.page.getByRole('table').getByText(name)).toBeVisible()
  }

  async clickEditForClient(name: string) {
    const row = this.page.getByRole('row').filter({ hasText: name })
    await row.getByRole('button', { name: /edit/i }).click()
  }

  async clickDeleteForClient(name: string) {
    const row = this.page.getByRole('row').filter({ hasText: name })
    await row.getByRole('button', { name: /delete/i }).click()
    await this.page.getByRole('button', { name: /confirm|yes|delete/i }).click()
  }

  async expectClientNotInList(name: string) {
    await expect(this.page.getByRole('table').getByText(name)).not.toBeVisible()
  }
}
```

- [ ] **Step 2: Create `e2e/tests/clients/clients.spec.ts`**

```typescript
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
    await c.clickEditForClient(seed.clientName)
    await page.getByRole('dialog').getByLabel(/name/i).clear()
    await page.getByRole('dialog').getByLabel(/name/i).fill('E2E Updated Client')
    await c.saveDialog()
    await c.expectClientInList('E2E Updated Client')
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
```

- [ ] **Step 3: Run clients tests**

```powershell
npx playwright test e2e/tests/clients/clients.spec.ts
```

Expected: all 5 tests pass.

- [ ] **Step 4: Commit**

```powershell
git add e2e/pages/clients/ClientPage.ts e2e/tests/clients/clients.spec.ts
git commit -m "feat(e2e): add client CRUD tests"
```

---

### Task 4: Providers tests

**Files:**
- Create: `e2e/pages/providers/ProviderPage.ts`
- Create: `e2e/tests/providers/providers.spec.ts`

- [ ] **Step 1: Create `e2e/pages/providers/ProviderPage.ts`**

```typescript
import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'

export class ProviderPage {
  constructor(private page: Page) {}

  async gotoList(providerType = 'freight') {
    await this.page.goto(`/provider/${providerType}`)
  }

  async gotoDetail(id: number) {
    await this.page.goto(`/provider/id-${id}`)
  }

  async clickAdd() {
    await this.page.getByRole('button', { name: /add|create|new/i }).first().click()
  }

  async fillName(name: string) {
    await this.page.getByRole('dialog').getByLabel(/name/i).fill(name)
  }

  async saveDialog() {
    await this.page.getByRole('dialog').getByRole('button', { name: /save|submit|add/i }).click()
    await this.page.getByRole('dialog').waitFor({ state: 'hidden' })
  }

  async expectProviderInList(name: string) {
    await expect(this.page.getByRole('table').getByText(name)).toBeVisible()
  }

  async clickEditForProvider(name: string) {
    const row = this.page.getByRole('row').filter({ hasText: name })
    await row.getByRole('button', { name: /edit/i }).click()
  }
}
```

- [ ] **Step 2: Create `e2e/tests/providers/providers.spec.ts`**

```typescript
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
    await p.clickEditForProvider(seed.providerName)
    await page.getByRole('dialog').getByLabel(/name/i).clear()
    await page.getByRole('dialog').getByLabel(/name/i).fill('E2E Updated Provider')
    await p.saveDialog()
    await p.expectProviderInList('E2E Updated Provider')
  })
})
```

- [ ] **Step 3: Run providers tests**

```powershell
npx playwright test e2e/tests/providers/providers.spec.ts
```

Expected: all 5 tests pass.

- [ ] **Step 4: Commit**

```powershell
git add e2e/pages/providers/ProviderPage.ts e2e/tests/providers/providers.spec.ts
git commit -m "feat(e2e): add provider CRUD tests"
```

---

### Task 5: Run full phase 2 suite

- [ ] **Step 1: Run all phase 2 tests**

```powershell
npx playwright test e2e/tests/settings e2e/tests/library e2e/tests/clients e2e/tests/providers
```

Expected: all 28 tests pass. If any fail, check the HTML report:

```powershell
pnpm e2e:report
```
