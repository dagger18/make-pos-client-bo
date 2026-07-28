# Maintenance Mode Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Block all API requests with a 503 response when `IS_MAINTENANCE=1` is set, and show a non-dismissable maintenance popup in the BO frontend when this response is received.

**Architecture:** A Symfony event listener with priority 200 short-circuits every request before routing when the env var is truthy, returning `{"maintenance":true}` with HTTP 503. The BO frontend detects this specific marker in its global `onResponseError` handler, sets a Pinia store flag, and a persistent `VDialog` becomes visible — it cannot be dismissed, only a page reload (via Retry button) exits it.

**Tech Stack:** PHP 8.1+ (Symfony 6, `#[AsEventListener]`), Vue 3, Vuetify 3, Pinia, ofetch

---

## File Map

**Backend — `d:\Projects\make-cargo-client`**
- Modify: `.env` — add `IS_MAINTENANCE=` template var
- Create: `src/EventListener/MaintenanceListener.php` — 503 short-circuit listener

**Frontend — `d:\Projects\make-cargo-client-bo`**
- Modify: `src/stores/appStore.js` — add `maintenance` state + `setMaintenance` action
- Modify: `src/utils/api.js` — add `HTTP_SERVICE_UNAVAILABLE` constant + 503 detection
- Create: `src/components/common/MaintenanceDialog.vue` — persistent non-closable dialog
- Modify: `src/App.vue` — import and mount `MaintenanceDialog`

---

### Task 1: Backend — `IS_MAINTENANCE` env var + listener

**Files:**
- Modify: `d:\Projects\make-cargo-client\.env`
- Create: `d:\Projects\make-cargo-client\src\EventListener\MaintenanceListener.php`

Context: The project uses `#[AsEventListener]` attributes for auto-registration (no `services.yaml` needed). See `src/EventListener/JsonRequestListener.php` for the exact pattern. Priority 200 runs before routing/auth (JsonRequestListener uses 100).

- [ ] **Step 1: Add the env var template to `.env`**

Open `d:\Projects\make-cargo-client\.env`. After the `APP_DEBUG=` line (line 3), add:

```
IS_MAINTENANCE=
```

The file block should look like:
```
APP_ENV=
APP_SECRET=
APP_DEBUG=
IS_MAINTENANCE=
```

Leave the value empty (disabled by default). Set `IS_MAINTENANCE=1` in `.env.local` or the server environment to enable.

- [ ] **Step 2: Create the listener**

Create `d:\Projects\make-cargo-client\src\EventListener\MaintenanceListener.php`:

```php
<?php

namespace App\EventListener;

use Symfony\Component\EventDispatcher\Attribute\AsEventListener;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\HttpKernel\KernelEvents;

#[AsEventListener(event: KernelEvents::REQUEST, priority: 200)]
class MaintenanceListener
{
    public function __invoke(RequestEvent $event): void
    {
        if (!$event->isMainRequest()) {
            return;
        }
        if (!filter_var($_ENV['IS_MAINTENANCE'] ?? '', FILTER_VALIDATE_BOOLEAN)) {
            return;
        }
        $event->setResponse(new JsonResponse([
            'maintenance' => true,
            'message'     => 'Server is under maintenance. Please try again in 5–10 minutes.',
        ], 503));
    }
}
```

- [ ] **Step 3: Verify the listener is registered**

Run from `d:\Projects\make-cargo-client`:
```
php bin/console debug:event-dispatcher kernel.request
```

Expected: `MaintenanceListener` appears in the list with priority 200, above `JsonRequestListener` (priority 100).

- [ ] **Step 4: Test the listener manually**

Temporarily set `IS_MAINTENANCE=1` in `.env.local`, then make any API request (e.g. `GET /user`). Expected response:
```json
HTTP 503
{"maintenance": true, "message": "Server is under maintenance. Please try again in 5–10 minutes."}
```

Revert `.env.local` after verifying.

- [ ] **Step 5: Commit**

```bash
cd d:\Projects\make-cargo-client
git add .env src/EventListener/MaintenanceListener.php
git commit -m "feat: add MaintenanceListener for IS_MAINTENANCE env var"
```

---

### Task 2: Frontend — add `maintenance` state to `appStore`

**Files:**
- Modify: `d:\Projects\make-cargo-client-bo\src\stores\appStore.js`

Context: The store uses the Options API style (`defineStore('appStore', { state, getters, actions })`). State is defined starting at line 4. Actions end at line 135.

- [ ] **Step 1: Add `maintenance: false` to state**

In `src/stores/appStore.js`, the `state` object currently ends with `currencyFormatsCache: {},`. Add `maintenance` as the last property:

```js
state: () => ({
  errorMessages: [],
  queuingBtnList: [],
  loadingBtnList: [],
  drawNavigationOut: 0,
  autoLoad: AutoLoad,
  confirm: null,
  cachedGetRequests: {},
  organizationInfo: useCookie('organizationInfo').value ?? null,
  newEntities: {
    shipment: 0,
    quote: 0,
    client: 0,
    provider: 0,
    accounting: 0,
    notification: 0,
  },
  exchangeRatesConfig: {},
  currencyFormatsCache: {},
  maintenance: false,
}),
```

- [ ] **Step 2: Add `setMaintenance` action**

In the `actions` block, add this after `endLoading`:

```js
setMaintenance(value) {
  this.maintenance = value
},
```

- [ ] **Step 3: Verify no syntax errors**

Run from `d:\Projects\make-cargo-client-bo`:
```
npm run type-check
```
Or if there is no type-check script:
```
npm run build 2>&1 | head -30
```
Expected: no errors related to appStore.

- [ ] **Step 4: Commit**

```bash
cd d:\Projects\make-cargo-client-bo
git add src/stores/appStore.js
git commit -m "feat: add maintenance state and setMaintenance action to appStore"
```

---

### Task 3: Frontend — intercept 503 in `api.js`

**Files:**
- Modify: `d:\Projects\make-cargo-client-bo\src\utils\api.js`

Context: The `status` constants object is at lines 6–16. The `onResponseError` handler is at line 73. The 503 check must be the **first** check inside `onResponseError`, before the 401/403 checks, so it takes priority over all other error handling.

- [ ] **Step 1: Add `HTTP_SERVICE_UNAVAILABLE` to the status constants**

The current `status` object ends at line 16. Add the new constant:

```js
export const status = {
  HTTP_BAD_REQUEST: 400,
  HTTP_UNAUTHORIZED: 401,
  HTTP_FORBIDDEN: 403,
  HTTP_NOT_FOUND: 404,
  HTTP_INTERNAL_SERVER_ERROR: 500,
  HTTP_CONFLICT: 409,
  HTTP_UNPROCESSABLE_CONTENT: 422,
  HTTP_OK: 200,
  HTTP_CREATED: 201,
  HTTP_SERVICE_UNAVAILABLE: 503,
}
```

- [ ] **Step 2: Add the 503 maintenance check at the top of `onResponseError`**

The handler currently begins at line 73 with:
```js
async onResponseError({ request, response, options }) {
  const {$gettext} = gettext
  // Log error
  const appStore = useAppStore()
  if (
    response.status === status.HTTP_UNAUTHORIZED &&
    ...
```

Insert the maintenance check immediately after `const appStore = useAppStore()` (before the first `if` block):

```js
async onResponseError({ request, response, options }) {
  const {$gettext} = gettext
  const appStore = useAppStore()
  if (response.status === status.HTTP_SERVICE_UNAVAILABLE && response._data?.maintenance === true) {
    appStore.setMaintenance(true)
    return
  }
  if (
    response.status === status.HTTP_UNAUTHORIZED &&
    ...
```

- [ ] **Step 3: Verify**

With `IS_MAINTENANCE=1` set on the backend and the dev server running (`npm run dev`), open the BO in a browser. Any page that triggers an API call should result in `appStore.maintenance` becoming `true`. You can verify via Vue DevTools → Pinia → appStore → `maintenance: true`.

- [ ] **Step 4: Commit**

```bash
cd d:\Projects\make-cargo-client-bo
git add src/utils/api.js
git commit -m "feat: detect 503 maintenance response in api.js"
```

---

### Task 4: Frontend — `MaintenanceDialog` component + wire into `App.vue`

**Files:**
- Create: `d:\Projects\make-cargo-client-bo\src\components\common\MaintenanceDialog.vue`
- Modify: `d:\Projects\make-cargo-client-bo\src\App.vue`

Context: `App.vue` already has `SessionExpiredDialog` imported from `@/components/SessionExpiredDialog.vue` and mounted at line 57. `MaintenanceDialog` follows the same persistent-dialog pattern. Vuetify components are globally registered. `useGettext` must be imported from `vue3-gettext`. `window` is available globally in the browser.

- [ ] **Step 1: Create `MaintenanceDialog.vue`**

Create `d:\Projects\make-cargo-client-bo\src\components\common\MaintenanceDialog.vue`:

```vue
<script setup>
import { useAppStore } from '@/stores/appStore'
import { useGettext } from 'vue3-gettext'

const { $gettext } = useGettext()
const appStore = useAppStore()
</script>

<template>
  <VDialog
    :model-value="appStore.maintenance"
    max-width="420"
    persistent
    no-click-animation
  >
    <VCard>
      <VCardText class="text-center pa-8">
        <VIcon
          icon="tabler-tools"
          size="56"
          color="warning"
          class="mb-4"
        />
        <h5 class="text-h5 font-weight-bold mb-2">
          {{ $gettext('System Maintenance') }}
        </h5>
        <p class="text-body-1 text-medium-emphasis mb-6">
          {{ $gettext('The server is temporarily under maintenance. Please wait 5–10 minutes and try again.') }}
        </p>
        <VBtn
          color="primary"
          @click="window.location.reload()"
        >
          {{ $gettext('Retry') }}
        </VBtn>
      </VCardText>
    </VCard>
  </VDialog>
</template>
```

- [ ] **Step 2: Add `MaintenanceDialog` to `App.vue`**

In `src/App.vue`, add the import alongside the existing dialog imports (after line 3):

```js
import MaintenanceDialog from '@/components/common/MaintenanceDialog.vue'
```

In the template, add `<MaintenanceDialog />` immediately after `<SessionExpiredDialog />` (line 57):

```html
<SessionExpiredDialog />
<MaintenanceDialog />
```

The full template block should look like:

```html
<template>
  <VLocaleProvider :rtl="configStore.isAppRTL">
    <VApp :style="`--v-global-theme-primary: ${hexToRgb(global.current.value.colors.primary)}`">
      <RouterView />
      <ScrollToTop />
    </VApp>
    <MessageSnackBar />
    <AppTableConfirm ref="confirm" />
    <SessionExpiredDialog />
    <MaintenanceDialog />
  </VLocaleProvider>
</template>
```

- [ ] **Step 3: End-to-end verification**

1. Set `IS_MAINTENANCE=1` in `d:\Projects\make-cargo-client\.env.local`
2. Restart the Symfony backend
3. Open the BO in a browser and navigate to any authenticated page
4. Expected: a centered non-closable dialog appears with a wrench icon, "System Maintenance" heading, the wait message, and a "Retry" button
5. Click "Retry" — page reloads; dialog reappears immediately (maintenance is still on)
6. Clicking outside the dialog or pressing Escape does nothing
7. Unset `IS_MAINTENANCE` and restart the backend — the dialog no longer appears

- [ ] **Step 4: Commit**

```bash
cd d:\Projects\make-cargo-client-bo
git add src/components/common/MaintenanceDialog.vue src/App.vue
git commit -m "feat: add MaintenanceDialog and wire into App.vue"
```
