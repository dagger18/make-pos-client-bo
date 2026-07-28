# Dashboard Capacity Usage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "Plan Usage" card to the main operational dashboard showing each organization capacity type with current usage vs. limit as a color-coded progress bar.

**Architecture:** A new public `getCapacityUsage()` method on `CapacityService` aggregates all configured capacity rules with live counts; a new Symfony route action exposes this as `GET /report/analytics/capacity-usage`; the BO fetches it via a new `CapacityService.js` and renders results in `CapacityUsageCard.vue`, mounted in `dashboard.vue` below the hero stat cards.

**Tech Stack:** PHP 8.1+ (Symfony 6), Vue 3 + Vuetify 3, `$api` (axios wrapper auto-imported in BO)

---

## File Map

**Backend — `d:\Projects\make-cargo-client`**
- Modify: `src/Module/Core/Service/CapacityService.php` — add public `getCapacityUsage(): array`
- Modify: `src/Module/Reporting/Controller/ReportAnalyticsController.php` — inject `CapacityService`, add `/capacity-usage` action

**Frontend — `d:\Projects\make-cargo-client-bo`**
- Create: `src/services/CapacityService.js` — thin `$api` wrapper
- Create: `src/components/dashboard/CapacityUsageCard.vue` — progress bar card component
- Modify: `src/pages/dashboard.vue` — fetch usage in parallel, render card

---

### Task 1: Add `getCapacityUsage()` to `CapacityService`

**Files:**
- Modify: `d:\Projects\make-cargo-client\src\Module\Core\Service\CapacityService.php`

Context: `CapacityService` already has a private `getCurrentCount(CapacityType $type, array $rule): int` method. `getCapacityUsage()` lives on the same class so can call it directly. `CapacityPeriod` is already imported at the top of the file.

- [ ] **Step 1: Add the public method after `recordUsage()`**

Open `src/Module/Core/Service/CapacityService.php`. The `recordUsage()` method ends around line 68. Insert the following immediately after it (before the `private function getRule` line):

```php
/**
 * Returns all enabled capacity rules with their live current usage.
 * Rules with no limit or limit=0 are excluded.
 *
 * @return array<int, array{type: string, label: string, limit: int, current: int, period: string}>
 */
public function getCapacityUsage(): array
{
    $config = $this->configService->getConfigValue('capacity', true);
    if (!is_array($config)) {
        return [];
    }

    $result = [];
    foreach ($config as $rule) {
        if (!($rule['enabled'] ?? true)) {
            continue;
        }
        $type = CapacityType::tryFrom($rule['type'] ?? '');
        if ($type === null) {
            continue;
        }
        $limit = isset($rule['limit']) ? (int) $rule['limit'] : null;
        if ($limit === null || $limit === 0) {
            continue;
        }
        $result[] = [
            'type'    => $type->value,
            'label'   => preg_replace('/(?<!^)([A-Z])/', ' $1', $type->name),
            'limit'   => $limit,
            'current' => $this->getCurrentCount($type, $rule),
            'period'  => $rule['period'] ?? CapacityPeriod::Total->value,
        ];
    }

    return $result;
}
```

The `label` logic converts the enum case name to a human string:
`MaxShipments` → `Max Shipments`, `EmailSend` → `Email Send`, etc.

- [ ] **Step 2: Verify the service compiles**

Run from `d:\Projects\make-cargo-client`:
```
php bin/console debug:container App\Module\Core\Service\CapacityService
```
Expected: service listed, no errors. If you see a parse error, fix the PHP syntax.

- [ ] **Step 3: Commit**

```bash
git add src/Module/Core/Service/CapacityService.php
git commit -m "feat: add getCapacityUsage() to CapacityService"
```

---

### Task 2: Add `GET /report/analytics/capacity-usage` endpoint

**Files:**
- Modify: `d:\Projects\make-cargo-client\src\Module\Reporting\Controller\ReportAnalyticsController.php`

Context: The controller currently injects only `ReportRepository`. Its class-level route is `#[Route('/report/analytics')]`. All methods use `#[Route('/<path>', methods: ['GET'])]` attributes. The last action is `dashboardStats()`.

- [ ] **Step 1: Inject `CapacityService` into the constructor**

Current constructor:
```php
public function __construct(private readonly ReportRepository $repo) {}
```

Replace with:
```php
public function __construct(
    private readonly ReportRepository $repo,
    private readonly \App\Module\Core\Service\CapacityService $capacityService,
) {}
```

- [ ] **Step 2: Add the route action after `dashboardStats()`**

```php
#[Route('/capacity-usage', methods: ['GET'])]
public function capacityUsage(): JsonResponse
{
    return $this->json($this->capacityService->getCapacityUsage());
}
```

- [ ] **Step 3: Verify the route is registered**

```
php bin/console debug:router | grep capacity-usage
```

Expected (route name may vary):
```
 report_analytics_capacity_usage   GET    ANY    ANY   /report/analytics/capacity-usage
```

- [ ] **Step 4: Test the endpoint**

Make an authenticated `GET /report/analytics/capacity-usage` request (use Postman, curl, or the browser with a valid JWT). Expected response shape when capacity is configured:
```json
[
  { "type": "max_shipments", "label": "Max Shipments", "limit": 100, "current": 12, "period": "total" },
  { "type": "email_send",    "label": "Email Send",    "limit": 500, "current": 0,  "period": "per_day" }
]
```
If the org has no `capacity` config key, returns `[]`.

- [ ] **Step 5: Commit**

```bash
git add src/Module/Reporting/Controller/ReportAnalyticsController.php
git commit -m "feat: add GET /report/analytics/capacity-usage endpoint"
```

---

### Task 3: Create `CapacityService.js` in the BO

**Files:**
- Create: `d:\Projects\make-cargo-client-bo\src\services\CapacityService.js`

Context: All BO services follow the same pattern — a plain object with methods that call `$api(path)`. `$api` is globally auto-imported (no import statement needed). See `src/services/ReportAnalyticsService.js` for the established pattern.

- [ ] **Step 1: Create the file**

```js
export default {
  getUsage() {
    return $api('report/analytics/capacity-usage')
  },
}
```

- [ ] **Step 2: Commit**

```bash
git add src/services/CapacityService.js
git commit -m "feat: add CapacityService.js for capacity usage API"
```

---

### Task 4: Create `CapacityUsageCard.vue`

**Files:**
- Create: `d:\Projects\make-cargo-client-bo\src\components\dashboard\CapacityUsageCard.vue`

Context: Vuetify 3 components (`VCard`, `VProgressLinear`, etc.) are globally registered — no imports needed. `useGettext` must be imported from `vue3-gettext`. Vue 3 `ref`/`computed` are auto-imported.

- [ ] **Step 1: Create the directory**

```bash
mkdir src/components/dashboard
```

- [ ] **Step 2: Create the component**

```vue
<script setup>
import { useGettext } from 'vue3-gettext'

const { $gettext } = useGettext()

defineProps({
  items: { type: Array, default: () => [] },
})

function usagePercent(item) {
  if (!item.limit) return 0
  return Math.min(100, Math.round((item.current / item.limit) * 100))
}

function usageColor(item) {
  const pct = usagePercent(item)
  if (pct >= 90) return 'error'
  if (pct >= 70) return 'warning'
  return 'success'
}
</script>

<template>
  <VCard>
    <VCardItem>
      <VCardTitle>{{ $gettext('Plan Usage') }}</VCardTitle>
    </VCardItem>
    <VCardText>
      <div
        v-for="item in items"
        :key="item.type"
        class="mb-4"
      >
        <div class="d-flex justify-space-between mb-1">
          <span class="text-body-2">
            {{ item.label }}
            <span
              v-if="item.period === 'per_day'"
              class="text-disabled text-caption ms-1"
            >({{ $gettext('today') }})</span>
          </span>
          <span class="text-body-2 font-weight-medium">{{ item.current }} / {{ item.limit }}</span>
        </div>
        <VProgressLinear
          :model-value="usagePercent(item)"
          :color="usageColor(item)"
          rounded
          height="6"
        />
      </div>
      <div
        v-if="items.length === 0"
        class="text-body-2 text-disabled text-center py-4"
      >
        {{ $gettext('No capacity limits configured') }}
      </div>
    </VCardText>
  </VCard>
</template>
```

Color thresholds: `success` < 70%, `warning` 70–89%, `error` ≥ 90%.

- [ ] **Step 3: Smoke-test with mock data**

Temporarily add `<CapacityUsageCard>` to any existing page with this mock:
```js
import CapacityUsageCard from '@/components/dashboard/CapacityUsageCard.vue'
const mock = [
  { type: 'max_shipments', label: 'Max Shipments', limit: 100, current: 47, period: 'total' },
  { type: 'email_send',    label: 'Email Send',    limit: 500, current: 380, period: 'per_day' },
  { type: 'max_users',     label: 'Max Users',     limit: 10,  current: 9,  period: 'total' },
]
```
```html
<CapacityUsageCard :items="mock" />
```
Expected: green bar at 47%, orange bar at 76%, red bar at 90%. "(today)" label next to "Email Send". Revert the test code before committing.

- [ ] **Step 4: Commit**

```bash
git add src/components/dashboard/CapacityUsageCard.vue
git commit -m "feat: add CapacityUsageCard component"
```

---

### Task 5: Wire capacity usage into `dashboard.vue`

**Files:**
- Modify: `d:\Projects\make-cargo-client-bo\src\pages\dashboard.vue`

Context: The current `load()` function fetches only `ReportAnalyticsService.dashboardStats()`. The template has a `<VRow>` that renders hero stat cards by looping over `heroCards` (a computed). Add the capacity card in a new row immediately after that hero cards row.

- [ ] **Step 1: Add imports at the top of `<script setup>`**

After the existing `import ReportAnalyticsService` line:
```js
import CapacityService from '@/services/CapacityService'
import CapacityUsageCard from '@/components/dashboard/CapacityUsageCard.vue'
```

- [ ] **Step 2: Add the reactive ref**

After `const data = ref(null)`:
```js
const capacityUsage = ref([])
```

- [ ] **Step 3: Replace `load()` to fetch both in parallel**

Current:
```js
async function load() {
  loading.value = true
  data.value = await ReportAnalyticsService.dashboardStats()
  loading.value = false
}
```

Replace with:
```js
async function load() {
  loading.value = true
  const [stats, usage] = await Promise.all([
    ReportAnalyticsService.dashboardStats(),
    CapacityService.getUsage(),
  ])
  data.value = stats
  capacityUsage.value = usage ?? []
  loading.value = false
}
```

- [ ] **Step 4: Add the card to the template**

In `<template>`, find the `<VRow>` that renders the hero stat cards (it contains a `v-for` over `heroCards`). Immediately after its closing `</VRow>`, add:

```html
<VRow class="mt-2">
  <VCol cols="12">
    <CapacityUsageCard :items="capacityUsage" />
  </VCol>
</VRow>
```

- [ ] **Step 5: Verify in browser**

Start the dev server (`npm run dev`). Navigate to the dashboard. The "Plan Usage" card should appear below the four hero stat cards with all capacity types configured for the org shown as colored progress bars. If the org has no capacity config, the card shows "No capacity limits configured".

- [ ] **Step 6: Commit**

```bash
git add src/pages/dashboard.vue
git commit -m "feat: show capacity usage card on main dashboard"
```
