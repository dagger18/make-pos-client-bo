# Maintenance Mode Design

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Block all API requests during deployments/migrations via an env var, and show a non-dismissable maintenance popup in the BO frontend.

**Architecture:** A Symfony event listener intercepts every request before routing when `IS_MAINTENANCE=1`, returning a 503 JSON response with a `maintenance: true` marker. The BO frontend detects this marker in its global `onResponseError` handler, sets a store flag, and renders a persistent dialog that cannot be closed — only a manual page reload (via a Retry button) exits it.

**Tech Stack:** PHP 8.1+ (Symfony 6), Vue 3 + Vuetify 3, Pinia, ofetch

---

## Backend — `make-cargo-client`

### Env var

Add to `d:\Projects\make-cargo-client\.env`:
```
IS_MAINTENANCE=
```
Set `IS_MAINTENANCE=1` (or any truthy string) in the server environment or `.env.local` to enable maintenance mode. Empty or absent = disabled.

### New listener: `src/EventListener/MaintenanceListener.php`

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

- Priority 200 runs before routing, authentication, and all business logic.
- Only fires on the main request (not sub-requests).
- `filter_var(..., FILTER_VALIDATE_BOOLEAN)` treats `"1"`, `"true"`, `"yes"`, `"on"` as truthy; empty string, `"0"`, `"false"` as falsy.
- No `services.yaml` change needed — `autoconfigure: true` registers it automatically.

### Response shape

```json
HTTP 503 Service Unavailable
Content-Type: application/json

{
  "maintenance": true,
  "message": "Server is under maintenance. Please try again in 5–10 minutes."
}
```

The `maintenance: true` key is the contract the frontend uses to distinguish maintenance 503s from accidental 503s (e.g. a crashed worker).

---

## Frontend — `make-cargo-client-bo`

### 1. `src/stores/appStore.js`

Add to the Pinia store state:
```js
maintenance: false,
```

Add action:
```js
setMaintenance(value) {
  this.maintenance = value
},
```

### 2. `src/utils/api.js`

In the `onResponseError` handler, add a check for maintenance 503 **before** the existing status checks, so it takes priority:

```js
if (response.status === 503 && response._data?.maintenance === true) {
  useAppStore().setMaintenance(true)
  return
}
```

Regular 503s (without `maintenance: true` in the body) fall through to existing handling.

### 3. `src/components/common/MaintenanceDialog.vue`

A persistent, non-closable Vuetify dialog — same pattern as `SessionExpiredDialog.vue`.

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
        <VIcon icon="tabler-tools" size="56" color="warning" class="mb-4" />
        <h5 class="text-h5 font-weight-bold mb-2">{{ $gettext('System Maintenance') }}</h5>
        <p class="text-body-1 text-medium-emphasis mb-6">
          {{ $gettext('The server is temporarily under maintenance. Please wait 5–10 minutes and try again.') }}
        </p>
        <VBtn color="primary" @click="() => window.location.reload()">
          {{ $gettext('Retry') }}
        </VBtn>
      </VCardText>
    </VCard>
  </VDialog>
</template>
```

- No close button, no overlay click-to-dismiss (`persistent`).
- Retry button reloads the page — if maintenance is still active, the next API call will set the flag again and the dialog reappears.
- `window.location.reload()` is intentional: clears in-flight state cleanly.

### 4. `src/App.vue`

Add the component import and mount it alongside `<SessionExpiredDialog />`:

```vue
import MaintenanceDialog from '@/components/common/MaintenanceDialog.vue'
```

```html
<SessionExpiredDialog />
<MaintenanceDialog />
```

---

## Out of Scope

- Backend health-check endpoint that bypasses maintenance (not needed for this use case)
- Auto-retry / polling (user manually retries via the button)
- Soft-warning banner before full maintenance (not requested)
- Admin bypass header (not requested)
