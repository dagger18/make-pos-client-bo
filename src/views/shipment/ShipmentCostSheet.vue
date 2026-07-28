<script setup>
import PnlService from '@/services/PnlService'

const props = defineProps({ shipment: { type: Object, required: true } })
const data = ref(null)
const loading = ref(false)
const closing = ref(false)
const fmt = (v) => Number(v ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const payableAtColor = { ORIGIN: 'primary', DESTINATION: 'warning', BOTH: 'secondary' }

async function load() {
  if (!props.shipment?.id) return
  loading.value = true
  data.value = await PnlService.costSheet(props.shipment.id)
  loading.value = false
}

async function closeAccounting() {
  closing.value = true
  await PnlService.accountingClose(props.shipment.id)
  closing.value = false
  await load()
}

onMounted(load)
</script>

<template>
  <div>
    <VRow class="mb-4" v-if="data">
      <VCol cols="auto">
        <VCard variant="tonal" color="primary" class="pa-3 text-center">
          <div class="text-caption text-medium-emphasis">{{ $gettext('Revenue') }}</div>
          <div class="text-h6 font-weight-bold">{{ fmt(data.totalSell) }}</div>
        </VCard>
      </VCol>
      <VCol cols="auto">
        <VCard variant="tonal" color="error" class="pa-3 text-center">
          <div class="text-caption text-medium-emphasis">{{ $gettext('Cost') }}</div>
          <div class="text-h6 font-weight-bold">{{ fmt(data.totalBuy) }}</div>
        </VCard>
      </VCol>
      <VCol cols="auto">
        <VCard variant="tonal" :color="data.grossProfit >= 0 ? 'success' : 'error'" class="pa-3 text-center">
          <div class="text-caption text-medium-emphasis">{{ $gettext('Gross Profit') }}</div>
          <div class="text-h6 font-weight-bold">{{ fmt(data.grossProfit) }}</div>
        </VCard>
      </VCol>
      <VCol cols="auto">
        <VCard variant="tonal" :color="data.marginPct >= 0 ? 'success' : 'error'" class="pa-3 text-center">
          <div class="text-caption text-medium-emphasis">{{ $gettext('Margin') }}</div>
          <div class="text-h6 font-weight-bold">{{ data.marginPct }}%</div>
        </VCard>
      </VCol>
      <VCol class="d-flex align-center justify-end">
        <VBtn
          v-if="!shipment.accountingClosedAt"
          color="success" variant="tonal"
          prepend-icon="tabler-lock"
          :loading="closing"
          @click="closeAccounting"
        >
          {{ $gettext('Close Accounting') }}
        </VBtn>
        <VChip v-else color="success" label prepend-icon="tabler-lock">
          {{ $gettext('Accounting Closed') }} {{ shipment.accountingClosedAt?.slice(0, 10) }}
        </VChip>
      </VCol>
    </VRow>

    <VTable v-if="data">
      <thead>
        <tr>
          <th>{{ $gettext('Charge Type') }}</th>
          <th>{{ $gettext('Charge Name') }}</th>
          <th>{{ $gettext('Dept') }}</th>
          <th>{{ $gettext('Payable At') }}</th>
          <th class="text-right">{{ $gettext('Sell (base)') }}</th>
          <th class="text-right">{{ $gettext('Buy (base)') }}</th>
          <th class="text-right">{{ $gettext('Margin') }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="loading"><td colspan="7" class="text-center pa-4"><VProgressCircular indeterminate size="24"/></td></tr>
        <tr v-for="(line, i) in data.lines" :key="i">
          <td>{{ line.chargeType }}</td>
          <td>{{ line.chargeName }}</td>
          <td>
            <VChip v-if="line.departmentName" size="x-small" label>
              {{ line.departmentName }}
            </VChip>
          </td>
          <td>
            <VChip
              v-if="line.payableAt"
              size="x-small"
              label
              :color="payableAtColor[line.payableAt]"
            >
              {{ line.payableAt }}
            </VChip>
          </td>
          <td class="text-right">{{ fmt(line.sellBase) }}</td>
          <td class="text-right">{{ fmt(line.buyBase) }}</td>
          <td class="text-right" :class="+line.marginBase >= 0 ? 'text-success' : 'text-error'">
            {{ fmt(line.marginBase) }}
          </td>
        </tr>
      </tbody>
    </VTable>

    <div v-else-if="loading" class="text-center pa-4"><VProgressCircular indeterminate /></div>
  </div>
</template>
