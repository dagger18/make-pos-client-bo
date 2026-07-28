# E2E Phase 4 — Consolidation, CRM, Accounting, Reports, Portal

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add e2e tests for Consolidation (CRUD), CRM (leads, opportunities, activities CRUD), Accounting (journal, ageing, P&L — read-heavy), Reports (read-only smoke tests for all report pages), and Portal (separate auth flow + shipments/invoices/documents/quote request).

**Architecture:** Same as Phases 2–3. Portal tests use a fresh unauthenticated context (`test.use({ storageState: { cookies: [], origins: [] } })`) with portal credentials from `E2E_PORTAL_USERNAME` / `E2E_PORTAL_PASSWORD` in `.env.e2e`.

**Tech Stack:** Playwright `@playwright/test`, TypeScript, Vuetify 3 selectors, pnpm.

**Prerequisite:** Phase 1 complete. `seed.json` has valid `consolidationId`, `leadId`, `opportunityId`, `activityId`.

---

## File Map

| Action | Path |
|--------|------|
| Create | `e2e/pages/consolidation/ConsolidationPage.ts` |
| Create | `e2e/tests/consolidation/consolidation.spec.ts` |
| Create | `e2e/pages/crm/CrmPage.ts` |
| Create | `e2e/tests/crm/crm.spec.ts` |
| Create | `e2e/pages/accounting/AccountingPage.ts` |
| Create | `e2e/tests/accounting/accounting.spec.ts` |
| Create | `e2e/pages/reports/ReportPage.ts` |
| Create | `e2e/tests/reports/reports.spec.ts` |
| Create | `e2e/pages/portal/PortalPage.ts` |
| Create | `e2e/tests/portal/portal.spec.ts` |

---

### Task 1: Consolidation tests

**Files:**
- Create: `e2e/pages/consolidation/ConsolidationPage.ts`
- Create: `e2e/tests/consolidation/consolidation.spec.ts`

- [ ] **Step 1: Create `e2e/pages/consolidation/ConsolidationPage.ts`**

```typescript
import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'

export class ConsolidationPage {
  constructor(private page: Page) {}

  async gotoList() {
    await this.page.goto('/consolidation')
  }

  async gotoDetail(id: number) {
    await this.page.goto(`/consolidation/${id}`)
  }

  async gotoWarehouseInventory() {
    await this.page.goto('/warehouse/inventory')
  }

  async gotoWarehouseFacility() {
    await this.page.goto('/warehouse/facility')
  }

  async clickAdd() {
    await this.page.getByRole('button', { name: /add|create|new/i }).first().click()
  }

  async fillField(label: string | RegExp, value: string) {
    await this.page.getByRole('dialog').getByLabel(label).fill(value)
  }

  async saveDialog() {
    await this.page.getByRole('dialog').getByRole('button', { name: /save|submit|create/i }).click()
    await this.page.getByRole('dialog').waitFor({ state: 'hidden' })
  }

  async expectItemInList(text: string) {
    await expect(this.page.getByRole('table').getByText(text)).toBeVisible()
  }

  async expectDetailLoaded() {
    await expect(this.page.getByRole('main')).toBeVisible()
    await expect(this.page).not.toHaveURL(/\/login/)
  }
}
```

- [ ] **Step 2: Create `e2e/tests/consolidation/consolidation.spec.ts`**

```typescript
import { test, expect } from '@playwright/test'
import { seed } from '../../fixtures/seed'
import { ConsolidationPage } from '../../pages/consolidation/ConsolidationPage'

test.describe('Consolidation', () => {
  test('consolidation list loads', async ({ page }) => {
    const c = new ConsolidationPage(page)
    await c.gotoList()
    await expect(page.getByRole('table')).toBeVisible()
  })

  test('consolidation detail loads for seeded consolidation', async ({ page }) => {
    const c = new ConsolidationPage(page)
    await c.gotoDetail(seed.consolidationId)
    await c.expectDetailLoaded()
  })

  test('create new consolidation', async ({ page }) => {
    const c = new ConsolidationPage(page)
    await c.gotoList()
    await c.clickAdd()
    await c.fillField(/name/i, 'E2E Create Consolidation')
    await c.saveDialog()
    await c.expectItemInList('E2E Create Consolidation')
  })

  test('warehouse inventory page loads', async ({ page }) => {
    const c = new ConsolidationPage(page)
    await c.gotoWarehouseInventory()
    await expect(page.getByRole('main')).toBeVisible()
  })

  test('warehouse facility page loads', async ({ page }) => {
    const c = new ConsolidationPage(page)
    await c.gotoWarehouseFacility()
    await expect(page.getByRole('main')).toBeVisible()
  })
})
```

- [ ] **Step 3: Run consolidation tests**

```powershell
npx playwright test e2e/tests/consolidation/consolidation.spec.ts
```

Expected: all 5 tests pass.

- [ ] **Step 4: Commit**

```powershell
git add e2e/pages/consolidation/ConsolidationPage.ts e2e/tests/consolidation/consolidation.spec.ts
git commit -m "feat(e2e): add consolidation and warehouse tests"
```

---

### Task 2: CRM tests

**Files:**
- Create: `e2e/pages/crm/CrmPage.ts`
- Create: `e2e/tests/crm/crm.spec.ts`

- [ ] **Step 1: Create `e2e/pages/crm/CrmPage.ts`**

```typescript
import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'

export class CrmPage {
  constructor(private page: Page) {}

  async gotoLeads() {
    await this.page.goto('/crm/leads')
  }

  async gotoOpportunities() {
    await this.page.goto('/crm/opportunities')
  }

  async gotoActivities() {
    await this.page.goto('/crm/activities')
  }

  async clickAdd() {
    await this.page.getByRole('button', { name: /add|create|new/i }).first().click()
  }

  async fillField(label: string | RegExp, value: string) {
    await this.page.getByRole('dialog').getByLabel(label).fill(value)
  }

  async saveDialog() {
    await this.page.getByRole('dialog').getByRole('button', { name: /save|submit|create/i }).click()
    await this.page.getByRole('dialog').waitFor({ state: 'hidden' })
  }

  async expectItemInList(text: string) {
    await expect(this.page.getByRole('table').getByText(text)).toBeVisible()
  }

  async expectTableVisible() {
    await expect(this.page.getByRole('table')).toBeVisible()
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

  async expectRowNotVisible(text: string) {
    await expect(this.page.getByRole('table').getByText(text)).not.toBeVisible()
  }
}
```

- [ ] **Step 2: Create `e2e/tests/crm/crm.spec.ts`**

```typescript
import { test, expect } from '@playwright/test'
import { seed } from '../../fixtures/seed'
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
```

- [ ] **Step 3: Run CRM tests**

```powershell
npx playwright test e2e/tests/crm/crm.spec.ts
```

Expected: all 7 tests pass.

- [ ] **Step 4: Commit**

```powershell
git add e2e/pages/crm/CrmPage.ts e2e/tests/crm/crm.spec.ts
git commit -m "feat(e2e): add CRM tests (leads, opportunities, activities)"
```

---

### Task 3: Accounting tests

**Files:**
- Create: `e2e/pages/accounting/AccountingPage.ts`
- Create: `e2e/tests/accounting/accounting.spec.ts`

- [ ] **Step 1: Create `e2e/pages/accounting/AccountingPage.ts`**

```typescript
import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'

export class AccountingPage {
  constructor(private page: Page) {}

  async gotoJournal() {
    await this.page.goto('/accounting/journal')
  }

  async gotoAgeingAP() {
    await this.page.goto('/accounting/ageing-ap')
  }

  async gotoAgeingAR() {
    await this.page.goto('/accounting/ageing-ar')
  }

  async gotoPnlPeriod() {
    await this.page.goto('/accounting/pnl-period')
  }

  async expectPageLoaded() {
    await expect(this.page.getByRole('main')).toBeVisible()
    await expect(this.page).not.toHaveURL(/\/login/)
  }

  async expectTableVisible() {
    await expect(this.page.getByRole('table')).toBeVisible()
  }
}
```

- [ ] **Step 2: Create `e2e/tests/accounting/accounting.spec.ts`**

```typescript
import { test, expect } from '@playwright/test'
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
```

- [ ] **Step 3: Run accounting tests**

```powershell
npx playwright test e2e/tests/accounting/accounting.spec.ts
```

Expected: all 4 tests pass.

- [ ] **Step 4: Commit**

```powershell
git add e2e/pages/accounting/AccountingPage.ts e2e/tests/accounting/accounting.spec.ts
git commit -m "feat(e2e): add accounting tests (journal, AP/AR ageing, P&L)"
```

---

### Task 4: Reports tests

**Files:**
- Create: `e2e/pages/reports/ReportPage.ts`
- Create: `e2e/tests/reports/reports.spec.ts`

All report pages are read-only. Tests assert each page loads without errors and the main content area is visible.

- [ ] **Step 1: Create `e2e/pages/reports/ReportPage.ts`**

```typescript
import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'

export class ReportPage {
  constructor(private page: Page) {}

  async goto(reportPath: string) {
    await this.page.goto(`/report/${reportPath}`)
  }

  async expectLoaded() {
    await expect(this.page.getByRole('main')).toBeVisible()
    await expect(this.page).not.toHaveURL(/\/login/)
    // Assert no error boundary / unhandled exception text
    await expect(this.page.getByText(/something went wrong|unhandled error/i)).not.toBeVisible()
  }
}
```

- [ ] **Step 2: Create `e2e/tests/reports/reports.spec.ts`**

```typescript
import { test } from '@playwright/test'
import { ReportPage } from '../../pages/reports/ReportPage'

const reports = [
  'kpi',
  'shipment',
  'co2-emissions',
  'vat-report',
  'audit-log',
  'carrier-performance',
  'charge',
  'compliance-dashboard',
  'customer-profitability',
  'department-pnl',
  'exception',
  'rate-benchmark',
  'sales-commission',
  'sales-target',
  'staff',
  'top-lanes',
]

for (const report of reports) {
  test(`report page loads: ${report}`, async ({ page }) => {
    const r = new ReportPage(page)
    await r.goto(report)
    await r.expectLoaded()
  })
}
```

- [ ] **Step 3: Run reports tests**

```powershell
npx playwright test e2e/tests/reports/reports.spec.ts
```

Expected: all 16 tests pass. These are smoke tests — they only assert the page loads without crashing.

- [ ] **Step 4: Commit**

```powershell
git add e2e/pages/reports/ReportPage.ts e2e/tests/reports/reports.spec.ts
git commit -m "feat(e2e): add report smoke tests (16 report pages)"
```

---

### Task 5: Portal tests

**Files:**
- Create: `e2e/pages/portal/PortalPage.ts`
- Create: `e2e/tests/portal/portal.spec.ts`

Portal has its own login flow separate from the BO session. All tests use a fresh unauthenticated context. Credentials come from `E2E_PORTAL_USERNAME` and `E2E_PORTAL_PASSWORD` in `.env.e2e`.

- [ ] **Step 1: Create `e2e/pages/portal/PortalPage.ts`**

```typescript
import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'

export class PortalPage {
  constructor(private page: Page) {}

  async gotoLogin() {
    await this.page.goto('/portal/login')
  }

  async login(username: string, password: string) {
    await this.page.getByLabel(/email|username/i).fill(username)
    await this.page.getByLabel(/password/i).fill(password)
    await this.page.getByRole('button', { name: /login|sign in/i }).click()
    await this.page.waitForURL(url => !url.pathname.includes('/portal/login'))
  }

  async gotoDashboard() {
    await this.page.goto('/portal/dashboard')
  }

  async gotoShipments() {
    await this.page.goto('/portal/shipments')
  }

  async gotoInvoices() {
    await this.page.goto('/portal/invoices')
  }

  async gotoDocuments() {
    await this.page.goto('/portal/documents')
  }

  async gotoQuoteRequest() {
    await this.page.goto('/portal/quote-request')
  }

  async expectPageLoaded() {
    await expect(this.page.getByRole('main')).toBeVisible()
    await expect(this.page).not.toHaveURL(/\/portal\/login/)
  }
}
```

- [ ] **Step 2: Create `e2e/tests/portal/portal.spec.ts`**

```typescript
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
```

- [ ] **Step 3: Run portal tests**

```powershell
npx playwright test e2e/tests/portal/portal.spec.ts
```

Expected: all 6 tests pass. If `E2E_PORTAL_USERNAME` / `E2E_PORTAL_PASSWORD` are not set, the `beforeEach` will fail — add them to `.env.e2e` first.

- [ ] **Step 4: Commit**

```powershell
git add e2e/pages/portal/PortalPage.ts e2e/tests/portal/portal.spec.ts
git commit -m "feat(e2e): add portal tests (login, dashboard, shipments, invoices, documents)"
```

---

### Task 6: Run full phase 4 suite and complete

- [ ] **Step 1: Run all phase 4 tests**

```powershell
npx playwright test e2e/tests/consolidation e2e/tests/crm e2e/tests/accounting e2e/tests/reports e2e/tests/portal
```

Expected: all 38 tests pass.

- [ ] **Step 2: Run the complete e2e suite**

```powershell
pnpm e2e
```

Expected: all tests pass across all phases (auth + settings + library + clients + providers + rates + carriers + quotes + shipments + consolidation + CRM + accounting + reports + portal). Total approximately 100 tests.

- [ ] **Step 3: Open the HTML report if any tests fail**

```powershell
pnpm e2e:report
```
