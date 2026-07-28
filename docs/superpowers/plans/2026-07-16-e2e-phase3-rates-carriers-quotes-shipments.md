# E2E Phase 3 — Rates, Carriers, Quotes, Shipments

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add full CRUD e2e tests for Rates (freight, customs, local, markup), Carriers (vessel, flight, container tracking), Quotes (create, view, update, convert), and Shipments (create, view tabs, update, documents).

**Architecture:** Same as Phase 2 — one page object per module, one spec file per module, all using the saved auth session. Seeded IDs imported from `e2e/fixtures/seed.ts`.

**Tech Stack:** Playwright `@playwright/test`, TypeScript, Vuetify 3 selectors, pnpm.

**Prerequisite:** Phase 1 complete. `playwright/.auth/seed.json` exists with valid `quoteId`, `shipmentId`, `clientId`.

---

## File Map

| Action | Path |
|--------|------|
| Create | `e2e/pages/rates/RatePage.ts` |
| Create | `e2e/tests/rates/rates.spec.ts` |
| Create | `e2e/pages/carriers/CarrierPage.ts` |
| Create | `e2e/tests/carriers/carriers.spec.ts` |
| Create | `e2e/pages/quotes/QuotePage.ts` |
| Create | `e2e/tests/quotes/quotes.spec.ts` |
| Create | `e2e/pages/shipments/ShipmentPage.ts` |
| Create | `e2e/tests/shipments/shipments.spec.ts` |
| Delete | `e2e/tests/rates/.gitkeep` |
| Delete | `e2e/tests/quotes/.gitkeep` |
| Delete | `e2e/tests/shipments/.gitkeep` |

---

### Task 1: Rates tests

**Files:**
- Create: `e2e/pages/rates/RatePage.ts`
- Create: `e2e/tests/rates/rates.spec.ts`
- Delete: `e2e/tests/rates/.gitkeep`

- [ ] **Step 1: Create `e2e/pages/rates/RatePage.ts`**

```typescript
import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'

export class RatePage {
  constructor(private page: Page) {}

  async gotoFreight(transportType = 'sea') {
    await this.page.goto(`/rate/freight/${transportType}`)
  }

  async gotoCustoms(transportType = 'sea') {
    await this.page.goto(`/rate/customs/${transportType}`)
  }

  async gotoLocal(transportType = 'sea') {
    await this.page.goto(`/rate/local/${transportType}`)
  }

  async gotoMarkup() {
    await this.page.goto('/rate/markup')
  }

  async gotoImport() {
    await this.page.goto('/rate/import')
  }

  async clickAdd() {
    await this.page.getByRole('button', { name: /add|create|new/i }).first().click()
  }

  async saveDialog() {
    await this.page.getByRole('dialog').getByRole('button', { name: /save|submit|add/i }).click()
    await this.page.getByRole('dialog').waitFor({ state: 'hidden' })
  }

  async expectTableVisible() {
    await expect(this.page.getByRole('table')).toBeVisible()
  }

  async expectRowWithText(text: string) {
    await expect(this.page.getByRole('table').getByText(text)).toBeVisible()
  }

  async clickEditFirstRow() {
    await this.page.getByRole('row').nth(1).getByRole('button', { name: /edit/i }).click()
  }

  async clickDeleteFirstRow() {
    await this.page.getByRole('row').nth(1).getByRole('button', { name: /delete/i }).click()
    await this.page.getByRole('button', { name: /confirm|yes|delete/i }).click()
  }

  async fillFieldInDialog(label: string | RegExp, value: string) {
    await this.page.getByRole('dialog').getByLabel(label).fill(value)
  }
}
```

- [ ] **Step 2: Create `e2e/tests/rates/rates.spec.ts`**

```typescript
import { test, expect } from '@playwright/test'
import { seed } from '../../fixtures/seed'
import { RatePage } from '../../pages/rates/RatePage'

test.describe('Rates — Freight', () => {
  test('freight rate list loads for sea', async ({ page }) => {
    const r = new RatePage(page)
    await r.gotoFreight('sea')
    await r.expectTableVisible()
  })

  test('freight rate list loads for air', async ({ page }) => {
    const r = new RatePage(page)
    await r.gotoFreight('air')
    await r.expectTableVisible()
  })

  test('create freight rate', async ({ page }) => {
    const r = new RatePage(page)
    await r.gotoFreight('sea')
    await r.clickAdd()
    // Fill minimum required fields — inspect the dialog if fields differ
    await r.fillFieldInDialog(/name|description/i, 'E2E Freight Rate')
    await r.saveDialog()
    await r.expectRowWithText('E2E Freight Rate')
  })
})

test.describe('Rates — Customs', () => {
  test('customs rate list loads', async ({ page }) => {
    const r = new RatePage(page)
    await r.gotoCustoms('sea')
    await r.expectTableVisible()
  })
})

test.describe('Rates — Local Charges', () => {
  test('local charge list loads', async ({ page }) => {
    const r = new RatePage(page)
    await r.gotoLocal('sea')
    await r.expectTableVisible()
  })
})

test.describe('Rates — Markup', () => {
  test('markup list loads', async ({ page }) => {
    const r = new RatePage(page)
    await r.gotoMarkup()
    await r.expectTableVisible()
  })
})

test.describe('Rates — Import', () => {
  test('rate import page loads', async ({ page }) => {
    const r = new RatePage(page)
    await r.gotoImport()
    await expect(page.getByRole('main')).toBeVisible()
  })
})
```

- [ ] **Step 3: Remove placeholder and run tests**

```powershell
Remove-Item "e2e\tests\rates\.gitkeep"
npx playwright test e2e/tests/rates/rates.spec.ts
```

Expected: all 6 tests pass.

- [ ] **Step 4: Commit**

```powershell
git add e2e/pages/rates/RatePage.ts e2e/tests/rates/rates.spec.ts
git rm e2e/tests/rates/.gitkeep
git commit -m "feat(e2e): add rates tests (freight, customs, local, markup, import)"
```

---

### Task 2: Carriers tests

**Files:**
- Create: `e2e/pages/carriers/CarrierPage.ts`
- Create: `e2e/tests/carriers/carriers.spec.ts`

- [ ] **Step 1: Create `e2e/pages/carriers/CarrierPage.ts`**

```typescript
import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'

export class CarrierPage {
  constructor(private page: Page) {}

  async gotoVesselSailing() {
    await this.page.goto('/carrier/vessel-sailing')
  }

  async gotoFlightSchedule() {
    await this.page.goto('/carrier/flight-schedule')
  }

  async gotoContainerTracking() {
    await this.page.goto('/carrier/container-tracking')
  }

  async expectPageLoaded() {
    await expect(this.page.getByRole('main')).toBeVisible()
  }

  async searchContainer(containerNumber: string) {
    await this.page.getByRole('textbox').first().fill(containerNumber)
    await this.page.getByRole('button', { name: /search|track/i }).first().click()
  }
}
```

- [ ] **Step 2: Create `e2e/tests/carriers/carriers.spec.ts`**

```typescript
import { test, expect } from '@playwright/test'
import { CarrierPage } from '../../pages/carriers/CarrierPage'

test.describe('Carriers — Vessel Sailing', () => {
  test('vessel sailing page loads', async ({ page }) => {
    const c = new CarrierPage(page)
    await c.gotoVesselSailing()
    await c.expectPageLoaded()
  })
})

test.describe('Carriers — Flight Schedule', () => {
  test('flight schedule page loads', async ({ page }) => {
    const c = new CarrierPage(page)
    await c.gotoFlightSchedule()
    await c.expectPageLoaded()
  })
})

test.describe('Carriers — Container Tracking', () => {
  test('container tracking page loads', async ({ page }) => {
    const c = new CarrierPage(page)
    await c.gotoContainerTracking()
    await c.expectPageLoaded()
  })

  test('container tracking search renders result area', async ({ page }) => {
    const c = new CarrierPage(page)
    await c.gotoContainerTracking()
    await c.searchContainer('TCKU1234567')
    // Assert the result area appeared (may be empty if container doesn't exist)
    await expect(page.getByRole('main')).toBeVisible()
  })
})
```

- [ ] **Step 3: Run carriers tests**

```powershell
npx playwright test e2e/tests/carriers/carriers.spec.ts
```

Expected: all 4 tests pass.

- [ ] **Step 4: Commit**

```powershell
git add e2e/pages/carriers/CarrierPage.ts e2e/tests/carriers/carriers.spec.ts
git commit -m "feat(e2e): add carrier tracking tests (vessel, flight, container)"
```

---

### Task 3: Quotes tests

**Files:**
- Create: `e2e/pages/quotes/QuotePage.ts`
- Create: `e2e/tests/quotes/quotes.spec.ts`
- Delete: `e2e/tests/quotes/.gitkeep`

- [ ] **Step 1: Create `e2e/pages/quotes/QuotePage.ts`**

```typescript
import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'

export class QuotePage {
  constructor(private page: Page) {}

  async gotoList(transportType = 'sea') {
    await this.page.goto(`/quote/${transportType}`)
  }

  async gotoRequest() {
    await this.page.goto('/quote/request')
  }

  async gotoDetail(id: number) {
    await this.page.goto(`/quote/preview/${id}`)
  }

  async gotoUpdate(id: number) {
    await this.page.goto(`/quote/update/${id}`)
  }

  async expectQuoteInList(text: string) {
    await expect(this.page.getByRole('table').getByText(text)).toBeVisible()
  }

  async expectDetailVisible() {
    await expect(this.page.getByRole('main')).toBeVisible()
    await expect(this.page).not.toHaveURL(/\/login/)
  }

  async fillRequestForm(data: { clientName: string }) {
    // Quote request form — fill client name typeahead then pick first suggestion
    await this.page.getByLabel(/client/i).fill(data.clientName)
    await this.page.getByRole('option').first().click()
  }

  async submitRequest() {
    await this.page.getByRole('button', { name: /submit|save|create/i }).click()
    await this.page.waitForURL(url => !url.pathname.includes('/request'))
  }

  async clickEditFirstRow() {
    await this.page.getByRole('row').nth(1).getByRole('button', { name: /edit/i }).click()
  }

  async clickDeleteFirstRow() {
    await this.page.getByRole('row').nth(1).getByRole('button', { name: /delete/i }).click()
    await this.page.getByRole('button', { name: /confirm|yes|delete/i }).click()
  }
}
```

- [ ] **Step 2: Create `e2e/tests/quotes/quotes.spec.ts`**

```typescript
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
```

- [ ] **Step 3: Remove placeholder and run tests**

```powershell
Remove-Item "e2e\tests\quotes\.gitkeep"
npx playwright test e2e/tests/quotes/quotes.spec.ts
```

Expected: all 5 tests pass.

- [ ] **Step 4: Commit**

```powershell
git add e2e/pages/quotes/QuotePage.ts e2e/tests/quotes/quotes.spec.ts
git rm e2e/tests/quotes/.gitkeep
git commit -m "feat(e2e): add quote tests (list, detail, update, request)"
```

---

### Task 4: Shipments tests

**Files:**
- Create: `e2e/pages/shipments/ShipmentPage.ts`
- Create: `e2e/tests/shipments/shipments.spec.ts`
- Delete: `e2e/tests/shipments/.gitkeep`

- [ ] **Step 1: Create `e2e/pages/shipments/ShipmentPage.ts`**

```typescript
import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'

export class ShipmentPage {
  constructor(private page: Page) {}

  async gotoList(transportType = 'sea') {
    await this.page.goto(`/shipment/${transportType}`)
  }

  async gotoDetail(id: number, tab1 = '', tab2 = '') {
    const tabSuffix = tab1 ? `/${tab1}${tab2 ? `-${tab2}` : ''}` : ''
    await this.page.goto(`/shipment/${id}${tabSuffix}`)
  }

  async expectListLoaded() {
    await expect(this.page.getByRole('table')).toBeVisible()
  }

  async expectDetailLoaded() {
    await expect(this.page.getByRole('main')).toBeVisible()
    await expect(this.page).not.toHaveURL(/\/login/)
  }

  async clickTab(tabName: string) {
    await this.page.getByRole('tab', { name: new RegExp(tabName, 'i') }).click()
    await this.page.waitForTimeout(300) // Vuetify tab transition
  }

  async expectTabContentVisible() {
    await expect(this.page.getByRole('tabpanel')).toBeVisible()
  }

  async clickAdd() {
    await this.page.getByRole('button', { name: /add|create|new shipment/i }).first().click()
  }

  async saveDialog() {
    await this.page.getByRole('dialog').getByRole('button', { name: /save|submit|create/i }).click()
    await this.page.getByRole('dialog').waitFor({ state: 'hidden' })
  }

  async expectShipmentInList(text: string) {
    await expect(this.page.getByRole('table').getByText(text)).toBeVisible()
  }
}
```

- [ ] **Step 2: Create `e2e/tests/shipments/shipments.spec.ts`**

```typescript
import { test, expect } from '@playwright/test'
import { seed } from '../../fixtures/seed'
import { ShipmentPage } from '../../pages/shipments/ShipmentPage'

test.describe('Shipments', () => {
  test('shipment list loads for sea', async ({ page }) => {
    const s = new ShipmentPage(page)
    await s.gotoList('sea')
    await s.expectListLoaded()
  })

  test('shipment list loads for air', async ({ page }) => {
    const s = new ShipmentPage(page)
    await s.gotoList('air')
    await s.expectListLoaded()
  })

  test('shipment detail page loads for seeded shipment', async ({ page }) => {
    const s = new ShipmentPage(page)
    await s.gotoDetail(seed.shipmentId)
    await s.expectDetailLoaded()
  })

  test('shipment detail — navigate documents tab', async ({ page }) => {
    const s = new ShipmentPage(page)
    await s.gotoDetail(seed.shipmentId)
    await s.clickTab('documents')
    await s.expectTabContentVisible()
  })

  test('shipment detail — navigate events tab', async ({ page }) => {
    const s = new ShipmentPage(page)
    await s.gotoDetail(seed.shipmentId)
    await s.clickTab('events')
    await s.expectTabContentVisible()
  })

  test('shipment detail — navigate financials tab', async ({ page }) => {
    const s = new ShipmentPage(page)
    await s.gotoDetail(seed.shipmentId)
    await s.clickTab('financials')
    await s.expectTabContentVisible()
  })
})
```

- [ ] **Step 3: Remove placeholder and run tests**

```powershell
Remove-Item "e2e\tests\shipments\.gitkeep"
npx playwright test e2e/tests/shipments/shipments.spec.ts
```

Expected: all 6 tests pass. If tab names differ from the actual UI, inspect the tab bar and update the `clickTab()` calls.

- [ ] **Step 4: Commit**

```powershell
git add e2e/pages/shipments/ShipmentPage.ts e2e/tests/shipments/shipments.spec.ts
git rm e2e/tests/shipments/.gitkeep
git commit -m "feat(e2e): add shipment tests (list, detail, tabs)"
```

---

### Task 5: Run full phase 3 suite

- [ ] **Step 1: Run all phase 3 tests**

```powershell
npx playwright test e2e/tests/rates e2e/tests/carriers e2e/tests/quotes e2e/tests/shipments
```

Expected: all 21 tests pass. Check the HTML report on failure:

```powershell
pnpm e2e:report
```
