<script setup>
import { useGettext } from 'vue3-gettext'
import ReportAnalyticsService from '@/services/ReportAnalyticsService'
definePage({ meta: { action: 'GET', subject: 'EbitNote', navActiveLink: 'report-customer-profitability' } })
const { $gettext } = useGettext()
const loading = ref(false)
const dateFrom = ref(new Date().toISOString().slice(0, 8) + '01')
const dateTo   = ref(new Date().toISOString().slice(0, 10))
const onTime = ref(null)
const conversion = ref([])
const productivity = ref([])
const dso = ref(null)
const fmt = (v) => Number(v ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })

async function load() {
  loading.value = true
  const [ot, cv, pr, d] = await Promise.all([
    ReportAnalyticsService.onTimeRate(dateFrom.value, dateTo.value),
    ReportAnalyticsService.conversionRate(dateFrom.value, dateTo.value),
    ReportAnalyticsService.operatorProductivity(dateFrom.value, dateTo.value),
    ReportAnalyticsService.dso(dateFrom.value, dateTo.value),
  ])
  onTime.value      = ot
  conversion.value  = cv
  productivity.value = pr
  dso.value         = d
  loading.value     = false
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
        <VBtn color="primary" :loading="loading" @click="load">{{ $gettext('Run') }}</VBtn>
      </VCol>
    </VRow>

    <VRow class="mb-6">
      <VCol cols="12" sm="6" md="3">
        <VCard>
          <VCardText>
            <div class="text-caption text-medium-emphasis mb-1">{{ $gettext('On-Time Rate') }}</div>
            <div
              class="text-h4 font-weight-bold"
              :class="!onTime ? '' : onTime.on_time_pct >= 90 ? 'text-success' : onTime.on_time_pct >= 70 ? 'text-warning' : 'text-error'"
            >
              {{ onTime ? onTime.on_time_pct + '%' : '—' }}
            </div>
            <div class="text-caption text-medium-emphasis" v-if="onTime">
              {{ onTime.on_time }} {{ $gettext('on-time') }} / {{ onTime.total }} {{ $gettext('total') }}
            </div>
          </VCardText>
        </VCard>
      </VCol>
      <VCol cols="12" sm="6" md="3">
        <VCard>
          <VCardText>
            <div class="text-caption text-medium-emphasis mb-1">{{ $gettext('DSO (Avg Days to Collect)') }}</div>
            <div
              class="text-h4 font-weight-bold"
              :class="!dso ? '' : dso.avg_dso <= 30 ? 'text-success' : dso.avg_dso <= 60 ? 'text-warning' : 'text-error'"
            >
              {{ dso ? dso.avg_dso + ' ' + $gettext('days') : '—' }}
            </div>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <VCard class="mb-6">
      <VCardTitle class="text-subtitle-1 font-weight-semibold pa-4">{{ $gettext('Quote Conversion by Month') }}</VCardTitle>
      <VTable>
        <thead>
          <tr>
            <th>{{ $gettext('Month') }}</th>
            <th class="text-right">{{ $gettext('Total Quotes') }}</th>
            <th class="text-right">{{ $gettext('Converted (Booked)') }}</th>
            <th class="text-right">{{ $gettext('Rejected') }}</th>
            <th class="text-right">{{ $gettext('Conversion %') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="5" class="text-center pa-4"><VProgressCircular indeterminate size="24" /></td>
          </tr>
          <tr v-else-if="!conversion.length">
            <td colspan="5" class="text-center text-medium-emphasis pa-4">{{ $gettext('No data for selected period.') }}</td>
          </tr>
          <tr v-for="r in conversion" :key="r.month">
            <td class="font-weight-medium">{{ r.month }}</td>
            <td class="text-right">{{ r.total }}</td>
            <td class="text-right text-success">{{ r.converted }}</td>
            <td class="text-right text-error">{{ r.rejected }}</td>
            <td class="text-right font-weight-bold">{{ r.conversion_pct }}%</td>
          </tr>
        </tbody>
      </VTable>
    </VCard>

    <VCard>
      <VCardTitle class="text-subtitle-1 font-weight-semibold pa-4">{{ $gettext('Operator Productivity') }}</VCardTitle>
      <VTable>
        <thead>
          <tr>
            <th>{{ $gettext('Operator') }}</th>
            <th class="text-right">{{ $gettext('Jobs Closed') }}</th>
            <th class="text-right">{{ $gettext('Revenue') }}</th>
            <th class="text-right">{{ $gettext('Cost') }}</th>
            <th class="text-right">{{ $gettext('Profit') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="5" class="text-center pa-4"><VProgressCircular indeterminate size="24" /></td>
          </tr>
          <tr v-else-if="!productivity.length">
            <td colspan="5" class="text-center text-medium-emphasis pa-4">{{ $gettext('No completed jobs in this period.') }}</td>
          </tr>
          <tr v-for="r in productivity" :key="r.first_name + r.last_name">
            <td class="font-weight-medium">{{ r.first_name }} {{ r.last_name }}</td>
            <td class="text-right">{{ r.jobs_count }}</td>
            <td class="text-right">{{ fmt(r.revenue_base) }}</td>
            <td class="text-right">{{ fmt(r.cost_base) }}</td>
            <td class="text-right font-weight-bold" :class="+r.profit_base >= 0 ? 'text-success' : 'text-error'">
              {{ fmt(r.profit_base) }}
            </td>
          </tr>
        </tbody>
      </VTable>
    </VCard>
  </VContainer>
</template>
