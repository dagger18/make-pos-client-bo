<script setup>
import { filterConfigs, headers } from '@/config/tables/InsurancePolicy'
import InsuranceService from '@/services/InsuranceService'
import ProviderService from '@/services/ProviderService'
import { useLibraryHeader } from '@/composables/useLibraryHeader'
import { useGettext } from 'vue3-gettext'
definePage({ meta: { action: 'GET', subject: 'Config', navActiveLink: 'library-cargo-claim' } })

const { $gettext } = useGettext()
const { buttons: headerButtons } = useLibraryHeader()

const table     = ref(null)
const providers = ref([])
const saving    = ref(false)
const dialog    = ref(false)
const editId    = ref(null)

const POLICY_TYPES    = ['OPEN_COVER', 'SPECIFIC_VOYAGE', 'LIABILITY']
const COVERAGE_SCOPES = ['ALL_RISK', 'NAMED_PERILS', 'TOTAL_LOSS_ONLY']
const PREMIUM_BASES   = ['PCT_VALUE', 'FLAT_RATE']
const MODES           = ['OCN', 'AIR', 'RD', 'RAL', 'COU']

const emptyForm = () => ({
  policyNumber: '', insurerId: null, policyType: 'OPEN_COVER',
  coverageScope: 'ALL_RISK', maxPerShipment: 0, maxPerConveyance: null,
  annualLimit: null, currency: 'USD', premiumBasis: 'PCT_VALUE',
  premiumRate: 0.0005, minPremium: null, deductible: null,
  modesCovered: ['OCN'], effectiveFrom: '', expiryDate: '', isActive: true,
})
const form = ref(emptyForm())

function openCreate() {
  editId.value = null
  form.value = emptyForm()
  dialog.value = true
}
headerButtons.value = [{ text: $gettext('New Policy'), func: openCreate }]
onUnmounted(() => { headerButtons.value = [] })

function openEdit(item) {
  editId.value = item.id
  form.value = {
    policyNumber: item.policyNumber,
    insurerId: item.insurer?.id ?? null,
    policyType: item.policyType,
    coverageScope: item.coverageScope,
    maxPerShipment: item.maxPerShipment,
    maxPerConveyance: item.maxPerConveyance,
    annualLimit: item.annualLimit,
    currency: item.currency,
    premiumBasis: item.premiumBasis,
    premiumRate: item.premiumRate,
    minPremium: item.minPremium,
    deductible: item.deductible,
    modesCovered: item.modesCovered ?? [],
    effectiveFrom: item.effectiveFrom,
    expiryDate: item.expiryDate,
    isActive: item.isActive,
  }
  dialog.value = true
}

async function save() {
  saving.value = true
  try {
    if (editId.value) {
      await InsuranceService.updatePolicy(editId.value, form.value)
    } else {
      await InsuranceService.createPolicy(form.value)
    }
    dialog.value = false
    await table.value?.fetchData()
  } finally {
    saving.value = false
  }
}

async function remove(id) {
  if (!confirm($gettext('Delete this insurance policy?'))) return
  await InsuranceService.deletePolicy(id)
  await table.value?.fetchData()
}

const fmtRate = (item) => {
  if (item.premiumBasis === 'PCT_VALUE') return `${(parseFloat(item.premiumRate) * 100).toFixed(4)}%`
  return Number(item.premiumRate).toLocaleString()
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
    :apiService="InsuranceService"
    :hideTitle="true"
  >
    <template #policyType="{ item }">
      <VChip size="x-small" color="primary">{{ item.policyType.replace(/_/g, ' ') }}</VChip>
    </template>

    <template #premiumRate="{ item }">{{ fmtRate(item) }}</template>

    <template #modesCovered="{ item }">
      <VChip v-for="m in (item.modesCovered ?? [])" :key="m" size="x-small" class="me-1">{{ m }}</VChip>
    </template>

    <template #isActive="{ item }">
      <VIcon :color="item.isActive ? 'success' : 'default'" size="18">
        {{ item.isActive ? 'tabler-check' : 'tabler-x' }}
      </VIcon>
    </template>

    <template #action="{ item }">
      <VBtn size="x-small" icon variant="text" @click="openEdit(item)">
        <VIcon>tabler-pencil</VIcon>
      </VBtn>
      <VBtn size="x-small" icon variant="text" color="error" @click="remove(item.id)">
        <VIcon>tabler-trash</VIcon>
      </VBtn>
    </template>
  </AppTable>

  <VDialog v-model="dialog" max-width="720px" persistent>
    <VCard :title="editId ? $gettext('Edit Policy') : $gettext('New Insurance Policy')">
      <DialogCloseBtn @click="dialog = false" />
      <VCardText>
        <VRow dense>
          <VCol cols="12" md="6">
            <VTextField v-model="form.policyNumber" :label="$gettext('Policy Number')" density="compact" />
          </VCol>
          <VCol cols="12" md="6">
            <VSelect
              v-model="form.insurerId"
              :items="providers"
              item-title="name"
              item-value="id"
              :label="$gettext('Insurer')"
              density="compact"
              clearable
            />
          </VCol>
          <VCol cols="12" md="4">
            <VSelect v-model="form.policyType" :items="POLICY_TYPES" :label="$gettext('Policy Type')" density="compact" />
          </VCol>
          <VCol cols="12" md="4">
            <VSelect v-model="form.coverageScope" :items="COVERAGE_SCOPES" :label="$gettext('Coverage Scope')" density="compact" />
          </VCol>
          <VCol cols="12" md="4">
            <VTextField v-model="form.currency" :label="$gettext('Currency')" density="compact" maxlength="3" />
          </VCol>
          <VCol cols="12" md="4">
            <VTextField v-model.number="form.maxPerShipment" type="number" :label="$gettext('Max Per Shipment')" density="compact" />
          </VCol>
          <VCol cols="12" md="4">
            <VTextField v-model.number="form.maxPerConveyance" type="number" :label="$gettext('Max Per Conveyance')" density="compact" clearable />
          </VCol>
          <VCol cols="12" md="4">
            <VTextField v-model.number="form.annualLimit" type="number" :label="$gettext('Annual Limit')" density="compact" clearable />
          </VCol>
          <VCol cols="12" md="4">
            <VSelect v-model="form.premiumBasis" :items="PREMIUM_BASES" :label="$gettext('Premium Basis')" density="compact" />
          </VCol>
          <VCol cols="12" md="4">
            <VTextField
              v-model.number="form.premiumRate"
              type="number"
              step="0.000001"
              :label="form.premiumBasis === 'PCT_VALUE' ? $gettext('Rate (e.g. 0.0005 = 0.05%)') : $gettext('Flat Amount')"
              density="compact"
            />
          </VCol>
          <VCol cols="12" md="4">
            <VTextField v-model.number="form.minPremium" type="number" :label="$gettext('Min Premium')" density="compact" clearable />
          </VCol>
          <VCol cols="12" md="4">
            <VTextField v-model.number="form.deductible" type="number" :label="$gettext('Deductible')" density="compact" clearable />
          </VCol>
          <VCol cols="12" md="8">
            <VSelect v-model="form.modesCovered" :items="MODES" :label="$gettext('Modes Covered')" density="compact" multiple chips />
          </VCol>
          <VCol cols="12" md="4">
            <VTextField v-model="form.effectiveFrom" type="date" :label="$gettext('Effective From')" density="compact" />
          </VCol>
          <VCol cols="12" md="4">
            <VTextField v-model="form.expiryDate" type="date" :label="$gettext('Expiry Date')" density="compact" />
          </VCol>
          <VCol cols="12" md="4" class="d-flex align-center">
            <VSwitch v-model="form.isActive" :label="$gettext('Active')" density="compact" hide-details />
          </VCol>
        </VRow>
      </VCardText>
      <VCardActions class="pa-4">
        <VSpacer />
        <VBtn variant="text" @click="dialog = false">{{ $gettext('Cancel') }}</VBtn>
        <VBtn color="primary" :loading="saving" @click="save">{{ $gettext('Save') }}</VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
