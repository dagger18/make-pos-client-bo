<script setup>
import { filterConfigs, headers } from '@/config/tables/DataRetention'
import ComplianceService from '@/services/ComplianceService'
import { useLibraryHeader } from '@/composables/useLibraryHeader'
import { useGettext } from 'vue3-gettext'

definePage({ meta: { action: 'GET', subject: 'Config', navActiveLink: 'library-cargo-claim' } })
const { $gettext } = useGettext()
const { buttons: headerButtons } = useLibraryHeader()

const table   = ref(null)
const saving  = ref(false)
const dialog  = ref(false)
const editId  = ref(null)

const DATA_CATEGORIES = [
  'FINANCIAL', 'CUSTOMS', 'JOB_DATA', 'DOCUMENTS',
  'PERSONAL', 'AUDIT_LOG', 'MARKETING', 'OTHER',
]

const CATEGORY_COLOR = {
  FINANCIAL: 'primary', CUSTOMS: 'info', JOB_DATA: 'default',
  DOCUMENTS: 'default', PERSONAL: 'warning', AUDIT_LOG: 'error',
  MARKETING: 'success', OTHER: 'default',
}

const emptyForm = () => ({
  dataCategory:   'PERSONAL',
  retentionYears: 3,
  legalBasis:     '',
  appliesTo:      '',
  autoDelete:     false,
})
const form = ref(emptyForm())

const retentionService = { list: (params) => ComplianceService.listRetention(params) }

function openCreate() {
  editId.value = null
  form.value = emptyForm()
  dialog.value = true
}
headerButtons.value = [{ text: $gettext('Add Policy'), func: openCreate }]
onUnmounted(() => { headerButtons.value = [] })

function openEdit(item) {
  editId.value = item.id
  form.value = {
    dataCategory:   item.dataCategory,
    retentionYears: item.retentionYears,
    legalBasis:     item.legalBasis ?? '',
    appliesTo:      item.appliesTo ?? '',
    autoDelete:     item.autoDelete ?? false,
  }
  dialog.value = true
}

async function save() {
  saving.value = true
  try {
    if (editId.value) {
      await ComplianceService.updateRetention(editId.value, form.value)
    } else {
      await ComplianceService.createRetention(form.value)
    }
    dialog.value = false
    await table.value?.fetchData()
  } finally {
    saving.value = false
  }
}

async function remove(id) {
  if (!confirm('Delete this retention policy?')) return
  await ComplianceService.deleteRetention(id)
  await table.value?.fetchData()
}
</script>

<template>
  <AppTable
    ref="table"
    :headers="headers()"
    :filterConfigs="filterConfigs"
    :apiService="retentionService"
    :hideTitle="true"
  >
    <template #dataCategory="{ item }">
      <VChip size="x-small" :color="CATEGORY_COLOR[item.dataCategory] ?? 'default'">
        {{ item.dataCategory }}
      </VChip>
    </template>

    <template #retentionYears="{ item }">
      <span class="font-weight-bold">{{ item.retentionYears }}</span>
      <span class="text-caption text-disabled ml-1">{{ $gettext('years') }}</span>
    </template>

    <template #autoDelete="{ item }">
      <VChip size="x-small" :color="item.autoDelete ? 'warning' : 'default'">
        {{ item.autoDelete ? $gettext('Auto') : $gettext('Manual') }}
      </VChip>
    </template>

    <template #action="{ item }">
      <VBtn size="x-small" icon variant="text" @click="openEdit(item)"><VIcon>tabler-pencil</VIcon></VBtn>
      <VBtn size="x-small" icon variant="text" color="error" @click="remove(item.id)"><VIcon>tabler-trash</VIcon></VBtn>
    </template>
  </AppTable>

  <VDialog v-model="dialog" max-width="640px" persistent>
    <VCard :title="editId ? $gettext('Edit Retention Policy') : $gettext('Add Retention Policy')">
      <DialogCloseBtn @click="dialog = false" />
      <VCardText>
        <VRow dense>
          <VCol cols="12" md="6">
            <VSelect
              v-model="form.dataCategory"
              :items="DATA_CATEGORIES"
              :label="$gettext('Data Category')"
              density="compact"
            />
          </VCol>
          <VCol cols="12" md="3">
            <VTextField
              v-model.number="form.retentionYears"
              :label="$gettext('Retention (years)')"
              type="number" min="1" max="100"
              density="compact"
            />
          </VCol>
          <VCol cols="12" md="3" class="d-flex align-center">
            <VSwitch
              v-model="form.autoDelete"
              :label="$gettext('Auto-Delete')"
              density="compact" hide-details
              color="warning"
            />
          </VCol>
          <VCol cols="12">
            <VTextarea
              v-model="form.legalBasis"
              :label="$gettext('Legal Basis')"
              density="compact" rows="2" clearable
              placeholder="e.g. GDPR Article 5(1)(e) — personal data not retained longer than necessary"
            />
          </VCol>
          <VCol cols="12">
            <VTextarea
              v-model="form.appliesTo"
              :label="$gettext('Applies To')"
              density="compact" rows="2" clearable
              placeholder="e.g. contact: firstName, lastName, email, phone"
            />
          </VCol>
        </VRow>

        <VAlert v-if="form.autoDelete" type="warning" variant="tonal" class="mt-3" density="compact">
          {{ $gettext('Auto-Delete is enabled. Records will be automatically purged after the retention period. Ensure this is compliant with your legal obligations.') }}
        </VAlert>
      </VCardText>
      <VCardActions class="pa-4">
        <VSpacer />
        <VBtn variant="text" @click="dialog = false">{{ $gettext('Cancel') }}</VBtn>
        <VBtn color="primary" :loading="saving" @click="save">{{ $gettext('Save') }}</VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
