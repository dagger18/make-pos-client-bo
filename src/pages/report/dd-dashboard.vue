<script setup>
import { useGettext } from 'vue3-gettext'
import DdService from '@/services/DdService'

definePage({ meta: { action: 'GET', subject: 'EbitNote', navActiveLink: 'report-customer-profitability' } })

const { $gettext } = useGettext()

const items         = ref([])
const loading       = ref(false)
const returnDialog  = ref(false)
const disputeDialog = ref(false)
const selectedId    = ref(null)
const returnDate    = ref(new Date().toISOString().slice(0, 10))
const disputeReason = ref('')
const saving        = ref(false)

const fmt = (v) => Number(v ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const headers = computed(() => [
  { title: $gettext('Shipment'),        key: 'shipmentId',     value: r => `#${r.shipmentId}` },
  { title: $gettext('Container'),       key: 'containerNumber' },
  { title: $gettext('Type'),            key: 'ddType' },
  { title: $gettext('Free End'),        key: 'freeEndDate' },
  { title: $gettext('Chargeable Days'), key: 'chargeableDays' },
  { title: $gettext('Accrued'),         key: 'accruedAmount' },
  { title: $gettext('Last Accrual'),    key: 'lastAccrualDate' },
  { title: $gettext('Disputed'),        key: 'isDisputed' },
  { title: '',                          key: 'actions', sortable: false, align: 'end' },
])

async function load() {
  loading.value = true
  items.value   = await DdService.dashboard()
  loading.value = false
}

function openReturn(id) {
  selectedId.value   = id
  returnDate.value   = new Date().toISOString().slice(0, 10)
  returnDialog.value = true
}

function openDispute(id) {
  selectedId.value    = id
  disputeReason.value = ''
  disputeDialog.value = true
}

async function confirmReturn() {
  saving.value = true
  try {
    await DdService.recordReturn(selectedId.value, returnDate.value)
    returnDialog.value = false
    await load()
  } finally {
    saving.value = false
  }
}

async function confirmDispute() {
  saving.value = true
  try {
    await DdService.dispute(selectedId.value, disputeReason.value)
    disputeDialog.value = false
    await load()
  } finally {
    saving.value = false
  }
}

onMounted(load)
</script>

<template>
  <VContainer fluid class="px-0">
    <VRow align="center" class="mb-4">
      <VSpacer />
      <VCol cols="auto">
        <VBtn variant="tonal" :loading="loading" prepend-icon="tabler-refresh" @click="load">{{ $gettext('Refresh') }}</VBtn>
      </VCol>
    </VRow>

    <VCard>
      <VDataTable :headers="headers" :items="items" :loading="loading" hover>
        <template #item.isDisputed="{ item }">
          <VChip v-if="item.isDisputed" color="warning" size="x-small">{{ $gettext('Disputed') }}</VChip>
        </template>
        <template #item.accruedAmount="{ item }">
          <span :class="parseFloat(item.accruedAmount) > 0 ? 'text-error font-weight-bold' : ''">
            {{ fmt(item.accruedAmount) }} {{ item.currency }}
          </span>
        </template>
        <template #item.actions="{ item }">
          <VBtn
            v-if="!item.isFinal"
            size="x-small" variant="tonal" color="success" class="mr-1"
            @click="openReturn(item.id)"
          >{{ $gettext('Return') }}</VBtn>
          <VBtn
            v-if="!item.isDisputed"
            size="x-small" variant="tonal" color="warning"
            @click="openDispute(item.id)"
          >{{ $gettext('Dispute') }}</VBtn>
        </template>
      </VDataTable>
    </VCard>

    <VDialog v-model="returnDialog" max-width="400px">
      <VCard>
        <VCardTitle class="pa-4 text-subtitle-1 font-weight-semibold">{{ $gettext('Record Container Return') }}</VCardTitle>
        <VCardText>
          <VTextField v-model="returnDate" type="date" :label="$gettext('Return Date')" density="compact" />
        </VCardText>
        <VCardActions class="pa-4">
          <VSpacer />
          <VBtn variant="text" @click="returnDialog = false">{{ $gettext('Cancel') }}</VBtn>
          <VBtn color="success" :loading="saving" @click="confirmReturn">{{ $gettext('Confirm Return') }}</VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <VDialog v-model="disputeDialog" max-width="400px">
      <VCard>
        <VCardTitle class="pa-4 text-subtitle-1 font-weight-semibold">{{ $gettext('Mark as Disputed') }}</VCardTitle>
        <VCardText>
          <VTextField v-model="disputeReason" :label="$gettext('Dispute Reason')" density="compact" />
        </VCardText>
        <VCardActions class="pa-4">
          <VSpacer />
          <VBtn variant="text" @click="disputeDialog = false">{{ $gettext('Cancel') }}</VBtn>
          <VBtn color="warning" :loading="saving" @click="confirmDispute">{{ $gettext('Confirm') }}</VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </VContainer>
</template>
