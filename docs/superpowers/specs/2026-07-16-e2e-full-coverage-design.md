# E2E Full Coverage — Design Spec

**Date:** 2026-07-16
**Status:** Approved

## Overview

Extend the existing Playwright e2e suite to cover all 13 app modules with full CRUD tests. Tests run against the real backend using a shared dataset seeded once before the suite runs. Auth tests already exist; this spec covers everything else.

## Shared Dataset Strategy

A `seed.setup.ts` Playwright project runs after `auth.setup.ts`. It calls the real API using the authenticated session cookie to create one baseline record per entity type. Seeded IDs are written to `playwright/.auth/seed.json` and imported by tests via `e2e/fixtures/seed.ts`.

**Why shared (not per-test):** Full CRUD across 13 modules would require hundreds of API calls if each test seeded its own data. A shared baseline is faster and simpler, with delete tests operating on throwaway records they create themselves.

**`seed.json` shape:**
```json
{
  "clientId": 0,
  "clientName": "E2E Test Client",
  "providerId": 0,
  "providerName": "E2E Test Provider",
  "branchId": 0,
  "departmentId": 0,
  "userId": 0,
  "groupId": 0,
  "hsCodeId": 0,
  "quoteId": 0,
  "shipmentId": 0,
  "consolidationId": 0,
  "leadId": 0,
  "opportunityId": 0,
  "activityId": 0,
  "journalId": 0
}
```

## File Structure

```
e2e/
  setup/
    auth.setup.ts                    ← exists: logs in, saves session
    seed.setup.ts                    ← NEW: seeds shared dataset, writes seed.json
  fixtures/
    seed.ts                          ← NEW: reads seed.json, exports typed IDs
  pages/
    LoginPage.ts                     ← exists
    AppPage.ts                       ← exists
    settings/SettingsPage.ts         ← NEW (one page object per module)
    library/LibraryPage.ts
    clients/ClientPage.ts
    providers/ProviderPage.ts
    rates/RatePage.ts
    carriers/CarrierPage.ts
    quotes/QuotePage.ts
    shipments/ShipmentPage.ts
    consolidation/ConsolidationPage.ts
    crm/CrmPage.ts
    accounting/AccountingPage.ts
    reports/ReportPage.ts
    portal/PortalPage.ts
  tests/
    auth/                            ← exists (login, logout, login-with-token)
    settings/settings.spec.ts        ← NEW
    library/library.spec.ts
    clients/clients.spec.ts
    providers/providers.spec.ts
    rates/rates.spec.ts
    carriers/carriers.spec.ts
    quotes/quotes.spec.ts
    shipments/shipments.spec.ts
    consolidation/consolidation.spec.ts
    crm/crm.spec.ts
    accounting/accounting.spec.ts
    reports/reports.spec.ts
    portal/portal.spec.ts
playwright.config.mjs                ← modify: add seed project
playwright/.auth/seed.json           ← gitignored, written by seed.setup.ts
```

## playwright.config.mjs Changes

Add a `seed` project that depends on `setup` (auth) and runs before `chromium`:

```javascript
projects: [
  { name: 'setup', testDir: './e2e/setup', testMatch: /auth\.setup\.ts/ },
  {
    name: 'seed',
    testDir: './e2e/setup',
    testMatch: /seed\.setup\.ts/,
    dependencies: ['setup'],
  },
  {
    name: 'chromium',
    use: { ...devices['Desktop Chrome'], storageState: 'playwright/.auth/user.json' },
    dependencies: ['seed'],
  },
]
```

## `seed.setup.ts`

Runs as an authenticated Playwright project. Uses `page.request` (which carries the session cookie) to POST to the real API and create one record per entity. Writes all returned IDs to `playwright/.auth/seed.json`.

Entities to seed (in dependency order). **Actual API endpoints must be verified by reading the existing service files in `src/services/` before implementing `seed.setup.ts`.**

1. Branch
2. Department
3. Group
4. User
5. Client
6. Provider
7. HS Code
8. Quote
9. Shipment
10. Consolidation
11. Lead
12. Opportunity
13. Activity
14. Journal entry

## `fixtures/seed.ts`

```typescript
import seedData from '../../playwright/.auth/seed.json'
export const seed = seedData as {
  clientId: number
  clientName: string
  providerId: number
  providerName: string
  branchId: number
  departmentId: number
  userId: number
  groupId: number
  hsCodeId: number
  quoteId: number
  shipmentId: number
  consolidationId: number
  leadId: number
  opportunityId: number
  activityId: number
  journalId: number
}
```

## Per-Module Test Pattern

Every module follows the same structure:

```typescript
import { test, expect } from '@playwright/test'
import { seed } from '../../fixtures/seed'
import { ClientPage } from '../../pages/clients/ClientPage'

test.describe('Clients', () => {
  test('list page loads and shows seeded client', async ({ page }) => {
    const p = new ClientPage(page)
    await p.gotoList()
    await expect(page.getByText(seed.clientName)).toBeVisible()
  })

  test('detail page loads', async ({ page }) => {
    const p = new ClientPage(page)
    await p.gotoDetail(seed.clientId)
    await expect(page.getByText(seed.clientName)).toBeVisible()
  })

  test('create new client', async ({ page }) => {
    const p = new ClientPage(page)
    await p.gotoList()
    await p.create({ name: 'E2E Create Test' })
    await expect(page.getByText('E2E Create Test')).toBeVisible()
  })

  test('update client', async ({ page }) => {
    const p = new ClientPage(page)
    await p.gotoDetail(seed.clientId)
    await p.update({ name: 'E2E Updated Name' })
    await expect(page.getByText('E2E Updated Name')).toBeVisible()
  })

  test('delete client', async ({ page }) => {
    // Create a throwaway record then delete it
    const p = new ClientPage(page)
    await p.gotoList()
    await p.create({ name: 'E2E Delete Target' })
    await p.deleteByName('E2E Delete Target')
    await expect(page.getByText('E2E Delete Target')).not.toBeVisible()
  })
})
```

Delete tests always create their own throwaway record so the shared seeded record stays intact for read/update tests.

## Module Implementations

### 1. Settings (`settings/settings.spec.ts`)
**Pages:** company, users, branches, departments, groups, global-setting
- List/view company info, update company name
- List users, view user detail, create user, update user role
- Create branch, update branch name, delete branch
- Create department, update, delete
- Create group, assign permissions, delete

### 2. Library (`library/library.spec.ts`)
**Pages:** hs-code, incoterm, shipment-mode, package-type, charge types
- List HS codes, create, update description, delete
- List incoterms (read-only reference data — assert visible)
- List shipment modes (read-only)
- Create package type, update, delete

### 3. Clients (`clients/clients.spec.ts`)
**Pages:** client/index, client/[id]
- List loads and shows seeded client
- Detail page loads with client info
- Create client
- Update client name/address
- Delete throwaway client

### 4. Providers (`providers/providers.spec.ts`)
**Pages:** provider/[providerType], provider/id-[id]
- List loads by provider type (freight, customs, etc.)
- Detail page loads
- Create provider
- Update provider details

### 5. Rates (`rates/rates.spec.ts`)
**Pages:** rate/freight/[transportType], rate/customs, rate/local, rate/markup
- Freight rates list loads
- Create freight rate
- Update rate value
- Delete rate

### 6. Carriers (`carriers/carriers.spec.ts`)
**Pages:** carrier/vessel-sailing, carrier/flight-schedule, carrier/container-tracking
- Vessel sailing list loads
- Flight schedule list loads
- Container tracking search (enter container number, assert result)

### 7. Quotes (`quotes/quotes.spec.ts`)
**Pages:** quote/request, quote/[transportType], quote/preview/[id], quote/update/[id]
- Create quote request
- View seeded quote
- Update quote
- Convert quote to shipment

### 8. Shipments (`shipments/shipments.spec.ts`)
**Pages:** shipment/[transportType], shipment/[id]/[[tab1]]-[[tab2]]
- Shipment list loads
- Detail loads (general tab)
- Navigate tabs (documents, events, financials)
- Update shipment field
- Upload document

### 9. Consolidation (`consolidation/consolidation.spec.ts`)
**Pages:** consolidation/index, consolidation/[id], warehouse/inventory, warehouse/facility
- Consolidation list loads
- Detail loads
- Create consolidation
- Add shipment to consolidation

### 10. CRM (`crm/crm.spec.ts`)
**Pages:** crm/leads, crm/opportunities, crm/activities
- Leads list loads, create lead, update lead status, delete
- Opportunities list, create opportunity, update stage
- Activities list, create activity, mark complete

### 11. Accounting (`accounting/accounting.spec.ts`)
**Pages:** accounting/journal, accounting/ageing-ap, accounting/ageing-ar, accounting/pnl-period
- Journal list loads, create journal entry, view entry detail
- AP ageing loads with data
- AR ageing loads with data
- P&L loads for a date range

### 12. Reports (`reports/reports.spec.ts`)
**Pages:** report/kpi, report/co2-emissions, report/vat-report, report/audit-log, report/shipment
**Read-only** — assert each report page loads without errors and displays content.
- KPI dashboard renders
- CO₂ emissions renders
- VAT report renders
- Audit log shows entries
- Shipment report renders

### 13. Portal (`portal/portal.spec.ts`)
**Pages:** portal/login, portal/dashboard, portal/shipments, portal/invoices, portal/documents, portal/quote-request
Portal uses a separate login flow (not the BO session). Tests use a fresh unauthenticated context with `test.use({ storageState: { cookies: [], origins: [] } })`. Portal credentials are read from `E2E_PORTAL_USERNAME` and `E2E_PORTAL_PASSWORD` in `.env.e2e`.
- Portal login with credentials
- Dashboard loads
- Shipments list shows seeded shipment
- Invoice list loads
- Document list loads
- Submit quote request form

## `.gitignore` Addition

```
/playwright/.auth/seed.json
```

## Implementation Order

Each module is a separate task in the implementation plan, executed in the dependency order listed above (Settings → Library → Clients → ... → Portal).
