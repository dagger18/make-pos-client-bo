<script setup>
import { filterConfigs, headers } from '@/config/tables/TaxRegistration'
import PartnerTaxRegistrationService from '@/services/PartnerTaxRegistrationService'
import PartnerService from '@/services/PartnerService'
import { useLibraryHeader } from '@/composables/useLibraryHeader'
import { useGettext } from 'vue3-gettext'
definePage({ meta: { action: 'GET', subject: 'Config', navActiveLink: 'library-tax-group' } })

const { $gettext } = useGettext()
const { buttons: headerButtons } = useLibraryHeader()

const table     = ref(null)
const partners  = ref([])
const partnerId = ref(null)
const saving    = ref(false)
const dialog    = ref(false)
const editId    = ref(null)
const form      = ref({ countryCode: '', taxType: 'VAT', registrationNo: '', isPrimary: false, effectiveFrom: '', effectiveTo: null })

const registrationService = computed(() => ({
  list: () => partnerId.value
    ? PartnerTaxRegistrationService.listByPartner(partnerId.value)
    : Promise.resolve({ list: [], total: 0, totalPages: 0, currentPage: 1 }),
}))

watch(partnerId, (val) => {
  headerButtons.value = val ? [{ text: $gettext('Add Registration'), func: openCreate }] : []
  table.value?.fetchData()
}, { immediate: true })
onUnmounted(() => { headerButtons.value = [] })

function openCreate() {
  editId.value = null
  form.value = { countryCode: '', taxType: 'VAT', registrationNo: '', isPrimary: false, effectiveFrom: new Date().toISOString().slice(0, 10), effectiveTo: null }
  dialog.value = true
}

function openEdit(item) {
  editId.value = item.id
  form.value = { ...item }
  dialog.value = true
}

async function save() {
  saving.value = true
  try {
    if (editId.value) {
      await PartnerTaxRegistrationService.update(editId.value, form.value)
    } else {
      await PartnerTaxRegistrationService.create(partnerId.value, form.value)
    }
    dialog.value = false
    await table.value?.fetchData()
  } finally {
    saving.value = false
  }
}

async function remove(id) {
  if (!confirm($gettext('Delete this registration?'))) return
  await PartnerTaxRegistrationService.remove(id)
  await table.value?.fetchData()
}

async function loadPartners() {
  const res = await PartnerService.list('limit=-1')
  partners.value = res?.list ?? res?.data ?? res ?? []
}

onMounted(loadPartners)
</script>

<template>
  <AppTable
    ref="table"
    :headers="headers()"
    :filterConfigs="filterConfigs"
    :apiService="registrationService"
    :hideTitle="true"
  >
    <template #tableAction>
      <VSelect
        v-model="partnerId"
        :items="partners"
        item-title="name"
        item-value="id"
        :label="$gettext('Partner')"
        density="compact"
        hide-details
        clearable
        style="max-width: 280px"
      />
    </template>

    <template #isPrimary="{ item }">
      <VIcon v-if="item.isPrimary" color="success" size="18">tabler-check</VIcon>
    </template>

    <template #action="{ item }">
      <VBtn size="x-small" icon variant="text" @click="openEdit(item)"><VIcon>tabler-pencil</VIcon></VBtn>
      <VBtn size="x-small" icon variant="text" color="error" @click="remove(item.id)"><VIcon>tabler-trash</VIcon></VBtn>
    </template>
  </AppTable>

  <VDialog v-model="dialog" max-width="560">
    <VCard :title="editId ? $gettext('Edit Registration') : $gettext('New Registration')">
      <DialogCloseBtn @click="dialog = false" />
      <VCardText>
        <VRow dense>
          <VCol cols="6"><VTextField v-model="form.countryCode" :label="$gettext('Country Code')" density="compact" maxlength="2" /></VCol>
          <VCol cols="6"><VTextField v-model="form.taxType" :label="$gettext('Tax Type (VAT / GST / WHT)')" density="compact" /></VCol>
          <VCol cols="12"><VTextField v-model="form.registrationNo" :label="$gettext('Registration Number')" density="compact" /></VCol>
          <VCol cols="6"><VTextField v-model="form.effectiveFrom" type="date" :label="$gettext('Effective From')" density="compact" /></VCol>
          <VCol cols="6"><VTextField v-model="form.effectiveTo" type="date" :label="$gettext('Effective To (blank = open)')" density="compact" clearable /></VCol>
          <VCol cols="12"><VCheckbox v-model="form.isPrimary" :label="$gettext('Primary Registration')" density="compact" hide-details /></VCol>
        </VRow>
      </VCardText>
      <VCardActions class="justify-end pa-4">
        <VBtn variant="text" @click="dialog = false">{{ $gettext('Cancel') }}</VBtn>
        <VBtn color="primary" :loading="saving" @click="save">{{ $gettext('Save') }}</VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
