<script setup>
import IntegrationService from '@/services/IntegrationService'
import { Feature } from '@/config/enums/Feature'
import { useFeature } from '@/composables/useFeature'
import { useGettext } from 'vue3-gettext'

definePage({ meta: { action: 'MANAGE', subject: 'Integration' } })

const { featureEnabled } = useFeature()
const { $gettext } = useGettext()

const connectors = ref([])
const loading    = ref(false)
const dialog     = ref(false)
const editId     = ref(null)
const saving     = ref(false)

const CONNECTOR_TYPES = ['CARRIER', 'CUSTOMS', 'PORT', 'AGENT', 'AGGREGATOR']
const PROTOCOLS       = ['REST', 'EDIFACT', 'XML', 'SFTP']
const AUTH_TYPES      = ['API_KEY', 'OAUTH2', 'BASIC', 'CERTIFICATE']
const CAPABILITIES    = ['BOOKING', 'SI', 'TRACKING', 'SCHEDULE', 'RATE']

const TYPE_COLOR = {
  CARRIER: 'primary', CUSTOMS: 'warning', PORT: 'info',
  AGENT: 'default', AGGREGATOR: 'secondary',
}

const emptyForm = () => ({
  connectorType: 'CARRIER', partnerName: '', protocol: 'REST',
  baseUrl: '', authType: '', credentialsRef: '',
  isActive: true, capabilities: [], testMode: false,
})

const form = ref(emptyForm())

async function load() {
  loading.value = true
  try {
    connectors.value = await IntegrationService.listConnectors() ?? []
  } finally {
    loading.value = false
  }
}

function openCreate() {
  editId.value = null
  form.value   = emptyForm()
  dialog.value = true
}

function openEdit(c) {
  editId.value = c.id
  form.value   = {
    connectorType: c.connectorType, partnerName: c.partnerName,
    protocol: c.protocol, baseUrl: c.baseUrl ?? '',
    authType: c.authType ?? '', credentialsRef: c.credentialsRef ?? '',
    isActive: c.isActive, capabilities: [...(c.capabilities ?? [])],
    testMode: c.testMode,
  }
  dialog.value = true
}

async function save() {
  saving.value = true
  try {
    const payload = { ...form.value }
    if (editId.value) {
      await IntegrationService.updateConnector(editId.value, payload)
    } else {
      await IntegrationService.createConnector(payload)
    }
    dialog.value = false
    await load()
  } finally {
    saving.value = false
  }
}

async function remove(id) {
  if (!confirm($gettext('Delete this connector?'))) return
  await IntegrationService.removeConnector(id)
  await load()
}

async function toggleActive(c) {
  await IntegrationService.updateConnector(c.id, { isActive: !c.isActive })
  await load()
}

onMounted(load)
</script>

<template>
  <VContainer fluid>
    <VRow align="center" class="mb-4">
      <VCol>
        <h2 class="text-h6">{{ $gettext('Integration Connectors') }}</h2>
        <div class="text-caption text-disabled">{{ $gettext('Manage partner connections for EDI, carrier APIs, and customs systems') }}</div>
      </VCol>
      <VCol cols="auto">
        <VBtn color="primary" prepend-icon="tabler-plus" :disabled="!featureEnabled(Feature.EdiIntegration)" @click="openCreate">
          {{ $gettext('Add Connector') }}
        </VBtn>
      </VCol>
    </VRow>

    <VCard>
      <VTable>
        <thead>
          <tr>
            <th>{{ $gettext('Partner') }}</th>
            <th>{{ $gettext('Type') }}</th>
            <th>{{ $gettext('Protocol') }}</th>
            <th>{{ $gettext('Auth') }}</th>
            <th>{{ $gettext('Capabilities') }}</th>
            <th>{{ $gettext('Mode') }}</th>
            <th>{{ $gettext('Status') }}</th>
            <th>{{ $gettext('Last Ping') }}</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="9" class="text-center pa-4"><VProgressCircular indeterminate size="24" /></td>
          </tr>
          <tr v-else-if="!connectors.length">
            <td colspan="9" class="text-center text-disabled pa-4 text-caption">
              {{ $gettext('No connectors configured. Add one to start integrating with external systems.') }}
            </td>
          </tr>
          <tr v-for="c in connectors" :key="c.id">
            <td class="font-weight-medium">{{ c.partnerName }}</td>
            <td>
              <VChip size="x-small" :color="TYPE_COLOR[c.connectorType] ?? 'default'">{{ c.connectorType }}</VChip>
            </td>
            <td class="text-caption">{{ c.protocol }}</td>
            <td class="text-caption">{{ c.authType || '—' }}</td>
            <td>
              <VChip v-for="cap in c.capabilities" :key="cap" size="x-small" color="default" class="me-1">{{ cap }}</VChip>
              <span v-if="!c.capabilities?.length" class="text-disabled text-caption">—</span>
            </td>
            <td>
              <VChip v-if="c.testMode" size="x-small" color="warning">TEST</VChip>
              <span v-else class="text-caption text-disabled">LIVE</span>
            </td>
            <td>
              <VChip
                size="x-small" :color="c.isActive ? 'success' : 'default'"
                style="cursor:pointer" @click="toggleActive(c)"
              >
                {{ c.isActive ? $gettext('Active') : $gettext('Inactive') }}
              </VChip>
            </td>
            <td class="text-caption">
              <span v-if="c.lastPingAt">
                {{ c.lastPingAt.slice(0, 10) }}
                <VChip size="x-small" :color="c.lastPingStatus === 'OK' ? 'success' : 'error'" class="ms-1">{{ c.lastPingStatus }}</VChip>
              </span>
              <span v-else class="text-disabled">—</span>
            </td>
            <td>
              <VBtn size="x-small" icon variant="text" @click="openEdit(c)"><VIcon>tabler-pencil</VIcon></VBtn>
              <VBtn size="x-small" icon variant="text" color="error" @click="remove(c.id)"><VIcon>tabler-trash</VIcon></VBtn>
            </td>
          </tr>
        </tbody>
      </VTable>
    </VCard>

    <!-- Create/Edit Dialog -->
    <VDialog v-model="dialog" max-width="680px" persistent>
      <VCard :title="editId ? $gettext('Edit Connector') : $gettext('Add Connector')">
        <DialogCloseBtn @click="dialog = false" />
        <VCardText>
          <VRow dense>
            <VCol cols="12" md="6">
              <VTextField v-model="form.partnerName" :label="$gettext('Partner Name')" density="compact" />
            </VCol>
            <VCol cols="12" md="3">
              <VSelect v-model="form.connectorType" :items="CONNECTOR_TYPES" :label="$gettext('Type')" density="compact" />
            </VCol>
            <VCol cols="12" md="3">
              <VSelect v-model="form.protocol" :items="PROTOCOLS" :label="$gettext('Protocol')" density="compact" />
            </VCol>
            <VCol cols="12">
              <VTextField v-model="form.baseUrl" :label="$gettext('Base URL')" density="compact" placeholder="https://api.example.com" clearable />
            </VCol>
            <VCol cols="12" md="6">
              <VSelect v-model="form.authType" :items="['', ...AUTH_TYPES]" :label="$gettext('Auth Type')" density="compact" clearable />
            </VCol>
            <VCol cols="12" md="6">
              <VTextField v-model="form.credentialsRef" :label="$gettext('Credentials Ref (secrets key)')" density="compact" placeholder="carrier-name/api-key" clearable />
            </VCol>
            <VCol cols="12">
              <VSelect
                v-model="form.capabilities" :items="CAPABILITIES"
                :label="$gettext('Capabilities')" density="compact"
                multiple chips closable-chips
              />
            </VCol>
            <VCol cols="12" md="6" class="d-flex align-center">
              <VSwitch v-model="form.isActive" :label="$gettext('Active')" density="compact" hide-details />
            </VCol>
            <VCol cols="12" md="6" class="d-flex align-center">
              <VSwitch v-model="form.testMode" :label="$gettext('Test Mode')" density="compact" hide-details />
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
  </VContainer>
</template>
