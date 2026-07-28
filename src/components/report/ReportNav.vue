<script setup>
import AppTableTitle from '@/components/table/AppTableTitle.vue'
import { useFeature } from '@/composables/useFeature'
import { Feature } from '@/config/enums/Feature'
import { useUpgradeDialog } from '@/composables/useUpgradeDialog'

const props = defineProps({
  toggleVerticalOverlayNavActive: { type: Function, default: () => {} }
})

const route = useRoute()
const router = useRouter()
const { featureEnabled } = useFeature()
const { open: openUpgradeDialog } = useUpgradeDialog()

const categories = computed(() => [
  {
    title: $gettext('Operations'),
    icon: 'tabler-package-export',
    reports: [
      { title: $gettext('Dataset'),    icon: 'tabler-table',            route: 'report-dataset' },
      { title: $gettext('Shipment'),   icon: 'tabler-package-export',   route: 'report-shipment' },
      { title: $gettext('Staff'),      icon: 'tabler-users',            route: 'report-staff' },
      { title: $gettext('Exceptions'), icon: 'tabler-alert-triangle',   route: 'report-exception' },
    ],
  },
  {
    title: $gettext('Finance'),
    icon: 'tabler-receipt',
    reports: [
      { title: $gettext('Charge Report'),     icon: 'tabler-file-dollar',   route: 'report-charge' },
      { title: $gettext('Sales Targets'),     icon: 'tabler-target',        route: 'report-sales-target' },
      { title: $gettext('Sales Commissions'), icon: 'tabler-percentage',    route: 'report-sales-commission' },
    ],
  },
  {
    title: $gettext('Analytics'),
    icon: 'tabler-chart-bar',
    reports: [
      { title: $gettext('KPI Dashboard'),         icon: 'tabler-dashboard',      route: 'report-kpi',                    locked: !featureEnabled(Feature.KpiDashboards) },
      { title: $gettext('Customer Profitability'), icon: 'tabler-chart-pie',      route: 'report-customer-profitability' },
      { title: $gettext('Top Lanes'),              icon: 'tabler-route',          route: 'report-top-lanes' },
      { title: $gettext('Carrier Performance'),    icon: 'tabler-truck',          route: 'report-carrier-performance' },
      { title: $gettext('D&D Dashboard'),          icon: 'tabler-calendar-stats', route: 'report-dd-dashboard' },
    ],
  },
  {
    title: $gettext('Compliance'),
    icon: 'tabler-shield-half-filled',
    reports: [
      { title: $gettext('VAT Report'),             icon: 'tabler-receipt-tax',    route: 'report-vat-report' },
      { title: $gettext('Insurance Declarations'),  icon: 'tabler-shield-half',    route: 'report-insurance-declaration' },
      { title: $gettext('CO₂ Emissions'),          icon: 'tabler-leaf',           route: 'report-co2-emissions',        locked: !featureEnabled(Feature.Co2Emissions) },
      { title: $gettext('Audit Log'),              icon: 'tabler-clipboard-list', route: 'report-audit-log',            locked: !featureEnabled(Feature.AuditLogCompliance) },
      { title: $gettext('Compliance Dashboard'),   icon: 'tabler-checklist',      route: 'report-compliance-dashboard', locked: !featureEnabled(Feature.AuditLogCompliance) },
    ],
  },
])

const activeCategory = computed(() =>
  categories.value.find(cat => cat.reports.some(r => r.route === route.name)) ?? null
)

function onCategoryChange(title) {
  const cat = categories.value.find(c => c.title === title)
  if (!cat) return
  const first = cat.reports.find(r => !r.locked)
  if (!first) { openUpgradeDialog(); return }
  router.push({ name: first.route })
}

function onTabChange(routeName) {
  const report = activeCategory.value?.reports.find(r => r.route === routeName)
  if (!report) return
  if (report.locked) { openUpgradeDialog(); return }
  router.push({ name: routeName })
}
</script>

<template>
  <AppTableTitle :toggleVerticalOverlayNavActive="toggleVerticalOverlayNavActive">
    <VTabs
      :modelValue="activeCategory?.title"
      class="v-tabs-pill"
      color="primary"
      @update:modelValue="onCategoryChange"
    >
      <VTab v-for="cat in categories" :key="cat.title" :value="cat.title" class="text-none">
        <VIcon :icon="cat.icon" size="18" class="me-2" />{{ cat.title }}
      </VTab>
    </VTabs>
  </AppTableTitle>

  <div v-if="activeCategory">
    <VTabs :modelValue="route.name" class="sub-nav-tabs mt-4 mb-2" show-arrows @update:modelValue="onTabChange">
      <VTab
        v-for="report in activeCategory.reports"
        :key="report.route"
        :value="report.route"
      >
        <VIcon :icon="report.icon" size="18" class="me-1" />
        {{ report.title }}
        <VIcon v-if="report.locked" icon="tabler-crown" size="12" class="ms-1 text-warning" />
      </VTab>
    </VTabs>
  </div>
</template>

<style scoped>
.sub-nav-tabs :deep(.v-tab) {
  padding-inline: 6px;
  min-width: 0;
}
.sub-nav-tabs :deep(.v-tab + .v-tab) {
  margin-left: 12px;
}
</style>
