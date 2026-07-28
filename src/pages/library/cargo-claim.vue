<script setup>
import { filterConfigs, headers } from '@/config/tables/CargoClaim'
import CargoClaimService from '@/services/CargoClaimService'
import ProviderService from '@/services/ProviderService'
import { useLibraryHeader } from '@/composables/useLibraryHeader'
import { useGettext } from 'vue3-gettext'

definePage({ meta: { action: 'GET', subject: 'Config' } })
const { $gettext } = useGettext()
const { buttons: headerButtons } = useLibraryHeader()

const table     = ref(null)
const providers = ref([])
const carrierId = ref(null)
const saving    = ref(false)
const dialog    = ref(false)
const editId    = ref(null)
const form      = ref({
  shipmentId: null, carrierId: null, transportMode: 'OCN',
  claimType: 'DAMAGE', claimDate: '', claimAmount: 0, currency: 'USD',
  description: null, status: 'OPEN', settlementAmount: null, settledAt: null,
})

const MODES       = ['OCN', 'AIR', 'RD']
const CLAIM_TYPES = ['LOSS', 'DAMAGE', 'DELAY', 'SHORT_DELIVERY']
const STATUSES    = ['OPEN', 'SETTLED', 'REJECTED', 'WITHDRAWN']
const STATUS_COLOR = { OPEN: 'warning', SETTLED: 'success', REJECTED: 'error', WITHDRAWN: 'default' }

const claimService = computed(() => ({
  list: (params) => {
    const p = new URLSearchParams(params || '')
    if (carrierId.value) p.set('carrierId', carrierId.value)
    return CargoClaimService.list(p.toString())
  },
}))

watch(carrierId, () => table.value?.fetchData())

function openCreate() {
  editId.value = null
  form.value = {
    shipmentId: null, carrierId: carrierId.value, transportMode: 'OCN',
    claimType: 'DAMAGE', claimDate: new Date().toISOString().slice(0, 10),
    claimAmount: 0, currency: 'USD', description: null,
    status: 'OPEN', settlementAmount: null, settledAt: null,
  }
  dialog.value = true
}
headerButtons.value = [{ text: $gettext('New Claim'), func: openCreate }]
onUnmounted(() => { headerButtons.value = [] })

function openEdit(item) {
  editId.value = item.id
  form.value = { ...item }
  dialog.value = true
}

async function save() {
  saving.value = true
  try {
    if (editId.value) {
      await CargoClaimService.update(editId.value, form.value)
    } else {
      await CargoClaimService.create(form.value)
    }
    dialog.value = false
    await table.value?.fetchData()
  } finally {
    saving.value = false
  }
}

async function remove(id) {
  if (!confirm($gettext('Delete this cargo claim?'))) return
  await CargoClaimService.remove(id)
  await table.value?.fetchData()
}

async function loadProviders() {
  const res = await ProviderService.list('limit=-1')
  providers.value = res?.list ?? res?.data ?? res ?? []
}

onMounted(loadProviders)
</script>

<template>
  <AppTable
    ref="table"
    :headers="headers()"
    :filterConfigs="filterConfigs"
    :apiService="claimService"
    :hideTitle="true"
  >
    <template #tableAction>
      <VSelect
        v-model="carrierId"
        :items="providers"
        item-title="name"
        item-value="id"
        :label="$gettext('Filter by Carrier')"
        density="compact"
        hide-details
        clearable
        style="max-width: 240px"
      />
    </template>

    <template #status="{ item }">
      <VChip :color="STATUS_COLOR[item.status] ?? 'default'" size="x-small">{{ item.status }}</VChip>
    </template>

    <template #action="{ item }">
      <VBtn size="x-small" icon variant="text" @click="openEdit(item)"><VIcon>tabler-pencil</VIcon></VBtn>
      <VBtn size="x-small" icon variant="text" color="error" @click="remove(item.id)"><VIcon>tabler-trash</VIcon></VBtn>
    </template>
  </AppTable>

  <VDialog v-model="dialog" max-width="680">
    <VCard :title="editId ? $gettext('Edit Cargo Claim') : $gettext('New Cargo Claim')">
      <VCardText>
        <VRow>
          <VCol cols="6">
            <VTextField v-model.number="form.shipmentId" type="number" :label="$gettext('Shipment ID')" />
          </VCol>
          <VCol cols="6">
            <VSelect v-model="form.carrierId" :items="providers" item-title="name" item-value="id" :label="$gettext('Carrier')" />
          </VCol>
          <VCol cols="4">
            <VSelect v-model="form.transportMode" :items="MODES" :label="$gettext('Mode')" />
          </VCol>
          <VCol cols="4">
            <VSelect v-model="form.claimType" :items="CLAIM_TYPES" :label="$gettext('Claim Type')" />
          </VCol>
          <VCol cols="4">
            <VSelect v-model="form.status" :items="STATUSES" :label="$gettext('Status')" />
          </VCol>
          <VCol cols="4">
            <VTextField v-model="form.claimDate" type="date" :label="$gettext('Claim Date')" />
          </VCol>
          <VCol cols="4">
            <VTextField v-model.number="form.claimAmount" type="number" :label="$gettext('Claim Amount')" />
          </VCol>
          <VCol cols="4">
            <VTextField v-model="form.currency" :label="$gettext('Currency')" maxlength="3" />
          </VCol>
          <VCol cols="12">
            <VTextarea v-model="form.description" :label="$gettext('Description (optional)')" rows="2" clearable />
          </VCol>
          <VCol cols="4">
            <VTextField v-model.number="form.settlementAmount" type="number" :label="$gettext('Settlement Amount (optional)')" clearable />
          </VCol>
          <VCol cols="4">
            <VTextField v-model="form.settledAt" type="date" :label="$gettext('Settled At (optional)')" clearable />
          </VCol>
        </VRow>
      </VCardText>
      <VCardActions class="justify-end pa-4">
        <VBtn variant="tonal" @click="dialog = false">{{ $gettext('Cancel') }}</VBtn>
        <VBtn color="primary" :loading="saving" @click="save">{{ $gettext('Save') }}</VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
