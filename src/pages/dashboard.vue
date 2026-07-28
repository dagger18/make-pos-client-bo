<script setup>
import ReportAnalyticsService from '@/services/ReportAnalyticsService'
import CapacityService from '@/services/CapacityService'
import CapacityUsageCard from '@/components/dashboard/CapacityUsageCard.vue'
import { useGettext } from 'vue3-gettext'
import { useAuthStore } from '@/stores/authStore'

definePage({ meta: { action: 'GET', subject: 'EbitNote' } })

const { $gettext } = useGettext()
const authStore = useAuthStore()
const planName = computed(() => authStore.organizationConfig?.planName ?? null)
const data = ref(null)
const capacityUsage = ref([])
const loading = ref(false)

async function load() {
  loading.value = true
  try {
    const [stats, usage] = await Promise.all([
      ReportAnalyticsService.dashboardStats(),
      CapacityService.getUsage(),
    ])
    data.value = stats
    capacityUsage.value = usage ?? []
  } finally {
    loading.value = false
  }
}

onMounted(load)

const nowStr = new Date().toISOString()

const formatDate = d => d
  ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
  : '—'

// ── Transport mode metadata ──────────────────────────────────────────────────
const MODE_LABELS = { OCN: 'Ocean', AIR: 'Air', RD: 'Road', RAL: 'Rail', COU: 'Courier', MMD: 'Multimodal' }
const MODE_HEX    = { OCN: '#7367F0', AIR: '#00CFE8', RD: '#FF9F43', RAL: '#9C27B0', COU: '#28C76F', MMD: '#EA5455' }
const MODE_COLOR  = { OCN: 'primary', AIR: 'info',   RD: 'warning', RAL: 'secondary', COU: 'success', MMD: 'error' }
const modeLabel = c => MODE_LABELS[c] || c || '—'
const modeColor = c => MODE_COLOR[c]  || 'default'
const modeHex   = c => MODE_HEX[c]   || '#7367F0'

// ── Hero stat cards (top row) ────────────────────────────────────────────────
const heroCards = computed(() => [
  {
    title: $gettext('Active Shipments'),
    value: data.value?.active_count ?? '—',
    icon: 'tabler-ship',
    color: 'primary',
  },
  {
    title: $gettext('Arriving in 7 Days'),
    value: data.value?.arriving_soon_count ?? '—',
    icon: 'tabler-calendar-due',
    color: 'info',
  },
  {
    title: $gettext('Overdue'),
    value: data.value?.overdue_count ?? '—',
    icon: 'tabler-alert-triangle',
    color: (data.value?.overdue_count ?? 0) > 0 ? 'error' : 'success',
  },
  {
    title: $gettext('Exceptions'),
    value: data.value?.exception_count ?? '—',
    icon: 'tabler-alert-circle',
    color: (data.value?.exception_count ?? 0) > 0 ? 'warning' : 'success',
  },
])

// ── Performance list (right panel) ──────────────────────────────────────────
const perfItems = computed(() => [
  { title: $gettext('Active'),        value: data.value?.active_count ?? 0,          icon: 'tabler-ship',           color: 'primary'   },
  { title: $gettext('Pending'),       value: data.value?.pending_count ?? 0,         icon: 'tabler-clock-hour-3',   color: 'warning'   },
  { title: $gettext('Confirmed'),     value: data.value?.confirmed_count ?? 0,       icon: 'tabler-checks',         color: 'success'   },
  { title: $gettext('Arriving (7d)'), value: data.value?.arriving_soon_count ?? 0,   icon: 'tabler-calendar-due',   color: 'info'      },
  { title: $gettext('Overdue'),       value: data.value?.overdue_count ?? 0,         icon: 'tabler-alert-triangle', color: 'error'     },
  { title: $gettext('Done (month)'),  value: data.value?.completed_this_month ?? 0,  icon: 'tabler-circle-check',   color: 'secondary' },
])

// ── Trend chart (bar + line) ─────────────────────────────────────────────────
const labelColor  = 'rgba(var(--v-theme-on-background), var(--v-medium-emphasis-opacity))'
const borderColor = 'rgba(var(--v-border-color), var(--v-border-opacity))'

const trendSeries = computed(() => {
  const months = data.value?.monthly_trend ?? []
  const vals   = months.map(t => parseInt(t.cnt))
  // simple moving-average line for second series
  const avg = vals.map((_, i) => {
    const window = vals.slice(Math.max(0, i - 1), i + 2)
    return Math.round(window.reduce((a, b) => a + b, 0) / window.length)
  })
  return [
    { name: $gettext('New jobs'), type: 'column', data: vals },
    { name: $gettext('Avg'),      type: 'line',   data: avg  },
  ]
})

const trendOptions = computed(() => ({
  chart: { type: 'line', stacked: false, parentHeightOffset: 0, toolbar: { show: false }, zoom: { enabled: false } },
  markers: { size: 5, colors: '#fff', strokeColors: '#7367F0', hover: { size: 6 }, borderRadius: 4 },
  stroke: { curve: 'smooth', width: [0, 3], lineCap: 'round' },
  legend: {
    show: true, position: 'bottom',
    markers: { width: 8, height: 8, offsetX: -3 },
    height: 40, itemMargin: { horizontal: 10, vertical: 0 },
    fontSize: '14px', fontWeight: 400,
    labels: { colors: labelColor, useSeriesColors: false },
    offsetY: 10,
  },
  grid: { strokeDashArray: 8, borderColor },
  colors: ['#FFB400', '#7367F0'],
  fill: { opacity: [1, 1] },
  plotOptions: { bar: { columnWidth: '30%', borderRadius: 4, borderRadiusApplication: 'end' } },
  dataLabels: { enabled: false },
  xaxis: {
    categories: (data.value?.monthly_trend ?? []).map(t => t.month),
    labels: { style: { colors: labelColor, fontSize: '13px', fontWeight: 400 } },
    axisBorder: { show: false },
    axisTicks: { show: false },
  },
  yaxis: {
    tickAmount: 4, min: 0,
    labels: { style: { colors: labelColor, fontSize: '13px', fontWeight: 400 } },
  },
  responsive: [
    { breakpoint: 1025, options: { chart: { height: 340 }, plotOptions: { bar: { columnWidth: '50%' } } } },
    { breakpoint: 480,  options: { chart: { height: 220 }, legend: { offsetY: 7 } } },
  ],
}))

// ── Mode donut chart ─────────────────────────────────────────────────────────
const modeSeries   = computed(() => (data.value?.by_mode ?? []).map(m => parseInt(m.cnt)))
const modeHexList  = computed(() => (data.value?.by_mode ?? []).map(m => modeHex(m.transport_type)))
const modeTotal    = computed(() => modeSeries.value.reduce((a, b) => a + b, 0))
const modeRows     = computed(() => (data.value?.by_mode ?? []).map(m => ({
  label: modeLabel(m.transport_type),
  cnt:   parseInt(m.cnt),
  hex:   modeHex(m.transport_type),
  color: modeColor(m.transport_type),
  pct:   modeTotal.value ? Math.round(parseInt(m.cnt) / modeTotal.value * 100) : 0,
})))

const donutOptions = computed(() => ({
  chart: { type: 'donut', toolbar: { show: false } },
  labels: (data.value?.by_mode ?? []).map(m => modeLabel(m.transport_type)),
  colors: modeHexList.value,
  dataLabels: { enabled: false },
  legend: { show: false },
  stroke: { width: 0 },
  plotOptions: {
    pie: {
      donut: {
        size: '72%',
        labels: {
          show: true,
          name:  { show: true, fontSize: '13px', offsetY: 10, color: labelColor },
          value: { show: true, fontSize: '22px', fontWeight: 700, offsetY: -15, color: labelColor, formatter: v => parseInt(v) },
          total: {
            show: true, label: $gettext('Total'), fontSize: '13px', color: labelColor,
            formatter: () => modeTotal.value,
          },
        },
      },
    },
  },
}))

// ── Stat card hover ──────────────────────────────────────────────────────────
const hoveredCard = ref(null)

// ── Active shipments search ──────────────────────────────────────────────────
const shipmentSearch = ref('')
const filteredShipments = computed(() => {
  const q = shipmentSearch.value.toLowerCase()
  if (!q) return data.value?.shipments ?? []
  return (data.value?.shipments ?? []).filter(s =>
    [s.code, s.origin, s.destination, s.operator_first_name, s.operator_last_name]
      .some(v => v?.toLowerCase().includes(q))
  )
})
</script>

<template>
  <VContainer fluid class="dashboard-page">
    <!-- ── Page header ─────────────────────────────────────────────────────── -->
    <div class="d-flex align-center justify-space-between mb-6">
      <div>
        <h4 class="text-h5 font-weight-bold">{{ $gettext('Operational Dashboard') }}</h4>
        <span class="text-body-2 text-medium-emphasis">{{ $gettext('Live overview of your shipments') }}</span>
      </div>
      <VBtn
        variant="tonal"
        prepend-icon="tabler-refresh"
        :loading="loading"
        @click="load"
      >
        {{ $gettext('Refresh') }}
      </VBtn>
    </div>

    <!-- ── Loading skeleton ───────────────────────────────────────────────── -->
    <div v-if="loading && !data" class="d-flex justify-center align-center" style="min-height: 300px;">
      <VProgressCircular indeterminate size="48" color="primary" />
    </div>

    <template v-if="data">
      <!-- ── Row 1: Hero stat cards ─────────────────────────────────────── -->
      <VRow class="mb-6">
        <VCol
          v-for="card in heroCards"
          :key="card.title"
          cols="12" sm="6" md="3"
        >
          <VCard
            class="stat-card"
            :style="`border-bottom: 3px solid ${hoveredCard === card.title ? `rgb(var(--v-theme-${card.color}))` : `rgba(var(--v-theme-${card.color}), 0.38)`}`"
            @mouseenter="hoveredCard = card.title"
            @mouseleave="hoveredCard = null"
          >
            <VCardText class="pa-5">
              <div class="d-flex align-center gap-4 mb-3">
                <VAvatar :color="card.color" variant="tonal" rounded size="46">
                  <VIcon :icon="card.icon" size="26" />
                </VAvatar>
                <span class="text-h4 font-weight-bold">{{ card.value }}</span>
              </div>
              <div class="text-body-1 font-weight-medium">{{ card.title }}</div>
            </VCardText>
          </VCard>
        </VCol>
      </VRow>

      <!-- ── Row 2: Trend chart + Plan Usage + Shipment Status ───────────── -->
      <VRow class="mb-6">
        <!-- Trend chart -->
        <VCol cols="12" md="5">
          <VCard height="100%">
            <VCardItem :title="$gettext('Shipment Trend')">
              <template #subtitle>
                {{ $gettext('Monthly new shipments over the last 6 months') }}
              </template>
            </VCardItem>
            <VCardText class="pt-0">
              <VueApexCharts
                v-if="trendSeries[0]?.data?.length"
                type="line"
                height="300"
                :options="trendOptions"
                :series="trendSeries"
              />
              <div
                v-else
                class="d-flex align-center justify-center text-medium-emphasis"
                style="height: 300px;"
              >
                {{ $gettext('No data available') }}
              </div>
            </VCardText>
          </VCard>
        </VCol>

        <!-- Shipment Status + Plan Usage -->
        <VCol cols="12" md="7">
          <VRow class="h-100">
            <VCol cols="12" sm="6" class="d-flex flex-column">
              <VCard class="flex-grow-1">
                <VCardItem :title="$gettext('Shipment Status')">
                  <template #subtitle>{{ $gettext('Current distribution') }}</template>
                </VCardItem>
                <VCardText class="pt-2">
                  <VList class="perf-list">
                    <VListItem
                      v-for="item in perfItems"
                      :key="item.title"
                      rounded="lg"
                    >
                      <template #prepend>
                        <VAvatar :color="item.color" variant="tonal" rounded size="38" class="me-1">
                          <VIcon :icon="item.icon" size="22" />
                        </VAvatar>
                      </template>
                      <VListItemTitle class="font-weight-medium">{{ item.title }}</VListItemTitle>
                      <template #append>
                        <span class="text-h6 font-weight-bold">{{ item.value }}</span>
                      </template>
                    </VListItem>
                  </VList>
                </VCardText>
              </VCard>
            </VCol>
            <VCol cols="12" sm="6" class="d-flex flex-column">
              <CapacityUsageCard :items="capacityUsage" :plan-name="planName" class="flex-grow-1" />
            </VCol>
          </VRow>
        </VCol>
      </VRow>

      <!-- ── Row 3: Mode donut + Upcoming arrivals ──────────────────────── -->
      <VRow class="mb-6">
        <!-- Transport mode donut -->
        <VCol cols="12" md="4">
          <VCard height="100%">
            <VCardItem :title="$gettext('Transport Modes')">
              <template #subtitle>{{ $gettext('Active shipments by mode') }}</template>
            </VCardItem>
            <VCardText>
              <VueApexCharts
                v-if="modeSeries.length"
                type="donut"
                height="220"
                :options="donutOptions"
                :series="modeSeries"
              />
              <div
                v-else
                class="d-flex align-center justify-center text-medium-emphasis"
                style="height:220px;"
              >
                {{ $gettext('No data') }}
              </div>

              <!-- Legend -->
              <div class="mt-4 d-flex flex-column gap-2">
                <div
                  v-for="row in modeRows"
                  :key="row.label"
                  class="d-flex align-center"
                >
                  <div
                    class="rounded me-2"
                    style="width: 10px; height: 10px; flex-shrink: 0;"
                    :style="`background: ${row.hex}`"
                  />
                  <span class="text-body-2 flex-grow-1">{{ row.label }}</span>
                  <span class="text-body-2 font-weight-medium me-2">{{ row.cnt }}</span>
                  <VChip :color="row.color" size="x-small" variant="tonal">{{ row.pct }}%</VChip>
                </div>
              </div>
            </VCardText>
          </VCard>
        </VCol>

        <!-- Upcoming arrivals -->
        <VCol cols="12" md="8">
          <VCard height="100%">
            <VCardItem :title="$gettext('Upcoming Arrivals')">
              <template #subtitle>{{ $gettext('Next 7 days') }}</template>
              <template #append>
                <VChip color="info" size="small" variant="tonal">
                  {{ data.upcoming_arrivals?.length ?? 0 }}
                </VChip>
              </template>
            </VCardItem>
            <VCardText v-if="data.upcoming_arrivals?.length" class="pt-0">
              <VTable hover>
                <thead>
                  <tr>
                    <th>{{ $gettext('Job #') }}</th>
                    <th>{{ $gettext('Mode') }}</th>
                    <th>{{ $gettext('Route') }}</th>
                    <th>{{ $gettext('ETA') }}</th>
                    <th>{{ $gettext('Operator') }}</th>
                    <th class="text-center">{{ $gettext('Exc.') }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="s in data.upcoming_arrivals" :key="s.id + '_arr'">
                    <td>
                      <RouterLink
                        class="text-primary font-weight-medium text-decoration-none"
                        :to="{ name: 'shipment-id-tab1?tab2?', params: { id: s.code, tab1: 'info', tab2: 'order' } }"
                      >
                        {{ s.code }}
                      </RouterLink>
                    </td>
                    <td>
                      <VChip size="x-small" :color="modeColor(s.transport_type)" variant="tonal">
                        {{ modeLabel(s.transport_type) }}
                      </VChip>
                    </td>
                    <td>
                      <div class="d-flex align-center gap-1">
                        <span class="text-body-2">{{ s.origin || '—' }}</span>
                        <VIcon icon="tabler-arrow-right" size="14" class="text-disabled" />
                        <span class="text-body-2">{{ s.destination || '—' }}</span>
                      </div>
                    </td>
                    <td class="text-body-2 font-weight-medium">{{ formatDate(s.eta) }}</td>
                    <td class="text-body-2">{{ s.operator_first_name }} {{ s.operator_last_name }}</td>
                    <td class="text-center">
                      <VChip v-if="+s.exception_count > 0" color="error" size="x-small">
                        {{ s.exception_count }}
                      </VChip>
                      <VIcon v-else icon="tabler-minus" size="14" class="text-disabled" />
                    </td>
                  </tr>
                </tbody>
              </VTable>
            </VCardText>
            <VCardText v-else class="d-flex align-center justify-center text-medium-emphasis" style="min-height:200px;">
              <div class="text-center">
                <VIcon icon="tabler-calendar-check" size="48" class="mb-3 text-disabled" />
                <div>{{ $gettext('No arrivals in the next 7 days') }}</div>
              </div>
            </VCardText>
          </VCard>
        </VCol>
      </VRow>

      <!-- ── Row 4: Active shipments table ──────────────────────────────── -->
      <VCard>
        <VCardItem :title="$gettext('Active Shipments')">
          <template #subtitle>
            {{ filteredShipments.length }}
            {{ $gettext('shipments') }}
          </template>
          <template #append>
            <VTextField
              v-model="shipmentSearch"
              :placeholder="$gettext('Search…')"
              prepend-inner-icon="tabler-search"
              density="compact"
              variant="outlined"
              hide-details
              style="max-width: 220px;"
            />
          </template>
        </VCardItem>

        <VTable hover>
          <thead>
            <tr>
              <th>{{ $gettext('Job #') }}</th>
              <th>{{ $gettext('Status') }}</th>
              <th>{{ $gettext('Mode') }}</th>
              <th>{{ $gettext('Origin') }}</th>
              <th>{{ $gettext('Destination') }}</th>
              <th>{{ $gettext('ETD') }}</th>
              <th>{{ $gettext('ETA') }}</th>
              <th>{{ $gettext('Operator') }}</th>
              <th class="text-center">{{ $gettext('Exc.') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="9" class="text-center pa-6">
                <VProgressCircular indeterminate size="28" color="primary" />
              </td>
            </tr>
            <tr v-else-if="!filteredShipments.length">
              <td colspan="9" class="text-center pa-6 text-medium-emphasis">
                {{ $gettext('No active shipments found.') }}
              </td>
            </tr>
            <tr v-for="s in filteredShipments" :key="s.id">
              <td>
                <RouterLink
                  class="text-primary font-weight-medium text-decoration-none"
                  :to="{ name: 'shipment-id-tab1?tab2?', params: { id: s.code, tab1: 'info', tab2: 'order' } }"
                >
                  {{ s.code }}
                </RouterLink>
              </td>
              <td>
                <VChip
                  size="x-small"
                  :color="s.status === 'AC' ? 'success' : 'warning'"
                  variant="tonal"
                >
                  {{ s.status }}
                </VChip>
              </td>
              <td>
                <VChip size="x-small" :color="modeColor(s.transport_type)" variant="tonal">
                  {{ modeLabel(s.transport_type) }}
                </VChip>
              </td>
              <td class="text-body-2">{{ s.origin || '—' }}</td>
              <td class="text-body-2">{{ s.destination || '—' }}</td>
              <td class="text-body-2">{{ formatDate(s.etd) }}</td>
              <td
                class="text-body-2 font-weight-medium"
                :class="s.eta && s.eta < nowStr ? 'text-error' : ''"
              >
                {{ formatDate(s.eta) }}
              </td>
              <td class="text-body-2">{{ s.operator_first_name }} {{ s.operator_last_name }}</td>
              <td class="text-center">
                <VChip v-if="+s.exception_count > 0" color="error" size="x-small">
                  {{ s.exception_count }}
                </VChip>
                <VIcon v-else icon="tabler-minus" size="14" class="text-disabled" />
              </td>
            </tr>
          </tbody>
        </VTable>
      </VCard>
    </template>
  </VContainer>
</template>

<style scoped>
.dashboard-page {
  padding-block: 1.5rem;
}

.stat-card {
  cursor: default;
  transition: box-shadow 0.15s ease-out, margin-bottom 0.15s ease-out;
}

.stat-card:hover {
  box-shadow: 0 6px 18px rgba(0,0,0,.12) !important;
}

.perf-list {
  --v-card-list-gap: 0.75rem;
}
</style>
