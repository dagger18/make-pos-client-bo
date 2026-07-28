<script setup>
import { useGettext } from 'vue3-gettext'
import PnlService from '@/services/PnlService'

definePage({ meta: { action: 'GET', subject: 'EbitNote' } })

const { $gettext } = useGettext()

const rows    = ref([])
const loading = ref(false)
const _now = new Date()
const _pad = n => String(n).padStart(2, '0')
const dateFrom = ref(`${_now.getFullYear()}-${_pad(_now.getMonth() + 1)}-01`)
const dateTo   = ref(`${_now.getFullYear()}-${_pad(_now.getMonth() + 1)}-${_pad(_now.getDate())}`)

const fmt = v => Number(v ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const directionColor = {
  EXP: 'primary',
  IMP: 'info',
  XTD: 'warning',
  DOM: 'secondary',
  TSH: 'success',
}

const totals = computed(() => ({
  jobs:    rows.value.reduce((s, r) => s + +r.jobs_count, 0),
  revenue: rows.value.reduce((s, r) => s + +r.revenue_base, 0),
  cost:    rows.value.reduce((s, r) => s + +r.cost_base, 0),
  profit:  rows.value.reduce((s, r) => s + +r.gross_profit, 0),
}))

async function load() {
  loading.value = true
  try {
    rows.value = (await PnlService.departmentPnl(dateFrom.value, dateTo.value)) ?? []
  } finally {
    loading.value = false
  }
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
            <th>{{ $gettext('Department') }}</th>
            <th>{{ $gettext('Branch') }}</th>
            <th>{{ $gettext('Direction') }}</th>
            <th class="text-right">{{ $gettext('Jobs') }}</th>
            <th class="text-right">{{ $gettext('Revenue') }}</th>
            <th class="text-right">{{ $gettext('Cost') }}</th>
            <th class="text-right">{{ $gettext('Gross Profit') }}</th>
            <th class="text-right">{{ $gettext('Margin %') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="8" class="text-center pa-4">
              <VProgressCircular indeterminate size="24" />
            </td>
          </tr>
          <tr v-else-if="!rows.length">
            <td colspan="8" class="text-center text-medium-emphasis pa-4">
              {{ $gettext('No data for selected period. Make sure completed shipments have charge items assigned to departments.') }}
            </td>
          </tr>
          <tr v-for="r in rows" :key="r.department_id">
            <td class="font-weight-medium">{{ r.department_name }}</td>
            <td>{{ r.branch_name }}</td>
            <td>
              <VChip
                v-if="r.direction"
                :color="directionColor[r.direction] ?? 'default'"
                size="small"
                label
              >
                {{ r.direction }}
              </VChip>
            </td>
            <td class="text-right">{{ r.jobs_count }}</td>
            <td class="text-right">{{ fmt(r.revenue_base) }}</td>
            <td class="text-right">{{ fmt(r.cost_base) }}</td>
            <td class="text-right" :class="+r.gross_profit >= 0 ? 'text-success' : 'text-error'">
              {{ fmt(r.gross_profit) }}
            </td>
            <td class="text-right">{{ r.margin_pct }}%</td>
          </tr>
        </tbody>
        <tfoot v-if="rows.length">
          <tr class="font-weight-bold bg-surface">
            <td colspan="3">{{ $gettext('TOTAL') }}</td>
            <td class="text-right">{{ totals.jobs }}</td>
            <td class="text-right">{{ fmt(totals.revenue) }}</td>
            <td class="text-right">{{ fmt(totals.cost) }}</td>
            <td class="text-right" :class="totals.profit >= 0 ? 'text-success' : 'text-error'">
              {{ fmt(totals.profit) }}
            </td>
            <td></td>
          </tr>
        </tfoot>
      </VTable>
    </VCard>
  </VContainer>
</template>
