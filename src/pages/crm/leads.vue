<script setup>
import { filterConfigs, headers } from '@/config/tables/CrmLead'
import SalesCrmService from '@/services/SalesCrmService'
import UserService from '@/services/UserService'
import { useGettext } from 'vue3-gettext'

definePage({ meta: { action: 'MANAGE', subject: 'CRM' } })

const { $gettext } = useGettext()

const table   = ref(null)
const users   = ref([])
const saving  = ref(false)
const dialog  = ref(false)
const editId  = ref(null)

const STATUSES = ['NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'DEAD']
const SOURCES  = ['REFERRAL', 'LINKEDIN', 'COLD_CALL', 'TRADE_SHOW', 'INBOUND']
const MODES    = ['OCN', 'AIR', 'RD', 'RAL']

const STATUS_COLOR = {
  NEW: 'info', CONTACTED: 'primary', QUALIFIED: 'success', CONVERTED: 'secondary', DEAD: 'default',
}

const emptyForm = () => ({
  companyName: '', contactName: '', contactEmail: '', contactPhone: '',
  countryCode: '', industry: '', estimatedVolume: '', primaryMode: null,
  primaryTrade: '', source: null, status: 'NEW', assignedToId: null, notes: '',
})
const form = ref(emptyForm())

const leadService = { list: (params) => SalesCrmService.listLeads(params) }

const buttons = computed(() => [{ text: $gettext('New Lead'), func: openCreate }])

function openCreate() {
  editId.value = null
  form.value = emptyForm()
  dialog.value = true
}

function openEdit(item) {
  editId.value = item.id
  form.value = {
    companyName: item.companyName, contactName: item.contactName ?? '',
    contactEmail: item.contactEmail ?? '', contactPhone: item.contactPhone ?? '',
    countryCode: item.countryCode ?? '', industry: item.industry ?? '',
    estimatedVolume: item.estimatedVolume ?? '', primaryMode: item.primaryMode ?? null,
    primaryTrade: item.primaryTrade ?? '', source: item.source ?? null,
    status: item.status, assignedToId: item.assignedTo?.id ?? null, notes: item.notes ?? '',
  }
  dialog.value = true
}

async function save() {
  saving.value = true
  try {
    if (editId.value) {
      await SalesCrmService.updateLead(editId.value, form.value)
    } else {
      await SalesCrmService.createLead(form.value)
    }
    dialog.value = false
    await table.value?.fetchData()
  } finally {
    saving.value = false
  }
}

async function convertLead(id) {
  await SalesCrmService.convertLead(id)
  await table.value?.fetchData()
}

async function remove(id) {
  if (!confirm($gettext('Delete this lead?'))) return
  await SalesCrmService.deleteLead(id)
  await table.value?.fetchData()
}

async function loadUsers() {
  const res = await UserService.getAll?.() ?? []
  users.value = Array.isArray(res) ? res : (res?.list ?? res?.data ?? [])
}

onMounted(loadUsers)
</script>

<template>
  <AppTable
    ref="table"
    :headers="headers()"
    :buttons="buttons"
    :filterConfigs="filterConfigs"
    :apiService="leadService"
    :pageTitle="$gettext('Leads')"
  >
    <template #status="{ item }">
      <VChip size="x-small" :color="STATUS_COLOR[item.status] ?? 'default'">{{ item.status }}</VChip>
    </template>

    <template #action="{ item }">
      <VBtn size="x-small" icon variant="text" @click="openEdit(item)">
        <VIcon>tabler-pencil</VIcon>
      </VBtn>
      <VBtn
        v-if="item.status !== 'CONVERTED' && item.status !== 'DEAD'"
        size="x-small" icon variant="text" color="success"
        @click="convertLead(item.id)"
      >
        <VIcon>tabler-check</VIcon>
        <VTooltip activator="parent">{{ $gettext('Mark Converted') }}</VTooltip>
      </VBtn>
      <VBtn size="x-small" icon variant="text" color="error" @click="remove(item.id)">
        <VIcon>tabler-trash</VIcon>
      </VBtn>
    </template>
  </AppTable>

  <VDialog v-model="dialog" max-width="680px" persistent>
    <VCard :title="editId ? $gettext('Edit Lead') : $gettext('New Lead')">
      <DialogCloseBtn @click="dialog = false" />
      <VCardText>
        <VRow dense>
          <VCol cols="12" md="6">
            <VTextField v-model="form.companyName" :label="$gettext('Company Name')" density="compact" />
          </VCol>
          <VCol cols="12" md="6">
            <VTextField v-model="form.contactName" :label="$gettext('Contact Name')" density="compact" clearable />
          </VCol>
          <VCol cols="12" md="6">
            <VTextField v-model="form.contactEmail" :label="$gettext('Email')" density="compact" clearable />
          </VCol>
          <VCol cols="12" md="6">
            <VTextField v-model="form.contactPhone" :label="$gettext('Phone')" density="compact" clearable />
          </VCol>
          <VCol cols="12" md="3">
            <VTextField v-model="form.countryCode" :label="$gettext('Country (2-letter)')" density="compact" maxlength="2" clearable />
          </VCol>
          <VCol cols="12" md="3">
            <VSelect v-model="form.primaryMode" :items="MODES" :label="$gettext('Primary Mode')" density="compact" clearable />
          </VCol>
          <VCol cols="12" md="6">
            <VTextField v-model="form.industry" :label="$gettext('Industry')" density="compact" clearable />
          </VCol>
          <VCol cols="12" md="6">
            <VTextField v-model="form.estimatedVolume" :label="$gettext('Est. Volume (e.g. 5-10 TEU/month)')" density="compact" clearable />
          </VCol>
          <VCol cols="12" md="6">
            <VTextField v-model="form.primaryTrade" :label="$gettext('Primary Trade Lane')" density="compact" clearable />
          </VCol>
          <VCol cols="12" md="4">
            <VSelect v-model="form.source" :items="SOURCES" :label="$gettext('Source')" density="compact" clearable />
          </VCol>
          <VCol cols="12" md="4">
            <VSelect v-model="form.status" :items="STATUSES" :label="$gettext('Status')" density="compact" />
          </VCol>
          <VCol cols="12" md="4">
            <VSelect v-model="form.assignedToId" :items="users" item-title="name" item-value="id" :label="$gettext('Assigned To')" density="compact" clearable />
          </VCol>
          <VCol cols="12">
            <VTextarea v-model="form.notes" :label="$gettext('Notes')" density="compact" rows="2" clearable />
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
