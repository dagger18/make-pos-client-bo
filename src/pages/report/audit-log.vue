<script setup>
import { useGettext } from 'vue3-gettext'
import ComplianceService from '@/services/ComplianceService'
definePage({ meta: { action: 'GET', subject: 'EbitNote', navActiveLink: 'report-vat-report' } })

const { $gettext } = useGettext()

const logs       = ref([])
const loading    = ref(false)
const filterType = ref('')
const filterActor = ref('')
const filterResult = ref(null)
const filterFrom  = ref('')
const filterTo    = ref('')

const EVENT_PREFIXES = ['AUTH.', 'PERMISSION.', 'DATA.', 'FINANCIAL.', 'COMPLIANCE.']
const RESULTS = ['SUCCESS', 'FAILURE', 'BLOCKED']

const RESULT_COLOR = { SUCCESS: 'success', FAILURE: 'error', BLOCKED: 'warning' }
const PREFIX_COLOR = {
  'AUTH.': 'info', 'PERMISSION.': 'warning', 'DATA.': 'default',
  'FINANCIAL.': 'primary', 'COMPLIANCE.': 'error',
}

const headers = computed(() => [
  { title: $gettext('Logged At'), key: 'loggedAt', width: 155 },
  { title: $gettext('Event'), key: 'eventType', width: 220 },
  { title: $gettext('Actor'), key: 'actorEmail' },
  { title: $gettext('Actor IP'), key: 'actorIp', width: 130 },
  { title: $gettext('Object'), key: 'object' },
  { title: $gettext('Detail'), key: 'actionDetail' },
  { title: $gettext('Result'), key: 'result', width: 100 },
])

async function load() {
  loading.value = true
  const params = {}
  if (filterType.value)   params.eventType  = filterType.value
  if (filterActor.value)  params.actorEmail = filterActor.value
  if (filterResult.value) params.result     = filterResult.value
  if (filterFrom.value)   params.from       = filterFrom.value
  if (filterTo.value)     params.to         = filterTo.value
  logs.value = await ComplianceService.listAuditLog(params)
  loading.value = false
}

function chipColor(eventType) {
  for (const [prefix, color] of Object.entries(PREFIX_COLOR)) {
    if (eventType?.startsWith(prefix)) return color
  }
  return 'default'
}

function fmtDetail(detail) {
  if (!detail) return '—'
  return Object.entries(detail).map(([k, v]) => `${k}: ${v}`).join(', ').slice(0, 80)
}

onMounted(load)
</script>

<template>
  <VContainer fluid class="px-0">
    <VRow align="center" class="mb-4">
      <VCol>
        <div class="text-caption text-disabled">{{ $gettext('Insert-only immutable record of all system events') }}</div>
      </VCol>
      <VCol cols="auto">
        <VBtn color="primary" prepend-icon="tabler-refresh" @click="load" :loading="loading">
          {{ $gettext('Refresh') }}
        </VBtn>
      </VCol>
    </VRow>

    <VRow class="mb-3">
      <VCol cols="12" sm="3">
        <VSelect
          v-model="filterType"
          :items="[{ title: $gettext('All Events'), value: '' }, ...EVENT_PREFIXES.map(p => ({ title: p + '…', value: p.slice(0,-1) }))]"
          :label="$gettext('Event Category')"
          density="compact" hide-details clearable
        />
      </VCol>
      <VCol cols="12" sm="3">
        <VTextField v-model="filterActor" :label="$gettext('Actor Email')" density="compact" hide-details clearable />
      </VCol>
      <VCol cols="12" sm="2">
        <VSelect
          v-model="filterResult"
          :items="[{ title: $gettext('All Results'), value: null }, ...RESULTS.map(r => ({ title: r, value: r }))]"
          :label="$gettext('Result')"
          density="compact" hide-details clearable
        />
      </VCol>
      <VCol cols="12" sm="2">
        <VTextField v-model="filterFrom" type="date" :label="$gettext('From')" density="compact" hide-details clearable />
      </VCol>
      <VCol cols="12" sm="2">
        <VTextField v-model="filterTo" type="date" :label="$gettext('To')" density="compact" hide-details clearable />
      </VCol>
      <VCol cols="auto" class="d-flex align-end">
        <VBtn @click="load" :loading="loading" density="compact">{{ $gettext('Apply') }}</VBtn>
      </VCol>
    </VRow>

    <VCard>
      <VDataTable :headers="headers" :items="logs" :loading="loading" density="compact">
        <template #item.loggedAt="{ item }">
          <span class="text-caption">{{ item.loggedAt }}</span>
        </template>
        <template #item.eventType="{ item }">
          <VChip size="x-small" :color="chipColor(item.eventType)">{{ item.eventType }}</VChip>
        </template>
        <template #item.actorEmail="{ item }">
          <span class="text-caption">{{ item.actorEmail ?? item.actorType }}</span>
        </template>
        <template #item.object="{ item }">
          <span v-if="item.objectType" class="text-caption">
            {{ item.objectType }}{{ item.objectRef ? ': ' + item.objectRef : '' }}
          </span>
          <span v-else>—</span>
        </template>
        <template #item.actionDetail="{ item }">
          <span class="text-caption text-disabled">{{ fmtDetail(item.actionDetail) }}</span>
        </template>
        <template #item.result="{ item }">
          <VChip size="x-small" :color="RESULT_COLOR[item.result] ?? 'default'">{{ item.result }}</VChip>
        </template>
      </VDataTable>
    </VCard>
  </VContainer>
</template>
