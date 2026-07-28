<script setup>
import { useGettext } from 'vue3-gettext'
import EmissionsService from '@/services/EmissionsService'
definePage({ meta: { action: 'GET', subject: 'EbitNote', navActiveLink: 'report-vat-report' } })

const { $gettext } = useGettext()

const records    = ref([])
const loading    = ref(false)
const filterMode = ref(null)
const filterFrom = ref('')
const filterTo   = ref('')

const MODES = ['OCN', 'AIR', 'RD', 'RAL']
const MODE_COLOR = { OCN: 'info', AIR: 'primary', RD: 'warning', RAL: 'success' }

const headers = computed(() => [
  { title: $gettext('Shipment'), key: 'shipmentCode', width: 130 },
  { title: $gettext('Mode'), key: 'transportMode', width: 80 },
  { title: $gettext('Leg'), key: 'legDescription' },
  { title: $gettext('Distance (km)'), key: 'distanceKm', align: 'end', width: 120 },
  { title: $gettext('Weight (t)'), key: 'cargoWeightTonnes', align: 'end', width: 110 },
  { title: $gettext('Tonne-km'), key: 'tonneKm', align: 'end', width: 110 },
  { title: $gettext('CO₂e TTW (kg)'), key: 'co2eTtwKg', align: 'end', width: 130 },
  { title: $gettext('CO₂e WTW (kg)'), key: 'co2eWtwKg', align: 'end', width: 130 },
  { title: $gettext('Methodology'), key: 'methodology', width: 120 },
  { title: $gettext('Estimate?'), key: 'isEstimate', width: 90 },
  { title: $gettext('Calculated'), key: 'calculatedAt', width: 130 },
])

const totals = computed(() => ({
  ttw: records.value.reduce((s, r) => s + Number(r.co2eTtwKg ?? 0), 0),
  wtw: records.value.reduce((s, r) => s + Number(r.co2eWtwKg ?? 0), 0),
  tkm: records.value.reduce((s, r) => s + Number(r.tonneKm ?? 0), 0),
}))

async function load() {
  loading.value = true
  const params = {}
  if (filterMode.value) params.mode = filterMode.value
  if (filterFrom.value) params.from = filterFrom.value
  if (filterTo.value)   params.to   = filterTo.value
  records.value = await EmissionsService.getReport(params)
  loading.value = false
}

const fmt2 = (v) => Number(v ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const fmt0 = (v) => Number(v ?? 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })

onMounted(load)
</script>

<template>
  <VContainer fluid class="px-0">
    <VRow align="center" class="mb-4">
      <VCol>
        <div class="text-caption text-disabled">{{ $gettext('GLEC Framework v3 — Tank-to-Wake & Well-to-Wake') }}</div>
      </VCol>
      <VCol cols="auto">
        <VBtn color="primary" prepend-icon="tabler-refresh" @click="load" :loading="loading">
          {{ $gettext('Refresh') }}
        </VBtn>
      </VCol>
    </VRow>

    <!-- Filters -->
    <VRow class="mb-3">
      <VCol cols="12" sm="3">
        <VSelect
          v-model="filterMode"
          :items="[{ title: $gettext('All Modes'), value: null }, ...MODES.map(m => ({ title: m, value: m }))]"
          :label="$gettext('Transport Mode')"
          density="compact" hide-details clearable
        />
      </VCol>
      <VCol cols="12" sm="2">
        <VTextField v-model="filterFrom" type="date" :label="$gettext('From')" density="compact" hide-details clearable />
      </VCol>
      <VCol cols="12" sm="2">
        <VTextField v-model="filterTo" type="date" :label="$gettext('To')" density="compact" hide-details clearable />
      </VCol>
      <VCol cols="12" sm="auto" class="d-flex align-end">
        <VBtn @click="load" :loading="loading" density="compact">{{ $gettext('Apply') }}</VBtn>
      </VCol>
    </VRow>

    <!-- Summary cards -->
    <VRow class="mb-4">
      <VCol cols="12" sm="4">
        <VCard variant="outlined">
          <VCardText class="pa-3">
            <div class="text-caption text-disabled">{{ $gettext('Total Tonne-km') }}</div>
            <div class="text-h6 font-weight-bold">{{ fmt0(totals.tkm) }}</div>
          </VCardText>
        </VCard>
      </VCol>
      <VCol cols="12" sm="4">
        <VCard color="success" variant="tonal">
          <VCardText class="pa-3">
            <div class="text-caption">{{ $gettext('Total CO₂e TTW (kg)') }}</div>
            <div class="text-h6 font-weight-bold">{{ fmt2(totals.ttw) }}</div>
          </VCardText>
        </VCard>
      </VCol>
      <VCol cols="12" sm="4">
        <VCard color="warning" variant="tonal">
          <VCardText class="pa-3">
            <div class="text-caption">{{ $gettext('Total CO₂e WTW (kg)') }}</div>
            <div class="text-h6 font-weight-bold">{{ fmt2(totals.wtw) }}</div>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <VCard>
      <VDataTable :headers="headers" :items="records" :loading="loading" density="compact">
        <template #item.transportMode="{ item }">
          <VChip size="x-small" :color="MODE_COLOR[item.transportMode] ?? 'default'">{{ item.transportMode }}</VChip>
        </template>
        <template #item.distanceKm="{ item }">{{ fmt0(item.distanceKm) }}</template>
        <template #item.cargoWeightTonnes="{ item }">{{ fmt2(item.cargoWeightTonnes) }}</template>
        <template #item.tonneKm="{ item }">{{ fmt0(item.tonneKm) }}</template>
        <template #item.co2eTtwKg="{ item }">
          <span class="font-weight-medium text-success">{{ fmt2(item.co2eTtwKg) }}</span>
        </template>
        <template #item.co2eWtwKg="{ item }">{{ fmt2(item.co2eWtwKg) }}</template>
        <template #item.isEstimate="{ item }">
          <VChip v-if="item.isEstimate" size="x-small" color="warning">{{ $gettext('Est.') }}</VChip>
          <VChip v-else size="x-small" color="success">{{ $gettext('Actual') }}</VChip>
        </template>
        <template #item.calculatedAt="{ item }">{{ item.calculatedAt?.slice(0, 10) }}</template>
      </VDataTable>
    </VCard>
  </VContainer>
</template>
