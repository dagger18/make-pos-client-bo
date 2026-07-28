<script setup>
import { filterConfigs, headers } from '@/config/tables/CrmOpportunity'
import SalesCrmService from '@/services/SalesCrmService'
import ClientService from '@/services/ClientService'
import UserService from '@/services/UserService'
import { useGettext } from 'vue3-gettext'

definePage({ meta: { action: 'MANAGE', subject: 'CRM' } })

const { $gettext } = useGettext()

const table       = ref(null)
const summary     = ref([])
const clients     = ref([])
const users       = ref([])
const saving      = ref(false)
const dialog      = ref(false)
const closeDialog = ref(false)
const editId      = ref(null)
const selectedOpp = ref(null)

const STAGES       = ['PROSPECTING', 'QUALIFICATION', 'PROPOSAL', 'NEGOTIATION', 'CLOSED_WON', 'CLOSED_LOST']
const OPEN_STAGES  = ['PROSPECTING', 'QUALIFICATION', 'PROPOSAL', 'NEGOTIATION']
const MODES        = ['OCN', 'AIR', 'RD', 'RAL', 'COU', 'MMD']
const UOMS         = ['TEU', 'TON', 'CBM', 'SHIPMENTS']
const LOSS_REASONS = ['PRICE', 'SERVICE', 'RELATIONSHIP', 'CAPACITY', 'OTHER']
const WIN_REASONS  = ['PRICE', 'SERVICE', 'RELATIONSHIP', 'SPEED', 'REPUTATION', 'OTHER']

const STAGE_COLOR = {
  PROSPECTING: 'default', QUALIFICATION: 'info', PROPOSAL: 'primary',
  NEGOTIATION: 'warning', CLOSED_WON: 'success', CLOSED_LOST: 'error',
}
const STAGE_PROB = { PROSPECTING: 10, QUALIFICATION: 25, PROPOSAL: 50, NEGOTIATION: 75, CLOSED_WON: 100, CLOSED_LOST: 0 }

const emptyForm = () => ({
  title: '', leadId: null, clientId: null, transportMode: null, serviceType: '',
  polName: '', podName: '', estimatedVolume: null, volumeUom: 'TEU',
  estimatedRevenue: null, currency: 'USD', stage: 'PROSPECTING', probabilityPct: 10,
  expectedClose: '', assignedToId: null, competitor: '', notes: '',
})
const form      = ref(emptyForm())
const closeForm = ref({ stage: 'CLOSED_LOST', lossReason: null, winReason: null })

const opportunityService = { list: (params) => SalesCrmService.listOpportunities(params) }

const buttons = computed(() => [{ text: $gettext('New Opportunity'), func: openCreate }])

watch(() => form.value.stage, (s) => {
  form.value.probabilityPct = STAGE_PROB[s] ?? form.value.probabilityPct
})

function openCreate() {
  editId.value = null
  form.value = emptyForm()
  dialog.value = true
}

function openEdit(item) {
  editId.value = item.id
  form.value = {
    title: item.title, leadId: item.lead?.id ?? null, clientId: item.client?.id ?? null,
    transportMode: item.transportMode, serviceType: item.serviceType ?? '',
    polName: item.polName ?? '', podName: item.podName ?? '',
    estimatedVolume: item.estimatedVolume, volumeUom: item.volumeUom ?? 'TEU',
    estimatedRevenue: item.estimatedRevenue, currency: item.currency ?? 'USD',
    stage: item.stage, probabilityPct: item.probabilityPct,
    expectedClose: item.expectedClose ?? '', assignedToId: item.assignedTo?.id ?? null,
    competitor: item.competitor ?? '', notes: item.notes ?? '',
  }
  dialog.value = true
}

async function save() {
  saving.value = true
  try {
    if (editId.value) {
      await SalesCrmService.updateOpportunity(editId.value, form.value)
    } else {
      await SalesCrmService.createOpportunity(form.value)
    }
    dialog.value = false
    await table.value?.fetchData()
  } finally {
    saving.value = false
  }
}

function openClose(item) {
  selectedOpp.value = item
  closeForm.value = { stage: 'CLOSED_LOST', lossReason: null, winReason: null }
  closeDialog.value = true
}

async function confirmClose() {
  saving.value = true
  try {
    await SalesCrmService.closeOpportunity(selectedOpp.value.id, closeForm.value)
    closeDialog.value = false
    await table.value?.fetchData()
  } finally {
    saving.value = false
  }
}

async function remove(id) {
  if (!confirm($gettext('Delete this opportunity?'))) return
  await SalesCrmService.deleteOpportunity(id)
  await table.value?.fetchData()
}

const fmt = (v) => Number(v ?? 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })

const totalWeighted = computed(() =>
  (summary.value ?? []).filter(s => !['CLOSED_WON','CLOSED_LOST'].includes(s.stage))
    .reduce((acc, s) => acc + Number(s.weighted_revenue ?? 0), 0)
)

async function loadRefs() {
  const [clientRes, userRes, summaryRes] = await Promise.all([
    ClientService.list('limit=-1').catch(() => []),
    UserService.getAll?.().catch(() => []),
    SalesCrmService.getPipelineSummary().catch(() => []),
  ])
  clients.value = clientRes?.list ?? clientRes?.data ?? clientRes ?? []
  users.value   = Array.isArray(userRes) ? userRes : (userRes?.list ?? userRes?.data ?? [])
  summary.value = summaryRes ?? []
}

onMounted(loadRefs)
</script>

<template>
  <AppTable
    ref="table"
    :headers="headers()"
    :buttons="buttons"
    :filterConfigs="filterConfigs"
    :apiService="opportunityService"
    :pageTitle="$gettext('Sales Pipeline')"
  >
    <template #beforeTable>
      <VRow class="mb-4 px-4">
        <VCol v-for="s in summary" :key="s.stage" cols="6" sm="3">
          <VCard variant="outlined">
            <VCardText class="pa-3">
              <VChip size="x-small" :color="STAGE_COLOR[s.stage]" class="mb-1">{{ s.stage }}</VChip>
              <div class="text-h6 font-weight-bold">{{ s.count }}</div>
              <div class="text-caption text-disabled">Weighted: {{ fmt(s.weighted_revenue) }}</div>
            </VCardText>
          </VCard>
        </VCol>
        <VCol cols="12" sm="3">
          <VCard color="primary" variant="tonal">
            <VCardText class="pa-3">
              <div class="text-caption mb-1">{{ $gettext('Total Weighted Pipeline') }}</div>
              <div class="text-h6 font-weight-bold">{{ fmt(totalWeighted) }}</div>
            </VCardText>
          </VCard>
        </VCol>
      </VRow>
    </template>

    <template #entity="{ item }">
      {{ item.client?.name ?? item.lead?.companyName ?? '—' }}
    </template>

    <template #stage="{ item }">
      <VChip size="x-small" :color="STAGE_COLOR[item.stage] ?? 'default'">
        {{ item.stage.replace('_', ' ') }} ({{ item.probabilityPct }}%)
      </VChip>
    </template>

    <template #action="{ item }">
      <VBtn size="x-small" icon variant="text" @click="openEdit(item)">
        <VIcon>tabler-pencil</VIcon>
      </VBtn>
      <VBtn
        v-if="OPEN_STAGES.includes(item.stage)"
        size="x-small" icon variant="text" color="warning"
        @click="openClose(item)"
      >
        <VIcon>tabler-flag</VIcon>
        <VTooltip activator="parent">{{ $gettext('Close Opportunity') }}</VTooltip>
      </VBtn>
      <VBtn size="x-small" icon variant="text" color="error" @click="remove(item.id)">
        <VIcon>tabler-trash</VIcon>
      </VBtn>
    </template>
  </AppTable>

  <!-- Create / Edit Dialog -->
  <VDialog v-model="dialog" max-width="700px" persistent>
    <VCard :title="editId ? $gettext('Edit Opportunity') : $gettext('New Opportunity')">
      <DialogCloseBtn @click="dialog = false" />
      <VCardText>
        <VRow dense>
          <VCol cols="12">
            <VTextField v-model="form.title" :label="$gettext('Title')" density="compact" />
          </VCol>
          <VCol cols="12" md="6">
            <VSelect v-model="form.clientId" :items="clients" item-title="name" item-value="id" :label="$gettext('Client (existing)')" density="compact" clearable />
          </VCol>
          <VCol cols="12" md="6">
            <VSelect v-model="form.transportMode" :items="MODES" :label="$gettext('Transport Mode')" density="compact" clearable />
          </VCol>
          <VCol cols="12" md="6">
            <VTextField v-model="form.polName" :label="$gettext('Origin (POL)')" density="compact" clearable />
          </VCol>
          <VCol cols="12" md="6">
            <VTextField v-model="form.podName" :label="$gettext('Destination (POD)')" density="compact" clearable />
          </VCol>
          <VCol cols="12" md="4">
            <VTextField v-model.number="form.estimatedVolume" type="number" :label="$gettext('Est. Volume')" density="compact" clearable />
          </VCol>
          <VCol cols="12" md="4">
            <VSelect v-model="form.volumeUom" :items="UOMS" :label="$gettext('Unit')" density="compact" />
          </VCol>
          <VCol cols="12" md="4">
            <VTextField v-model.number="form.estimatedRevenue" type="number" :label="$gettext('Est. Revenue')" density="compact" clearable />
          </VCol>
          <VCol cols="12" md="2">
            <VTextField v-model="form.currency" :label="$gettext('Currency')" density="compact" maxlength="3" />
          </VCol>
          <VCol cols="12" md="4">
            <VSelect v-model="form.stage" :items="OPEN_STAGES" :label="$gettext('Stage')" density="compact" />
          </VCol>
          <VCol cols="12" md="3">
            <VTextField v-model.number="form.probabilityPct" type="number" min="0" max="100" :label="$gettext('Probability %')" density="compact" />
          </VCol>
          <VCol cols="12" md="3">
            <VTextField v-model="form.expectedClose" type="date" :label="$gettext('Expected Close')" density="compact" clearable />
          </VCol>
          <VCol cols="12" md="6">
            <VSelect v-model="form.assignedToId" :items="users" item-title="name" item-value="id" :label="$gettext('Assigned To')" density="compact" clearable />
          </VCol>
          <VCol cols="12" md="6">
            <VTextField v-model="form.competitor" :label="$gettext('Current Competitor')" density="compact" clearable />
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

  <!-- Close Opportunity Dialog -->
  <VDialog v-model="closeDialog" max-width="440px">
    <VCard :title="$gettext('Close Opportunity')">
      <VCardText>
        <VSelect v-model="closeForm.stage" :items="['CLOSED_WON', 'CLOSED_LOST']" :label="$gettext('Outcome')" density="compact" class="mb-3" />
        <VSelect
          v-if="closeForm.stage === 'CLOSED_LOST'"
          v-model="closeForm.lossReason"
          :items="LOSS_REASONS"
          :label="$gettext('Loss Reason *')"
          density="compact"
          class="mb-3"
        />
        <VSelect
          v-if="closeForm.stage === 'CLOSED_WON'"
          v-model="closeForm.winReason"
          :items="WIN_REASONS"
          :label="$gettext('Win Reason')"
          density="compact"
        />
      </VCardText>
      <VCardActions class="pa-4">
        <VSpacer />
        <VBtn variant="text" @click="closeDialog = false">{{ $gettext('Cancel') }}</VBtn>
        <VBtn
          :color="closeForm.stage === 'CLOSED_WON' ? 'success' : 'error'"
          :loading="saving"
          :disabled="closeForm.stage === 'CLOSED_LOST' && !closeForm.lossReason"
          @click="confirmClose"
        >
          {{ $gettext('Confirm') }}
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
