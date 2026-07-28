<script setup>
import { useGettext } from 'vue3-gettext'
// CarrierPerformanceService removed - freight-specific service
const CarrierPerformanceService = null
definePage({ meta: { action: 'GET', subject: 'EbitNote', navActiveLink: 'report-customer-profitability' } })

const { $gettext } = useGettext()

const loading  = ref(false)
const scores   = ref([])
const prevMonth = new Date()
prevMonth.setMonth(prevMonth.getMonth() - 1)
const year  = ref(prevMonth.getFullYear())
const month = ref(prevMonth.getMonth() + 1)
const mode  = ref('OCN')

const MODES = ['OCN', 'AIR', 'RD']

const BAND_COLOR = { A: 'success', B: 'light-green', C: 'warning', D: 'error', F: 'deep-purple' }

const fmtPct = (v) => v != null ? Number(v).toFixed(1) + '%' : 'N/A'
const fmtScore = (v) => v != null ? Number(v).toFixed(2) : 'N/A'

const headers = computed(() => [
  { title: $gettext('Carrier'), key: 'carrierName' },
  { title: $gettext('Mode'), key: 'transportMode', width: 70 },
  { title: $gettext('Band'), key: 'scoreBand', width: 70 },
  { title: $gettext('Score'), key: 'compositeScore', width: 80 },
  { title: $gettext('OT Dep'), key: 'onTimeDepPct', width: 90 },
  { title: $gettext('OT Arr'), key: 'onTimeArrPct', width: 90 },
  { title: $gettext('Schedule'), key: 'scheduleReliabilityPct', width: 90 },
  { title: $gettext('Booking'), key: 'bookingAcceptancePct', width: 90 },
  { title: $gettext('Rate Consist.'), key: 'rateConsistencyPct', width: 110 },
  { title: $gettext('Claims/100'), key: 'claimsPer100', width: 110 },
  { title: $gettext('Claims'), key: 'cargoClaimsCount', width: 80 },
  { title: $gettext('Shipments'), key: 'shipmentsTotal', width: 90 },
  { title: $gettext('Calculated'), key: 'calculatedAt', width: 140 },
])

async function load() {
  loading.value = true
  scores.value = await CarrierPerformanceService.getScores(year.value, month.value, mode.value)
  loading.value = false
}

onMounted(load)
</script>

<template>
  <VContainer fluid class="px-0">
    <VRow class="mb-4" align="center">
      <VCol cols="12" sm="2">
        <VTextField v-model.number="year" type="number" :label="$gettext('Year')" density="compact" hide-details min="2020" max="2099" />
      </VCol>
      <VCol cols="12" sm="2">
        <VTextField v-model.number="month" type="number" :label="$gettext('Month (1-12)')" density="compact" hide-details min="1" max="12" />
      </VCol>
      <VCol cols="12" sm="2">
        <VSelect v-model="mode" :items="MODES" :label="$gettext('Mode')" density="compact" hide-details />
      </VCol>
      <VCol cols="auto">
        <VBtn color="primary" :loading="loading" @click="load">{{ $gettext('Load') }}</VBtn>
      </VCol>
    </VRow>

    <VCard>
      <VDataTable :headers="headers" :items="scores" :loading="loading" density="compact">
        <template #item.scoreBand="{ item }">
          <VChip v-if="item.scoreBand" :color="BAND_COLOR[item.scoreBand] ?? 'default'" size="small" class="font-weight-bold">
            {{ item.scoreBand }}
          </VChip>
          <span v-else class="text-medium-emphasis text-caption">N/A</span>
        </template>
        <template #item.compositeScore="{ item }">
          <span :class="item.compositeScore >= 3.5 ? 'text-success font-weight-bold' : item.compositeScore >= 2.5 ? 'text-warning' : 'text-error'">
            {{ fmtScore(item.compositeScore) }}
          </span>
        </template>
        <template #item.onTimeDepPct="{ item }">{{ fmtPct(item.onTimeDepPct) }}</template>
        <template #item.onTimeArrPct="{ item }">{{ fmtPct(item.onTimeArrPct) }}</template>
        <template #item.scheduleReliabilityPct="{ item }">{{ fmtPct(item.scheduleReliabilityPct) }}</template>
        <template #item.bookingAcceptancePct="{ item }">{{ fmtPct(item.bookingAcceptancePct) }}</template>
        <template #item.rateConsistencyPct="{ item }">{{ fmtPct(item.rateConsistencyPct) }}</template>
        <template #item.claimsPer100="{ item }">
          {{ item.claimsPer100 != null ? Number(item.claimsPer100).toFixed(2) : 'N/A' }}
        </template>
        <template #item.calculatedAt="{ item }">{{ item.calculatedAt?.slice(0, 16) ?? '—' }}</template>

        <template #no-data>
          <div class="text-center text-medium-emphasis pa-6">
            {{ $gettext('No scores for') }} {{ year }}-{{ String(month).padStart(2, '0') }} ({{ mode }}). {{ $gettext('Run the compute command first.') }}
          </div>
        </template>
      </VDataTable>
    </VCard>
  </VContainer>
</template>
