<script setup>
import { useGettext } from 'vue3-gettext'
import ReportAnalyticsService from '@/services/ReportAnalyticsService'
definePage({ meta: { action: 'GET', subject: 'EbitNote', navActiveLink: 'report-customer-profitability' } })
const { $gettext } = useGettext()
const rows = ref([])
const loading = ref(false)
const dateFrom = ref(new Date().toISOString().slice(0, 8) + '01')
const dateTo   = ref(new Date().toISOString().slice(0, 10))
const fmt = (v) => Number(v ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
async function load() {
  loading.value = true
  rows.value = await ReportAnalyticsService.topLanes(dateFrom.value, dateTo.value)
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
            <th>#</th>
            <th>{{ $gettext('Origin') }}</th>
            <th>{{ $gettext('Destination') }}</th>
            <th class="text-right">{{ $gettext('Shipments') }}</th>
            <th class="text-right">{{ $gettext('Revenue') }}</th>
            <th class="text-right">{{ $gettext('Profit') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="6" class="text-center pa-4"><VProgressCircular indeterminate size="24" /></td>
          </tr>
          <tr v-else-if="!rows.length">
            <td colspan="6" class="text-center text-medium-emphasis pa-4">{{ $gettext('No completed shipments for selected period.') }}</td>
          </tr>
          <tr v-for="(r, i) in rows" :key="i">
            <td class="text-medium-emphasis">{{ i + 1 }}</td>
            <td>{{ r.origin || '—' }}</td>
            <td>{{ r.destination || '—' }}</td>
            <td class="text-right font-weight-bold">{{ r.shipments }}</td>
            <td class="text-right">{{ fmt(r.revenue_base) }}</td>
            <td class="text-right" :class="+r.profit_base >= 0 ? 'text-success' : 'text-error'">{{ fmt(r.profit_base) }}</td>
          </tr>
        </tbody>
      </VTable>
    </VCard>
  </VContainer>
</template>
