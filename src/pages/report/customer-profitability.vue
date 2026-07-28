<script setup>
import { useGettext } from 'vue3-gettext'
import ReportAnalyticsService from '@/services/ReportAnalyticsService'
definePage({ meta: { action: 'GET', subject: 'EbitNote' } })
const { $gettext } = useGettext()
const rows = ref([])
const loading = ref(false)
const dateFrom = ref(new Date().toISOString().slice(0, 8) + '01')
const dateTo   = ref(new Date().toISOString().slice(0, 10))
const fmt = (v) => Number(v ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const totals = computed(() => ({
  jobs:    rows.value.reduce((s, r) => s + +r.jobs_count, 0),
  revenue: rows.value.reduce((s, r) => s + +r.revenue_base, 0),
  cost:    rows.value.reduce((s, r) => s + +r.cost_base, 0),
  profit:  rows.value.reduce((s, r) => s + +r.profit_base, 0),
}))
async function load() {
  loading.value = true
  rows.value = await ReportAnalyticsService.customerProfitability(dateFrom.value, dateTo.value)
  loading.value = false
}
onMounted(load)
</script>
<template>
  <VContainer fluid class="px-0">
    <VRow class="mb-4">
      <VCol cols="12" sm="3">
        <VTextField v-model="dateFrom" type="date" :label="$gettext('From')" density="compact" hide-details />
      </VCol>
      <VCol cols="12" sm="3">
        <VTextField v-model="dateTo" type="date" :label="$gettext('To')" density="compact" hide-details />
      </VCol>
      <VCol cols="auto">
        <VBtn color="primary" :loading="loading" @click="load">{{ $gettext('Run Report') }}</VBtn>
      </VCol>
    </VRow>
    <VCard>
      <VTable>
        <thead>
          <tr>
            <th>{{ $gettext('Client') }}</th>
            <th class="text-right">{{ $gettext('Jobs') }}</th>
            <th class="text-right">{{ $gettext('Revenue') }}</th>
            <th class="text-right">{{ $gettext('Cost') }}</th>
            <th class="text-right">{{ $gettext('Profit') }}</th>
            <th class="text-right">{{ $gettext('Margin %') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="6" class="text-center pa-4"><VProgressCircular indeterminate size="24" /></td>
          </tr>
          <tr v-else-if="!rows.length">
            <td colspan="6" class="text-center text-medium-emphasis pa-4">{{ $gettext('No data for selected period.') }}</td>
          </tr>
          <tr v-for="r in rows" :key="r.client_name">
            <td class="font-weight-medium">{{ r.client_name }}</td>
            <td class="text-right">{{ r.jobs_count }}</td>
            <td class="text-right">{{ fmt(r.revenue_base) }}</td>
            <td class="text-right">{{ fmt(r.cost_base) }}</td>
            <td class="text-right" :class="+r.profit_base >= 0 ? 'text-success' : 'text-error'">{{ fmt(r.profit_base) }}</td>
            <td class="text-right">{{ r.margin_pct }}%</td>
          </tr>
        </tbody>
        <tfoot v-if="rows.length">
          <tr class="font-weight-bold bg-surface">
            <td>{{ $gettext('TOTAL') }}</td>
            <td class="text-right">{{ totals.jobs }}</td>
            <td class="text-right">{{ fmt(totals.revenue) }}</td>
            <td class="text-right">{{ fmt(totals.cost) }}</td>
            <td class="text-right" :class="totals.profit >= 0 ? 'text-success' : 'text-error'">{{ fmt(totals.profit) }}</td>
            <td></td>
          </tr>
        </tfoot>
      </VTable>
    </VCard>
  </VContainer>
</template>
