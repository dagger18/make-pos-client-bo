<script setup>
import PnlService from '@/services/PnlService'
import { useGettext } from 'vue3-gettext'

definePage({ meta: { action: 'GET', subject: 'EbitNote' } })

const { $gettext } = useGettext()

const rows = ref([])
const loading = ref(false)
const dateFrom = ref(new Date().toISOString().slice(0, 8) + '01')
const dateTo   = ref(new Date().toISOString().slice(0, 10))
const fmt = (v) => Number(v ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const totals = computed(() => ({
  revenue: rows.value.reduce((s, r) => s + +r.revenue_base, 0),
  cost:    rows.value.reduce((s, r) => s + +r.cost_base, 0),
  gross:   rows.value.reduce((s, r) => s + +r.gross_profit, 0),
  fx:      rows.value.reduce((s, r) => s + +r.fx_gain_loss, 0),
  net:     rows.value.reduce((s, r) => s + +r.net_profit, 0),
}))
const marginPct = (r) => +r.revenue_base > 0 ? ((+r.gross_profit / +r.revenue_base) * 100).toFixed(1) + '%' : '—'

async function load() {
  loading.value = true
  rows.value = await PnlService.periodPnl(dateFrom.value, dateTo.value)
  loading.value = false
}
onMounted(load)
</script>

<template>
  <VContainer fluid>
    <VRow align="center" class="mb-4">
      <VCol><h4 class="text-h5 font-weight-bold">{{ $gettext('Period P&L by Branch') }}</h4></VCol>
    </VRow>
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
            <th>{{ $gettext('Branch') }}</th><th class="text-right">{{ $gettext('Jobs') }}</th>
            <th class="text-right">{{ $gettext('Revenue') }}</th><th class="text-right">{{ $gettext('Cost') }}</th>
            <th class="text-right">{{ $gettext('Gross Profit') }}</th><th class="text-right">{{ $gettext('Margin %') }}</th>
            <th class="text-right">{{ $gettext('FX Gain/Loss') }}</th><th class="text-right">{{ $gettext('Net Profit') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading"><td colspan="8" class="text-center pa-4"><VProgressCircular indeterminate size="24"/></td></tr>
          <tr v-else-if="!rows.length"><td colspan="8" class="text-center text-medium-emphasis pa-4">{{ $gettext('No data for selected period.') }}</td></tr>
          <tr v-for="r in rows" :key="r.branch">
            <td class="font-weight-medium">{{ r.branch }}</td>
            <td class="text-right">{{ r.jobs_count }}</td>
            <td class="text-right">{{ fmt(r.revenue_base) }}</td>
            <td class="text-right">{{ fmt(r.cost_base) }}</td>
            <td class="text-right" :class="+r.gross_profit >= 0 ? 'text-success' : 'text-error'">{{ fmt(r.gross_profit) }}</td>
            <td class="text-right">{{ marginPct(r) }}</td>
            <td class="text-right" :class="+r.fx_gain_loss >= 0 ? 'text-success' : 'text-error'">{{ fmt(r.fx_gain_loss) }}</td>
            <td class="text-right font-weight-bold" :class="+r.net_profit >= 0 ? 'text-success' : 'text-error'">{{ fmt(r.net_profit) }}</td>
          </tr>
        </tbody>
        <tfoot v-if="rows.length">
          <tr class="font-weight-bold">
            <td>{{ $gettext('TOTAL') }}</td><td></td>
            <td class="text-right">{{ fmt(totals.revenue) }}</td>
            <td class="text-right">{{ fmt(totals.cost) }}</td>
            <td class="text-right">{{ fmt(totals.gross) }}</td><td></td>
            <td class="text-right">{{ fmt(totals.fx) }}</td>
            <td class="text-right">{{ fmt(totals.net) }}</td>
          </tr>
        </tfoot>
      </VTable>
    </VCard>
  </VContainer>
</template>
