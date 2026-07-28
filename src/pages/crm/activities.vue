<script setup>
import { filterConfigs, headers } from '@/config/tables/CrmActivity'
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

const TYPES    = ['CALL', 'EMAIL', 'MEETING', 'VISIT', 'QUOTE_SENT', 'FOLLOW_UP']
const OUTCOMES = ['POSITIVE', 'NEUTRAL', 'NEGATIVE', 'NO_ANSWER']

const TYPE_COLOR = {
  CALL: 'info', EMAIL: 'primary', MEETING: 'success',
  VISIT: 'warning', QUOTE_SENT: 'secondary', FOLLOW_UP: 'default',
}
const OUTCOME_COLOR = {
  POSITIVE: 'success', NEUTRAL: 'default', NEGATIVE: 'error', NO_ANSWER: 'warning',
}

const emptyForm = () => ({
  opportunityId: null, clientId: null, activityType: 'CALL',
  subject: '', description: '', outcome: null,
  nextAction: '', nextActionDate: '',
  performedById: null, performedAt: new Date().toISOString().slice(0, 16),
})
const form = ref(emptyForm())

const activityService = { list: (params) => SalesCrmService.listActivities(params) }

const buttons = computed(() => [{ text: $gettext('Log Activity'), func: openCreate }])

function openCreate() {
  editId.value = null
  form.value = emptyForm()
  dialog.value = true
}

function openEdit(item) {
  editId.value = item.id
  form.value = {
    opportunityId: item.opportunity?.id ?? null,
    clientId: item.client?.id ?? null,
    activityType: item.activityType,
    subject: item.subject ?? '',
    description: item.description ?? '',
    outcome: item.outcome ?? null,
    nextAction: item.nextAction ?? '',
    nextActionDate: item.nextActionDate ?? '',
    performedById: item.performedBy?.id ?? null,
    performedAt: item.performedAt ? item.performedAt.slice(0, 16) : '',
  }
  dialog.value = true
}

async function save() {
  saving.value = true
  try {
    if (editId.value) {
      await SalesCrmService.updateActivity(editId.value, form.value)
    } else {
      await SalesCrmService.createActivity(form.value)
    }
    dialog.value = false
    await table.value?.fetchData()
  } finally {
    saving.value = false
  }
}

async function remove(id) {
  if (!confirm($gettext('Delete this activity?'))) return
  await SalesCrmService.deleteActivity(id)
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
    :apiService="activityService"
    :pageTitle="$gettext('Activity Log')"
  >
    <template #activityType="{ item }">
      <VChip size="x-small" :color="TYPE_COLOR[item.activityType] ?? 'default'">
        {{ item.activityType.replace('_', ' ') }}
      </VChip>
    </template>

    <template #outcome="{ item }">
      <VChip v-if="item.outcome" size="x-small" :color="OUTCOME_COLOR[item.outcome] ?? 'default'">
        {{ item.outcome }}
      </VChip>
      <span v-else>—</span>
    </template>

    <template #nextActionDate="{ item }">
      <span
        v-if="item.nextActionDate"
        :class="item.nextActionDate < new Date().toISOString().slice(0,10) ? 'text-error' : ''"
      >
        {{ item.nextActionDate }}
      </span>
      <span v-else>—</span>
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

  <VDialog v-model="dialog" max-width="700px" persistent>
    <VCard :title="editId ? $gettext('Edit Activity') : $gettext('Log Activity')">
      <DialogCloseBtn @click="dialog = false" />
      <VCardText>
        <VRow dense>
          <VCol cols="12" md="6">
            <VSelect v-model="form.activityType" :items="TYPES" :label="$gettext('Activity Type')" density="compact" />
          </VCol>
          <VCol cols="12" md="6">
            <VTextField v-model="form.performedAt" type="datetime-local" :label="$gettext('Performed At')" density="compact" />
          </VCol>
          <VCol cols="12">
            <VTextField v-model="form.subject" :label="$gettext('Subject')" density="compact" />
          </VCol>
          <VCol cols="12">
            <VTextarea v-model="form.description" :label="$gettext('Description / Notes')" density="compact" rows="3" clearable />
          </VCol>
          <VCol cols="12" md="6">
            <VSelect v-model="form.outcome" :items="OUTCOMES" :label="$gettext('Outcome')" density="compact" clearable />
          </VCol>
          <VCol cols="12" md="6">
            <VSelect v-model="form.performedById" :items="users" item-title="name" item-value="id" :label="$gettext('Performed By')" density="compact" clearable />
          </VCol>
          <VCol cols="12">
            <VTextField v-model="form.nextAction" :label="$gettext('Next Action')" density="compact" clearable />
          </VCol>
          <VCol cols="12" md="6">
            <VTextField v-model="form.nextActionDate" type="date" :label="$gettext('Next Action Date')" density="compact" clearable />
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
