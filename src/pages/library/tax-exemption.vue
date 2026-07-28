<script setup>
import { filterConfigs, headers } from '@/config/tables/TaxExemption'
import CustomerTaxExemptionService from '@/services/CustomerTaxExemptionService'
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
const form      = ref({ exemptionType: '', countryCode: '', exemptionRef: null, validFrom: '', validTo: null, documentUrl: null })

const exemptionService = computed(() => ({
  list: () => partnerId.value
    ? CustomerTaxExemptionService.listByPartner(partnerId.value)
    : Promise.resolve({ list: [], total: 0, totalPages: 0, currentPage: 1 }),
}))

watch(partnerId, (val) => {
  headerButtons.value = val ? [{ text: $gettext('Add Exemption'), func: openCreate }] : []
  table.value?.fetchData()
}, { immediate: true })
onUnmounted(() => { headerButtons.value = [] })

function openCreate() {
  editId.value = null
  form.value = { exemptionType: '', countryCode: '', exemptionRef: null, validFrom: new Date().toISOString().slice(0, 10), validTo: null, documentUrl: null }
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
      await CustomerTaxExemptionService.update(editId.value, form.value)
    } else {
      await CustomerTaxExemptionService.create(partnerId.value, form.value)
    }
    dialog.value = false
    await table.value?.fetchData()
  } finally {
    saving.value = false
  }
}

async function remove(id) {
  if (!confirm($gettext('Delete this exemption?'))) return
  await CustomerTaxExemptionService.remove(id)
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
    :apiService="exemptionService"
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

    <template #action="{ item }">
      <VBtn size="x-small" icon variant="text" @click="openEdit(item)"><VIcon>tabler-pencil</VIcon></VBtn>
      <VBtn size="x-small" icon variant="text" color="error" @click="remove(item.id)"><VIcon>tabler-trash</VIcon></VBtn>
    </template>
  </AppTable>

  <VDialog v-model="dialog" max-width="560">
    <VCard :title="editId ? $gettext('Edit Exemption') : $gettext('New Exemption')">
      <DialogCloseBtn @click="dialog = false" />
      <VCardText>
        <VRow dense>
          <VCol cols="6"><VTextField v-model="form.exemptionType" :label="$gettext('Exemption Type (e.g. ZERO_RATED_EXPORT)')" density="compact" /></VCol>
          <VCol cols="6"><VTextField v-model="form.countryCode" :label="$gettext('Country Code')" density="compact" maxlength="2" /></VCol>
          <VCol cols="6"><VTextField v-model="form.exemptionRef" :label="$gettext('Certificate / Reference')" density="compact" clearable /></VCol>
          <VCol cols="6"><VTextField v-model="form.documentUrl" :label="$gettext('Document URL')" density="compact" clearable /></VCol>
          <VCol cols="6"><VTextField v-model="form.validFrom" type="date" :label="$gettext('Valid From')" density="compact" /></VCol>
          <VCol cols="6"><VTextField v-model="form.validTo" type="date" :label="$gettext('Valid To (blank = open)')" density="compact" clearable /></VCol>
        </VRow>
      </VCardText>
      <VCardActions class="justify-end pa-4">
        <VBtn variant="text" @click="dialog = false">{{ $gettext('Cancel') }}</VBtn>
        <VBtn color="primary" :loading="saving" @click="save">{{ $gettext('Save') }}</VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
