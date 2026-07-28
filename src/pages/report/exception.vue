<script setup>
import { useGettext } from 'vue3-gettext'
import ReportAnalyticsService from '@/services/ReportAnalyticsService'
definePage({ meta: { action: 'GET', subject: 'EbitNote', navActiveLink: 'report-dataset' } })

const { $gettext } = useGettext()

const rows = ref([])
const loading = ref(false)
const dateFrom = ref(new Date().toISOString().slice(0, 8) + '01')
const dateTo   = ref(new Date().toISOString().slice(0, 10))
const formatDate = (d) => d ? new Date(d).toLocaleString() : '—'
async function load() {
  loading.value = true
  rows.value = await ReportAnalyticsService.exceptions(dateFrom.value, dateTo.value)
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
            <th>{{ $gettext('Job #') }}</th>
            <th>{{ $gettext('Milestone') }}</th>
            <th>{{ $gettext('Origin') }}</th>
            <th>{{ $gettext('Destination') }}</th>
            <th>{{ $gettext('Planned') }}</th>
            <th>{{ $gettext('Actual') }}</th>
            <th class="text-right">{{ $gettext('Delay (hrs)') }}</th>
            <th>{{ $gettext('Operator') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="8" class="text-center pa-4"><VProgressCircular indeterminate size="24" /></td>
          </tr>
          <tr v-else-if="!rows.length">
            <td colspan="8" class="text-center text-medium-emphasis pa-4">{{ $gettext('No exceptions for selected period.') }}</td>
          </tr>
          <tr v-for="(r, i) in rows" :key="i">
            <td>
              <RouterLink
                :to="{ name: 'shipment-id-tab1?tab2?', params: { id: r.shipment_code, tab1: 'info', tab2: 'order' } }"
              >
                {{ r.shipment_code }}
              </RouterLink>
            </td>
            <td>{{ r.milestone_code }}</td>
            <td>{{ r.origin || '—' }}</td>
            <td>{{ r.destination || '—' }}</td>
            <td>{{ formatDate(r.planned_date) }}</td>
            <td>{{ formatDate(r.actual_date) }}</td>
            <td class="text-right text-error font-weight-bold">{{ r.exception_hours ?? '—' }}</td>
            <td>{{ r.operator_first_name }} {{ r.operator_last_name }}</td>
          </tr>
        </tbody>
      </VTable>
    </VCard>
  </VContainer>
</template>
