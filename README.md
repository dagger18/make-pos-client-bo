# Make Cargo — Back Office

Vue 3 + Vite + Vuetify 3 SPA. Freight-forwarding back-office covering quotes, shipments, rates, accounting, reporting, and more.

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=vue.volar) (disable Vetur).

## Project Setup

```sh
pnpm install
# postinstall auto-runs: build:icons + msw:init
```

### Dev server

```sh
pnpm dev
```

### Production build

```sh
pnpm build
```

### Preview production build

```sh
pnpm preview
```

### Lint (auto-fix)

```sh
pnpm lint
```

### Rebuild Iconify icon bundle

```sh
pnpm build:icons
```

Run this after adding new icons to `src/plugins/iconify/`.


## E2E Tests (Playwright)

Tests run against a live dev server — start it first.

### First-time setup

```sh
# 1. Install Playwright's Chromium browser
npx playwright install chromium

# 2. Create your local env file (already gitignored)
cp .env.e2e.example .env.e2e
```

Edit `.env.e2e` and fill in your credentials:

```
E2E_BASE_URL=http://localhost:5177/local-98960d49
E2E_USERNAME=your_test_username
E2E_PASSWORD=your_test_password
E2E_ORGANIZATION_ID=1
```

### Run tests

```sh
# Start the dev server in another terminal first
pnpm dev

# Run the full suite (setup → auth tests)
pnpm e2e

# Run a specific file
npx playwright test e2e/tests/auth/login.spec.ts

# Interactive UI mode (shows browser, great for debugging)
pnpm e2e:ui

# Open the last HTML report
pnpm e2e:report
```

### How it works

- `e2e/setup/auth.setup.ts` logs in once and saves the session to `playwright/.auth/user.json`
- All feature tests reuse that saved session automatically
- Tests that need a fresh unauthenticated context use `test.use({ storageState: { cookies: [], origins: [] } })` at the top of the file

### Test structure

```
e2e/
  setup/auth.setup.ts          ← runs once before all tests, saves session
  pages/
    LoginPage.ts               ← selectors for the login form
    AppPage.ts                 ← selectors for the main app (logout, dashboard)
  tests/
    auth/
      login.spec.ts            ← valid + wrong credentials
      logout.spec.ts           ← logout clears session
      login-with-token.spec.ts ← one-click login link (valid + invalid)
    rates/                     ← placeholder for future tests
    quotes/
    shipments/
    settings/
```

---

## Translations

Files: `src/locales/{lang}.po` — supported locales: `zh_CN`, `vi`, `ja`, `ko`, `de`, `es`, `ar`.

### Extract → Merge → Compile

```sh
# 1. Scan src/ for $gettext() calls and update src/locales/messages.pot
pnpm i18n:extract

# 2. Merge new strings into each .po file (preserves existing translations)
#    Requires gettext tools: choco install gettext  (Windows)
pnpm i18n:merge

# 3. Compile .po files to public/locales/*.json for the browser
pnpm i18n:compile
```

After step 2, open `src/locales/{lang}.po` and fill in `msgstr` for any new entries, then run step 3.

---

## User Guide Translations

The user guide HTML files in `public/docs/user-guide/` are translated separately from the app UI strings.

Files: `public/docs/user-guide/locales/{lang}.po` — same locales: `zh`, `vi`, `ja`, `ko`, `de`, `es`, `ar`.

### Extract → Merge → Build

```sh
# 1. Extract translatable strings from HTML docs → messages.pot
pnpm docs:i18n:extract

# 2. Merge new strings into per-language .po files (preserves existing translations)
pnpm docs:i18n:merge

# 3. Build translated HTML into public/docs/user-guide/{lang}/
pnpm docs:i18n:build

# Run all three steps at once
pnpm docs:i18n:all
```

After step 2, open `public/docs/user-guide/locales/{lang}.po` and fill in `msgstr` for any new entries, then run step 3.
