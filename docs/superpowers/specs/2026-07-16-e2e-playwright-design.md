# E2E Testing with Playwright — Design Spec

**Date:** 2026-07-16
**Status:** Approved

## Overview

Add a Playwright e2e test suite to `make-cargo-client-bo` that runs against the real backend. Auth is handled once via a global setup that saves browser session state to disk; all feature tests reuse that saved session. Initial coverage targets auth flows (login, logout, login-with-token). Feature suites (rates, quotes, shipments, settings) are scaffolded as empty directories for future expansion.

## Framework

**Playwright** with Chromium. TypeScript. No `webServer` auto-start — the dev server is assumed to be already running when tests execute.

## Environment

`.env.e2e` (gitignored) provides:

```
E2E_BASE_URL=http://localhost:5177/local-98960d49
E2E_USERNAME=<test account username>
E2E_PASSWORD=<test account password>
```

`playwright.config.ts` reads these via `process.env`.

## File Structure

```
e2e/
  setup/
    auth.setup.ts          ← logs in once, saves storageState to disk
  pages/
    LoginPage.ts           ← Page Object: goto, login, expectError
    AppPage.ts             ← Page Object base: logout, expectOnDashboard
  tests/
    auth/
      login.spec.ts
      logout.spec.ts
      login-with-token.spec.ts
    rates/                 ← placeholder for future tests
    quotes/                ← placeholder for future tests
    shipments/             ← placeholder for future tests
    settings/              ← placeholder for future tests
playwright.config.ts
playwright/.auth/
  user.json                ← gitignored, written by auth.setup.ts
.env.e2e                   ← gitignored
```

## playwright.config.ts

- `baseURL`: `process.env.E2E_BASE_URL`
- Two Playwright "projects":
  1. `setup` — runs `auth.setup.ts`, no `storageState`
  2. `chromium` — depends on `setup`, uses `storageState: 'playwright/.auth/user.json'`
- `testDir: './e2e/tests'`
- `globalSetup` not needed — Playwright projects handle ordering

## Auth Setup (`e2e/setup/auth.setup.ts`)

1. `page.goto('/login')`
2. Fill username field with `process.env.E2E_USERNAME`
3. Fill password field with `process.env.E2E_PASSWORD`
4. Click submit button
5. `await page.waitForURL(url => !url.includes('/login'))` — wait for redirect
6. `await page.context().storageState({ path: 'playwright/.auth/user.json' })`

## Page Objects

### `LoginPage.ts`
- `goto()` — `page.goto('/login')`
- `login(username, password)` — fill both `AppTextField` inputs + click submit
- `expectError()` — assert text "Wrong credentials" is visible

### `AppPage.ts`
- `expectOnDashboard()` — assert `page.url()` does not include `/login`
- `logout()` — open user menu and click logout item

## Initial Test Coverage

### `auth/login.spec.ts`
Uses a fresh context to test the login page itself. Override the project-level `storageState` with `test.use({ storageState: { cookies: [], origins: [] } })` at the top of the file so these tests run unauthenticated even though the `chromium` project sets a default session.

| Test | Action | Expected |
|------|--------|----------|
| valid login | fill correct creds + submit | redirected away from `/login` |
| wrong credentials | fill bad creds + submit | "Wrong credentials" error visible, URL stays `/login` |

### `auth/logout.spec.ts`
Uses saved session (already logged in).

| Test | Action | Expected |
|------|--------|----------|
| logout | click logout | redirected to `/login`, `accessToken` cookie absent |

### `auth/login-with-token.spec.ts`
Uses fresh context (unauthenticated) via `test.use({ storageState: { cookies: [], origins: [] } })`.

Valid-token values are obtained by calling the BO API before the test: `GET /api/organizations/{id}/login-link` returns `{ link }`. The test extracts the token and email path segments from that URL and navigates to them.

| Test | Action | Expected |
|------|--------|----------|
| valid token | call API to get login link, navigate to the returned URL path | redirected away from `/login-with-token/...` |
| invalid token | navigate with fake base64 values (`aW52YWxpZA==` / `dGVzdEBleGFtcGxlLmNvbQ==`) | "Invalid or expired login link" text visible |

## Gitignore Additions

```
playwright/.auth/
.env.e2e
```

## npm Script

```json
"e2e": "playwright test",
"e2e:ui": "playwright test --ui"
```

## Out of Scope

- No mock/stub layer — tests hit the real backend
- No CI pipeline configuration in this spec
- Feature test implementations (rates, quotes, shipments, settings) — directories scaffolded only
