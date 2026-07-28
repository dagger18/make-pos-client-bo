# Playwright E2E Test Suite Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Install Playwright and implement auth e2e tests (login, logout, login-with-token) against the real backend, with feature test directories scaffolded for future expansion.

**Architecture:** A global `auth.setup.ts` project logs in once and saves browser session state to `playwright/.auth/user.json`; all feature tests reuse that state via `storageState`. Tests needing a fresh unauthenticated context override `storageState` locally. Page Objects wrap Vuetify selectors so test files stay readable.

**Tech Stack:** Playwright `@playwright/test`, TypeScript, Chromium, `dotenv` for `.env.e2e` loading, pnpm.

---

## File Map

| Action | Path |
|--------|------|
| Create | `playwright.config.ts` |
| Create | `.env.e2e` (gitignored template) |
| Modify | `.gitignore` |
| Create | `playwright/.auth/.gitkeep` |
| Create | `e2e/setup/auth.setup.ts` |
| Create | `e2e/pages/LoginPage.ts` |
| Create | `e2e/pages/AppPage.ts` |
| Create | `e2e/tests/auth/login.spec.ts` |
| Create | `e2e/tests/auth/logout.spec.ts` |
| Create | `e2e/tests/auth/login-with-token.spec.ts` |
| Create | `e2e/tests/rates/.gitkeep` |
| Create | `e2e/tests/quotes/.gitkeep` |
| Create | `e2e/tests/shipments/.gitkeep` |
| Create | `e2e/tests/settings/.gitkeep` |
| Modify | `package.json` (add e2e scripts) |

---

### Task 1: Install Playwright

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install packages**

```powershell
pnpm add -D @playwright/test dotenv
```

Expected output: packages added to `devDependencies`, no errors.

- [ ] **Step 2: Install Chromium browser binary**

```powershell
npx playwright install chromium
```

Expected: Chromium downloaded, no errors.

- [ ] **Step 3: Add e2e scripts to package.json**

Open `package.json` and add to the `"scripts"` section:

```json
"e2e": "playwright test",
"e2e:ui": "playwright test --ui",
"e2e:report": "playwright show-report"
```

- [ ] **Step 4: Verify install**

```powershell
npx playwright --version
```

Expected: prints a version string like `Version 1.x.x`.

- [ ] **Step 5: Commit**

```powershell
git add package.json pnpm-lock.yaml
git commit -m "chore: install playwright and dotenv for e2e tests"
```

---

### Task 2: Playwright config, env file, gitignore

**Files:**
- Create: `playwright.config.ts`
- Create: `.env.e2e`
- Create: `playwright/.auth/.gitkeep`
- Modify: `.gitignore`

- [ ] **Step 1: Create `playwright.config.ts`**

```typescript
import { defineConfig, devices } from '@playwright/test'
import { config } from 'dotenv'

config({ path: '.env.e2e' })

export default defineConfig({
  testDir: './e2e/tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: 'html',
  use: {
    baseURL: process.env.E2E_BASE_URL,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'setup',
      testDir: './e2e/setup',
      testMatch: /auth\.setup\.ts/,
    },
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/user.json',
      },
      dependencies: ['setup'],
    },
  ],
})
```

- [ ] **Step 2: Create `.env.e2e` with your actual credentials**

```
E2E_BASE_URL=http://localhost:5177/local-98960d49
E2E_USERNAME=your_test_username
E2E_PASSWORD=your_test_password
E2E_ORGANIZATION_ID=1
```

Replace the values with your real test account credentials and an organization ID whose login-link you want to test.

- [ ] **Step 3: Create `playwright/.auth/.gitkeep`**

```powershell
New-Item -ItemType Directory -Path "playwright\.auth" -Force
New-Item -ItemType File -Path "playwright\.auth\.gitkeep" -Force
```

- [ ] **Step 4: Update `.gitignore`**

Add these lines to the `# 👉 Custom Git ignores` section of `.gitignore`:

```
# Playwright
/playwright/.auth/user.json
/playwright-report/
/test-results/
```

- [ ] **Step 5: Verify config is valid**

```powershell
npx playwright test --list 2>&1
```

Expected: prints "No tests found" or similar — no import/config errors.

- [ ] **Step 6: Commit**

```powershell
git add playwright.config.ts playwright/.auth/.gitkeep .gitignore
git commit -m "chore: add playwright config and env setup"
```

---

### Task 3: Auth setup

**Files:**
- Create: `e2e/setup/auth.setup.ts`

- [ ] **Step 1: Create `e2e/setup/auth.setup.ts`**

```typescript
import { test as setup } from '@playwright/test'
import path from 'path'

const authFile = path.join(__dirname, '../../playwright/.auth/user.json')

setup('authenticate', async ({ page }) => {
  await page.goto('/login')

  await page.locator('input').nth(0).fill(process.env.E2E_USERNAME!)
  await page.locator('input[type="password"]').fill(process.env.E2E_PASSWORD!)
  await page.getByRole('button', { name: 'Login' }).click()

  await page.waitForURL(url => !url.pathname.includes('/login'))

  await page.context().storageState({ path: authFile })
})
```

> **Note on selectors:** `input.nth(0)` targets the first input on the login page (username). `input[type="password"]` targets the password field. `getByRole('button', { name: 'Login' })` targets the submit button. If the login form has extra inputs above the username field, adjust `nth(0)` accordingly.

- [ ] **Step 2: Run auth setup in isolation to verify it works**

```powershell
npx playwright test --project=setup
```

Expected: 1 test passes ("authenticate"). After it completes, verify the file exists:

```powershell
Test-Path "playwright/.auth/user.json"
```

Expected: `True`.

- [ ] **Step 3: Commit**

```powershell
git add e2e/setup/auth.setup.ts
git commit -m "feat(e2e): add auth setup - logs in once and saves session"
```

---

### Task 4: Page Objects

**Files:**
- Create: `e2e/pages/LoginPage.ts`
- Create: `e2e/pages/AppPage.ts`

- [ ] **Step 1: Create `e2e/pages/LoginPage.ts`**

```typescript
import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'

export class LoginPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/login')
  }

  async login(username: string, password: string) {
    await this.page.locator('input').nth(0).fill(username)
    await this.page.locator('input[type="password"]').fill(password)
    await this.page.getByRole('button', { name: 'Login' }).click()
  }

  async expectError() {
    await expect(this.page.getByText('Wrong credentials').first()).toBeVisible()
  }

  async expectOnLoginPage() {
    await expect(this.page).toHaveURL(/\/login/)
  }
}
```

- [ ] **Step 2: Create `e2e/pages/AppPage.ts`**

```typescript
import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'

export class AppPage {
  constructor(private page: Page) {}

  async expectOnDashboard() {
    await expect(this.page).not.toHaveURL(/\/login/)
  }

  async logout() {
    // The logout item lives inside a user accordion — click it by text.
    // If it is hidden inside a collapsed menu, first click the user avatar/name
    // button to open the accordion, then click Logout.
    await this.page.getByText('Logout').click()
    await this.page.waitForURL(/\/login/)
  }
}
```

> **Note:** If `getByText('Logout')` fails because the menu is collapsed, inspect the nav layout component and add a click on the user accordion trigger before the logout click. The trigger is typically a button showing the user's name or avatar.

- [ ] **Step 3: Commit**

```powershell
git add e2e/pages/LoginPage.ts e2e/pages/AppPage.ts
git commit -m "feat(e2e): add LoginPage and AppPage page objects"
```

---

### Task 5: Login tests

**Files:**
- Create: `e2e/tests/auth/login.spec.ts`

- [ ] **Step 1: Create `e2e/tests/auth/login.spec.ts`**

```typescript
import { test, expect } from '@playwright/test'
import { LoginPage } from '../../pages/LoginPage'

// These tests verify the login page itself — run without saved session
test.use({ storageState: { cookies: [], origins: [] } })

test.describe('Login', () => {
  test('valid credentials redirect away from /login', async ({ page }) => {
    const login = new LoginPage(page)
    await login.goto()
    await login.login(process.env.E2E_USERNAME!, process.env.E2E_PASSWORD!)
    await expect(page).not.toHaveURL(/\/login/)
  })

  test('wrong credentials show error and stay on /login', async ({ page }) => {
    const login = new LoginPage(page)
    await login.goto()
    await login.login('wrong@example.com', 'wrongpassword')
    await login.expectError()
    await login.expectOnLoginPage()
  })
})
```

- [ ] **Step 2: Run the login tests**

```powershell
npx playwright test e2e/tests/auth/login.spec.ts
```

Expected: 2 tests pass. If the valid-login test fails, check that `E2E_USERNAME` and `E2E_PASSWORD` in `.env.e2e` are correct. If the error test fails, verify the error text "Wrong credentials" matches what Vuetify renders (inspect the DOM if needed).

- [ ] **Step 3: Commit**

```powershell
git add e2e/tests/auth/login.spec.ts
git commit -m "feat(e2e): add login tests (valid creds + wrong creds)"
```

---

### Task 6: Logout test

**Files:**
- Create: `e2e/tests/auth/logout.spec.ts`

- [ ] **Step 1: Create `e2e/tests/auth/logout.spec.ts`**

```typescript
import { test, expect } from '@playwright/test'
import { AppPage } from '../../pages/AppPage'

// This test uses the saved session (default storageState from playwright.config.ts)
test.describe('Logout', () => {
  test('logout redirects to /login and clears accessToken cookie', async ({ page }) => {
    // Start from dashboard (already authenticated via storageState)
    await page.goto('/')

    const app = new AppPage(page)
    await app.expectOnDashboard()
    await app.logout()

    await expect(page).toHaveURL(/\/login/)

    const cookies = await page.context().cookies()
    const accessToken = cookies.find(c => c.name === 'accessToken')
    expect(accessToken).toBeUndefined()
  })
})
```

- [ ] **Step 2: Run the logout test**

```powershell
npx playwright test e2e/tests/auth/logout.spec.ts
```

Expected: 1 test passes. If `AppPage.logout()` fails to find the "Logout" text, open the app in the browser, inspect the nav sidebar, find the element wrapping "Logout", and update `AppPage.ts` to open that accordion/menu first.

- [ ] **Step 3: Commit**

```powershell
git add e2e/tests/auth/logout.spec.ts
git commit -m "feat(e2e): add logout test"
```

---

### Task 7: Login-with-token tests

**Files:**
- Create: `e2e/tests/auth/login-with-token.spec.ts`

The valid-token test calls `GET /api/organizations/login-link/{id}` using the authenticated `page.request` context (which carries the session cookie), then opens the returned URL in a fresh (unauthenticated) browser context.

- [ ] **Step 1: Create `e2e/tests/auth/login-with-token.spec.ts`**

```typescript
import { test, expect } from '@playwright/test'

test.describe('Login with token', () => {
  test('valid token redirects to dashboard', async ({ page, browser }) => {
    const orgId = process.env.E2E_ORGANIZATION_ID!

    // page uses the saved auth session — use it to fetch the login link
    const response = await page.request.get(`/api/organizations/login-link/${orgId}`)
    expect(response.ok()).toBeTruthy()

    const { link } = await response.json() as { link: string }
    expect(link).toBeTruthy()

    // Navigate the login link in a fresh (unauthenticated) context
    const freshContext = await browser.newContext()
    const freshPage = await freshContext.newPage()

    await freshPage.goto(link)
    await freshPage.waitForURL(url => !url.pathname.includes('/login-with-token/'))
    await expect(freshPage).not.toHaveURL(/\/login$/)

    await freshContext.close()
  })

  test('invalid token shows error state', async ({ browser }) => {
    const baseURL = process.env.E2E_BASE_URL!

    const freshContext = await browser.newContext()
    const freshPage = await freshContext.newPage()

    // Navigate with fake base64 values (decode to "invalid" and "test@example.com")
    await freshPage.goto(`${baseURL}/login-with-token/aW52YWxpZA==/${btoa('test@example.com').replace(/=/g, '%3D')}`)
    await expect(freshPage.getByText('Invalid or expired login link')).toBeVisible()

    await freshContext.close()
  })
})
```

> **Note on the invalid-token URL:** `aW52YWxpZA==` is `btoa('invalid')`. The email segment is `btoa('test@example.com')` URL-encoded. These values decode to a non-existent user so the API returns `{ result: 'invalid token' }`.

- [ ] **Step 2: Run the login-with-token tests**

```powershell
npx playwright test e2e/tests/auth/login-with-token.spec.ts
```

Expected: 2 tests pass. If the valid-token test fails with a 401/403, confirm that `E2E_ORGANIZATION_ID` in `.env.e2e` is an organization the test user has access to. If the error test fails because the URL format doesn't match, adjust the URL construction to match what the backend actually produces.

- [ ] **Step 3: Commit**

```powershell
git add e2e/tests/auth/login-with-token.spec.ts
git commit -m "feat(e2e): add login-with-token tests (valid + invalid token)"
```

---

### Task 8: Scaffold feature directories and run full suite

**Files:**
- Create: `e2e/tests/rates/.gitkeep`
- Create: `e2e/tests/quotes/.gitkeep`
- Create: `e2e/tests/shipments/.gitkeep`
- Create: `e2e/tests/settings/.gitkeep`

- [ ] **Step 1: Create placeholder directories**

```powershell
New-Item -ItemType File -Path "e2e/tests/rates/.gitkeep" -Force
New-Item -ItemType File -Path "e2e/tests/quotes/.gitkeep" -Force
New-Item -ItemType File -Path "e2e/tests/shipments/.gitkeep" -Force
New-Item -ItemType File -Path "e2e/tests/settings/.gitkeep" -Force
```

- [ ] **Step 2: Run the full suite to confirm everything passes**

```powershell
pnpm e2e
```

Expected: 5 tests total (2 login + 1 logout + 2 login-with-token), all pass. HTML report opens at `playwright-report/index.html` if any fail.

- [ ] **Step 3: Commit**

```powershell
git add e2e/tests/rates/.gitkeep e2e/tests/quotes/.gitkeep e2e/tests/shipments/.gitkeep e2e/tests/settings/.gitkeep
git commit -m "feat(e2e): scaffold feature test directories for future expansion"
```
