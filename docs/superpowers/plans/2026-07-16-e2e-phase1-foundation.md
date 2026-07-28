# E2E Phase 1 — Seed Infrastructure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `seed` Playwright project that runs once before all tests, creates one shared baseline record per entity type via the real API, and writes all IDs to `playwright/.auth/seed.json` for feature tests to import.

**Architecture:** `seed.setup.ts` runs after `auth.setup.ts` (which saves the auth cookie). It uses Playwright's `request` fixture (which carries the session cookie via `storageState`) to POST to the real Symfony backend through the Vite dev-server proxy. Resulting IDs are written to disk and imported by all feature tests via `e2e/fixtures/seed.ts`.

**Tech Stack:** Playwright `@playwright/test`, TypeScript, real Symfony backend, API base `/api` (local dev), pnpm.

---

## File Map

| Action | Path |
|--------|------|
| Modify | `playwright.config.mjs` |
| Modify | `.gitignore` |
| Modify | `.env.e2e.example` |
| Create | `e2e/fixtures/seed.ts` |
| Create | `e2e/setup/seed.setup.ts` |

---

### Task 1: Update playwright.config.mjs, .gitignore, .env.e2e.example

**Files:**
- Modify: `playwright.config.mjs`
- Modify: `.gitignore`
- Modify: `.env.e2e.example`

- [ ] **Step 1: Add seed project to `playwright.config.mjs`**

Open `playwright.config.mjs`. Replace the `projects` array (currently 2 entries) with this 3-entry version:

```javascript
projects: [
  {
    name: 'setup',
    testDir: './e2e/setup',
    testMatch: /auth\.setup\.ts/,
  },
  {
    name: 'seed',
    testDir: './e2e/setup',
    testMatch: /seed\.setup\.ts/,
    dependencies: ['setup'],
    use: {
      storageState: 'playwright/.auth/user.json',
    },
  },
  {
    name: 'chromium',
    use: {
      ...devices['Desktop Chrome'],
      storageState: 'playwright/.auth/user.json',
    },
    dependencies: ['seed'],
  },
],
```

- [ ] **Step 2: Add `seed.json` to `.gitignore`**

In `.gitignore`, find the `# Playwright` section and add a new line:

```
/playwright/.auth/seed.json
```

The section should now look like:

```
# Playwright
/playwright/.auth/user.json
/playwright/.auth/seed.json
/playwright-report/
/test-results/
```

- [ ] **Step 3: Add portal credentials to `.env.e2e.example`**

Append to `.env.e2e.example`:

```
E2E_PORTAL_USERNAME=your_portal_username
E2E_PORTAL_PASSWORD=your_portal_password
```

Also add these two lines to your real `.env.e2e` file with actual portal test account credentials.

- [ ] **Step 4: Verify the config parses correctly**

```powershell
npx playwright test --list 2>&1 | Select-Object -First 20
```

Expected: lists the 3 existing auth test titles, no import errors. The seed project will appear once `seed.setup.ts` is created.

- [ ] **Step 5: Commit**

```powershell
git add playwright.config.mjs .gitignore .env.e2e.example
git commit -m "chore(e2e): add seed project to playwright config"
```

---

### Task 2: Create `e2e/fixtures/seed.ts`

**Files:**
- Create: `e2e/fixtures/seed.ts`

- [ ] **Step 1: Create the fixtures directory**

```powershell
New-Item -ItemType Directory -Path "e2e\fixtures" -Force
```

- [ ] **Step 2: Create `e2e/fixtures/seed.ts`**

```typescript
import { readFileSync } from 'fs'
import path from 'path'

export interface SeedData {
  branchId: number
  branchName: string
  departmentId: number
  departmentName: string
  groupId: number
  groupName: string
  clientId: number
  clientName: string
  providerId: number
  providerName: string
  hsCodeId: number
  quoteId: number
  shipmentId: number
  consolidationId: number
  leadId: number
  opportunityId: number
  activityId: number
}

const seedPath = path.join(__dirname, '../../playwright/.auth/seed.json')

export const seed: SeedData = JSON.parse(readFileSync(seedPath, 'utf-8'))
```

- [ ] **Step 3: Commit**

```powershell
git add e2e/fixtures/seed.ts
git commit -m "feat(e2e): add seed data interface and loader"
```

---

### Task 3: Create `e2e/setup/seed.setup.ts`

**Files:**
- Create: `e2e/setup/seed.setup.ts`

**Important:** The API base URL in local dev is `/api` (see `src/utils/api.js` — returns `/api` when neither `VITE_API_BASE_URL` nor `VITE_CLIENT_MODE=shared` is set). Playwright resolves `/api/branch` against `baseURL` from `.env.e2e`, which sends the request to `http://localhost:5177/api/branch`.

**If any `expect(res.ok()).toBeTruthy()` fails:** open the running app in Chrome, open DevTools → Network, create the same entity via the UI, find the POST request, and inspect its payload to see the exact field names. Adjust the `multipart` object in the failing step to match.

- [ ] **Step 1: Create `e2e/setup/seed.setup.ts`**

```typescript
import { test as setup, expect } from '@playwright/test'
import { writeFileSync } from 'fs'
import path from 'path'

const seedPath = path.join(__dirname, '../../playwright/.auth/seed.json')

setup('seed shared test data', async ({ request }) => {
  const seed: Record<string, unknown> = {}

  // Branch
  const branchRes = await request.post('/api/branch', {
    multipart: { name: 'E2E Test Branch' },
  })
  expect(branchRes.ok(), `branch create failed: ${await branchRes.text()}`).toBeTruthy()
  const branch = await branchRes.json()
  seed.branchId = branch.id
  seed.branchName = 'E2E Test Branch'

  // Department
  const deptRes = await request.post('/api/department', {
    multipart: { name: 'E2E Test Department' },
  })
  expect(deptRes.ok(), `department create failed: ${await deptRes.text()}`).toBeTruthy()
  const dept = await deptRes.json()
  seed.departmentId = dept.id
  seed.departmentName = 'E2E Test Department'

  // User Group
  const groupRes = await request.post('/api/user-group', {
    multipart: { name: 'E2E Test Group' },
  })
  expect(groupRes.ok(), `user-group create failed: ${await groupRes.text()}`).toBeTruthy()
  const group = await groupRes.json()
  seed.groupId = group.id
  seed.groupName = 'E2E Test Group'

  // Client
  const clientRes = await request.post('/api/client', {
    multipart: { name: 'E2E Test Client' },
  })
  expect(clientRes.ok(), `client create failed: ${await clientRes.text()}`).toBeTruthy()
  const client = await clientRes.json()
  seed.clientId = client.id
  seed.clientName = 'E2E Test Client'

  // Provider
  const providerRes = await request.post('/api/provider', {
    multipart: { name: 'E2E Test Provider' },
  })
  expect(providerRes.ok(), `provider create failed: ${await providerRes.text()}`).toBeTruthy()
  const provider = await providerRes.json()
  seed.providerId = provider.id
  seed.providerName = 'E2E Test Provider'

  // HS Code
  const hsRes = await request.post('/api/hs-code', {
    multipart: { code: '999999', description: 'E2E Test HS Code' },
  })
  expect(hsRes.ok(), `hs-code create failed: ${await hsRes.text()}`).toBeTruthy()
  const hs = await hsRes.json()
  seed.hsCodeId = hs.id

  // Quote (requires client)
  const quoteRes = await request.post('/api/quote', {
    multipart: {
      name: 'E2E Test Quote',
      transportType: 'sea',
      clientId: String(seed.clientId),
    },
  })
  expect(quoteRes.ok(), `quote create failed: ${await quoteRes.text()}`).toBeTruthy()
  const quote = await quoteRes.json()
  seed.quoteId = quote.id

  // Shipment (requires client)
  const shipmentRes = await request.post('/api/shipment', {
    multipart: {
      reference: 'E2E-SHIP-001',
      transportType: 'sea',
      clientId: String(seed.clientId),
    },
  })
  expect(shipmentRes.ok(), `shipment create failed: ${await shipmentRes.text()}`).toBeTruthy()
  const shipment = await shipmentRes.json()
  seed.shipmentId = shipment.id

  // Consolidation
  const consRes = await request.post('/api/consolidation', {
    multipart: {
      name: 'E2E Test Consolidation',
      transportType: 'sea',
    },
  })
  expect(consRes.ok(), `consolidation create failed: ${await consRes.text()}`).toBeTruthy()
  const cons = await consRes.json()
  seed.consolidationId = cons.id

  // CRM Lead (JSON body — SalesCrmService uses JSON.stringify)
  const leadRes = await request.post('/api/crm/lead', {
    headers: { 'Content-Type': 'application/json' },
    data: JSON.stringify({ firstName: 'E2E', lastName: 'Lead', email: 'e2e-lead@test.invalid' }),
  })
  expect(leadRes.ok(), `lead create failed: ${await leadRes.text()}`).toBeTruthy()
  const lead = await leadRes.json()
  seed.leadId = lead.id

  // CRM Opportunity (JSON body)
  const oppRes = await request.post('/api/crm/opportunity', {
    headers: { 'Content-Type': 'application/json' },
    data: JSON.stringify({ name: 'E2E Test Opportunity', leadId: seed.leadId }),
  })
  expect(oppRes.ok(), `opportunity create failed: ${await oppRes.text()}`).toBeTruthy()
  const opp = await oppRes.json()
  seed.opportunityId = opp.id

  // CRM Activity (JSON body)
  const actRes = await request.post('/api/crm/activity', {
    headers: { 'Content-Type': 'application/json' },
    data: JSON.stringify({ type: 'call', subject: 'E2E Test Activity' }),
  })
  expect(actRes.ok(), `activity create failed: ${await actRes.text()}`).toBeTruthy()
  const act = await actRes.json()
  seed.activityId = act.id

  writeFileSync(seedPath, JSON.stringify(seed, null, 2))
})
```

- [ ] **Step 2: Run auth setup then seed in isolation**

```powershell
npx playwright test --project=setup
npx playwright test --project=seed
```

Expected: both pass. Then verify seed.json:

```powershell
Get-Content "playwright/.auth/seed.json"
```

Expected: a JSON object where every value is a positive integer (or the string name). Example:

```json
{
  "branchId": 3,
  "branchName": "E2E Test Branch",
  "departmentId": 2,
  ...
}
```

If any step fails, the error message in the terminal includes the API response body (e.g. `"branch create failed: {"errors":{"name":"This value should not be blank."}}`). Add the missing fields to the `multipart` object.

- [ ] **Step 3: Commit**

```powershell
git add e2e/setup/seed.setup.ts
git commit -m "feat(e2e): add seed setup - creates shared test dataset via API"
```

---

### Task 4: Verify full auth suite still passes with the new dependency chain

- [ ] **Step 1: Run the chromium project auth tests**

```powershell
npx playwright test --project=chromium e2e/tests/auth
```

Expected: 5 auth tests pass. The seed project runs automatically (chromium now depends on seed, which depends on setup).

- [ ] **Step 2: Run the full suite listing to confirm all projects appear**

```powershell
npx playwright test --list
```

Expected: lists setup, seed, and chromium projects with all tests.
