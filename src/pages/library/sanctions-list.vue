<script setup>
import { filterConfigs, headers } from '@/config/tables/SanctionsList'
import ComplianceService from '@/services/ComplianceService'
import { useLibraryHeader } from '@/composables/useLibraryHeader'
import { useGettext } from 'vue3-gettext'

definePage({ meta: { action: 'GET', subject: 'Config', navActiveLink: 'library-cargo-claim' } })
const { $gettext } = useGettext()
const { buttons: headerButtons } = useLibraryHeader()

const table      = ref(null)
const search     = ref('')
const filterList = ref(null)
const saving     = ref(false)
const dialog     = ref(false)
const editId     = ref(null)

const LIST_NAMES   = ['OFAC_SDN', 'UN_CONSOLIDATED', 'EU_SANCTIONS', 'UK_SANCTIONS', 'CUSTOM']
const ENTITY_TYPES = ['INDIVIDUAL', 'ENTITY', 'VESSEL', 'AIRCRAFT']
const LIST_COLOR   = { OFAC_SDN: 'error', UN_CONSOLIDATED: 'warning', EU_SANCTIONS: 'info', UK_SANCTIONS: 'primary', CUSTOM: 'default' }

const emptyForm = () => ({
  listName: 'OFAC_SDN', listedName: '', aliases: '', countryCode: '',
  entityType: null, programs: '', reason: '', listedDate: '',
  sourceRef: '', isActive: true, lastUpdated: new Date().toISOString().slice(0, 10),
})
const form = ref(emptyForm())

const sanctionsService = computed(() => ({
  list: (params) => {
    const p = Object.fromEntries(new URLSearchParams(params || ''))
    if (search.value)     p.q        = search.value
    if (filterList.value) p.listName = filterList.value
    return ComplianceService.listSanctions(p)
  },
}))

watch(filterList, () => table.value?.fetchData())

function triggerSearch() {
  table.value?.fetchData()
}

function openCreate() {
  editId.value = null
  form.value = emptyForm()
  dialog.value = true
}
headerButtons.value = [{ text: $gettext('Add Entry'), func: openCreate }]
onUnmounted(() => { headerButtons.value = [] })

function openEdit(item) {
  editId.value = item.id
  form.value = {
    listName:    item.listName,
    listedName:  item.listedName,
    aliases:     (item.aliases ?? []).join(', '),
    countryCode: item.countryCode ?? '',
    entityType:  item.entityType ?? null,
    programs:    (item.programs ?? []).join(', '),
    reason:      item.reason ?? '',
    listedDate:  item.listedDate ?? '',
    sourceRef:   item.sourceRef ?? '',
    isActive:    item.isActive,
    lastUpdated: item.lastUpdated ?? new Date().toISOString().slice(0, 10),
  }
  dialog.value = true
}

async function save() {
  saving.value = true
  try {
    const payload = {
      ...form.value,
      aliases:     form.value.aliases  ? form.value.aliases.split(',').map(s => s.trim()).filter(Boolean)  : null,
      programs:    form.value.programs ? form.value.programs.split(',').map(s => s.trim()).filter(Boolean) : null,
      countryCode: form.value.countryCode || null,
      listedDate:  form.value.listedDate  || null,
    }
    if (editId.value) {
      await ComplianceService.updateSanction(editId.value, payload)
    } else {
      await ComplianceService.createSanction(payload)
    }
    dialog.value = false
    await table.value?.fetchData()
  } finally {
    saving.value = false
  }
}

async function remove(id) {
  if (!confirm('Delete this sanctions entry?')) return
  await ComplianceService.deleteSanction(id)
  await table.value?.fetchData()
}
</script>

<template>
  <AppTable
    ref="table"
    :headers="headers()"
    :filterConfigs="filterConfigs"
    :apiService="sanctionsService"
    :hideTitle="true"
  >
    <template #tableAction>
      <VTextField
        v-model="search"
        :label="$gettext('Search by name')"
        density="compact"
        hide-details
        clearable
        prepend-inner-icon="tabler-search"
        style="max-width: 220px"
        @keyup.enter="triggerSearch"
      />
      <VSelect
        v-model="filterList"
        :items="[{ title: $gettext('All Lists'), value: null }, ...LIST_NAMES.map(l => ({ title: l, value: l }))]"
        :label="$gettext('List')"
        density="compact"
        hide-details
        clearable
        style="max-width: 180px"
      />
      <VBtn density="compact" @click="triggerSearch">{{ $gettext('Search') }}</VBtn>
    </template>

    <template #listName="{ item }">
      <VChip size="x-small" :color="LIST_COLOR[item.listName] ?? 'default'">{{ item.listName }}</VChip>
    </template>

    <template #isActive="{ item }">
      <VChip size="x-small" :color="item.isActive ? 'success' : 'default'">
        {{ item.isActive ? $gettext('Active') : $gettext('Inactive') }}
      </VChip>
    </template>

    <template #action="{ item }">
      <VBtn size="x-small" icon variant="text" @click="openEdit(item)"><VIcon>tabler-pencil</VIcon></VBtn>
      <VBtn size="x-small" icon variant="text" color="error" @click="remove(item.id)"><VIcon>tabler-trash</VIcon></VBtn>
    </template>
  </AppTable>

  <VDialog v-model="dialog" max-width="700px" persistent>
    <VCard :title="editId ? $gettext('Edit Sanctions Entry') : $gettext('Add Sanctions Entry')">
      <DialogCloseBtn @click="dialog = false" />
      <VCardText>
        <VRow dense>
          <VCol cols="12" md="4">
            <VSelect v-model="form.listName" :items="LIST_NAMES" :label="$gettext('List')" density="compact" />
          </VCol>
          <VCol cols="12" md="8">
            <VTextField v-model="form.listedName" :label="$gettext('Listed Name')" density="compact" />
          </VCol>
          <VCol cols="12">
            <VTextField v-model="form.aliases" :label="$gettext('Aliases (comma-separated)')"
              density="compact" clearable placeholder="Alias 1, Alias 2" />
          </VCol>
          <VCol cols="12" md="3">
            <VTextField v-model="form.countryCode" :label="$gettext('Country')" density="compact" maxlength="2" clearable />
          </VCol>
          <VCol cols="12" md="3">
            <VSelect v-model="form.entityType" :items="ENTITY_TYPES" :label="$gettext('Entity Type')" density="compact" clearable />
          </VCol>
          <VCol cols="12" md="3">
            <VTextField v-model="form.listedDate" type="date" :label="$gettext('Listed Date')" density="compact" clearable />
          </VCol>
          <VCol cols="12" md="3">
            <VTextField v-model="form.lastUpdated" type="date" :label="$gettext('Last Updated')" density="compact" />
          </VCol>
          <VCol cols="12">
            <VTextField v-model="form.programs" :label="$gettext('Programs (comma-separated)')"
              density="compact" clearable placeholder="SDN, IRAN, NPWMD" />
          </VCol>
          <VCol cols="12">
            <VTextarea v-model="form.reason" :label="$gettext('Reason for listing')" density="compact" rows="2" clearable />
          </VCol>
          <VCol cols="12" md="8">
            <VTextField v-model="form.sourceRef" :label="$gettext('Source Reference')" density="compact" clearable />
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
