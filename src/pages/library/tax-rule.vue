<script setup>
import { filterConfigs, headers } from '@/config/tables/TaxRule'
import TaxRuleService from '@/services/TaxRuleService'
import { useLibraryHeader } from '@/composables/useLibraryHeader'
import { useGettext } from 'vue3-gettext'
definePage({ meta: { action: 'GET', subject: 'Config', navActiveLink: 'library-tax-group' } })

const { $gettext } = useGettext()
const { buttons: headerButtons } = useLibraryHeader()

const table  = ref(null)
const saving = ref(false)
const dialog = ref(false)
const editId = ref(null)
const form   = ref({
  countryCode: '', chargeCategory: null, serviceType: null, customerType: null,
  taxType: 'VAT', taxCode: '', taxRate: 0, isReverseCharge: false,
  isZeroRated: false, isExempt: false, description: null,
  effectiveFrom: new Date().toISOString().slice(0, 10), effectiveTo: null,
})

function openCreate() {
  editId.value = null
  form.value = {
    countryCode: '', chargeCategory: null, serviceType: null, customerType: null,
    taxType: 'VAT', taxCode: '', taxRate: 0, isReverseCharge: false,
    isZeroRated: false, isExempt: false, description: null,
    effectiveFrom: new Date().toISOString().slice(0, 10), effectiveTo: null,
  }
  dialog.value = true
}
headerButtons.value = [{ text: $gettext('Add Rule'), func: openCreate }]
onUnmounted(() => { headerButtons.value = [] })

function openEdit(rule) {
  editId.value = rule.id
  form.value = { ...rule }
  dialog.value = true
}

async function save() {
  saving.value = true
  try {
    if (editId.value) {
      await TaxRuleService.update(editId.value, form.value)
    } else {
      await TaxRuleService.create(form.value)
    }
    dialog.value = false
    await table.value?.fetchData()
  } finally {
    saving.value = false
  }
}

async function remove(id) {
  if (!confirm($gettext('Delete this tax rule?'))) return
  await TaxRuleService.remove(id)
  await table.value?.fetchData()
}
</script>

<template>
  <AppTable
    ref="table"
    :headers="headers()"
    :filterConfigs="filterConfigs"
    :apiService="TaxRuleService"
    :hideTitle="true"
  >
    <template #flags="{ item }">
      <VChip v-if="item.isZeroRated" size="x-small" color="info" class="me-1">{{ $gettext('Zero-Rated') }}</VChip>
      <VChip v-if="item.isExempt" size="x-small" color="warning" class="me-1">{{ $gettext('Exempt') }}</VChip>
      <VChip v-if="item.isReverseCharge" size="x-small" color="secondary">{{ $gettext('RC') }}</VChip>
    </template>

    <template #action="{ item }">
      <VBtn size="x-small" icon variant="text" @click="openEdit(item)"><VIcon>tabler-pencil</VIcon></VBtn>
      <VBtn size="x-small" icon variant="text" color="error" @click="remove(item.id)"><VIcon>tabler-trash</VIcon></VBtn>
    </template>
  </AppTable>

  <VDialog v-model="dialog" max-width="640">
    <VCard :title="editId ? $gettext('Edit Tax Rule') : $gettext('New Tax Rule')">
      <DialogCloseBtn @click="dialog = false" />
      <VCardText>
        <VRow dense>
          <VCol cols="6"><VTextField v-model="form.countryCode" :label="$gettext('Country Code (2-letter)')" density="compact" maxlength="2" /></VCol>
          <VCol cols="6"><VTextField v-model="form.taxType" :label="$gettext('Tax Type (VAT / WHT / GST)')" density="compact" /></VCol>
          <VCol cols="6"><VTextField v-model="form.taxCode" :label="$gettext('Tax Code (e.g. VAT-10)')" density="compact" /></VCol>
          <VCol cols="6"><VTextField v-model.number="form.taxRate" type="number" :label="$gettext('Tax Rate (decimal, e.g. 0.10 = 10%)')" density="compact" /></VCol>
          <VCol cols="6"><VTextField v-model="form.chargeCategory" :label="$gettext('Charge Category (optional)')" density="compact" clearable /></VCol>
          <VCol cols="6"><VTextField v-model="form.serviceType" :label="$gettext('Service Type (optional)')" density="compact" clearable /></VCol>
          <VCol cols="6"><VTextField v-model="form.customerType" :label="$gettext('Customer Type (optional)')" density="compact" clearable /></VCol>
          <VCol cols="6"><VTextField v-model="form.description" :label="$gettext('Description (optional)')" density="compact" clearable /></VCol>
          <VCol cols="6"><VTextField v-model="form.effectiveFrom" type="date" :label="$gettext('Effective From')" density="compact" /></VCol>
          <VCol cols="6"><VTextField v-model="form.effectiveTo" type="date" :label="$gettext('Effective To (blank = open)')" density="compact" clearable /></VCol>
          <VCol cols="12">
            <VCheckbox v-model="form.isZeroRated" :label="$gettext('Zero-Rated')" density="compact" hide-details class="d-inline-flex me-4" />
            <VCheckbox v-model="form.isExempt" :label="$gettext('Exempt')" density="compact" hide-details class="d-inline-flex me-4" />
            <VCheckbox v-model="form.isReverseCharge" :label="$gettext('Reverse Charge')" density="compact" hide-details class="d-inline-flex" />
          </VCol>
        </VRow>
      </VCardText>
      <VCardActions class="justify-end pa-4">
        <VBtn variant="text" @click="dialog = false">{{ $gettext('Cancel') }}</VBtn>
        <VBtn color="primary" :loading="saving" @click="save">{{ $gettext('Save') }}</VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
