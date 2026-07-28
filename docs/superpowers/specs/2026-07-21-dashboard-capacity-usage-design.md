# Dashboard Capacity Usage Design

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a "Plan Usage" card to the main operational dashboard showing each organization capacity type with its current usage vs. limit as a color-coded progress bar.

**Architecture:** A new backend endpoint reads the `capacity` config and fetches live counts via the existing `CapacityService`, returning a normalized array. The BO frontend calls this via a new `CapacityService.js`, renders results in a new `CapacityUsageCard.vue` component, and mounts it in `dashboard.vue` below the hero stat cards.

**Tech Stack:** PHP (Symfony), Vue 3 + Vuetify 3, Axios via `$api`

---

## Backend — `make-cargo-client`

### New endpoint

`GET /report/analytics/capacity-usage`

Added to the existing `ReportAnalyticsController` (same controller as `dashboard-stats`).

**Logic:**
1. Read `capacity` config via `ConfigService::getConfigValue('capacity', true)`
2. For each rule where `enabled !== false`, call `CapacityService::getCurrentCount(CapacityType, rule)` to get current usage
3. Return array of normalized items

**Response shape:**
```json
[
  {
    "type": "max_shipments",
    "label": "Max Shipments",
    "limit": 100,
    "current": 47,
    "period": "total"
  },
  {
    "type": "email_send",
    "label": "Email Send",
    "limit": 500,
    "current": 12,
    "period": "per_day"
  }
]
```

- `type`: the CapacityType case value (snake_case string)
- `label`: human-readable name derived from the enum case name (e.g. `MaxShipments` → `Max Shipments`)
- `limit`: integer limit from the config rule
- `current`: live count — for `per_day` rules this is today's recorded usage from `cap_{type}_{YYYY-MM-DD}` config key; for `total` rules this is the live count from the relevant repository
- `period`: `"total"` or `"per_day"`
- Disabled rules (`enabled === false`) are excluded from the response

**Route registration:** Add alongside the existing `operational-dashboard` and `dashboard-stats` routes in the analytics route group.

---

## Frontend — `make-cargo-client-bo`

### New service: `src/services/CapacityService.js`

```js
export default {
  getUsage() {
    return $api('report/analytics/capacity-usage')
  },
}
```

### New component: `src/components/dashboard/CapacityUsageCard.vue`

- Accepts a `items` prop: array of capacity usage objects (shape above)
- Renders a `VCard` with title "Plan Usage"
- For each item renders:
  - A row with label `{label}: {current} / {limit}` and a period badge `(today)` when `period === "per_day"`
  - A `VProgressLinear` with `model-value` set to `(current / limit) * 100`
  - Color: `success` when < 70%, `warning` when 70–89%, `error` when ≥ 90%
- If `limit` is 0 or null for a rule, skip rendering that item (no division by zero)
- Shows a `VSkeletonLoader` while loading

### Changes to `src/pages/dashboard.vue`

- Import `CapacityService` and `CapacityUsageCard`
- Add `capacityUsage = ref([])` alongside existing `data = ref(null)`
- In `load()`, fetch both in parallel:
  ```js
  const [stats, usage] = await Promise.all([
    ReportAnalyticsService.dashboardStats(),
    CapacityService.getUsage(),
  ])
  data.value = stats
  capacityUsage.value = usage ?? []
  ```
- Add a full-width `VRow` / `VCol` after the hero stat cards row, rendering `<CapacityUsageCard :items="capacityUsage" />`

### Changes to `src/services/ReportAnalyticsService.js`

No changes needed — `CapacityService.js` is a separate file.

---

## Color Thresholds

| Usage %   | Vuetify color |
|-----------|---------------|
| < 70%     | `success`     |
| 70–89%    | `warning`     |
| ≥ 90%     | `error`       |

---

## Out of Scope

- Editing capacity limits from the dashboard (that belongs in settings/admin)
- Alerts or notifications when limits are approached
- Historical usage charts
