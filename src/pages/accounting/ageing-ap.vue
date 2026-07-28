<script setup>
import AgeingService from '@/services/AgeingService'
import { useGettext } from 'vue3-gettext'

definePage({ meta: { action: 'GET', subject: 'EbitNote' } })

const { $gettext } = useGettext()

const rows = ref([])
const loading = ref(false)

async function load() {
  loading.value = true
  rows.value = await AgeingService.apAgeing()
  loading.value = false
}

const fmt = (v) => Number(v ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const totals = computed(() => ({
  outstanding: rows.value.reduce((s, r) => s + +r.outstanding, 0),
  current:     rows.value.reduce((s, r) => s + +r.current_not_due, 0),
  d1_30:       rows.value.reduce((s, r) => s + +r.overdue_1_30, 0),
  d31_60:      rows.value.reduce((s, r) => s + +r.overdue_31_60, 0),
  d61_90:      rows.value.reduce((s, r) => s + +r.overdue_61_90, 0),
  d90plus:     rows.value.reduce((s, r) => s + +r.overdue_90plus, 0),
}))

onMounted(load)
</script>

<template>
  <VContainer fluid>
    <VRow align="center" class="mb-4">
      <VCol><h4 class="text-h5 font-weight-bold">{{ $gettext('AP Ageing Report') }}</h4></VCol>
      <VCol cols="auto"><VBtn prepend-icon="tabler-refresh" @click="load" :loading="loading">{{ $gettext('Refresh') }}</VBtn></VCol>
    </VRow>
    <VCard>
      <VTable>
        <thead>
          <tr>
            <th>{{ $gettext('Vendor') }}</th><th>{{ $gettext('Ccy') }}</th>
            <th class="text-right">{{ $gettext('Outstanding') }}</th><th class="text-right">{{ $gettext('Current') }}</th>
            <th class="text-right">{{ $gettext('1-30 days') }}</th><th class="text-right">{{ $gettext('31-60 days') }}</th>
            <th class="text-right">{{ $gettext('61-90 days') }}</th><th class="text-right">{{ $gettext('90+ days') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading"><td colspan="8" class="text-center pa-4"><VProgressCircular indeterminate size="24"/></td></tr>
          <tr v-for="r in rows" :key="r.partner + r.currency">
            <td>{{ r.partner }}</td><td>{{ r.currency }}</td>
            <td class="text-right font-weight-medium">{{ fmt(r.outstanding) }}</td>
            <td class="text-right text-success">{{ fmt(r.current_not_due) }}</td>
            <td class="text-right" :class="{ 'text-warning': +r.overdue_1_30 > 0 }">{{ fmt(r.overdue_1_30) }}</td>
            <td class="text-right" :class="{ 'text-orange': +r.overdue_31_60 > 0 }">{{ fmt(r.overdue_31_60) }}</td>
            <td class="text-right" :class="{ 'text-error': +r.overdue_61_90 > 0 }">{{ fmt(r.overdue_61_90) }}</td>
            <td class="text-right text-error font-weight-bold">{{ fmt(r.overdue_90plus) }}</td>
          </tr>
        </tbody>
        <tfoot v-if="rows.length">
          <tr class="font-weight-bold">
            <td colspan="2">{{ $gettext('TOTAL') }}</td>
            <td class="text-right">{{ fmt(totals.outstanding) }}</td>
            <td class="text-right">{{ fmt(totals.current) }}</td>
            <td class="text-right">{{ fmt(totals.d1_30) }}</td>
            <td class="text-right">{{ fmt(totals.d31_60) }}</td>
            <td class="text-right">{{ fmt(totals.d61_90) }}</td>
            <td class="text-right">{{ fmt(totals.d90plus) }}</td>
          </tr>
        </tfoot>
      </VTable>
    </VCard>
  </VContainer>
</template>
